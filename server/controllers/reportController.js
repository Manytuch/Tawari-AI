const PDFDocument = require('pdfkit');

/**
 * Stream a PDF police report to the HTTP response.
 * @param {object} res - Express response object
 * @param {object} incident - Incident row from DB
 * @param {object} triage - Triage result row from DB
 * @param {string} reportText - Plain-text report content from Claude
 * @param {string} reportNumber - e.g. RES-2024-001234
 */
function streamPDF(res, { incident, triage, reportText, reportNumber }) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 60, bottom: 60, left: 72, right: 72 },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="RescueAI_Report_${reportNumber}.pdf"`
  );

  doc.pipe(res);

  // ── Header bar ──
  doc.rect(0, 0, doc.page.width, 80).fill('#CC2B2B');
  doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
    .text('RESCUEAI', 72, 20);
  doc.fontSize(10).font('Helvetica')
    .text('Emergency Medical Response System — South Sudan', 72, 48);

  // Severity badge
  const severityColors = { 5: '#CC2B2B', 4: '#E07B00', 3: '#D4A800', 2: '#2B8A3E', 1: '#1971C2' };
  const badgeColor = severityColors[triage.severity_score] || '#555';
  doc.rect(doc.page.width - 140, 10, 70, 60).fill(badgeColor);
  doc.fillColor('white').fontSize(28).font('Helvetica-Bold')
    .text(triage.severity_score, doc.page.width - 128, 18, { align: 'left' });
  doc.fontSize(8).font('Helvetica')
    .text('SEVERITY', doc.page.width - 132, 50, { align: 'left' });

  doc.moveDown(4);

  // ── Report metadata ──
  doc.fillColor('#333333').fontSize(9).font('Helvetica');
  doc.text(`Report Number: ${reportNumber}`, { continued: true });
  doc.text(`   |   Generated: ${new Date().toLocaleString('en-GB')}`, { align: 'right' });
  doc.moveDown(0.5);
  doc.moveTo(72, doc.y).lineTo(doc.page.width - 72, doc.y).strokeColor('#CCCCCC').stroke();
  doc.moveDown(0.8);

  // ── Incident snapshot cards ──
  const cardY = doc.y;
  const cardW = (doc.page.width - 144 - 12) / 2;

  // Card 1: Incident details
  doc.rect(72, cardY, cardW, 90).fillAndStroke('#FFF5F5', '#E8B4B4');
  doc.fillColor('#CC2B2B').fontSize(9).font('Helvetica-Bold')
    .text('INCIDENT', 84, cardY + 10);
  doc.fillColor('#333').fontSize(9).font('Helvetica')
    .text(`Type: ${incident.incident_type}`, 84, cardY + 26)
    .text(`Location: ${incident.location_name || 'GPS: ' + incident.location_lat + ', ' + incident.location_lng}`, 84, cardY + 40, { width: cardW - 24 })
    .text(`Status: ${incident.status?.toUpperCase()}`, 84, cardY + 68);

  // Card 2: Triage summary
  doc.rect(72 + cardW + 12, cardY, cardW, 90).fillAndStroke('#FFF8E1', '#F5D87A');
  doc.fillColor('#7C5C00').fontSize(9).font('Helvetica-Bold')
    .text('TRIAGE ASSESSMENT', 84 + cardW + 12, cardY + 10);
  doc.fillColor('#333').fontSize(9).font('Helvetica')
    .text(`Severity: ${triage.severity_score}/5 — ${triage.severity_label?.toUpperCase()}`, 84 + cardW + 12, cardY + 26)
    .text(`Injury: ${triage.injury_type}`, 84 + cardW + 12, cardY + 40, { width: cardW - 24 })
    .text(`Care Level: ${triage.care_level?.toUpperCase()}`, 84 + cardW + 12, cardY + 56)
    .text(`Immediate Dispatch: ${triage.dispatch_immediately ? 'YES' : 'No'}`, 84 + cardW + 12, cardY + 70);

  doc.moveDown(6);

  // ── Main report body ──
  doc.fillColor('#111111').fontSize(10).font('Helvetica');

  const lines = reportText.split('\n');
  for (const line of lines) {
    if (line.trim() === '') {
      doc.moveDown(0.4);
    } else if (line.match(/^\d+\.|^[A-Z][A-Z\s]+:/) || line.match(/^[A-Z\s]{4,}$/)) {
      // Section headers
      doc.moveDown(0.4);
      doc.fillColor('#CC2B2B').fontSize(10).font('Helvetica-Bold').text(line);
      doc.fillColor('#111111').font('Helvetica').fontSize(10);
    } else {
      doc.text(line, { lineGap: 2 });
    }
  }

  // ── First aid steps ──
  if (triage.first_aid_steps && triage.first_aid_steps.length) {
    doc.addPage();
    doc.fillColor('#CC2B2B').fontSize(12).font('Helvetica-Bold')
      .text('IMMEDIATE FIRST AID STEPS FOR BYSTANDERS');
    doc.moveTo(72, doc.y + 4).lineTo(doc.page.width - 72, doc.y + 4).strokeColor('#CC2B2B').stroke();
    doc.moveDown(0.8);

    const steps = Array.isArray(triage.first_aid_steps)
      ? triage.first_aid_steps
      : JSON.parse(triage.first_aid_steps);

    steps.forEach((step, i) => {
      // Step circle
      doc.circle(84, doc.y + 8, 10).fillAndStroke('#CC2B2B', '#CC2B2B');
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
        .text(String(i + 1), 80, doc.y - 10);
      doc.fillColor('#111').fontSize(10).font('Helvetica')
        .text(step, 104, doc.y - 18, { width: doc.page.width - 180 });
      doc.moveDown(0.8);
    });
  }

  // ── Footer ──
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fillColor('#999999').fontSize(8).font('Helvetica')
      .text(
        `RescueAI Emergency Response System  |  Report ${reportNumber}  |  Page ${i + 1} of ${pageCount}`,
        72, doc.page.height - 40,
        { align: 'center', width: doc.page.width - 144 }
      );
  }

  doc.end();
}

module.exports = { streamPDF };
