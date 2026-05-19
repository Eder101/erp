// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
let db = [
  {id:'GQZINV00001',marca:'Acer',modelo:'Aspire 3',cat:'Laptop',mac:'A1:B2:C3:D4:E5:F6',usu:'Javier Pérez Laureano',area:'Sistemas',desc:'Laptop color negra, 8GB RAM, 512GB SSD. Asignada al coordinador de telecomunicaciones.',est:'Activo'},
  {id:'GQZINV00002',marca:'HP',modelo:'EliteDesk 800',cat:'Escritorio',mac:'11:22:33:44:55:66',usu:'María González',area:'Adquisiciones',desc:'Equipo de escritorio color negro, Intel i5, 16GB RAM.',est:'Activo'},
  {id:'GQZINV00003',marca:'Dell',modelo:'Vostro 3405',cat:'Laptop',mac:'AA:BB:CC:DD:EE:FF',usu:'Carlos Ramírez',area:'Contabilidad',desc:'Laptop gris, AMD Ryzen 5, 8GB RAM, 256GB SSD.',est:'Activo'},
  {id:'GQZINV00004',marca:'Cisco',modelo:'Catalyst 2960',cat:'Red',mac:'00:1A:2B:3C:4D:5E',usu:'Javier Pérez Laureano',area:'Sistemas',desc:'Switch 24 puertos, rack principal.',est:'Activo'},
  {id:'GQZINV00005',marca:'HP',modelo:'LaserJet Pro',cat:'Multifuncional',mac:'B1:C2:D3:E4:F5:A6',usu:'Ana López',area:'Recursos Humanos',desc:'Impresora multifuncional láser, blanco y negro.',est:'Falla'},
  {id:'GQZINV00006',marca:'Samsung',modelo:'SyncMaster 24"',cat:'Monitor',mac:'N/A',usu:'Carlos Ramírez',area:'Contabilidad',desc:'Monitor 24", Full HD, HDMI.',est:'Activo'},
  {id:'GQZINV00007',marca:'Lenovo',modelo:'ThinkCentre M720',cat:'Escritorio',mac:'12:34:56:78:9A:BC',usu:'Roberto Sánchez',area:'Dirección',desc:'Equipo ejecutivo, Intel i7, 32GB RAM.',est:'Activo'},
  {id:'GQZINV00008',marca:'Hikvision',modelo:'DS-2CD2143G2',cat:'Seguridad',mac:'FC:EA:BC:12:34:56',usu:'Javier Pérez Laureano',area:'Sistemas',desc:'Cámara IP 4MP, acceso principal.',est:'Activo'},
  {id:'GQZINV00009',marca:'Dell',modelo:'PowerEdge T40',cat:'Servidor',mac:'08:00:27:AB:CD:EF',usu:'Javier Pérez Laureano',area:'Sistemas',desc:'Servidor torre, Xeon E-2224, 16GB ECC, 1TB.',est:'Activo'},
  {id:'GQZINV00010',marca:'Acer',modelo:'Aspire 5',cat:'Laptop',mac:'DE:AD:BE:EF:00:01',usu:'Laura Morales',area:'Almacén',desc:'Laptop dañada por caída, pantalla rota.',est:'Baja'},
];

let filtered = [...db];
let editId = null;
let page = 1;
const PER = 7;
let charts = {};

// ═══════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════
const TITLES = {
  dashboard:  ['Dashboard','Resumen general del módulo de activos'],
  inventario: ['Inventario de Activos','Gestión completa de equipos informáticos'],
  reportes:   ['Reportes','Visualización y exportación de datos'],
  usuarios:   ['Usuarios','Empleados con activos asignados'],
  tintas:     ['Tintas','Gestión de cartuchos e insumos de impresión'],
};

