import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';


import Landing from './pages/auth/Landing';
import Agora from './pages/home/Agora';
import SwipeStack from './pages/stack/SwipeStack';
import ChatEngine from './pages/chat/ChatEngine';
import Communities from './pages/communities/Communities';
import Profile from './pages/auth/Profile';

function App() {
  // app routes are split into public and protected
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {}
          <Route path="/" element={<Landing />} />

          {}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Agora />} />
            <Route path="/stack" element={<SwipeStack />} />
            <Route path="/chat" element={<ChatEngine />} />
            <Route path="/chat/:conversationId" element={<ChatEngine />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
