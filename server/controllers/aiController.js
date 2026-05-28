/**
 * aiController.js
 * All Gemini API interactions for RescueAI.
 * Uses Google Gemini content generation via native fetch.
 */

// Uses native fetch (Node 18+) — no SDK required
async function callGemini({ system, messages, imageBase64, imageMimeType }) {
  const prompt = system ? `${system}\n\n${messages[0].content}` : messages[0].content;

  const parts = [{ text: prompt }];

  // Add image if provided
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: imageMimeType,
        data: imageBase64,
      },
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(`Gemini error: ${JSON.stringify(data)}`);
  return data.candidates[0].content.parts[0].text;
}

/**
 * Core triage function.
 * Accepts a text description and optional base64 image.
 * Returns structured JSON with severity, first aid steps, and care recommendation.
 */
async function triageIncident({ description, incidentType, imageBase64, imageMimeType }) {
  const systemPrompt = `You are an expert emergency medical triage AI for RescueAI, deployed in South Sudan.
Your role is to assess emergency incidents (accidents, fights, injuries) and provide:
1. A severity score (1–5)
2. Immediate first aid steps for bystanders
3. A recommended care level

Severity scale:
- 5 = CRITICAL: life-threatening, needs immediate hospital care (bleeding out, unconscious, not breathing)
- 4 = SERIOUS: urgent hospital care needed within 1 hour (deep wounds, broken bones, head injury)
- 3 = MODERATE: medical attention needed within a few hours (lacerations, sprains, moderate pain)
- 2 = MINOR: clinic or self-care appropriate (minor cuts, bruising, mild pain)
- 1 = OBSERVATION: no immediate medical risk, monitor only

Always respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;

  const userContent = [];

  // Attach image if provided
  if (imageBase64 && imageMimeType) {
    userContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMimeType,
        data: imageBase64,
      },
    });
  }

  userContent.push({
    type: 'text',
    text: `Incident type: ${incidentType || 'unknown'}
Description: ${description}

Analyze this emergency and respond with this exact JSON structure:
{
  "severity_score": <1-5>,
  "severity_label": "<critical|serious|moderate|minor|observation>",
  "injury_type": "<brief injury description>",
  "care_level": "<hospital|clinic|self-care>",
  "image_analysis": "<what you see in the image, or null if no image>",
  "first_aid_steps": [
    "<step 1 — clear action bystander can take now>",
    "<step 2>",
    "<step 3>",
    "<step 4 — optional>",
    "<step 5 — optional>"
  ],
  "dispatch_immediately": <true if severity >= 4>,
  "ai_notes": "<any important clinical notes or warnings for the responder>"
}`,
  });

  const raw = await callGemini({
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
    imageBase64,
    imageMimeType,
  });
  // Strip any accidental markdown code fences
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Generate a formal police incident report from structured incident + triage data.
 * Returns plain text formatted as an official document.
 */
async function generatePoliceReport({ incident, triage }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const prompt = `You are a legal document assistant for RescueAI, South Sudan.
Generate a formal police incident report based on the following data.
The report must be professional, factual, and formatted for official use.
Use plain text with clear section headers — no markdown.

INCIDENT DATA:
- Incident ID: ${incident.id}
- Date/Time: ${dateStr} at ${timeStr}
- Location: ${incident.location_name || `${incident.location_lat}, ${incident.location_lng}`}
- Incident Type: ${incident.incident_type}
- Description: ${incident.description}
- Reported By: ${incident.reported_by || 'Anonymous bystander via RescueAI'}

MEDICAL TRIAGE DATA (assessed by RescueAI AI system):
- Severity Score: ${triage.severity_score}/5 (${triage.severity_label?.toUpperCase()})
- Injury Assessment: ${triage.injury_type}
- Required Care Level: ${triage.care_level}
- Immediate Dispatch Required: ${triage.dispatch_immediately ? 'YES' : 'No'}
- Clinical Notes: ${triage.ai_notes}

Generate a formal POLICE INCIDENT REPORT with these sections:
1. REPORT HEADER (report number, date, issuing system)
2. INCIDENT SUMMARY
3. VICTIM / PATIENT INFORMATION
4. CIRCUMSTANCES OF INCIDENT
5. MEDICAL ASSESSMENT SUMMARY
6. RECOMMENDED IMMEDIATE ACTION
7. DECLARATION (that this report was auto-generated by RescueAI for the purpose of enabling immediate medical response, and is submitted simultaneously with emergency dispatch)
8. SIGNATURE LINE (for attending officer to complete)`;

  return await callGemini({
    messages: [{ role: 'user', content: prompt }],
  });
}

/**
 * Given a severity score and care level, return additional contextual
 * first aid tips specific to South Sudan's setting (limited resources, heat, etc.)
 */
async function getContextualFirstAid({ injuryType, severityScore, resourcesAvailable }) {
  const prompt = `You are a wilderness and austere-environment first aid expert advising bystanders in South Sudan.
Resources available: ${resourcesAvailable || 'basic items only — cloth, water, no medications'}.
Injury: ${injuryType}, Severity: ${severityScore}/5.

Give 3–5 practical first aid tips that a non-medical bystander in rural South Sudan can actually perform right now.
Be specific, simple, and account for limited resources and hot climate.
Respond ONLY with a JSON array of strings: ["tip 1", "tip 2", ...]`;

  const raw = await callGemini({
    messages: [{ role: 'user', content: prompt }],
  });
  return JSON.parse(raw);
}

module.exports = { triageIncident, generatePoliceReport, getContextualFirstAid };