function showSection(name) {
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('sec-'+name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>{
    if(n.getAttribute('onclick')&&n.getAttribute('onclick').includes("'"+name+"'")) n.classList.add('active');
  });
  const [t,s]=TITLES[name]||['',''];
  document.getElementById('tb-title').textContent=t;
  document.getElementById('tb-sub').textContent=s;
  if(name==='dashboard')  renderDashboard();
  if(name==='inventario'){ filtered=[...db]; applyFilters(); fillAreaFilter(); }
  if(name==='reportes')   renderReports();
  if(name==='usuarios')   renderUsuarios();
  if(name==='tintas'){    initTintasForm(); renderTintas(); }
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
function renderDashboard() {
  const tot=db.length, act=db.filter(a=>a.est==='Activo').length,
        fal=db.filter(a=>a.est==='Falla').length, baj=db.filter(a=>a.est==='Baja'||a.est==='Inactivo').length;
  document.getElementById('kv-total').textContent=tot;
  document.getElementById('kv-activo').textContent=act;
  document.getElementById('kv-falla').textContent=fal;
  document.getElementById('kv-baja').textContent=baj;

  // last-5 table
  const rows=[...db].slice(-5).reverse().map(a=>`
    <tr>
      <td><span class="id-code">${a.id}</span></td>
      <td><strong>${a.marca}</strong> <span style="color:var(--tm)">${a.modelo}</span></td>
      <td><span class="cbadge"><i class="${catIco(a.cat)}"></i>${a.cat}</span></td>
      <td>${a.usu}</td><td>${a.area}</td><td>${badge(a.est)}</td>
    </tr>`).join('');
  document.getElementById('db-tbody').innerHTML=rows;

  // bar
  const cats={};db.forEach(a=>{cats[a.cat]=(cats[a.cat]||0)+1;});
  mkChart('ch-bar','bar',Object.keys(cats),
    [{label:'Equipos',data:Object.values(cats),backgroundColor:'rgba(192,57,43,.8)',borderColor:'#922B21',borderWidth:1,borderRadius:6}],
    {plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1},grid:{color:'rgba(0,0,0,.05)'}},x:{grid:{display:false}}}});

  // pie
  mkChart('ch-pie','doughnut',['Activo','Falla','Baja/Inactivo'],
    [{data:[act,fal,baj],backgroundColor:['#27AE60','#F39C12','#E74C3C'],borderWidth:2,borderColor:'#fff'}],
    {plugins:{legend:{position:'bottom',labels:{padding:12,font:{size:12}}}},cutout:'65%'});
}

// ═══════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════
function applyFilters() {
  const q=(document.getElementById('fi-q').value||'').toLowerCase();
  const cat=document.getElementById('fi-cat').value;
  const est=document.getElementById('fi-est').value;
  const area=document.getElementById('fi-area').value;
  filtered=db.filter(a=>{
    const mq=!q||[a.marca,a.modelo,a.usu,a.mac,a.area,a.id,a.desc,a.cat].some(v=>(v||'').toLowerCase().includes(q));
    return mq&&(!cat||a.cat===cat)&&(!est||a.est===est)&&(!area||a.area===area);
  });
  page=1; renderPage();
}

function clearFilters(){
  ['fi-q','fi-cat','fi-est','fi-area'].forEach(id=>{
    const el=document.getElementById(id);
    el.value='';
  });
  filtered=[...db]; page=1; renderPage();
}

function fillAreaFilter(){
  const areas=[...new Set(db.map(a=>a.area))].sort();
  const sel=document.getElementById('fi-area');
  const cur=sel.value;
  sel.innerHTML='<option value="">Todas las áreas</option>';
  areas.forEach(a=>{
    const o=document.createElement('option');
    o.value=a;o.textContent=a;if(a===cur)o.selected=true;
    sel.appendChild(o);
  });
}

function renderPage(){
  const tbody=document.getElementById('inv-tbody');
  const tot=filtered.length, pages=Math.ceil(tot/PER)||1;
  if(page>pages)page=pages;
  const s=(page-1)*PER, slice=filtered.slice(s,s+PER);

  if(!slice.length){
    tbody.innerHTML=`<tr><td colspan="9"><div class="empty"><i class="fas fa-search"></i><h3>Sin resultados</h3><p>No hay activos con esos filtros.</p></div></td></tr>`;
  } else {
    tbody.innerHTML=slice.map(a=>`
      <tr>
        <td><span class="id-code">${a.id}</span></td>
        <td><strong>${a.marca}</strong></td>
        <td>${a.modelo}</td>
        <td><span class="cbadge"><i class="${catIco(a.cat)}"></i>${a.cat}</span></td>
        <td style="font-family:monospace;font-size:12px">${a.mac}</td>
        <td>${a.usu}</td>
        <td>${a.area}</td>
        <td>${badge(a.est)}</td>
        <td class="action-col">
          <div style="display:flex;gap:4px">
            <button class="btn btn-v btn-sm" onclick="viewActivo('${a.id}')" title="Ver detalle"><i class="fas fa-eye"></i></button>
            <button class="btn btn-e btn-sm" onclick="openModal('edit','${a.id}')" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="btn btn-d btn-sm" onclick="confirmDel('${a.id}')" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>`).join('');
  }

  document.getElementById('pag-info').textContent=
    `Mostrando ${Math.min(s+1,tot)}–${Math.min(s+PER,tot)} de ${tot} registros`;

  const pb=document.getElementById('pag-btns');
  pb.innerHTML='';
  const mk=(lbl,disabled,act,fn)=>{
    const b=document.createElement('button');
    b.className='pb'+(act?' active':'');
    b.innerHTML=lbl; b.disabled=disabled;
    b.onclick=fn; pb.appendChild(b);
  };
  mk('<i class="fas fa-chevron-left"></i>',page===1,false,()=>{page--;renderPage();});
  for(let i=1;i<=pages;i++) mk(i,false,i===page,((p)=>()=>{page=p;renderPage();})(i));
  mk('<i class="fas fa-chevron-right"></i>',page===pages,false,()=>{page++;renderPage();});
}

