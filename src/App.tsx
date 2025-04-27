import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import GroupPage from "./pages/GroupPage";
import CallPage from "./pages/CallPage";

function App() {
  // TODO: Add auth logic and route guards
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat/:chatId" element={<ChatPage />} />
      <Route path="/group/:groupId" element={<GroupPage />} />
      <Route path="/call/:callId" element={<CallPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
