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
 
// --- RENDER CARDS ---
function renderCards() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
 
  grid.innerHTML = propiedades.map(p => `
    <div class="prop-card" onclick="verDetalle(${p.id})">
      <div class="card-img">
        <div class="card-img-placeholder">${p.emoji}</div>
        <span class="card-badge ${p.badgeClass}">${p.badge}</span>
        <button class="card-fav" onclick="toggleFav(event, this)" aria-label="Favorito">
          <i class="fa-regular fa-heart"></i>
        </button>
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.title}</h3>
        <p class="card-loc"><i class="fa-solid fa-location-dot"></i> ${p.location}</p>
        <div class="card-specs">
          <span class="card-spec"><i class="fa-solid fa-bed"></i> ${p.hab} hab.</span>
          <span class="card-spec"><i class="fa-solid fa-shower"></i> ${p.banos} baños</span>
          <span class="card-spec"><i class="fa-solid fa-vector-square"></i> ${p.area} m²</span>
        </div>
        <div class="card-footer">
          <div>
            <div class="card-price">${p.precio}<span>${p.tipo}</span></div>
          </div>
          <button class="card-btn">Ver detalles</button>
        </div>
      </div>
    </div>
  `).join('');
}
 
// --- TOGGLE FAVORITO ---
function toggleFav(e, btn) {
  e.stopPropagation();
  const icon = btn.querySelector('i');
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) {
    icon.className = 'fa-solid fa-heart';
  } else {
    icon.className = 'fa-regular fa-heart';
  }
}
 
 // RUTA CORREGIDA DIRECTA PARA EL MÓDULO 2
 function verDetalle(id) {
  window.location.href = `../html/detalle-propiedad.html?id=${id}`;
}
 
// --- NAVBAR SCROLL ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});
 
// --- SEARCH BUTTON ---
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    window.location.href = '../html/busqueda.html';
  });
}
 
// --- CATEGORY CARDS ---
document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', () => {
    window.location.href = '../html/busqueda.html';
  });
});
 
// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  renderCards();
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
    navCuenta.href = '../html/login.html';
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