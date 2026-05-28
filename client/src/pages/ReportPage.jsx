import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitIncident } from '../lib/api.js';

const INCIDENT_TYPES = [
  { value: 'accident',  label: '🚗 Road Accident' },
  { value: 'fight',     label: '⚔️ Fight / Assault' },
  { value: 'fire',      label: '🔥 Fire / Burns' },
  { value: 'medical',   label: '💊 Medical Emergency' },
  { value: 'drowning',  label: '🌊 Drowning' },
  { value: 'other',     label: '⚠️ Other Emergency' },
];

const STAGES = [
  { key: 'form',       label: 'Report' },
  { key: 'submitting', label: 'Submitting' },
  { key: 'triaging',   label: 'AI Triage' },
  { key: 'done',       label: 'Done' },
];

export default function ReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [stage, setStage] = useState('form'); // form | submitting | triaging | done
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    description: '',
    incident_type: 'accident',
    location_lat: '',
    location_lng: '',
    location_name: '',
    reported_by: '',
    imageFile: null,
  });

  const [gpsLoading, setGpsLoading] = useState(false);

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(f => ({ ...f, imageFile: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function getGPS() {
    setGpsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          location_lat: pos.coords.latitude.toFixed(6),
          location_lng: pos.coords.longitude.toFixed(6),
        }));
        setGpsLoading(false);
      },
      () => {
        setError('Could not get your location. Enter coordinates manually or use the Juba default.');
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  }

  function useJubaDefault() {
    setForm(f => ({ ...f, location_lat: '4.851400', location_lng: '31.582500', location_name: 'Juba, Central Equatoria' }));
  }

  async function handleSubmit() {
    setError(null);
    if (!form.description.trim()) return setError('Please describe what happened.');
    if (!form.location_lat || !form.location_lng) return setError('Location is required. Use GPS or enter manually.');

    setStage('submitting');
    setTimeout(() => setStage('triaging'), 800);

    try {
      const result = await submitIncident({
        description: form.description,
        incidentType: form.incident_type,
        locationLat: form.location_lat,
        locationLng: form.location_lng,
        locationName: form.location_name,
        reportedBy: form.reported_by,
        imageFile: form.imageFile,
      });

      setStage('done');
      setTimeout(() => navigate(`/result/${result.incident_id}`, { state: result }), 600);
    } catch (err) {
      setStage('form');
      setError(err.message || 'Submission failed. Check your connection.');
    }
  }

  const isLoading = stage !== 'form';

  return (
    <div className="min-h-screen bg-rescue-dark font-body">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-rescue-border">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-rescue-red rounded-sm flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">TW</span>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight group-hover:text-rescue-red transition-colors">TawariAI</span>
        </button>
        <span className="font-mono text-xs text-rescue-muted">Report Incident</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STAGES.map((s, i) => {
            const idx = STAGES.findIndex(x => x.key === stage);
            const active = i === idx;
            const done   = i < idx;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all
                  ${active ? 'bg-rescue-red text-white' : done ? 'bg-rescue-red/20 text-rescue-red' : 'bg-rescue-panel text-rescue-muted border border-rescue-border'}
                `}>
                  {done ? '✓ ' : ''}{s.label}
                  {active && stage !== 'form' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`w-6 h-px ${done ? 'bg-rescue-red' : 'bg-rescue-border'} transition-all`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="text-center py-20 animate-fade-up">
            <div className="w-16 h-16 border-4 border-rescue-border border-t-rescue-red rounded-full animate-spin mx-auto mb-6" />
            <h2 className="font-display font-bold text-white text-2xl mb-2">
              {stage === 'submitting' ? 'Submitting incident…' : 'AI is analysing…'}
            </h2>
            <p className="text-gray-400 text-sm">
              {stage === 'triaging'
                ? 'Claude is assessing severity and generating first aid instructions'
                : 'Saving your report'}
            </p>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h1 className="font-display font-extrabold text-white text-3xl mb-1">Report an Emergency</h1>
              <p className="text-gray-400 text-sm">All fields except image are required. Medical response starts immediately.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-400 text-sm">
                ⚠ {error}
              </div>
            )}

            {/* Incident type */}
            <div>
              <label className="block text-xs font-mono text-rescue-muted uppercase tracking-wider mb-2">
                Incident Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INCIDENT_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, incident_type: t.value }))}
                    className={`
                      px-3 py-2.5 rounded-lg text-sm text-left border transition-all
                      ${form.incident_type === t.value
                        ? 'bg-rescue-red/20 border-rescue-red text-white'
                        : 'bg-rescue-panel border-rescue-border text-gray-400 hover:border-gray-500'}
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono text-rescue-muted uppercase tracking-wider mb-2">
                What happened? *
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="Describe the incident clearly — number of people injured, visible injuries, how it happened…"
                className="w-full bg-rescue-panel border border-rescue-border rounded-xl px-4 py-3 text-white text-sm placeholder-rescue-muted focus:outline-none focus:border-rescue-red resize-none transition-colors"
              />
              <p className="text-xs text-rescue-muted mt-1">{form.description.length}/500 · More detail = better AI triage</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-mono text-rescue-muted uppercase tracking-wider mb-2">
                Location *
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={getGPS}
                  disabled={gpsLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rescue-panel border border-rescue-border rounded-xl text-sm text-white hover:border-rescue-red transition-colors disabled:opacity-50"
                >
                  {gpsLoading
                    ? <><span className="w-4 h-4 border-2 border-rescue-muted border-t-rescue-red rounded-full animate-spin" /> Locating…</>
                    : '📍 Use my GPS location'}
                </button>
                <button
                  onClick={useJubaDefault}
                  className="px-4 py-2.5 bg-rescue-panel border border-rescue-border rounded-xl text-sm text-rescue-muted hover:text-white hover:border-gray-500 transition-colors"
                >
                  Juba default
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.000001"
                  value={form.location_lat}
                  onChange={set('location_lat')}
                  placeholder="Latitude e.g. 4.851400"
                  className="bg-rescue-panel border border-rescue-border rounded-xl px-4 py-3 text-white text-sm placeholder-rescue-muted focus:outline-none focus:border-rescue-red transition-colors font-mono"
                />
                <input
                  type="number"
                  step="0.000001"
                  value={form.location_lng}
                  onChange={set('location_lng')}
                  placeholder="Longitude e.g. 31.582500"
                  className="bg-rescue-panel border border-rescue-border rounded-xl px-4 py-3 text-white text-sm placeholder-rescue-muted focus:outline-none focus:border-rescue-red transition-colors font-mono"
                />
              </div>
              <input
                type="text"
                value={form.location_name}
                onChange={set('location_name')}
                placeholder="Location description (optional) — e.g. Near Juba Bridge, Munuki Road"
                className="mt-3 w-full bg-rescue-panel border border-rescue-border rounded-xl px-4 py-3 text-white text-sm placeholder-rescue-muted focus:outline-none focus:border-rescue-red transition-colors"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-mono text-rescue-muted uppercase tracking-wider mb-2">
                Photo of Incident (optional but recommended)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-6 cursor-pointer text-center transition-colors
                  ${imagePreview ? 'border-rescue-red/50' : 'border-rescue-border hover:border-gray-500'}
                `}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                    <p className="text-xs text-rescue-muted mt-2">Click to change image</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-2">📷</p>
                    <p className="text-sm text-gray-400">Click to upload a photo</p>
                    <p className="text-xs text-rescue-muted mt-1">JPEG, PNG or WEBP · Max 20 MB</p>
                    <p className="text-xs text-rescue-red mt-1">Claude will analyse the image to improve triage accuracy</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImage}
              />
            </div>

            {/* Reporter */}
            <div>
              <label className="block text-xs font-mono text-rescue-muted uppercase tracking-wider mb-2">
                Your name / contact (optional)
              </label>
              <input
                type="text"
                value={form.reported_by}
                onChange={set('reported_by')}
                placeholder="Anonymous bystander"
                className="w-full bg-rescue-panel border border-rescue-border rounded-xl px-4 py-3 text-white text-sm placeholder-rescue-muted focus:outline-none focus:border-rescue-red transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-rescue-red text-white font-display font-bold text-lg rounded-xl hover:bg-red-700 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-900/30"
            >
              🚨 Submit Emergency — Get Immediate Help
            </button>

            <p className="text-xs text-rescue-muted text-center">
              Medical response dispatched immediately. Police report generated in parallel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
