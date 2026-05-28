import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import TriageResultPage from './pages/TriageResultPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<LandingPage />} />
      <Route path="/report"     element={<ReportPage />} />
      <Route path="/result/:id" element={<TriageResultPage />} />
    </Routes>
  );
}
