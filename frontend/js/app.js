const propiedades = [
  {
    id: 1,
    badge: 'Destacada',
    badgeClass: '',
    title: 'Apartamento en Piantini',
    location: 'Piantini, Santo Domingo',
    hab: 3, banos: 2, area: 145,
    precio: 'RD$ 35,000',
    tipo: '/mes',
    emoji: '🏢'
  },
  {
    id: 2,
    badge: 'Nueva',
    badgeClass: 'nueva',
    title: 'Casa en Juan Dolio',
    location: 'Juan Dolio, San Pedro',
    hab: 4, banos: 3, area: 280,
    precio: 'RD$ 58,000',
    tipo: '/mes',
    emoji: '🏠'
  },
  {
    id: 3,
    badge: 'Oportunidad',
    badgeClass: 'oportunidad',
    title: 'Apartamento en Naco',
    location: 'Naco, Santo Domingo',
    hab: 2, banos: 2, area: 110,
    precio: 'RD$ 22,000',
    tipo: '/mes',
    emoji: '🏙️'
  },
  {
    id: 4,
    badge: 'Premium',
    badgeClass: 'premium',
    title: 'Penthouse en Bella Vista',
    location: 'Bella Vista, Santo Domingo',
    hab: 4, banos: 4, area: 320,
    precio: 'RD$ 95,000',
    tipo: '/mes',
    emoji: '🌟'
  }
];
 
// --- RENDER CARDS DINÁMICO (DESDE LA BASE DE DATOS) ---
function renderCards(listaPropiedades) {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  
  if (listaPropiedades.length === 0) {
    grid.innerHTML = `<p style="color: white; text-align: center; grid-column: 1/-1;">No hay propiedades disponibles en este momento.</p>`;
    return;
  }
 
  grid.innerHTML = listaPropiedades.map(p => {
    // Formateamos el DECIMAL de SQL Server a pesos dominicanos (RD$)
    const precioRD = new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0
    }).format(p.precio);

    // Si tu consulta de SQL trae una imagen de portada la usa, si no, pone un icono por defecto
    const componenteImagen = p.url_imagen 
      ? `<img src="${p.url_imagen}" alt="${p.titulo}" style="width:100%; height:100%; object-fit:cover;">`
      : `<div class="card-img-placeholder">🏢</div>`;

    // Adaptamos las variables estáticas viejas a las columnas reales de tus tablas
    const ubicacionTexto = `${p.sector}, ${p.provincia}`;
    const badgeTexto = p.disponible ? 'Disponible' : 'Alquilado';
    const badgeClase = p.disponible ? 'nueva' : 'oportunidad';

    return `
      <div class="prop-card" onclick="verDetalle('${p.id_propiedad}')">
        <div class="card-img">
          ${componenteImagen}
          <span class="card-badge ${badgeClase}">${badgeTexto}</span>
          <button class="card-fav" onclick="toggleFav(event, this)" aria-label="Favorito">
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
            <div>
              <div class="card-price">${precioRD}<span>/mes</span></div>
            </div>
            <button class="card-btn">Ver detalles</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
 
// --- INIT ACTUALIZADO CON ASYNC/AWAIT ---
// En tu js/app.js busca el DOMContentLoaded y déjalo así:
document.addEventListener('DOMContentLoaded', async () => {
  actualizarNavbar();

  try {
    const respuestaAPI = await API.getPropiedades(); 
    // Como el controlador devuelve { total, propiedades }, accedemos al arreglo interno:
    renderCards(respuestaAPI.propiedades); 
  } catch (error) {
    console.error("Error al conectar con el backend de Alquilao:", error);
  }
});

// ── VERIFICAR SESIÓN ──
function verificarSesion() {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || localStorage.getItem('usuario') || 'null');
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
        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.reload();
      }
    };
  } else {
    navCuenta.innerHTML = `<i class="fa-regular fa-user"></i> Mi cuenta`;
    // CORREGIDO: Como estás dentro de la carpeta html, el enlace va directo
    navCuenta.href = 'login.html'; 
  }
 } 

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("burger");
    const navMenu = document.getElementById("nav-menu");

    if (menuBtn && navMenu) {
        menuBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    const btn = document.getElementById("btn-login");

    if (btn) {
        btn.addEventListener("click", () => {
            // código login
        });
    }

});