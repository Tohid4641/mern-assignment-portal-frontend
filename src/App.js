import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherSubmissions from './pages/TeacherSubmissions';
import StudentDashboard from './pages/StudentDashboard';
import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to='/' />;
  if (role && user.role !== role) return <Navigate to='/' />;
  return children;
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/teacher" element={<PrivateRoute role="teacher"><TeacherDashboard/></PrivateRoute>} />
        <Route path="/teacher/submissions/:id" element={<PrivateRoute role="teacher"><TeacherSubmissions/></PrivateRoute>} />
        <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard/></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
