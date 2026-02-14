import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { isAuthenticated } from '@/lib/auth';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import CravingFlow from '@/pages/CravingFlow';
import TimerSession from '@/pages/TimerSession';
import Journal from '@/pages/Journal';
import JournalAdd from '@/pages/JournalAdd';
import JournalDetail from '@/pages/JournalDetail';
import CopingTools from '@/pages/CopingTools';
import Progress from '@/pages/Progress';
import Resources from '@/pages/Resources';
import Settings from '@/pages/Settings';
import Privacy from '@/pages/Privacy';
import CalendarPage from '@/pages/CalendarPage';
import '@/App.css';

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/auth" replace />;
};

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/home" replace />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/craving-flow"
            element={
              <ProtectedRoute>
                <CravingFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timer-session"
            element={
              <ProtectedRoute>
                <TimerSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal/add"
            element={
              <ProtectedRoute>
                <JournalAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal/:id"
            element={
              <ProtectedRoute>
                <JournalDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coping-tools"
            element={
              <ProtectedRoute>
                <CopingTools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <ProtectedRoute>
                <Privacy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
