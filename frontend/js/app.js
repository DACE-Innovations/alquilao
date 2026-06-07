// frontend/js/app.js
// ── CAMBIOS respecto a la versión anterior ──
//   1. Fix imagen: ahora acepta imagen_portada (SQL) O url_imagen (legacy)
//   2. Eliminado el segundo DOMContentLoaded duplicado (el del burger/login)
//      → fusionado en uno solo para evitar race conditions
//   3. Sin cambios en la lógica de negocio ni en renderCards

// ── RENDER CARDS DINÁMICO (DESDE LA BASE DE DATOS) ──
function renderCards(listaPropiedades) {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;

  if (!listaPropiedades || listaPropiedades.length === 0) {
    grid.innerHTML = `<p style="color: white; text-align: center; grid-column: 1/-1;">No hay propiedades disponibles en este momento.</p>`;
    return;
  }

  grid.innerHTML = listaPropiedades.map(p => {
    const precioRD = new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0
    }).format(p.precio);

    // FIX: SQL devuelve imagen_portada, pero también soportamos url_imagen para retrocompatibilidad
    const urlImagen = p.imagen_portada || p.url_imagen || null;
    const componenteImagen = urlImagen
      ? `<img src="${urlImagen}" alt="${p.titulo}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">`
      : `<div class="card-img-placeholder">🏢</div>`;

    const ubicacionTexto = `${p.sector || ''}, ${p.provincia || 'RD'}`.replace(/^, /, '');
    const badgeTexto  = p.disponible ? 'Disponible' : 'Alquilado';
    const badgeClase  = p.disponible ? 'nueva'      : 'oportunidad';

    return `
      <div class="prop-card" onclick="verDetalle('${p.id_propiedad}')">
        <div class="card-img">
          ${componenteImagen}
          <span class="card-badge ${badgeClase}">${badgeTexto}</span>
          <button class="card-fav" onclick="toggleFav(event, this, '${p.id_propiedad}')" aria-label="Favorito">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
        <div class="card-body">
          <h3 class="card-title">${p.titulo}</h3>
          <p class="card-loc"><i class="fa-solid fa-location-dot"></i> ${ubicacionTexto}</p>
          <div class="card-specs">
            <span class="card-spec"><i class="fa-solid fa-bed"></i> ${p.habitaciones} hab.</span>
            <span class="card-spec"><i class="fa-solid fa-shower"></i> ${p.banos} baños</span>
            <span class="card-spec"><i class="fa-solid fa-vector-square"></i> ${p.metros_cuadrados} m²</span>
          </div>
          <div class="card-footer">
            <div class="card-price">${precioRD}<span>/mes</span></div>
            <button class="card-btn">Ver detalles</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── TOGGLE FAVORITO DESDE LA CARD ──
async function toggleFav(event, btn, idPropiedad) {
  event.stopPropagation();
  try {
    const data = await API.toggleFavorito(idPropiedad);
    const icon = btn.querySelector('i');
    if (data.accion === 'agregado') {
      icon.className = 'fa-solid fa-heart';
      btn.style.color = '#EF4444';
    } else {
      icon.className = 'fa-regular fa-heart';
      btn.style.color = '';
    }
  } catch (err) {
    console.warn('No se pudo procesar el favorito (¿sesión activa?)');
  }
}

// ── VER DETALLE ──
function verDetalle(id) {
  window.location.href = `detalle-propiedad.html?id=${id}`;
}

// ── VERIFICAR SESIÓN ──
function verificarSesion() {
  const sesion  = window.Seguridad ? Seguridad.getSesion() : null;
  const token   = window.Seguridad ? Seguridad.getToken()  : localStorage.getItem('alquilao_token');
  const usuario = sesion ? sesion.usuario : null;
  return { token, usuario, autenticado: !!token };
}

// ── ACTUALIZAR NAVBAR SEGÚN SESIÓN ──
function actualizarNavbar() {
  const { usuario, autenticado } = verificarSesion();
  const navCuenta = document.querySelector('.nav-cuenta');
  if (!navCuenta) return;

  if (autenticado && usuario) {
    navCuenta.innerHTML = `<i class="fa-regular fa-user"></i> ${usuario.nombre}`;
    navCuenta.href = '#';
    navCuenta.onclick = () => {
      if (confirm('¿Deseas cerrar sesión?')) {
        if (window.Seguridad) { Seguridad.cerrarSesion(); return; }
        sessionStorage.removeItem('alquilao_session');
        localStorage.removeItem('alquilao_token');
        window.location.reload();
      }
    };
  } else {
    navCuenta.innerHTML = `<i class="fa-regular fa-user"></i> Mi cuenta`;
    navCuenta.href = 'login.html';
  }
}

// ── ÚNICO DOMContentLoaded (fusión del original duplicado) ──
document.addEventListener('DOMContentLoaded', async () => {
  actualizarNavbar();

  // Burger menu
  const menuBtn = document.getElementById('burger');
  const navMenu = document.getElementById('nav-menu');
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => navMenu.classList.toggle('active'));
  }

  // Cargar propiedades desde la API real
  try {
    const respuestaAPI = await API.getPropiedades();
    renderCards(respuestaAPI.propiedades);
  } catch (error) {
    console.error('Error al conectar con el backend de AlquilaoRD:', error);
  }
});
