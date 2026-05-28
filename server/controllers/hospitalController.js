const db = require('../db');

/**
 * Haversine formula — distance in km between two lat/lng points
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find hospitals nearest to a given coordinate.
 * Optionally filter by care level (hospital | clinic | health_center).
 * Returns up to `limit` results sorted by distance.
 */
async function getNearestHospitals({ lat, lng, careLevel, limit = 5 }) {
  let query = `SELECT * FROM hospitals WHERE active = true`;
  const params = [];

  // If care level is 'hospital', only return hospitals with emergency care
  if (careLevel === 'hospital') {
    query += ` AND has_emergency = true`;
  } else if (careLevel === 'clinic') {
    query += ` AND type IN ('clinic', 'health_center', 'hospital')`;
  }

  const result = await db.query(query, params);
  const hospitals = result.rows;

  // Calculate distance for each and sort
  const withDistance = hospitals.map((h) => ({
    ...h,
    distance_km: parseFloat(haversineKm(lat, lng, parseFloat(h.lat), parseFloat(h.lng)).toFixed(2)),
    estimated_minutes: Math.round(haversineKm(lat, lng, parseFloat(h.lat), parseFloat(h.lng)) * 3), // ~20 km/h avg in Juba traffic
  }));

  return withDistance
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
}

/**
 * Get a single hospital by ID
 */
async function getHospitalById(id) {
  const result = await db.query('SELECT * FROM hospitals WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Update bed availability (called when a patient is dispatched)
 */
async function updateBedAvailability(hospitalId, delta) {
  await db.query(
    `UPDATE hospitals
     SET available_beds = GREATEST(0, available_beds + $1), updated_at = NOW()
     WHERE id = $2`,
    [delta, hospitalId]
  );
}

module.exports = { getNearestHospitals, getHospitalById, updateBedAvailability };
