import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Chat from './pages/Chat';
import News from './pages/News';
import Report from './pages/Report';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import Friends from './pages/Friends';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-100 font-sans">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#11296b',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
              },
            }}
          />
          
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Navigation />
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/news" element={
              <ProtectedRoute>
                <Navigation />
                <News />
              </ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute>
                <Navigation />
                <Report />
              </ProtectedRoute>
            } />
            <Route path="/forum" element={
              <ProtectedRoute>
                <Navigation />
                <Forum />
              </ProtectedRoute>
            } />
            <Route path="/friends" element={
              <ProtectedRoute>
                <Navigation />
                <Friends />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute adminOnly>
                <Navigation />
                <Dashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;