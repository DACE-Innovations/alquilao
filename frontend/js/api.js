// URL base del backend
const API_URL = 'http://localhost:3000/api';

// URL base del backend
const API_URL = 'http://localhost:3000/api';

// ── HELPERS (Sincronizados con seguridad.js) ──
const getToken = () => localStorage.getItem('alquilao_token');
const getUsuario = () => {
  const sesion = sessionStorage.getItem('alquilao_session');
  return sesion ? JSON.parse(sesion).usuario : null;
};
const setAuth = (token, usuario) => {
  // Ahora usan las llaves oficiales del sistema
  localStorage.setItem('alquilao_token', token);
  sessionStorage.setItem('alquilao_session', JSON.stringify({
    usuario: usuario, 
    token: token, 
    expira: Date.now() + (24 * 60 * 60 * 1000) 
  }));
};
const clearAuth = () => {
  localStorage.removeItem('alquilao_token');
  sessionStorage.removeItem('alquilao_session');
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