// ═══════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════
const FIELDS=['f-est','f-marca','f-modelo','f-cat','f-mac','f-usu','f-area','f-desc'];

function openModal(mode,id=null){
  editId=null;
  FIELDS.forEach(f=>document.getElementById(f).classList.remove('err'));

  if(mode==='add'){
    document.getElementById('m-title').textContent='Registrar Activo';
    document.getElementById('m-save-lbl').textContent='Guardar Activo';
    document.getElementById('f-id').value=genId();
    FIELDS.forEach(f=>{const el=document.getElementById(f);el.value='';});
  } else {
    const a=db.find(x=>x.id===id); if(!a)return;
    editId=id;
    document.getElementById('m-title').textContent='Editar Activo';
    document.getElementById('m-save-lbl').textContent='Guardar Cambios';
    document.getElementById('f-id').value=a.id;
    document.getElementById('f-est').value=a.est;
    document.getElementById('f-marca').value=a.marca;
    document.getElementById('f-modelo').value=a.modelo;
    document.getElementById('f-cat').value=a.cat;
    document.getElementById('f-mac').value=a.mac;
    document.getElementById('f-usu').value=a.usu;
    document.getElementById('f-area').value=a.area;
    document.getElementById('f-desc').value=a.desc;
  }
  document.getElementById('mo-activo').classList.add('open');
}

function closeModal(id){document.getElementById(id).classList.remove('open');}

function saveActivo(){
  let ok=true;
  FIELDS.forEach(f=>{
    const el=document.getElementById(f);
    if(!el.value.trim()){el.classList.add('err');ok=false;}
    else el.classList.remove('err');
  });
  if(!ok){toast('Completa todos los campos obligatorios.','e');return;}

  const rec={
    id:document.getElementById('f-id').value,
    est:document.getElementById('f-est').value,
    marca:document.getElementById('f-marca').value.trim(),
    modelo:document.getElementById('f-modelo').value.trim(),
    cat:document.getElementById('f-cat').value,
    mac:document.getElementById('f-mac').value.trim(),
    usu:document.getElementById('f-usu').value.trim(),
    area:document.getElementById('f-area').value,
    desc:document.getElementById('f-desc').value.trim(),
  };

  if(editId){
    const i=db.findIndex(a=>a.id===editId); db[i]=rec;
    toast('Activo actualizado correctamente.','s');
  } else {
    db.push(rec);
    toast('Activo registrado correctamente.','s');
  }
  closeModal('mo-activo');
  filtered=[...db]; applyFilters(); fillAreaFilter();
  renderDashboard();
}

// ═══════════════════════════════════════════
// DETAIL VIEW
// ═══════════════════════════════════════════
function viewActivo(id){
  const a=db.find(x=>x.id===id); if(!a)return;
  document.getElementById('det-content').innerHTML=`
    <div class="di"><label>ID del Activo</label><p><span class="id-code">${a.id}</span></p></div>
    <div class="di"><label>Estado</label><p>${badge(a.est)}</p></div>
    <div class="di"><label>Marca</label><p>${a.marca}</p></div>
    <div class="di"><label>Modelo</label><p>${a.modelo}</p></div>
    <div class="di"><label>Categoría</label><p><span class="cbadge"><i class="${catIco(a.cat)}"></i>${a.cat}</span></p></div>
    <div class="di"><label>Dirección MAC</label><p style="font-family:monospace">${a.mac}</p></div>
    <div class="di"><label>Usuario Asignado</label><p>${a.usu}</p></div>
    <div class="di"><label>Área / Departamento</label><p>${a.area}</p></div>
    <div class="di full"><label>Descripción</label><p style="font-weight:400;color:var(--tm)">${a.desc}</p></div>`;
  document.getElementById('det-edit-btn').onclick=()=>{closeModal('mo-det');openModal('edit',id);};
  document.getElementById('mo-det').classList.add('open');
}

