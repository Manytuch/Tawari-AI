const express = require('express');
const router = express.Router();
const db = require('../db');
const { generatePoliceReport } = require('../controllers/aiController');
const { streamPDF } = require('../controllers/reportController');

// GET /api/reports/:incidentId/pdf
// Generates and streams a police report PDF for a given incident
router.get('/:incidentId/pdf', async (req, res) => {
  try {
    const { incidentId } = req.params;

    // Fetch incident
    const incidentRes = await db.query('SELECT * FROM incidents WHERE id = $1', [incidentId]);
    if (!incidentRes.rows.length) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    const incident = incidentRes.rows[0];

    // Fetch triage
    const triageRes = await db.query(
      'SELECT * FROM triage_results WHERE incident_id = $1 ORDER BY created_at DESC LIMIT 1',
      [incidentId]
    );
    if (!triageRes.rows.length) {
      return res.status(404).json({ error: 'Triage data not found for this incident' });
    }
    const triage = triageRes.rows[0];

    // Fetch or create police report record
    let reportRes = await db.query(
      'SELECT * FROM police_reports WHERE incident_id = $1 ORDER BY generated_at DESC LIMIT 1',
      [incidentId]
    );

    let reportNumber;
    if (reportRes.rows.length) {
      reportNumber = reportRes.rows[0].report_number;
    } else {
      reportNumber = `RES-${new Date().getFullYear()}-${String(incidentId).substring(0, 8).toUpperCase()}`;
      await db.query(
        'INSERT INTO police_reports (incident_id, report_number) VALUES ($1, $2)',
        [incidentId, reportNumber]
      );
    }

    // Generate report text via Claude
    const reportText = await generatePoliceReport({ incident, triage });

    // Stream PDF to client
    streamPDF(res, { incident, triage, reportText, reportNumber });

    // Mark as sent in background
    db.query(
      'UPDATE police_reports SET sent_to_police = true WHERE incident_id = $1',
      [incidentId]
    ).catch(console.error);

  } catch (err) {
    console.error('GET /reports/:id/pdf error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/reports/:incidentId — report metadata only (no PDF)
router.get('/:incidentId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM police_reports WHERE incident_id = $1 ORDER BY generated_at DESC LIMIT 1',
      [req.params.incidentId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'No report found' });
    }
    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
