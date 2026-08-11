/**
 * shared/utils/strapi.js
 *
 * Centralised Strapi v5 helpers shared across frontoffice, backoffice and PWA.
 * Mirrors the pattern already used in frontoffice/src/views/CreatePack.vue.
 */

export const STRAPI_URL = "http://localhost:1337";

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Perform a GET request against the Strapi REST API.
 * @param {string} path  - e.g. "/api/orders?populate=*"
 * @param {string} [jwt] - optional Bearer token for protected endpoints
 * @returns {Promise<any>} parsed JSON body
 */
export async function strapiGet(path, jwt = null) {
  const headers = { "Content-Type": "application/json" };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const res = await fetch(`${STRAPI_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`Strapi GET ${path} failed (${res.status})`);
  return res.json();
}

/**
 * Perform a PUT request against the Strapi REST API.
 * @param {string} path  - e.g. "/api/orders/abc123"
 * @param {object} data  - the { data: { ... } } body
 * @param {string} [jwt] - Bearer token
 */
export async function strapiPut(path, data, jwt = null) {
  const headers = { "Content-Type": "application/json" };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    let errorBody = {};
    try {
      errorBody = await res.json();
      console.error(`[strapiPut] ${path} error details:`, errorBody);
    } catch (e) {
      // Response is not JSON, ignore
    }
    throw new Error(`Strapi PUT ${path} failed (${res.status}) - ${JSON.stringify(errorBody?.error || errorBody?.message || errorBody || 'Unknown error')}`);
  }
  return res.json();
}

/**
 * Perform a POST request against the Strapi REST API.
 * @param {string} path  - e.g. "/api/clients"
 * @param {object} data  - the { data: { ... } } body
 * @param {string} [jwt] - Bearer token
 */
export async function strapiPost(path, data, jwt = null) {
  const headers = { "Content-Type": "application/json" };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    let errorBody = {};
    try {
      errorBody = await res.json();
      console.error(`[strapiPost] ${path} error details:`, errorBody);
    } catch (e) {
      // Response is not JSON, ignore
    }
    throw new Error(`Strapi POST ${path} failed (${res.status}): ${JSON.stringify(errorBody?.error?.message || errorBody?.message || 'Unknown error')}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Data mappers (Strapi v5 flat format — no .attributes wrapper)
// ---------------------------------------------------------------------------

/**
 * Map a Strapi v5 product entry to the shape expected by PackCard / cart store.
 */
export function mapProduct(entry) {
  const imgArr = Array.isArray(entry.image) ? entry.image : [];
  const imgUrl = imgArr[0]?.url ?? "";
  const imageUrl = imgUrl
    ? imgUrl.startsWith("http") ? imgUrl : `${STRAPI_URL}${imgUrl}`
    : "";

  return {
    id: entry.product_id ?? entry.id,
    documentId: entry.documentId,
    product_id: entry.product_id,
    title: entry.title ?? "",
    category: entry.category ?? "",
    price: entry.price ?? 0,
    image: imageUrl,
    badge: entry.badge ?? "",
    featuredImage: imageUrl,
    description: entry.description ?? "",
    specs: entry.specs ?? [],
    included: entry.included ?? [],
    availability: entry.availability ?? "",
    minTime: entry.minTime ?? "",
    suggestions: entry.suggestions ?? [],
  };
}

/**
 * Map a Strapi v5 order entry.
 */
export function mapOrder(entry) {
  const client = entry.client_id ?? {};
  const courier = entry.courier_id ?? {};

  return {
    id: entry.order_id ?? entry.id,
    documentId: entry.documentId,
    order_id: entry.order_id,
    // Client info
    clientId: client.client_id ?? client.id ?? null,
    clientDocumentId: client.documentId ?? null,
    clientName: client.first_name
      ? `${client.first_name} ${client.last_name ?? ""}`.trim()
      : (client.fullname ?? client.name ?? "—"),
    // Courier info
    courierId: courier.courier_id ?? courier.id ?? null,
    courierDocumentId: courier.documentId ?? null,
    courierName: courier.first_name
      ? `${courier.first_name} ${courier.last_name ?? ""}`.trim()
      : null,
    // Order fields
    products: entry.products ?? [],
    combos: entry.combos ?? [],
    date: entry.date_delivery ? new Date(entry.date_delivery) : (entry.date_collection ? new Date(entry.date_collection) : null),
    address: entry.address ?? "",
    collection_address: entry.collection_address ?? "",
    // Aliases used by useFleetTracking for geocoding
    destinationAddress: entry.address ?? "",
    pickupAddress: entry.collection_address ?? "",
    price: entry.price ?? 0,
    numProducts: entry.num_products ?? 0,
    status: entry.order_status ?? "pending",
    priority: entry.priority ?? 1,
    instructions: entry.intructions ?? entry.instructions ?? "",
    notes: entry.notes ?? "",
    classification: entry.classification ?? null,
    image: entry.image ?? null,
    createdAt: entry.createdAt ? new Date(entry.createdAt) : null,
    updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : null,
    started_at: entry.started_at ? new Date(entry.started_at) : null,
    ended_at: entry.ended_at ? new Date(entry.ended_at) : null,
    delivery_duration: entry.delivery_duration ?? null,
  };
}

/**
 * Map a Strapi v5 vehicle entry.
 */
export function mapVehicle(entry) {
  return {
    id: entry.vehicle_id ?? entry.id,
    documentId: entry.documentId,
    vehicle_id: entry.vehicle_id,
    licencePlate: entry.licence_plate ?? "",
    maxWeight: entry.max_weight != null ? Number(entry.max_weight) : null,
    maxDimensions: entry.max_dimensions ?? null,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    brand: entry.brand ?? "",
    // The courier relation (populated) — just store the documentId for linking
    courierDocumentId: entry.courier?.documentId ?? null,
  };
}

/**
 * Map a Strapi v5 courier entry.
 */
export function mapCourier(entry) {
  const orders = Array.isArray(entry.orders) ? entry.orders : [];
  const activeTasks = orders.filter((o) => o.order_status !== "delivered" && o.order_status !== "cancelled" && o.order_status !== "completed").length;

  const ratedOrders = orders.filter(o => typeof o.classification === 'number' && o.classification > 0);
  const totalRating = ratedOrders.reduce((sum, o) => sum + o.classification, 0);
  const avgRating = ratedOrders.length > 0 ? (totalRating / ratedOrders.length).toFixed(1) : "0.0";

  // Vehicle data now comes from the related Vehicle entity
  const vehicleRel = entry.vehicle && typeof entry.vehicle === 'object' ? entry.vehicle : null;

  return {
    id: entry.courier_id ?? entry.id,
    documentId: entry.documentId,
    courier_id: entry.courier_id,
    email: entry.email ?? "",
    firstName: entry.first_name ?? "",
    lastName: entry.last_name ?? "",
    name: `${entry.first_name ?? ""} ${entry.last_name ?? ""}`.trim() || "—",
    // Vehicle relation — all vehicle data comes from the related Vehicle entity
    vehicleDocumentId: vehicleRel?.documentId ?? null,
    vehicleBrand: vehicleRel?.brand ?? "",
    licencePlate: vehicleRel?.licence_plate ?? "",
    maxWeight: vehicleRel?.max_weight != null ? Number(vehicleRel.max_weight) : null,
    maxDimensions: vehicleRel?.max_dimensions ?? null,
    // Tags belong to the vehicle; courier inherits them when a vehicle is assigned
    tags: Array.isArray(vehicleRel?.tags) ? vehicleRel.tags : [],
    isActive: entry.is_active ?? false,
    status: entry.is_active ? "Online" : "Offline",
    activeTasks,
    rating: avgRating,
    ratingCount: ratedOrders.length
  };
}

// ---------------------------------------------------------------------------
// Strapi local auth (email + password → JWT)
// Used for write operations (assign courier, cancel order, etc.)
// ---------------------------------------------------------------------------

/**
 * Authenticate against Strapi's local provider.
 * Returns the JWT string on success.
 * @param {string} identifier - Strapi user email
 * @param {string} password
 */
export async function strapiLogin(identifier, password) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) throw new Error(`Strapi login failed (${res.status})`);
  const json = await res.json();
  return json.jwt ?? null;
}
