// ═══════════════════════════════════════════════════════════
//  ALQUILAO' — MÓDULO DE SEGURIDAD
//  seguridad.js
//  Versión: 1.0.1 (Optimizado anti-bucles)
// ═══════════════════════════════════════════════════════════

const Seguridad = (() => {

  // ── CONFIGURACIÓN ────────────────────────────────────────
  const CONFIG = {
    SESSION_KEY:      'alquilao_session',
    TOKEN_KEY:        'alquilao_token',
    LOGS_KEY:         'alquilao_logs',
    INTENTOS_KEY:     'alquilao_intentos',
    MAX_INTENTOS:     5,
    BLOQUEO_MS:       15 * 60 * 1000,   // 15 minutos
    INACTIVIDAD_MS:   30 * 60 * 1000,   // 30 minutos
    TOKEN_EXPIRY_MS:  24 * 60 * 60 * 1000, // 24 horas
  };

  // ── ROLES Y PERMISOS ─────────────────────────────────────
  const ROLES = {
    admin:      { nivel: 3, label: 'Administrador' },
    moderador:  { nivel: 2, label: 'Moderador'     },
    vendedor:   { nivel: 1, label: 'Propietario / Agente' },
    usuario:    { nivel: 0, label: 'Inquilino'     },
  };

  const PERMISOS = {
    publicar:         ['admin', 'moderador', 'vendedor'],
    verMisPublic:     ['admin', 'moderador', 'vendedor'],
    moderarContenido: ['admin', 'moderador'],
    adminPanel:       ['admin'],
    verFavoritos:     ['admin', 'moderador', 'vendedor', 'usuario'],
    verPerfil:        ['admin', 'moderador', 'vendedor', 'usuario'],
  };

  // ── RUTAS PROTEGIDAS ─────────────────────────────────────
  const RUTAS_PROTEGIDAS = {
    'perfil.html':            ['admin', 'moderador', 'vendedor', 'usuario'],
    'favoritos.html':         ['admin', 'moderador', 'vendedor', 'usuario'],
    'mis-publicaciones.html': ['admin', 'moderador', 'vendedor'],
    'publicar-propiedad.html':['admin', 'moderador', 'vendedor'],
    'admin.html':             ['admin'],
    'index.html':             ['admin', 'moderador', 'vendedor', 'usuario']
  };

  // ── TIMER DE INACTIVIDAD ─────────────────────────────────
  let timerInactividad = null;

  function resetearInactividad() {
    clearTimeout(timerInactividad);
    timerInactividad = setTimeout(() => {
      log('SESION', 'Cierre automático por inactividad');
      cerrarSesion(true);
    }, CONFIG.INACTIVIDAD_MS);
  }

  // ── CIFRADO DE CONTRASEÑA ───────────────────────────────
  async function hashPassword(password) {
    const salt = 'alquilao_salt_2025_RD';
    const datos = salt + password + salt;
    const encoder = new TextEncoder();
    const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(datos));
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ── GENERAR TOKEN JWT SIMULADO ───────────────────────────
  function generarToken(usuario) {
    const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      id:    usuario.id || Date.now(),
      email: usuario.correo,
      rol:   usuario.rol,
      exp:   Date.now() + CONFIG.TOKEN_EXPIRY_MS,
      iat:   Date.now(),
    }));
    const signature = btoa(header + '.' + payload + '_alquilao_secret');
    return `${header}.${payload}.${signature}`;
  }

  // ── VERIFICAR TOKEN ──────────────────────────────────────
  function verificarToken(token) {
    if (!token) return null;
    try {
      const partes   = token.split('.');
      if (partes.length !== 3) return null;
      const payload  = JSON.parse(atob(partes[1]));
      if (Date.now() > payload.exp) {
        log('SEGURIDAD', 'Token expirado');
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  // ── SANITIZAR ENTRADA (Anti-XSS) ─────────────────────────
  function sanitizar(texto) {
    if (typeof texto !== 'string') return '';
    return texto
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  // ── VALIDACIONES ─────────────────────────────────────────
  const Validar = {
    correo(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
    password(v) {
      return {
        longitud:  v.length >= 8,
        mayuscula: /[A-Z]/.test(v),
        numero:    /[0-9]/.test(v),
        especial:  /[^A-Za-z0-9]/.test(v),
        valido() { return this.longitud && this.mayuscula && this.numero && this.especial; }
      };
    },
    nombre(v)    { return v.trim().length >= 3; },
    telefono(v)  { return /^[\d\s\-\+\(\)]{8,15}$/.test(v); },
    noVacio(v)   { return v.trim().length > 0; },
    sinInyeccion(v) {
      const patrones = [/select/i, /insert/i, /update/i, /delete/i, /drop/i, /union/i, /exec/i, /script/i];
      return !patrones.some(p => p.test(v));
    },
  };

  // ── CONTROL DE INTENTOS ──────────────────────────────────
  function registrarIntento(correo, exitoso) {
    const clave = CONFIG.INTENTOS_KEY + '_' + correo;
    let data = JSON.parse(localStorage.getItem(clave) || '{"intentos":0,"bloqueadoHasta":0}');

    if (exitoso) {
      localStorage.removeItem(clave);
      return { bloqueado: false };
    }

    data.intentos++;
    data.ultimoIntento = Date.now();

    if (data.intentos >= CONFIG.MAX_INTENTOS) {
      data.bloqueadoHasta = Date.now() + CONFIG.BLOQUEO_MS;
      log('SEGURIDAD', `Cuenta bloqueada por fuerza bruta: ${correo}`);
    }

    localStorage.setItem(clave, JSON.stringify(data));
    return {
      bloqueado:       data.bloqueadoHasta > Date.now(),
      intentosRestantes: Math.max(0, CONFIG.MAX_INTENTOS - data.intentos),
      bloqueadoHasta:  data.bloqueadoHasta,
    };
  }

  function estaBloqueado(correo) {
    const clave = CONFIG.INTENTOS_KEY + '_' + correo;
    const data  = JSON.parse(localStorage.getItem(clave) || '{"bloqueadoHasta":0}');
    return data.bloqueadoHasta > Date.now();
  }

  function tiempoBloqueoRestante(correo) {
    const clave = CONFIG.INTENTOS_KEY + '_' + correo;
    const data  = JSON.parse(localStorage.getItem(clave) || '{"bloqueadoHasta":0}');
    const ms    = data.bloqueadoHasta - Date.now();
    if (ms <= 0) return null;
    const min = Math.ceil(ms / 60000);
    return `${min} minuto${min !== 1 ? 's' : ''}`;
  }

  // ── LOGS DE SEGURIDAD ────────────────────────────────────
  function log(tipo, mensaje, extra = {}) {
    const logs = JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || '[]');
    const entrada = {
      id:        Date.now(),
      tipo,
      mensaje,
      timestamp: new Date().toISOString(),
      url:       window.location.pathname,
      ...extra,
    };
    logs.unshift(entrada);
    if (logs.length > 100) logs.pop();
    localStorage.setItem(CONFIG.LOGS_KEY, JSON.stringify(logs));
    console.log(`[ALQUILAO SECURITY] [${tipo}] ${mensaje}`, extra);
  }

  function getLogs() { return JSON.parse(localStorage.getItem(CONFIG.LOGS_KEY) || '[]'); }

  // ── SESIÓN ───────────────────────────────────────────────
  function guardarSesion(usuario, token) {
    const sesion = {
      usuario:   { ...usuario, password: undefined },
      token,
      inicio:    Date.now(),
      expira:    Date.now() + CONFIG.TOKEN_EXPIRY_MS,
    };
    sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sesion));
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
    log('SESION', `Sesión iniciada: ${usuario.correo}`, { rol: usuario.rol });
    resetearInactividad();
  }

  function getSesion() {
    const raw = sessionStorage.getItem(CONFIG.SESSION_KEY);
    if (!raw) return null;
    try {
      const sesion = JSON.parse(raw);
      if (Date.now() > sesion.expira) {
        cerrarSesion();
        return null;
      }
      return sesion;
    } catch {
      return null;
    }
  }

  function getUsuario() { const sesion = getSesion(); return sesion ? sesion.usuario : null; }
  function getToken() { return localStorage.getItem(CONFIG.TOKEN_KEY); }

  function estaAutenticado() {
    const sesion = getSesion();
    if (!sesion) return false;
    const payload = verificarToken(sesion.token);
    return payload !== null;
  }

  function cerrarSesion(porInactividad = false) {
    const usuario = getUsuario();
    log('SESION', porInactividad ? 'Cierre por inactividad' : 'Cierre manual', {
      usuario: usuario?.correo || 'desconocido'
    });
    sessionStorage.removeItem(CONFIG.SESSION_KEY);
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    clearTimeout(timerInactividad);
    window.location.replace('login.html'); // Rompe el historial de bucles
  }

  // ── CONTROL DE ACCESO ────────────────────────────────────
  function tienePermiso(accion) {
    const usuario = getUsuario();
    if (!usuario) return false;
    const roles = PERMISOS[accion];
    return roles ? roles.includes(usuario.rol) : false;
  }

  function tieneRol(rolRequerido) {
    const usuario = getUsuario();
    if (!usuario) return false;
    const nivelUsuario   = ROLES[usuario.rol]?.nivel ?? -1;
    const nivelRequerido = ROLES[rolRequerido]?.nivel ?? 999;
    return nivelUsuario >= nivelRequerido;
  }

  // ── PROTECCIÓN DE RUTAS INTERNAS (ANTI-BUCLE DEFINITIVO) ──
 // ── PROTECCIÓN DE RUTAS (VERSIÓN DEFINITIVA ANTI-BUCLE) ──
  function protegerRuta() {
    const pathname = window.location.pathname;
    let paginaActual = pathname.split('/').pop().split('?')[0] || 'index.html';

    // Si estás en la raíz pública de Express, equivale a login.html
    if (pathname === '/' || paginaActual === '') {
      paginaActual = 'login.html';
    }

    // 🚨 ESCUDO CRÍTICO: Si ya estás en el login, se aborta la protección.
    // Esto impide por completo que seguridad.js intente expulsarte si ya estás fuera.
    if (paginaActual === 'login.html') {
      return;
    }

    const rolesPermitidos = RUTAS_PROTEGIDAS[paginaActual];
    if (!rolesPermitidos) return; // Es una ruta pública, se permite el acceso libre

    const sesion = getSesion();
    
    if (!sesion) {
      log('SEGURIDAD', `Acceso anónimo denegado para: ${paginaActual}`);
      sessionStorage.removeItem(CONFIG.SESSION_KEY);
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      window.location.replace('login.html');
      return;
    }

    const usuario = sesion.usuario;
    
    // 🌟 LA SOLUCIÓN MAESTRA: Forzamos el rol del usuario a minúsculas
    // para que coincida perfectamente con ['admin'] sin importar cómo venga de la base de datos.
    const rolUsuarioClean = usuario && usuario.rol ? usuario.rol.toLowerCase().trim() : '';

    if (!usuario || !rolesPermitidos.includes(rolUsuarioClean)) {
      log('ACCESO', `Acceso denegado: El rol '${usuario?.rol}' no coincide con los permitidos [${rolesPermitidos}]`);
      
      // Usamos replace para no ensuciar el historial de navegación
      window.location.replace('login.html');
    }
  }

  function obtenerRutaLogin() { return 'login.html'; }

  // ── CSRF TOKEN ───────────────────────────────────────────
  function generarCSRFToken() {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  function verificarCSRFToken(token) { return token === sessionStorage.getItem('csrf_token'); }

  // ── HEADERS SEGUROS ──────────────────────────────────────
  function getHeadersSeguras() {
    const token     = getToken();
    const csrfToken = sessionStorage.getItem('csrf_token') || generarCSRFToken();
    return {
      'Content-Type':  'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-CSRF-Token':  csrfToken,
    };
  }

  // ── FETCH SEGURO ─────────────────────────────────────────
  async function fetchSeguro(url, opciones = {}) {
    const headers = getHeadersSeguras();
    try {
      const res = await fetch(url, {
        ...opciones,
        headers: { ...headers, ...(opciones.headers || {}) },
      });
      if (res.status === 401) {
        log('SEGURIDAD', 'Sesión expirada en servidor web');
        cerrarSesion();
        return null;
      }
      return res;
    } catch (err) {
      log('ERROR', `Error en fetch seguro: ${url}`, { error: err.message });
      throw err;
    }
  }

  // ── UI PERMISOS ──────────────────────────────────────────
  function aplicarPermisoUI() {
    const usuario = getUsuario();
    if (!usuario) return;

    document.querySelectorAll('[data-rol]').forEach(el => {
      const rolesEl = el.dataset.rol.split(',').map(r => r.trim());
      el.style.display = rolesEl.includes(usuario.rol) ? '' : 'none';
    });

    document.querySelectorAll('.vendor-only').forEach(el => {
      const esVendedor = ['admin', 'moderador', 'vendedor'].includes(usuario.rol);
      el.style.display = esVendedor ? '' : 'none';
    });

    const topbarNombre = document.getElementById('topbar-nombre');
    const avatarInicial = document.getElementById('avatar-inicial');
    if (topbarNombre) topbarNombre.textContent = usuario.nombre || usuario.correo;
    if (avatarInicial) avatarInicial.textContent = (usuario.nombre || 'U').charAt(0).toUpperCase();
  }

  // ── VALIDACIÓN TIEMPO REAL ───────────────────────────────
  function activarValidacionTiempoReal() {
    document.querySelectorAll('input[type="email"]').forEach(input => {
      input.addEventListener('input', () => marcarCampo(input, Validar.correo(input.value) || input.value === ''));
    });
    document.querySelectorAll('input[type="password"]').forEach(input => {
      input.addEventListener('input', () => actualizarHintsPassword(input));
    });
  }

  function marcarCampo(input, valido) {
    const wrap = input.closest('.input-wrap');
    if (!wrap) return;
    wrap.style.borderColor = valido ? '' : '#EF4444';
  }

  function actualizarHintsPassword(input) {
    const v = Validar.password(input.value);
    const hints = { 'h-len': v.longitud, 'h-upper': v.mayuscula, 'h-num': v.numero, 'h-special': v.especial };
    Object.entries(hints).forEach(([id, ok]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('ok', ok);
    });
  }

  // ── INIT ─────────────────────────────────────────────────
  function init() {
    generarCSRFToken();
    protegerRuta();

    if (estaAutenticado()) {
      aplicarPermisoUI();
      resetearInactividad();
    }

    activarValidacionTiempoReal();

    ['click', 'keypress', 'scroll', 'mousemove'].forEach(evento => {
      document.addEventListener(evento, resetearInactividad, { passive: true });
    });

    log('SISTEMA', 'Módulo de seguridad iniciado correctamente');
  }

  return {
    init, hashPassword, generarToken, verificarToken, sanitizar, Validar,
    registrarIntento, estaBloqueado, tiempoBloqueoRestante, log, getLogs,
    guardarSesion, getSesion, getUsuario, getToken, estaAutenticado,
    cerrarSesion, tienePermiso, tieneRol, protegerRuta, generarCSRFToken,
    verificarCSRFToken, getHeadersSeguras, fetchSeguro, aplicarPermisoUI,
    ROLES, PERMISOS, CONFIG
  };

})();

// Inicialización automática nativa
document.addEventListener('DOMContentLoaded', () => Seguridad.init());