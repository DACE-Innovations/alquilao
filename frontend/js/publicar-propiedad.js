
  let currentStep = 1;
  const totalSteps = 6;
  const counters = { habitaciones: 3, banos: 2, parqueos: 1 };
  let uploadedPhotos = [];
  let coverIndex = 0;

  const amenidadesList = [
    { id:'ac', label:'Aire acondicionado', icon:'❄️' },
    { id:'balcon', label:'Balcón', icon:'🌇' },
    { id:'piscina', label:'Piscina', icon:'🏊' },
    { id:'gym', label:'Gimnasio', icon:'🏋️' },
    { id:'seguridad', label:'Seguridad 24/7', icon:'🔐' },
    { id:'ascensor', label:'Ascensor', icon:'🛗' },
    { id:'lavanderia', label:'Lavandería', icon:'🧺' },
    { id:'amueblado', label:'Amueblado', icon:'🛋️' },
    { id:'internet', label:'Internet incluido', icon:'📶' },
    { id:'generador', label:'Planta eléctrica', icon:'⚡' },
    { id:'cisterna', label:'Cisterna/Bomba', icon:'💧' },
    { id:'terraza', label:'Terraza', icon:'🌿' },
  ];
  let activeAmenidades = new Set(['ac','ascensor','generador','cisterna']);

  function initAmenidades() {
    const grid = document.getElementById('amenidades-grid');
    grid.innerHTML = amenidadesList.map(a => `
      <div class="amenidad-item ${activeAmenidades.has(a.id)?'active':''}" data-id="${a.id}" onclick="toggleAmenidad('${a.id}', this)">
        <div class="amenidad-check"></div>
        <span style="font-size:13px">${a.icon} ${a.label}</span>
      </div>
    `).join('');
  }

  function toggleAmenidad(id, el) {
    if(activeAmenidades.has(id)) { activeAmenidades.delete(id); el.classList.remove('active'); }
    else { activeAmenidades.add(id); el.classList.add('active'); }
  }

  document.querySelectorAll('.tipo-card').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.tipo-card').forEach(x=>x.classList.remove('selected'));
      c.classList.add('selected');
    });
  });
  document.querySelectorAll('.op-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.op-btn').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
    });
  });

  function selectPeriodo(btn) {
    document.querySelectorAll('.periodo-tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
  }

  function adjustCounter(key, delta) {
    counters[key] = Math.max(0, counters[key] + delta);
    document.getElementById('val-' + key).textContent = counters[key];
  }

  function handleDragOver(e) { e.preventDefault(); document.getElementById('dropzone').classList.add('dragover'); }
  function handleDragLeave() { document.getElementById('dropzone').classList.remove('dragover'); }
  function handleDrop(e) { e.preventDefault(); document.getElementById('dropzone').classList.remove('dragover'); processFiles(e.dataTransfer.files); }
  function handleFileSelect(e) { processFiles(e.target.files); }

  function processFiles(files) {
    Array.from(files).forEach(file => {
      if(uploadedPhotos.length >= 20) return;
      const reader = new FileReader();
      reader.onload = ev => {
        uploadedPhotos.push(ev.target.result);
        renderFotos();
      };
      reader.readAsDataURL(file);
    });
    document.getElementById('file-input').value = '';
  }

  function renderFotos() {
    const grid = document.getElementById('fotos-grid');
    document.getElementById('fotos-count-label').textContent = `Fotos subidas: ${uploadedPhotos.length} / 20`;
    grid.innerHTML = uploadedPhotos.map((src, i) => `
      <div class="foto-thumb">
        <img src="${src}" alt="Foto ${i+1}" />
        ${i===coverIndex?'<div class="foto-badge">⭐ Portada</div>':''}
        <div class="foto-overlay">
          ${i!==coverIndex?`<button class="foto-btn foto-btn-cover" onclick="setCover(${i})">⭐ Hacer portada</button>`:''}
          <button class="foto-btn foto-btn-del" onclick="deletePhoto(${i})">🗑️ Eliminar</button>
        </div>
      </div>
    `).join('');
  }

  function setCover(i) { coverIndex = i; renderFotos(); }
  function deletePhoto(i) {
    uploadedPhotos.splice(i, 1);
    if(coverIndex >= uploadedPhotos.length) coverIndex = 0;
    renderFotos();
  }

  function updateProgress() {
    const pct = Math.round(((currentStep - 1) / totalSteps) * 100) + 17;
    const capped = Math.min(pct, 100);
    document.getElementById('progress-fill').style.width = capped + '%';
    document.getElementById('pct').textContent = capped + '%';
  }

  function setActiveStep(n) {
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('step-' + n);
    if(panel) panel.classList.add('active');

    document.querySelectorAll('.step-item').forEach(item => {
      const s = parseInt(item.dataset.step);
      item.classList.remove('active','done');
      if(s === n) item.classList.add('active');
      else if(s < n) item.classList.add('done');
    });
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextStep() {
    if(currentStep < totalSteps) { currentStep++; setActiveStep(currentStep); }
    else submitForm();
  }
  function prevStep() { if(currentStep > 1) { currentStep--; setActiveStep(currentStep); } }
  function jumpTo(n) { currentStep = n; setActiveStep(n); }
  function goBack() { if(currentStep > 1) prevStep(); }
  function saveDraft() { showToast('Borrador guardado ✓'); }

  function populateReview() {
    const tipo = document.querySelector('.tipo-card.selected')?.dataset.tipo || '—';
    const op = document.querySelector('.op-btn.selected')?.dataset.op || '—';
    document.getElementById('rv-tipo').textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    document.getElementById('rv-op').textContent = op.charAt(0).toUpperCase() + op.slice(1);
    document.getElementById('rv-titulo').textContent = document.getElementById('titulo-input').value || '—';
    document.getElementById('rv-dir').textContent = document.getElementById('direccion-input').value || '—';
    document.getElementById('rv-hab').textContent = counters.habitaciones;
    document.getElementById('rv-ban').textContent = counters.banos;
    document.getElementById('rv-par').textContent = counters.parqueos;
    document.getElementById('rv-area').textContent = (document.getElementById('area-input').value || '—') + ' m²';
    const precio = parseInt(document.getElementById('precio-input').value) || 0;
    const moneda = document.getElementById('moneda-sel').value;
    const periodo = document.querySelector('.periodo-tab.active')?.dataset.periodo || 'mes';
    document.getElementById('rv-precio').textContent = `$${precio.toLocaleString()} ${moneda} / ${periodo}`;
    document.getElementById('rv-neg').textContent = document.getElementById('negociable').checked ? 'Sí' : 'No';
    const wrap = document.getElementById('rv-fotos-wrap');
    if(uploadedPhotos.length > 0) {
      wrap.innerHTML = `<div class="review-fotos-mini">${uploadedPhotos.slice(0,8).map(src=>`<div class="review-foto-mini"><img src="${src}" /></div>`).join('')}${uploadedPhotos.length>8?`<div class="review-foto-mini" style="display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--gray-500)">+${uploadedPhotos.length-8}</div>`:''}</div>`;
    } else {
      wrap.innerHTML = '<span style="font-size:13px;color:var(--gray-400)">Sin fotos agregadas</span>';
    }
  }

  const origNextStep = nextStep;
  window.nextStep = function() {
    if(currentStep === 5) { currentStep++; setActiveStep(currentStep); populateReview(); return; }
    if(currentStep < totalSteps) { currentStep++; setActiveStep(currentStep); }
    else submitForm();
  };

  function submitForm() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('success-screen').style.display = 'flex';
    document.querySelector('.sidebar').style.display = 'none';
    document.getElementById('progress-fill').style.width = '100%';
    document.getElementById('pct').textContent = '100%';
  }

  function resetForm() {
    currentStep = 1;
    uploadedPhotos = [];
    coverIndex = 0;
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('success-screen').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'flex';
    setActiveStep(1);
    renderFotos();
  }

  function showToast(msg) {
    let t = document.getElementById('toast');
    if(!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:10px 18px;border-radius:8px;font-size:13.5px;font-weight:500;z-index:9999;transition:opacity .3s;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(()=>{ t.style.opacity='0'; }, 2200);
  }

  function updateMunicipios() {}
  function updateSectores() {}

  initAmenidades();
  setActiveStep(1);
