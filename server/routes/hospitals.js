const express = require('express');
const router = express.Router();
const { getNearestHospitals, getHospitalById } = require('../controllers/hospitalController');
const db = require('../db');

// GET /api/hospitals/nearest?lat=4.85&lng=31.58&care_level=hospital&limit=5
router.get('/nearest', async (req, res) => {
  try {
    const { lat, lng, care_level, limit } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query params are required' });
    }

    const hospitals = await getNearestHospitals({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      careLevel: care_level || null,
      limit: parseInt(limit) || 5,
    });

    res.json({ success: true, hospitals });
  } catch (err) {
    console.error('GET /hospitals/nearest error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hospitals — list all active hospitals
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM hospitals WHERE active = true ORDER BY city, name`
    );
    res.json({ success: true, hospitals: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hospitals/:id
router.get('/:id', async (req, res) => {
  try {
    const hospital = await getHospitalById(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json({ success: true, hospital });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
