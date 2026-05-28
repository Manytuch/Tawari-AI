const express = require('express');
const router = express.Router();
const { triageIncident } = require('../controllers/aiController');

// POST /api/triage
// Standalone triage — useful for re-triaging or testing without saving to DB
router.post('/', async (req, res) => {
  try {
    const { description, incident_type, imageBase64, imageMimeType } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }

    const triage = await triageIncident({
      description,
      incidentType: incident_type || 'unknown',
      imageBase64: imageBase64 || null,
      imageMimeType: imageMimeType || null,
    });

    res.json({ success: true, triage });
  } catch (err) {
    console.error('POST /triage error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
