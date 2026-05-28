const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const { triageIncident } = require('../controllers/aiController');
const { getNearestHospitals } = require('../controllers/hospitalController');

// Use memory storage so we can pass base64 to Claude directly
// (switch to Cloudinary storage once you have credentials)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/incidents
// Creates incident, runs AI triage, returns everything in one response
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      description,
      incident_type = 'accident',
      location_lat,
      location_lng,
      location_name,
      reported_by,
    } = req.body;

    if (!description || !location_lat || !location_lng) {
      return res.status(400).json({
        error: 'description, location_lat and location_lng are required',
      });
    }

    const lat = parseFloat(location_lat);
    const lng = parseFloat(location_lng);

    // 1. Save incident
    const incidentResult = await db.query(
      `INSERT INTO incidents
         (description, incident_type, location_lat, location_lng, location_name, reported_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [description, incident_type, lat, lng, location_name || null, reported_by || null]
    );
    const incident = incidentResult.rows[0];

    // 2. Prepare image for Claude if uploaded
    let imageBase64 = null;
    let imageMimeType = null;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      imageMimeType = req.file.mimetype;
    }

    // 3. AI triage (with image if provided)
    const triage = await triageIncident({
      description,
      incidentType: incident_type,
      imageBase64,
      imageMimeType,
    });

    // 4. Save triage result
    const triageResult = await db.query(
      `INSERT INTO triage_results
         (incident_id, severity_score, severity_label, injury_type, care_level,
          first_aid_steps, image_analysis, ai_notes, dispatch_immediately)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        incident.id,
        triage.severity_score,
        triage.severity_label,
        triage.injury_type,
        triage.care_level,
        JSON.stringify(triage.first_aid_steps),
        triage.image_analysis || null,
        triage.ai_notes || null,
        triage.dispatch_immediately,
      ]
    );

    // 5. Update incident status
    await db.query(
      `UPDATE incidents SET status = 'triaged', updated_at = NOW() WHERE id = $1`,
      [incident.id]
    );

    // 6. Find nearest hospitals
    const hospitals = await getNearestHospitals({
      lat,
      lng,
      careLevel: triage.care_level,
      limit: 5,
    });

    // 7. Generate a report number and create police report record
    const reportNumber = `RES-${new Date().getFullYear()}-${String(incident.id).substring(0, 8).toUpperCase()}`;
    await db.query(
      `INSERT INTO police_reports (incident_id, report_number) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [incident.id, reportNumber]
    );

    res.status(201).json({
      success: true,
      incident_id: incident.id,
      report_number: reportNumber,
      triage: triageResult.rows[0],
      hospitals,
    });
  } catch (err) {
    console.error('POST /incidents error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/incidents/:id — fetch full incident + triage
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await db.query('SELECT * FROM incidents WHERE id = $1', [id]);
    if (!incident.rows.length) return res.status(404).json({ error: 'Incident not found' });

    const triage = await db.query(
      'SELECT * FROM triage_results WHERE incident_id = $1 ORDER BY created_at DESC LIMIT 1',
      [id]
    );

    res.json({ incident: incident.rows[0], triage: triage.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/incidents — list recent incidents (admin/dashboard use)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, t.severity_score, t.severity_label
       FROM incidents i
       LEFT JOIN triage_results t ON t.incident_id = i.id
       ORDER BY i.created_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
