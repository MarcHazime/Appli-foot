import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlayerProfile from './pages/PlayerProfile';
import ClubProfile from './pages/ClubProfile';
import MapSearch from './pages/MapSearch';
import PublicProfile from './pages/PublicProfile';
import Messages from './pages/Messages';
import { ToastProvider } from './context/ToastContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
    const { user } = useAuth();

    return (
        <LanguageProvider>
            <ToastProvider> {/* Wrapped with ToastProvider */}
                <Router>
                    <Routes>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                        <Route element={
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        }>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/map" element={<MapSearch />} />
                            <Route path="/messages" element={<Messages />} />
                            <Route path="/user/:id" element={<PublicProfile />} />
                            <Route path="/profile" element={user?.role?.toUpperCase() === 'PLAYER' ? <PlayerProfile /> : <ClubProfile />} />
                        </Route>

                        <Route path="/" element={<Navigate to="/login" />} />
                    </Routes>
                </Router>
            </ToastProvider> {/* Closed ToastProvider */}
        </LanguageProvider>
    );
}

export default App;
