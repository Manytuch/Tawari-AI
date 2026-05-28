const BASE = '/api';

// Submit a new incident with optional image file
export async function submitIncident({ description, incidentType, locationLat, locationLng, locationName, reportedBy, imageFile }) {
  const form = new FormData();
  form.append('description', description);
  form.append('incident_type', incidentType);
  form.append('location_lat', String(locationLat));
  form.append('location_lng', String(locationLng));
  if (locationName) form.append('location_name', locationName);
  if (reportedBy)   form.append('reported_by', reportedBy);
  if (imageFile)    form.append('image', imageFile);

  const res = await fetch(`${BASE}/incidents`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit incident');
  return data; // { incident_id, report_number, triage, hospitals }
}

// Get nearest hospitals for coordinates
export async function getNearestHospitals({ lat, lng, careLevel, limit = 5 }) {
  const params = new URLSearchParams({ lat, lng, limit });
  if (careLevel) params.set('care_level', careLevel);
  const res = await fetch(`${BASE}/hospitals/nearest?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch hospitals');
  return data.hospitals;
}

// Get incident + triage details
export async function getIncident(id) {
  const res = await fetch(`${BASE}/incidents/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch incident');
  return data;
}

// Get PDF download URL (just build it — browser navigates to it)
export function getReportPDFUrl(incidentId) {
  return `${BASE}/reports/${incidentId}/pdf`;
}

// Health check
export async function checkHealth() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}
