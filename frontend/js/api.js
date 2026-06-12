// frontend/js/api.js
// ── CAMBIOS respecto a la versión anterior ──
//   + getFavoritos()           → GET  /api/favoritos
//   + toggleFavorito(id)       → POST /api/favoritos/:id
//   + getMisPublicaciones()    → GET  /api/mis-publicaciones
// Todo lo demás es idéntico a la versión original.

const API_URL = 'http://localhost:3000/api';

const getToken = () => {
  if (window.Seguridad) return Seguridad.getToken();
  return localStorage.getItem('alquilao_token');
};

const getUsuario = () => {
  if (window.Seguridad) return Seguridad.getUsuario();
  const sesion = sessionStorage.getItem('alquilao_session') || localStorage.getItem('alquilao_session');
  if (!sesion) return null;
  try {
    return JSON.parse(sesion).usuario || null;
  } catch {
    return null;
  }
};

const setAuth = (token, usuario) => {
  if (window.Seguridad) {
    Seguridad.guardarSesion(usuario, token);
    return;
  }
  localStorage.setItem('alquilao_token', token);
  const sesion = JSON.stringify({
    usuario,
    token,
    inicio: Date.now(),
    expira: Date.now() + (24 * 60 * 60 * 1000)
  });
  sessionStorage.setItem('alquilao_session', sesion);
  localStorage.setItem('alquilao_session', sesion);
};

const clearAuth = () => {
  if (window.Seguridad) {
    Seguridad.cerrarSesion();
    return;
  }
  localStorage.removeItem('alquilao_token');
  sessionStorage.removeItem('alquilao_session');
  localStorage.removeItem('alquilao_session');
};

const API = {
  // ── Auth ──
  registro: async (datos) => {
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return await res.json();
  },

  login: async (datos) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return await res.json();
  },

  // ── Propiedades ──
  getPropiedades: async (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    const res = await fetch(`${API_URL}/propiedades?${params}`);
    return await res.json();
  },

  getPropiedad: async (id) => {
    const res = await fetch(`${API_URL}/propiedades/${id}`);
    return await res.json();
  },

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

  // ── Perfil ──
  getPerfil: async () => {
    const res = await fetch(`${API_URL}/usuarios/perfil`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await res.json();
  },

  actualizarPerfil: async (datos) => {
    const res = await fetch(`${API_URL}/usuarios/perfil`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(datos)
    });
    return await res.json();
  },

  // ── Reportes ──
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
  },

  // ── FAVORITOS (nuevos) ──
  getFavoritos: async () => {
    const res = await fetch(`${API_URL}/favoritos`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await res.json();
  },

  toggleFavorito: async (idPropiedad) => {
    const res = await fetch(`${API_URL}/favoritos/${idPropiedad}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await res.json();
  },

  // ── MIS PUBLICACIONES (nuevo) ──
  getMisPublicaciones: async () => {
    const res = await fetch(`${API_URL}/mis-publicaciones`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await res.json();
  }
};
