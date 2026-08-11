'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Ensure password_reset_tokens table exists (bypass pooler issues)
    try {
      await strapi.db.connection.raw(`
        CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
          id serial PRIMARY KEY,
          token varchar(255) NOT NULL UNIQUE,
          email varchar(255) NOT NULL,
          expires_at timestamp NOT NULL,
          used boolean DEFAULT false NOT NULL,
          document_id varchar(255),
          published_at timestamp,
          created_at timestamp DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ password_reset_tokens table verified/created.');
    } catch (dbErr) {
      console.error('Error creating password_reset_tokens table:', dbErr);
    }

    const { Server } = require('socket.io');
    
    // Configurar Socket.io
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected to socket:', socket.id);

      socket.on('join_order_room', (orderId) => {
        const roomName = `room_order_${orderId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined ${roomName}`);
      });

      socket.on('location_update', (data) => {
        // data: { orderId, lat, lng, timestamp }
        if (data.orderId) {
          const roomName = `room_order_${data.orderId}`;
          // Emit to all clients in the room (e.g., frontoffice client)
          socket.to(roomName).emit('location_update', data);
        }
      });

      // --- SIMULATION LOGIC ---
      const activeSimulations = {}; // Store intervals

      socket.on('start_simulation', async (data) => {
        const { orderId, origin, pickup, destination } = data;
        const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

        if (!orderId || !origin || !destination || !MAPBOX_TOKEN) {
          console.error('Missing data for simulation or Mapbox Token.');
          return;
        }

        const roomName = `room_order_${orderId}`;

        // Stop existing simulation if any
        if (activeSimulations[orderId]) {
          clearInterval(activeSimulations[orderId]);
        }

        try {
          // Update order started_at
          try {
            const orders = await strapi.entityService.findMany('api::order.order', {
              filters: { documentId: orderId },
              limit: 1
            });
            if (orders && orders.length > 0 && !orders[0].started_at) {
              await strapi.entityService.update('api::order.order', orders[0].id, {
                data: { started_at: new Date().toISOString() }
              });
            }
          } catch (dbErr) {
            console.error('Failed to update started_at in DB:', dbErr);
          }

          // Fetch route from Mapbox Directions API
          // Se tiver pickup, passamos pelo pickup (origin -> pickup -> destination)
          const waypoints = pickup 
            ? `${origin.lng},${origin.lat};${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}`
            : `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
            
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
          
          const response = await fetch(url);
          const result = await response.json();

          if (result.routes && result.routes.length > 0) {
            const route = result.routes[0];
            const coordinates = route.geometry.coordinates; // Array of [lng, lat]
            
            // Send the full route and duration to the client
            io.to(roomName).emit('route_calculated', { 
              orderId, 
              coordinates,
              durationSeconds: route.duration // Mapbox estimated duration
            });

            let currentIndex = 0;
            let passedPickup = false;

            // Start sending location updates every 3 seconds
            activeSimulations[orderId] = setInterval(async () => {
              // Avançar 2 coordenadas de cada vez (reduzido de 10 para uma simulação mais realista/lenta)
              currentIndex += 2;

              // Clamp: nunca ultrapassar o último índice
              const isLast = currentIndex >= coordinates.length - 1;
              if (isLast) {
                currentIndex = coordinates.length - 1;
              }

              const [lng, lat] = coordinates[currentIndex];
              
              // Estado 50%: Transição para "A Caminho"
              if (!passedPickup && currentIndex >= coordinates.length / 2) {
                passedPickup = true;
                io.to(roomName).emit('notification', {
                  orderId,
                  status: 'transito',
                  message: 'A sua encomenda já foi recolhida e está a caminho!',
                  timestamp: new Date().toISOString()
                });
              }

              // Emit current position — currentIndex/totalCoordinates-1 para ratio correto
              io.to(roomName).emit('location_update', {
                orderId,
                lat,
                lng,
                currentIndex,
                totalCoordinates: coordinates.length,
                timestamp: new Date().toISOString(),
                heading: calculateHeading(
                  coordinates[Math.max(0, currentIndex - 10)],
                  coordinates[currentIndex]
                )
              });

              if (isLast) {
                // Parar simulação
                clearInterval(activeSimulations[orderId]);
                delete activeSimulations[orderId];
                console.log(`Simulation finished for order ${orderId}`);
                
                // Notify arrival
                io.to(roomName).emit('notification', {
                  orderId,
                  status: 'concluida',
                  message: 'A sua encomenda chegou ao destino!',
                  timestamp: new Date().toISOString()
                });
                
                // Atualizar base de dados Strapi para "delivered"
                try {
                  const orders = await strapi.entityService.findMany('api::order.order', {
                    filters: { order_id: orderId },
                    limit: 1
                  });
                  if (orders && orders.length > 0) {
                    await strapi.entityService.update('api::order.order', orders[0].id, {
                      data: { order_status: 'delivered' }
                    });
                    console.log(`Order ${orderId} updated to delivered in DB.`);
                  }
                } catch (dbErr) {
                  console.error('Failed to update order status in DB:', dbErr);
                }
                return;
              }

            }, 3000); // 3 seconds per step
          }
        } catch (err) {
          console.error('Error starting simulation:', err);
        }
      });
      
      // Helper function to calculate bearing/heading for realistic marker rotation
      function calculateHeading(prev, curr) {
        if (!prev || !curr) return 0;
        const [lon1, lat1] = prev;
        const [lon2, lat2] = curr;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const l1 = lat1 * Math.PI / 180;
        const l2 = lat2 * Math.PI / 180;
        const y = Math.sin(dLon) * Math.cos(l2);
        const x = Math.cos(l1) * Math.sin(l2) - Math.sin(l1) * Math.cos(l2) * Math.cos(dLon);
        const brng = Math.atan2(y, x) * 180 / Math.PI;
        return (brng + 360) % 360;
      }
      // --- END SIMULATION LOGIC ---

      socket.on('status_transition', async (data) => {
        // data: { orderId, status, messageContent, courierId, clientId }
        if (data.orderId) {
          try {
            const roomName = `room_order_${data.orderId}`;
            
            // Gravar notificação na base de dados (Messages)
            // Assumimos sender 'admin' para mensagens de sistema
            if (data.messageContent) {
              await strapi.entityService.create('api::message.message', {
                data: {
                  content: data.messageContent,
                  sender: 'admin',
                  is_read: false,
                  order: data.orderId,
                  courier: data.courierId || null,
                  client: data.clientId || null
                }
              });
            }

            // Emitir evento de notificação em tempo real
            io.to(roomName).emit('notification', {
              orderId: data.orderId,
              status: data.status,
              message: data.messageContent,
              timestamp: new Date().toISOString()
            });

            // Se o estado final for "delivered" (entregue), notificar administradores
            if (data.status === 'delivered') {
              io.emit('admin_alert', {
                orderId: data.orderId,
                message: `A encomenda #${data.orderId} foi Entregue!`,
                timestamp: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Erro ao processar status_transition:', error);
          }
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Make io globally accessible
    strapi.io = io;
  },
};
