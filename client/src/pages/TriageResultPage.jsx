import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getIncident, getNearestHospitals, getReportPDFUrl } from '../lib/api.js';
import SeverityBadge from '../components/SeverityBadge.jsx';
import FirstAidPanel from '../components/FirstAidPanel.jsx';
import HospitalCard from '../components/HospitalCard.jsx';
import EmergencyMap from '../components/EmergencyMap.jsx';

const CARE_LEVEL_LABELS = {
  hospital:  { label: 'Hospital Required',     color: 'text-red-400',    bg: 'bg-red-950/40 border-red-800' },
  clinic:    { label: 'Clinic Care Needed',     color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800' },
  'self-care':{ label: 'Self-Care Appropriate', color: 'text-green-400',  bg: 'bg-green-950/40 border-green-800' },
};

export default function TriageResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Result may come from navigation state (instant) or fetched from API
  const [data, setData] = useState(location.state || null);
  const [hospitals, setHospitals] = useState(location.state?.hospitals || []);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('firstaid'); // firstaid | hospitals | map

  useEffect(() => {
    if (data) {
      // If we have data from navigation but no hospitals, fetch them
      if (!hospitals.length && data.triage) {
        fetchHospitals(data);
      }
      return;
    }

    // Fetch from API if navigated directly to URL
    async function load() {
      try {
        const result = await getIncident(id);
        setData({
          incident_id: result.incident.id,
          report_number: null,
          triage: result.triage,
          incident: result.incident,
        });
        if (result.triage) {
          await fetchHospitals(result);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function fetchHospitals(d) {
    try {
      const triage  = d.triage;
      const lat     = d.incident?.location_lat || d.triage?.incident_lat;
      const lng     = d.incident?.location_lng || d.triage?.incident_lng;
      if (!lat || !lng) return;
      const hs = await getNearestHospitals({ lat, lng, careLevel: triage?.care_level });
      setHospitals(hs);
    } catch {}
  }

  function downloadPDF() {
    setPdfLoading(true);
    const url = getReportPDFUrl(id);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RescueAI_Report_${id.substring(0, 8)}.pdf`;
    a.click();
    setTimeout(() => setPdfLoading(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rescue-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rescue-border border-t-rescue-red rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono text-sm">Loading triage results…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-rescue-dark flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-rescue-red text-4xl mb-4">⚠</p>
          <h2 className="font-display font-bold text-white text-2xl mb-2">Could not load report</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-rescue-red text-white rounded-xl font-display font-bold">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const triage   = data?.triage;
  const incident = data?.incident;
  const incLat   = parseFloat(incident?.location_lat || 4.8514);
  const incLng   = parseFloat(incident?.location_lng || 31.5825);
  const careConf = CARE_LEVEL_LABELS[triage?.care_level] || CARE_LEVEL_LABELS['clinic'];

  return (
    <div className="min-h-screen bg-rescue-dark font-body">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-rescue-border">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-rescue-red rounded-sm flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">R</span>
          </div>
          <span className="font-display font-bold text-white text-lg group-hover:text-rescue-red transition-colors">RescueAI</span>
        </button>
        <span className="font-mono text-xs text-rescue-muted">
          Incident #{id?.substring(0, 8).toUpperCase()}
        </span>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Top: Severity + care level + dispatch alert */}
        <div className="animate-fade-up stagger-1">
          {triage?.dispatch_immediately && (
            <div className="flex items-center gap-3 px-5 py-3 bg-red-950/60 border border-red-800 rounded-xl mb-4 animate-pulse-slow">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-display font-bold text-red-400 text-sm">IMMEDIATE DISPATCH REQUIRED</p>
                <p className="text-red-300/70 text-xs">This case is life-threatening. Contact emergency services now.</p>
              </div>
              <a href="tel:+211" className="ml-auto px-4 py-2 bg-rescue-red text-white text-xs font-mono rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
                📞 Call 911
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-5 p-6 bg-rescue-panel border border-rescue-border rounded-2xl">
            <SeverityBadge score={triage?.severity_score} large />

            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-2 mb-3">
                <h1 className="font-display font-extrabold text-white text-2xl">
                  {triage?.injury_type || 'Emergency Incident'}
                </h1>
                <span className={`px-3 py-1 border rounded-full text-xs font-mono ${careConf.bg} ${careConf.color}`}>
                  {careConf.label}
                </span>
              </div>

              {triage?.image_analysis && (
                <div className="mb-3 p-3 bg-rescue-dark rounded-lg border border-rescue-border">
                  <p className="text-xs font-mono text-rescue-muted uppercase tracking-wider mb-1">🔍 Image Analysis</p>
                  <p className="text-sm text-gray-300">{triage.image_analysis}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                {incident?.incident_type && (
                  <span className="font-mono">Type: {incident.incident_type}</span>
                )}
                {incident?.location_name && (
                  <span>📍 {incident.location_name}</span>
                )}
                {data?.report_number && (
                  <span className="font-mono text-rescue-muted">Ref: {data.report_number}</span>
                )}
              </div>
            </div>

            {/* PDF download */}
            <div className="flex-shrink-0">
              <button
                onClick={downloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-3 bg-rescue-dark border border-rescue-border rounded-xl text-sm text-gray-300 hover:border-rescue-red hover:text-white transition-all disabled:opacity-50"
              >
                {pdfLoading
                  ? <><span className="w-4 h-4 border-2 border-rescue-muted border-t-rescue-red rounded-full animate-spin" /> Generating…</>
                  : <>📄 Download Police Report</>}
              </button>
              <p className="text-xs text-rescue-muted mt-1.5 text-center">PDF sent to station in parallel</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-up stagger-2">
          <div className="flex gap-1 p-1 bg-rescue-panel border border-rescue-border rounded-xl mb-4">
            {[
              { key: 'firstaid',  label: '🩺 First Aid'  },
              { key: 'hospitals', label: '🏥 Hospitals'  },
              { key: 'map',       label: '🗺️ Map'        },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`
                  flex-1 py-2.5 text-sm font-display font-semibold rounded-lg transition-all
                  ${activeTab === t.key
                    ? 'bg-rescue-red text-white shadow-sm'
                    : 'text-rescue-muted hover:text-white'}
                `}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* First Aid */}
          {activeTab === 'firstaid' && (
            <FirstAidPanel
              steps={triage?.first_aid_steps}
              injuryType={triage?.injury_type}
              aiNotes={triage?.ai_notes}
              dispatchImmediately={triage?.dispatch_immediately}
            />
          )}

          {/* Hospitals */}
          {activeTab === 'hospitals' && (
            <div className="space-y-3">
              {hospitals.length === 0 ? (
                <div className="p-6 bg-rescue-panel border border-rescue-border rounded-xl text-center text-rescue-muted text-sm">
                  No hospitals found near this location.
                </div>
              ) : (
                hospitals.map((h, i) => (
                  <HospitalCard key={h.id || i} hospital={h} rank={i} />
                ))
              )}
            </div>
          )}

          {/* Map */}
          {activeTab === 'map' && (
            <div className="bg-rescue-panel border border-rescue-border rounded-xl overflow-hidden">
              <EmergencyMap
                incidentLat={incLat}
                incidentLng={incLng}
                hospitals={hospitals}
                severityScore={triage?.severity_score || 3}
              />
              <div className="px-4 py-3 flex items-center gap-4 text-xs font-mono text-rescue-muted border-t border-rescue-border">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rescue-red inline-block" />
                  Incident
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-green-600 inline-block" />
                  Nearest hospital
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-blue-700 inline-block" />
                  Other facilities
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="animate-fade-up stagger-3 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/report')}
            className="flex-1 py-3 bg-rescue-panel border border-rescue-border rounded-xl text-sm text-gray-300 font-display font-semibold hover:border-rescue-red hover:text-white transition-all"
          >
            + Report Another Incident
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 bg-rescue-panel border border-rescue-border rounded-xl text-sm text-gray-300 font-display font-semibold hover:border-gray-500 hover:text-white transition-all"
          >
            ← Back to Home
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-rescue-muted text-center pb-6 font-mono">
          RescueAI triage is AI-generated guidance, not a substitute for professional medical assessment.
          Police report has been auto-generated and submitted in parallel with this medical response.
        </p>
      </div>
    </div>
  );
}