// ═══════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════
function confirmDel(id){
  document.getElementById('conf-del-btn').onclick=()=>{
    db=db.filter(a=>a.id!==id);
    filtered=filtered.filter(a=>a.id!==id);
    closeModal('mo-confirm');
    renderPage(); renderDashboard(); fillAreaFilter();
    toast('Activo eliminado correctamente.','s');
  };
  document.getElementById('mo-confirm').classList.add('open');
}

// ═══════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════
function renderReports(){
  const cats={},areas={};
  db.forEach(a=>{cats[a.cat]=(cats[a.cat]||0)+1; areas[a.area]=(areas[a.area]||0)+1;});
  const act=db.filter(a=>a.est==='Activo').length, fal=db.filter(a=>a.est==='Falla').length,
        baj=db.filter(a=>a.est==='Baja').length, ina=db.filter(a=>a.est==='Inactivo').length;

  mkChart('rch-bar','bar',Object.keys(cats),
    [{label:'Activos',data:Object.values(cats),backgroundColor:'rgba(192,57,43,.8)',borderRadius:6}],
    {plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}},x:{grid:{display:false}}}});

  mkChart('rch-pie','doughnut',['Activo','Falla','Baja','Inactivo'],
    [{data:[act,fal,baj,ina],backgroundColor:['#27AE60','#F39C12','#E74C3C','#95A5A6'],borderWidth:2,borderColor:'#fff'}],
    {plugins:{legend:{position:'bottom'}},cutout:'60%'});

  mkChart('rch-area','bar',Object.keys(areas),
    [{label:'Equipos',data:Object.values(areas),backgroundColor:'rgba(192,57,43,.75)',borderRadius:6}],
    {indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{stepSize:1}}}});

  const rows=[
    {lbl:'Total de activos',val:db.length,bg:'var(--bg)',c:'var(--td)'},
    {lbl:'Funcionales (Activo)',val:act,bg:'#EAFAF1',c:'#27AE60'},
    {lbl:'En falla',val:fal,bg:'#FEF9E7',c:'#D97706'},
    {lbl:'Dados de baja / inactivos',val:baj+ina,bg:'#FDEDEC',c:'#E74C3C'},
    {lbl:'Áreas cubiertas',val:Object.keys(areas).length,bg:'var(--bg)',c:'var(--td)'},
  ];
  document.getElementById('rpt-sum').innerHTML=rows.map(r=>
    `<div class="rs-row" style="background:${r.bg}"><span style="color:${r.c}">${r.lbl}</span><strong style="color:${r.c}">${r.val}</strong></div>`
  ).join('');

  document.getElementById('rpt-tbody').innerHTML=db.map(a=>`
    <tr>
      <td><span class="id-code">${a.id}</span></td>
      <td>${a.marca}</td><td>${a.modelo}</td><td>${a.cat}</td>
      <td style="font-family:monospace;font-size:12px">${a.mac}</td>
      <td>${a.usu}</td><td>${a.area}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.desc}</td>
      <td>${badge(a.est)}</td>
    </tr>`).join('');
}

