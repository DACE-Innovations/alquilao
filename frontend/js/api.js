// URL base del backend
const API_URL = 'http://localhost:3000/api';

// ── HELPERS ──
const getToken = () => localStorage.getItem('token');
const getUsuario = () => JSON.parse(localStorage.getItem('usuario') || 'null');
const setAuth = (token, usuario) => {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
};
const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

// ── AUTH ──
const API = {

  // Registro
  registro: async (datos) => {
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return await res.json();
  },

  // Login
  login: async (datos) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return await res.json();
  },

  // Obtener propiedades
  getPropiedades: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const res = await fetch(`${API_URL}/propiedades?${params}`);
    return await res.json();
  },

  // Obtener propiedad por id
  getPropiedad: async (id) => {
    const res = await fetch(`${API_URL}/propiedades/${id}`);
    return await res.json();
  },

  // Crear propiedad
  crearPropiedad: async (datos) => {
    const res = await fetch(`${API_URL}/propiedades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(datos)
    });
    return await res.json();
  },

  // Obtener perfil
  getPerfil: async () => {
    const res = await fetch(`${API_URL}/usuarios/perfil`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await res.json();
  },

  // Crear reporte
  crearReporte: async (datos) => {
    const res = await fetch(`${API_URL}/reportes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(datos)
    });
    return await res.json();
  }
};