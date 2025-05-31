import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './routes/Dashboard';
import Schedule from './routes/Schedule';
import CallIn from './routes/CallIn';
import Admin from './routes/Admin';

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/callin" element={<CallIn />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;