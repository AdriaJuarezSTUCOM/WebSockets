// src/Rutas.jsx
import { Routes, Route } from 'react-router-dom';
import Login from '../src/Views/LoginPage';
import App from '../src/App'; // Asumiendo que tienes una vista llamada App

export default function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/app" element={<App />} />
    </Routes>
  );
}
