'use strict';

const { ApplicationError } = require('@strapi/utils').errors;

module.exports = {
  async beforeUpdate(event) {
    await validateCourierAssignment(event);
  },
  
  async beforeCreate(event) {
    await validateCourierAssignment(event);
  },

  async afterUpdate(event) {
    const { result } = event;
    // Check if the update contains an order_status change
    if (result && result.order_status) {
      // Find the documentId or id
      const targetRoomId = result.documentId || result.order_id || String(result.id);
      const roomName = `room_order_${targetRoomId}`;

      // Broadcast the real-time status shift to Frontoffice and Backoffice clients
      // @ts-ignore
      if (strapi.io) {
        // @ts-ignore
        strapi.io.to(roomName).emit('notification', {
          orderId: targetRoomId,
          status: result.order_status,
          message: `O estado da encomenda foi atualizado para: ${result.order_status}`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
};

// ── Constants ──────────────────────────────────────────────────────────────
// Define the statuses that count towards the courier's active delivery limit
const ACTIVE_STATUSES = ['pending', 'active', 'em curso', 'in_transit', 'in progress'];
const MAX_ACTIVE_ORDERS = 5;

// Strapi Collection UIDs based on current schema
const ORDER_UID = 'api::order.order';
const COURIER_UID = 'api::courier.courier';
const PRODUCT_UID = 'api::product.product';

// ── Helper Parsers ─────────────────────────────────────────────────────────
function parseWeight(weightStr) {
  if (!weightStr) return 0;
  const match = weightStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseDimensions(dimStr) {
  if (!dimStr) return [0, 0, 0];
  const isMeters = dimStr.toLowerCase().includes('m') && !dimStr.toLowerCase().includes('cm');
  const matches = dimStr.match(/(\d+(?:\.\d+)?)/g);
  if (matches && matches.length >= 3) {
    let l = parseFloat(matches[0]);
    let w = parseFloat(matches[1]);
    let h = parseFloat(matches[2]);
    if (isMeters || (l < 10 && w < 10 && h < 10)) {
      l *= 100;
      w *= 100;
      h *= 100;
    }
    return [l, w, h];
  }
  return [0, 0, 0];
}

/**
 * Validates courier assignment when an order is created or updated.
 * Enforces limits on active orders, tag compatibility, and capacity constraints.
 * 
 * @param {Object} event - The Strapi lifecycle event object
 */
async function validateCourierAssignment(event) {
  const { data, where } = event.params;
  
  // ── Guard Clause 1: Field check ──────────────────────────────────────────
  // If courier_id is undefined in the payload, the courier is not being updated at all.
  // This allows the user to update other fields (e.g. address) without triggering validation.
  if (data.courier_id === undefined) {
    return;
  }

  // ── Safely Extract Courier ID ─────────────────────────────────────────────
  // Strapi 5 passes relations dynamically. We must handle direct IDs or connect objects.
  let courierIdToAssign = null;
  let existingOrder = null;
  let targetDocId = (where && where.documentId) || data.documentId;
  let targetDbId = (where && where.id) || data.id;
  
  if (data.courier_id !== null) {
    if (typeof data.courier_id === 'number' || typeof data.courier_id === 'string') {
      courierIdToAssign = data.courier_id;
    } else if (data.courier_id.connect && data.courier_id.connect.length > 0) {
      courierIdToAssign = data.courier_id.connect[0].id || data.courier_id.connect[0].documentId;
    } else if (data.courier_id.set && data.courier_id.set.length > 0) {
      courierIdToAssign = data.courier_id.set[0].id || data.courier_id.set[0].documentId;
    } else if (data.courier_id.documentId) {
      courierIdToAssign = data.courier_id.documentId;
    }
  }

  // ── Guard Clause 2: Removal Check ────────────────────────────────────────
  // If no courier is being assigned (e.g., they are just removing the courier), skip validation
  if (!courierIdToAssign) {
    return;
  }

  // ── Guard Clause 3: Same Courier Check ───────────────────────────────────
  // If it's an update, verify if the courier actually changed.
  const isUpdate = event.action === 'beforeUpdate';
  targetDocId = event.params.documentId || targetDocId;
  targetDbId = event.params.id || targetDbId;

  if (isUpdate) {
    if (!targetDocId && !targetDbId) {
      // We are updating, but we cannot identify the order ID (Strapi merged it weirdly).
      // To prevent blocking legitimate status updates from PWA, skip validation.
      return;
    }
    
    try {
      if (targetDocId) {
        existingOrder = await strapi.documents(ORDER_UID).findOne({
          documentId: targetDocId,
          populate: ['courier_id']
        });
      } else {
        existingOrder = await strapi.db.query(ORDER_UID).findOne({
          where: { id: targetDbId },
          populate: ['courier_id']
        });
      }
    } catch(e) {
      console.error('[validateCourierAssignment] Error fetching existing order:', e);
    }
    
    if (existingOrder && existingOrder.courier_id) {
      let existingDocId = '';
      let existingDbId = '';
      
      if (typeof existingOrder.courier_id === 'object') {
        existingDocId = String(existingOrder.courier_id.documentId || '');
        existingDbId  = String(existingOrder.courier_id.id || '');
      } else {
        existingDbId = String(existingOrder.courier_id);
      }
      
      const assignIdStr = String(courierIdToAssign || '');

      // If the assigned courier is the exact same as the one already in DB, skip validation
      if (assignIdStr && (assignIdStr === existingDocId || assignIdStr === existingDbId)) {
        return;
      }
    }
  }

  // ── 1. Fetch the Courier ─────────────────────────────────────────────────
  const courier = await strapi.db.query(COURIER_UID).findOne({
    where: { 
      $or: [
        { id: courierIdToAssign },
        { documentId: courierIdToAssign }
      ]
    },
    populate: ['orders', 'vehicle']
  });

  if (!courier) {
    throw new ApplicationError('Estafeta não encontrado.');
  }

  // ── RULE 1: Maximum Active Orders ────────────────────────────────────────
  // Count how many "active" orders the courier has
  // If the courier already has orders assigned, count the active ones.
  // Note: fetch fresh from DB to ensure accuracy.
  const activeOrdersCount = await strapi.db.query(ORDER_UID).count({
    where: {
      courier_id: courier.id,
      order_status: { $in: ACTIVE_STATUSES },
      // Exclude the current order being updated so we don't double count it
      ...(where && where.id ? { id: { $ne: where.id } } : {})
    }
  });

  if (activeOrdersCount >= MAX_ACTIVE_ORDERS) {
    throw new ApplicationError(`Erro: O estafeta ${courier.first_name} já atingiu o limite de ${MAX_ACTIVE_ORDERS} entregas ativas.`);
  }

  // ── Prepare Order Data ───────────────────────────────────────────────────
  // If it's an update, some data might not be in the 'data' payload, so we fetch the existing order
  let orderData = data;
  if (where && (where.id || where.documentId)) {
    const existingOrder = await strapi.db.query(ORDER_UID).findOne({ where });
    if (existingOrder) {
      orderData = { ...existingOrder, ...data };
    }
  }

  // ── Extract Products ─────────────────────────────────────────────────────
  // Products are saved as a JSON array inside the `products` field
  const orderProducts = orderData.products || [];
  
  if (!orderProducts.length) {
    // If there are no products, we can skip tag and dimension validations
    return;
  }

  // ── Fetch Full Product Details ───────────────────────────────────────────
  // Query DB using the IDs stored in the order payload
  const productIds = orderProducts.map(p => p.product_id || p.id).filter(Boolean);
  
  if (productIds.length > 0) {
    const fullProducts = await strapi.db.query(PRODUCT_UID).findMany({
      where: {
        $or: [
          { product_id: { $in: productIds } },
          { documentId: { $in: productIds } }
        ]
      }
    });

    // ── RULE 2: Tag Compatibility & Cart Calculations ──────────────────────
    let requiredTags = new Set();
    let totalWeight = 0;
    let totalVolume = 0;
    
    // Critical dimensions of the cart
    let maxCartL = 0;
    let maxCartW = 0;
    let maxCartH = 0;

    for (const op of orderProducts) {
      const pId = op.product_id || op.id;
      const fullProd = fullProducts.find(p => p.product_id === pId || p.documentId === pId);
      
      const itemData = fullProd || op;
      
      if (itemData) {
        // Collect tags
        if (itemData.tags && Array.isArray(itemData.tags)) {
          itemData.tags.forEach(t => requiredTags.add(t));
        }
        
        const qty = op.quantity || 1;
        
        // Parse specs from the array of objects if it exists
        if (Array.isArray(itemData.specs)) {
          const weightSpec = itemData.specs.find(s => s.label === "Peso");
          const dimSpec = itemData.specs.find(s => s.label === "Dimensão");
          
          if (weightSpec && weightSpec.value) {
            totalWeight += parseWeight(weightSpec.value) * qty;
          }
          
          if (dimSpec && dimSpec.value) {
            const dims = parseDimensions(dimSpec.value);
            const l = dims[0];
            const w = dims[1];
            const h = dims[2];
            
            // Calculate total volume (cm3)
            totalVolume += (l * w * h) * qty;
            
            // Calculate bounding box for this product by ordering dimensions (L >= W >= H)
            const orderedDims = [l, w, h].sort((a, b) => b - a);
            
            if (orderedDims[0] > maxCartL) maxCartL = orderedDims[0];
            if (orderedDims[1] > maxCartW) maxCartW = orderedDims[1];
            if (orderedDims[2] > maxCartH) maxCartH = orderedDims[2];
          }
        }
      }
    }

    const courierTags = Array.isArray(courier.vehicle?.tags) ? courier.vehicle.tags : [];
    
    // ── Validate Required Tags ─────────────────────────────────────────────
    // Check if courier has all required tags
    for (const requiredTag of requiredTags) {
      if (!courierTags.includes(requiredTag)) {
        throw new ApplicationError(`Erro: O estafeta não possui a tag necessária '${requiredTag}' exigida pelos produtos desta encomenda. DEBUG INFO: existingDocId=${typeof existingOrder !== 'undefined' && existingOrder && existingOrder.courier_id ? existingOrder.courier_id.documentId : 'NO_ORDER_OR_COURIER'}, assignIdStr=${courierIdToAssign}, targetDocId=${targetDocId}, targetDbId=${targetDbId}`);
      }
    }

    // ── RULE 3: Weight and Dimensions Restrictions ─────────────────────────
    // Validate Weight
    if (courier.vehicle?.max_weight !== null && courier.vehicle?.max_weight !== undefined) {
      if (totalWeight > Number(courier.vehicle.max_weight)) {
        throw new ApplicationError(`Erro: O peso total da encomenda (${totalWeight}kg) ultrapassa a capacidade máxima suportada pelo estafeta (${courier.vehicle.max_weight}kg).`);
      }
    }

    // Validate Dimensions / Volume
    if (courier.vehicle?.max_dimensions) {
      let vL, vW, vH;
      const vDimsObj = courier.vehicle.max_dimensions;
      
      // Check if it's the new structure { length, width, height }
      if (vDimsObj.length !== undefined && vDimsObj.width !== undefined && vDimsObj.height !== undefined) {
        vL = Number(vDimsObj.length);
        vW = Number(vDimsObj.width);
        vH = Number(vDimsObj.height);
      }
      // Fallback for old structure { valor: "150x100x150" }
      else if (vDimsObj.valor) {
        const parsedDims = parseDimensions(vDimsObj.valor);
        vL = parsedDims[0];
        vW = parsedDims[1];
        vH = parsedDims[2];
      }

      if (vL !== undefined && vL > 0) {
        const maxVol = vL * vW * vH;
        
        // 1. Volume Rule
        if (totalVolume > maxVol) {
          throw new ApplicationError(`Erro: O volume total da encomenda (${totalVolume} cm³) ultrapassa o limite de capacidade do veículo do estafeta (${maxVol} cm³).`);
        }
        
        // 2. Fit Rule
        const vDimsArray = [vL, vW, vH].sort((a, b) => b - a);
        if (maxCartL > vDimsArray[0] || maxCartW > vDimsArray[1] || maxCartH > vDimsArray[2]) {
          throw new ApplicationError(`Erro: As dimensões críticas dos produtos (${maxCartL}x${maxCartW}x${maxCartH} cm) não cabem na dimensão do veículo do estafeta (${vDimsArray[0]}x${vDimsArray[1]}x${vDimsArray[2]} cm).`);
        }
      }
      // Old fallback Volume Rule
      else if (vDimsObj.max_volume !== undefined && vDimsObj.length === undefined) {
        const maxVol = Number(vDimsObj.max_volume);
        if (totalVolume > maxVol) {
          throw new ApplicationError(`Erro: O volume total da encomenda (${totalVolume}) ultrapassa o limite do veículo do estafeta (${maxVol}).`);
        }
      }
    }
  }
}