// ═══════════════════════════════════════════
// USUARIOS
// ═══════════════════════════════════════════
function renderUsuarios(){
  const m={};
  db.forEach(a=>{
    if(!m[a.usu])m[a.usu]={area:a.area,equipos:[],estados:[]};
    m[a.usu].equipos.push(a.cat+' '+a.marca);
    m[a.usu].estados.push(a.est);
  });
  const tbody=document.getElementById('usr-tbody');
  if(!Object.keys(m).length){
    tbody.innerHTML=`<tr><td colspan="5"><div class="empty"><i class="fas fa-users"></i><h3>Sin usuarios registrados</h3></div></td></tr>`;
    return;
  }
  tbody.innerHTML=Object.entries(m).map(([u,d])=>{
    const bad=d.estados.some(e=>e==='Falla'||e==='Baja'||e==='Inactivo');
    return `<tr>
      <td><strong>${u}</strong></td>
      <td>${d.area}</td>
      <td style="font-size:12px;color:var(--tm)">${d.equipos.join(', ')}</td>
      <td>${d.equipos.length}</td>
      <td>${badge(bad?'Falla':'Activo')}</td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function genId(){return 'GQZINV'+String(db.length+1).padStart(5,'0');}

function badge(est){
  const m={Activo:'ba',Inactivo:'bi',Falla:'bf',Baja:'bb'};
  return `<span class="badge ${m[est]||'bb'}">${est}</span>`;
}

function catIco(c){
  return ({Laptop:'fas fa-laptop','All-in-One':'fas fa-desktop',Escritorio:'fas fa-computer',
    Monitor:'fas fa-tv',Ratón:'fas fa-computer-mouse',Teclado:'fas fa-keyboard',
    Cargador:'fas fa-plug',Red:'fas fa-network-wired',Servidor:'fas fa-server',
    Multimedia:'fas fa-photo-film',NAS:'fas fa-hard-drive',Seguridad:'fas fa-shield-halved',
    Multifuncional:'fas fa-print'})[c]||'fas fa-microchip';
}

function fmtMAC(inp){
  let v=inp.value.replace(/[^0-9A-Fa-f]/g,'').toUpperCase();
  let o='';for(let i=0;i<v.length&&i<12;i++){if(i>0&&i%2===0)o+=':';o+=v[i];}
  inp.value=o;
}

function mkChart(id,type,labels,datasets,options){
  const el=document.getElementById(id); if(!el)return;
  if(charts[id])charts[id].destroy();
  charts[id]=new Chart(el,{type,data:{labels,datasets},options:{responsive:true,...options}});
}

function toast(msg,type='s'){
  const w=document.getElementById('toast-wrap');
  const t=document.createElement('div');
  const icons={s:'fa-circle-check',e:'fa-circle-xmark',w:'fa-triangle-exclamation'};
  const cls={s:'ts',e:'te',w:'tw'};
  t.className=`toast ${cls[type]||'ts'}`;
  t.innerHTML=`<i class="fas ${icons[type]||icons.s}"></i>${msg}`;
  w.appendChild(t);
  setTimeout(()=>{t.style.transition='opacity .3s';t.style.opacity='0';setTimeout(()=>t.remove(),300);},3200);
}

// ═══════════════════════════════════════════
// TINTAS
// ═══════════════════════════════════════════
const TINTAS_KEY = 'sist108_tintas';
let tintasDb = JSON.parse(localStorage.getItem(TINTAS_KEY) || '[]');
let editTintaId = null;

function saveTintasLocal() {
  localStorage.setItem(TINTAS_KEY, JSON.stringify(tintasDb));
}

function initTintasForm() {
  if (!editTintaId) {
    document.getElementById('tf-fingreso').value = new Date().toISOString().split('T')[0];
  }
}

function saveTinta() {
  let ok = true;
  ['tf-modelo', 'tf-color'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add('err'); ok = false; }
    else el.classList.remove('err');
  });
  if (!ok) { toast('Completa los campos obligatorios.', 'e'); return; }

  const rec = {
    id: editTintaId || 'TIN' + Date.now(),
    modelo: document.getElementById('tf-modelo').value.trim(),
    nombre: document.getElementById('tf-nombre').value.trim(),
    color: document.getElementById('tf-color').value.trim(),
    fingreso: document.getElementById('tf-fingreso').value,
    fcaducidad: document.getElementById('tf-fcaducidad').value,
    cantidad: Math.max(0, parseInt(document.getElementById('tf-cantidad').value) || 0),
    proveedor: document.getElementById('tf-proveedor').value.trim(),
    notas: document.getElementById('tf-notas').value.trim(),
  };

  if (editTintaId) {
    const i = tintasDb.findIndex(t => t.id === editTintaId);
    tintasDb[i] = rec;
    toast('Tinta actualizada correctamente.', 's');
  } else {
    tintasDb.push(rec);
    toast('Tinta registrada correctamente.', 's');
  }
  saveTintasLocal();
  cancelEditTinta();
  renderTintas();
}

function cancelEditTinta() {
  editTintaId = null;
  document.getElementById('tf-form-title').innerHTML =
    '<i class="fas fa-plus-circle" style="color:var(--r3);margin-right:6px"></i>Registrar Tinta';
  document.getElementById('btn-save-tinta-lbl').textContent = 'Guardar tinta';
  document.getElementById('btn-cancel-tinta').style.display = 'none';
  ['tf-modelo', 'tf-nombre', 'tf-color', 'tf-proveedor', 'tf-notas'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.classList.remove('err');
  });
  document.getElementById('tf-cantidad').value = '1';
  document.getElementById('tf-fingreso').value = new Date().toISOString().split('T')[0];
  document.getElementById('tf-fcaducidad').value = '';
}

function editTintaFn(id) {
  const t = tintasDb.find(x => x.id === id); if (!t) return;
  editTintaId = id;
  document.getElementById('tf-modelo').value = t.modelo;
  document.getElementById('tf-nombre').value = t.nombre;
  document.getElementById('tf-color').value = t.color;
  document.getElementById('tf-fingreso').value = t.fingreso;
  document.getElementById('tf-fcaducidad').value = t.fcaducidad;
  document.getElementById('tf-cantidad').value = t.cantidad;
  document.getElementById('tf-proveedor').value = t.proveedor;
  document.getElementById('tf-notas').value = t.notas;
  document.getElementById('tf-form-title').innerHTML =
    '<i class="fas fa-edit" style="color:var(--r3);margin-right:6px"></i>Editar Tinta';
  document.getElementById('btn-save-tinta-lbl').textContent = 'Actualizar tinta';
  document.getElementById('btn-cancel-tinta').style.display = '';
  document.getElementById('sec-tintas').scrollIntoView({ behavior: 'smooth' });
}

function deleteTintaFn(id) {
  if (!confirm('¿Eliminar esta tinta? La acción es irreversible.')) return;
  tintasDb = tintasDb.filter(t => t.id !== id);
  saveTintasLocal();
  if (editTintaId === id) cancelEditTinta();
  renderTintas();
  toast('Tinta eliminada.', 's');
}

function renderTintas() {
  const q = (document.getElementById('tfi-q').value || '').toLowerCase();
  const rows = tintasDb.filter(t =>
    !q || [t.modelo, t.color, t.proveedor, t.nombre].some(v => (v || '').toLowerCase().includes(q))
  );
  const tbody = document.getElementById('tintas-tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty"><i class="fas fa-print"></i><h3>Sin registros</h3><p>${tintasDb.length ? 'Sin resultados con ese filtro.' : 'Agrega una tinta usando el formulario.'}</p></div></td></tr>`;
  } else {
    tbody.innerHTML = rows.map(t => `
      <tr>
        <td><strong>${tesc(t.modelo)}</strong></td>
        <td>${tesc(t.nombre)||'—'}</td>
        <td>${colorDot(t.color)}${tesc(t.color)}</td>
        <td>${t.fingreso||'—'}</td>
        <td>${t.fcaducidad||'—'}</td>
        <td>${t.cantidad}</td>
        <td>${tesc(t.proveedor)||'—'}</td>
        <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${tesc(t.notas)}">${tesc(t.notas)||'—'}</td>
        <td class="action-col">
          <div style="display:flex;gap:4px">
            <button class="btn btn-e btn-sm" onclick="editTintaFn('${t.id}')" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="btn btn-d btn-sm" onclick="deleteTintaFn('${t.id}')" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>`).join('');
  }
  document.getElementById('tintas-pag-info').textContent =
    rows.length === tintasDb.length
      ? `${tintasDb.length} registro${tintasDb.length !== 1 ? 's' : ''}`
      : `Mostrando ${rows.length} de ${tintasDb.length} registros`;
}

function colorDot(color) {
  const map = { negro:'#222', cian:'#00BCD4', magenta:'#E91E63', amarillo:'#FFC107' };
  const c = map[(color||'').toLowerCase()] || '#adb5bd';
  return `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c};border:1px solid rgba(0,0,0,.2);vertical-align:middle;margin-right:4px"></span>`;
}

function tesc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function exportTintasExcel() {
  if (!tintasDb.length) { toast('No hay tintas para exportar.', 'w'); return; }
  if (typeof XLSX === 'undefined') { toast('Librería XLSX no disponible.', 'e'); return; }
  const rows = tintasDb.map(t => ({
    'Modelo': t.modelo,
    'Nombre': t.nombre,
    'Color': t.color,
    'Fecha Ingreso': t.fingreso,
    'Fecha Caducidad': t.fcaducidad,
    'Cantidad': t.cantidad,
    'Proveedor': t.proveedor,
    'Notas': t.notas,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tintas');
  XLSX.writeFile(wb, `tintas_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast('Excel exportado correctamente.', 's');
}

// close on overlay click
document.querySelectorAll('.mo').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');}));

// ── INIT ──
renderDashboard();
