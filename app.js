const RAW_CATEGORIES = [
  { id:'food', number:'01', name:'อาหาร', icon:'🍽️', accent:'#ff8d6a', soft:'#fff1ea', banner:'assets/banners/food.gif', line:'assets/line/food-line.png' },
  { id:'medicine', number:'02', name:'ยา', icon:'💊', accent:'#56c0b6', soft:'#eaf9f7', banner:'assets/banners/medicine.gif', line:'assets/line/medicine-line.png' },
  { id:'herbal', number:'03', name:'ผลิตภัณฑ์สมุนไพร', icon:'🌿', accent:'#76b96f', soft:'#eef8ec', banner:'assets/banners/herbal.gif', line:'assets/line/herbal-line.png' },
  { id:'cosmetics', number:'04', name:'เครื่องสำอาง', icon:'🧴', accent:'#e68ab4', soft:'#fff0f7', banner:'assets/banners/cosmetics.gif', line:'assets/line/cosmetics-line.png' },
  { id:'hazardous', number:'05', name:'วัตถุอันตราย', icon:'⚠️', accent:'#e1b044', soft:'#fff6df', banner:'assets/banners/hazardous.gif', line:'assets/line/hazardous-line.png' },
  { id:'narcotics', number:'06', name:'วัตถุเสพติด', icon:'🧪', accent:'#8d69d5', soft:'#f3eeff', banner:'assets/banners/narcotics.gif', line:'assets/line/narcotics-line.png' },
  { id:'medical-device', number:'07', name:'เครื่องมือแพทย์', icon:'🩺', accent:'#5d98d8', soft:'#eef5ff', banner:'assets/banners/medical-device.gif', line:'assets/line/medical-device-line.png' },
  { id:'hospital', number:'08', name:'สถานพยาบาล', icon:'🏥', accent:'#49a7c6', soft:'#edf8fc', banner:'assets/banners/hospital.gif', line:'assets/line/hospital-line.png' },
  { id:'health-establishment', number:'09', name:'สถานประกอบการเพื่อสุขภาพ', icon:'💆', accent:'#62aa91', soft:'#edf9f4', banner:'assets/banners/health-establishment.gif', line:'assets/line/health-establishment-line.png' }
];

const makeSubtopics = (name) => ([
  { type:'ขั้นตอน', title:`ขั้นตอนการดำเนินงาน`, desc:`รายละเอียดขั้นตอนการยื่นคำขอและกระบวนงานที่เกี่ยวข้องกับงาน${name}` },
  { type:'แบบฟอร์ม', title:'ดาวน์โหลดแบบฟอร์ม', desc:`รวมแบบคำขอ หนังสือรับรอง และเอกสารประกอบสำหรับงาน${name}` },
  { type:'หลักเกณฑ์', title:'หลักเกณฑ์และกฎหมาย', desc:`กฎหมาย ระเบียบ และแนวทางปฏิบัติที่เกี่ยวข้องกับงาน${name}` },
  { type:'คู่มือ', title:'คู่มือประชาชน/เจ้าหน้าที่', desc:`คู่มือสำหรับประชาชน ผู้ประกอบการ และเจ้าหน้าที่ในหมวด${name}` },
  { type:'เอกสารเผยแพร่', title:'เอกสารเผยแพร่', desc:`ข่าวประชาสัมพันธ์ เอกสารเผยแพร่ และสื่อความรู้ของงาน${name}` },
  { type:'ติดต่อ', title:'ติดต่อสอบถาม', desc:`ช่องทาง LINE และการติดต่อสอบถามสำหรับงาน${name}` }
]);

const CATEGORIES = RAW_CATEGORIES.map((item) => ({
  ...item,
  summary:`รวมขั้นตอน แบบฟอร์ม หลักเกณฑ์ คู่มือ และเอกสารที่เกี่ยวข้องกับงาน${item.name}`,
  chips:['ขั้นตอน', 'แบบฟอร์ม', 'หลักเกณฑ์', 'คู่มือ'],
  subtopics: makeSubtopics(item.name)
}));

const state = { slide:0, timer:null, currentUser:null, users:[], uploads:[] };
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function defaultData(){
  const admin = {
    id:'u1', username:'admin', name:'ผู้ดูแลระบบ', email:'admin@ossc73.local', password:'admin1234',
    role:'admin', active:true, permissions:CATEGORIES.map(c => c.id)
  };
  const user = {
    id:'u2', username:'user', name:'เจ้าหน้าที่ตัวอย่าง', email:'user@ossc73.local', password:'user1234',
    role:'user', active:true, permissions:['food','medicine','herbal','cosmetics']
  };
  return { users:[admin,user], uploads:[] };
}

function loadData(){
  const saved = localStorage.getItem('ossc73-demo-data');
  const data = saved ? JSON.parse(saved) : defaultData();
  state.users = data.users;
  state.uploads = data.uploads || [];
}
function saveData(){
  localStorage.setItem('ossc73-demo-data', JSON.stringify({ users:state.users, uploads:state.uploads }));
}

function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])); }
function attr(s=''){ return esc(s); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove('show'),2600); }
function scrollToTarget(selector){ const el = document.querySelector(selector); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }

function renderBanners(){
  const track = $('#bannerTrack');
  track.innerHTML = CATEGORIES.map(c => `<div class="banner-slide"><img src="${c.banner}" alt="${c.name}"></div>`).join('');
  $('#bannerDots').innerHTML = CATEGORIES.map((_,i) => `<button class="dot ${i===0?'active':''}" data-slide="${i}" aria-label="สไลด์ ${i+1}"></button>`).join('');
  $$('.dot').forEach(d => d.onclick = () => goSlide(+d.dataset.slide));
  startSlider();
}
function goSlide(i){
  state.slide = (i + CATEGORIES.length) % CATEGORIES.length;
  $('#bannerTrack').style.transform = `translateX(-${state.slide*100}%)`;
  $$('.dot').forEach((d,idx) => d.classList.toggle('active', idx===state.slide));
}
function startSlider(){ clearInterval(state.timer); state.timer = setInterval(() => goSlide(state.slide+1), 4500); }

function serviceCardMarkup(c){
  return `
    <article class="service-card" style="--accent:${c.accent};--soft:${c.soft}">
      <div class="service-top">
        <div class="service-icon">${c.icon}</div>
        <div class="service-no">${c.number}</div>
      </div>
      <h3>${c.name}</h3>
      <p>${c.summary}</p>
      <div class="service-meta">
        ${c.chips.map(chip => `<span class="meta-chip">${chip}</span>`).join('')}
      </div>
      <div class="card-actions">
        <button class="mini-btn primary" data-open-category="${c.id}">เปิดรายละเอียด</button>
        <button class="mini-btn" data-request-upload="${c.id}">อัปโหลดเอกสาร</button>
      </div>
    </article>`;
}

function renderServices(query=''){
  const q = query.trim().toLowerCase();
  const filtered = !q ? CATEGORIES : CATEGORIES.filter(c => {
    const bucket = [c.name, c.summary, ...c.chips, ...c.subtopics.map(s => `${s.title} ${s.desc}`)].join(' ').toLowerCase();
    return bucket.includes(q);
  });

  const grid = $('#serviceGrid');
  grid.innerHTML = filtered.length
    ? filtered.map(serviceCardMarkup).join('')
    : `<div class="empty-state"><b>ไม่พบหมวดงานที่ค้นหา</b><div style="margin-top:8px">ลองค้นหาด้วยคำว่า อาหาร, ยา, เครื่องมือแพทย์ หรือ สถานพยาบาล</div></div>`;

  $$('[data-open-category]').forEach(btn => btn.onclick = () => openCategory(btn.dataset.openCategory));
  $$('[data-request-upload]').forEach(btn => btn.onclick = () => requestUpload(btn.dataset.requestUpload));
}

function renderLines(){
  $('#lineGrid').innerHTML = CATEGORIES.map(c => `
    <article class="line-card">
      <div class="line-card-head">
        <h3>${c.name}</h3>
        <p>ช่องทาง LINE สำหรับติดต่อสอบถามงาน${c.name}</p>
      </div>
      <img src="${c.line}" alt="LINE ${c.name}">
      <a href="#" data-open-line="${c.id}">เปิด LINE ${c.name}</a>
    </article>`).join('');

  $$('[data-open-line]').forEach(a => a.onclick = (e) => {
    e.preventDefault();
    const c = CATEGORIES.find(x => x.id === a.dataset.openLine);
    toast(`ตัวอย่างปุ่ม LINE ของหมวด ${c.name} — สามารถใส่ลิงก์จริงได้ภายหลัง`);
  });
}

function openCategory(id){
  const c = CATEGORIES.find(x => x.id === id);
  if(!c) return;
  $('#categoryModalBody').innerHTML = `
    <div class="category-shell">
      <div class="category-hero" style="--accent:${c.accent};--soft:${c.soft}">
        <div class="category-copy">
          <div class="badge-number">${c.number}</div>
          <span class="eyebrow">หมวดงานตามพระราชบัญญัติ</span>
          <h3>${c.name}</h3>
          <p>${c.summary}</p>
        </div>
        <img src="${c.banner}" alt="${c.name}">
      </div>

      <div class="category-content">
        <div class="subtopic-grid">
          ${c.subtopics.map((s, idx) => `
            <article class="subtopic-card" style="--accent:${c.accent};--soft:${c.soft}">
              <span class="subtopic-tag">${String(idx+1).padStart(2,'0')} • ${s.type}</span>
              <h4>${s.title}</h4>
              <p>${s.desc}</p>
              <button class="mini-btn primary" data-open-subtopic="${c.id}|${idx}">เปิดข้อมูล</button>
            </article>`).join('')}
        </div>

        <aside class="category-side">
          <div class="side-card">
            <h4>LINE สอบถามงาน${c.name}</h4>
            <p>สามารถนำปุ่มนี้ไปเชื่อมกับลิงก์ LINE ของแต่ละกลุ่มงานได้จริงภายหลัง</p>
            <img src="${c.line}" alt="LINE ${c.name}">
            <button class="btn btn-soft" data-open-line="${c.id}">ทดลองกดเปิด LINE</button>
          </div>

          <div class="side-card">
            <h4>สิ่งที่หมวดนี้รองรับ</h4>
            <ul class="side-list">
              <li>หัวข้อย่อยหลายรายการภายในแต่ละ พ.ร.บ.</li>
              <li>เชื่อมลิงก์ Google Drive / Google Site / Apps Script ได้</li>
              <li>เจ้าหน้าที่ที่มีสิทธิ์สามารถอัปโหลดเอกสารได้</li>
            </ul>
            <button class="btn btn-primary" data-request-upload="${c.id}">เข้าสู่ระบบเพื่ออัปโหลด</button>
          </div>
        </aside>
      </div>
    </div>`;

  $('#categoryModal').classList.add('open');
  $('#categoryModal').setAttribute('aria-hidden','false');

  $$('[data-open-subtopic]').forEach(btn => btn.onclick = () => {
    const [catId, idx] = btn.dataset.openSubtopic.split('|');
    const cat = CATEGORIES.find(x => x.id === catId);
    const topic = cat?.subtopics[+idx];
    toast(`หัวข้อ "${topic.title}" ของงาน${cat.name} พร้อมเชื่อมลิงก์เอกสารจริงได้`);
  });
  $$('[data-open-line]').forEach(btn => btn.onclick = () => {
    const cat = CATEGORIES.find(x => x.id === btn.dataset.openLine);
    toast(`ตัวอย่างปุ่ม LINE ของหมวด ${cat.name} — ใส่ URL จริงได้ภายหลัง`);
  });
  $$('[data-request-upload]').forEach(btn => btn.onclick = () => requestUpload(btn.dataset.requestUpload));
}
function closeCategory(){ $('#categoryModal').classList.remove('open'); $('#categoryModal').setAttribute('aria-hidden','true'); }
function requestUpload(id){ closeCategory(); openLogin(); sessionStorage.setItem('ossc73-after-login-category', id); }

function openLogin(){ const m=$('#loginModal'); m.classList.add('open'); m.setAttribute('aria-hidden','false'); setTimeout(() => $('#loginUser').focus(), 80); }
function closeLogin(){ const m=$('#loginModal'); m.classList.remove('open'); m.setAttribute('aria-hidden','true'); $('#loginError').textContent=''; }
function openDashboard(user){
  state.currentUser = user;
  closeLogin();
  $('#dashboardModal').classList.add('open');
  $('#dashboardModal').setAttribute('aria-hidden','false');
  renderDashboard();
  const cat = sessionStorage.getItem('ossc73-after-login-category');
  if(cat){ sessionStorage.removeItem('ossc73-after-login-category'); setTimeout(() => selectUploadCategory(cat), 100); }
}
function closeDashboard(){ $('#dashboardModal').classList.remove('open'); $('#dashboardModal').setAttribute('aria-hidden','true'); }

function login(e){
  e.preventDefault();
  const u = $('#loginUser').value.trim().toLowerCase();
  const p = $('#loginPassword').value;
  const found = state.users.find(x => x.active && (x.username.toLowerCase()===u || x.email.toLowerCase()===u) && x.password===p);
  if(!found){ $('#loginError').textContent='ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'; return; }
  openDashboard(found);
}
function logout(){ state.currentUser=null; closeDashboard(); toast('ออกจากระบบแล้ว'); }

function renderDashboard(){
  const u = state.currentUser;
  $('#dashboardTitle').textContent = u.role==='admin' ? 'Admin Dashboard' : 'พื้นที่เจ้าหน้าที่';
  $('#dashboardSubtitle').textContent = `${u.name} • ${u.email}`;
  const mine = state.uploads.filter(x => x.userId===u.id);
  const allowed = u.role==='admin' ? CATEGORIES : CATEGORIES.filter(c => u.permissions.includes(c.id));
  const tabs = u.role==='admin'
    ? [['upload','อัปโหลดไฟล์'],['users','ผู้ใช้งานและสิทธิ์'],['history','ประวัติอัปโหลด']]
    : [['upload','อัปโหลดไฟล์'],['history','ประวัติของฉัน']];

  $('#dashboardContent').innerHTML = `
    <div class="stats">
      <div class="stat"><span>สิทธิ์หมวดงาน</span><b>${allowed.length}</b></div>
      <div class="stat"><span>ไฟล์ที่อัปโหลด</span><b>${u.role==='admin' ? state.uploads.length : mine.length}</b></div>
      <div class="stat"><span>สถานะบัญชี</span><b style="font-size:20px;color:#2f8f72">ใช้งานได้</b></div>
    </div>

    <div class="tabs">
      ${tabs.map((t,i)=>`<button class="tab ${i===0?'active':''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}
    </div>

    <div class="panel active" id="panel-upload">${uploadPanel(allowed)}</div>
    ${u.role==='admin' ? `<div class="panel" id="panel-users">${usersPanel()}</div>` : ''}
    <div class="panel" id="panel-history">${historyPanel(u)}</div>`;

  $$('.tab').forEach(btn => btn.onclick = () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $$('.panel').forEach(x => x.classList.remove('active'));
    $(`#panel-${btn.dataset.tab}`).classList.add('active');
  });

  bindDashboardHandlers();
}

function uploadPanel(allowed){
  return `
    <div class="upload-box">
      <h4>อัปโหลดเอกสาร</h4>
      <p class="muted">ระบบทดลองจะบันทึกรายการอัปโหลดไว้ในเบราว์เซอร์ ส่วนระบบจริงสามารถเชื่อม Google Drive ของแต่ละหมวดได้</p>
      <form id="uploadForm">
        <div class="row">
          <label>หมวดงาน
            <select id="uploadCategory">${allowed.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
          </label>
          <label>ชื่อเอกสาร
            <input id="uploadTitle" required placeholder="เช่น คู่มือการยื่นคำขอ" />
          </label>
        </div>
        <label>เลือกไฟล์
          <input id="uploadFile" type="file" required />
        </label>
        <button class="btn btn-primary" type="submit" style="margin-top:14px">อัปโหลดไฟล์</button>
      </form>
    </div>`;
}

function usersPanel(){
  return `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
      <div>
        <h4 style="margin:0">ผู้ใช้งานและสิทธิ์</h4>
        <span class="muted">Admin กำหนดสิทธิ์การอัปโหลดเป็นรายหมวด</span>
      </div>
      <button class="btn btn-primary" id="addUserBtn">+ เพิ่มผู้ใช้</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>ชื่อ</th><th>บัญชี</th><th>บทบาท</th><th>สิทธิ์</th><th>สถานะ</th><th></th></tr></thead>
        <tbody>
          ${state.users.map(u => `
            <tr>
              <td>${esc(u.name)}</td>
              <td>${esc(u.username)}<br><span class="muted">${esc(u.email)}</span></td>
              <td><span class="badge ${u.role}">${u.role==='admin'?'ADMIN':'USER'}</span></td>
              <td>${u.role==='admin'?'ทุกหมวด':u.permissions.length+' หมวด'}</td>
              <td>${u.active ? 'ใช้งาน' : 'ปิด'}</td>
              <td><button class="mini-btn" data-edit-user="${u.id}">จัดการ</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div id="userEditor" style="margin-top:18px"></div>`;
}

function historyPanel(u){
  const rows = (u.role==='admin' ? state.uploads : state.uploads.filter(x => x.userId===u.id)).slice().reverse();
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>วันที่</th><th>เอกสาร</th><th>หมวด</th><th>ไฟล์</th><th>ผู้อัปโหลด</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(x => `
            <tr>
              <td>${new Date(x.time).toLocaleString('th-TH')}</td>
              <td>${esc(x.title)}</td>
              <td>${CATEGORIES.find(c => c.id===x.category)?.name || x.category}</td>
              <td>${esc(x.fileName)}</td>
              <td>${esc(x.userName)}</td>
            </tr>`).join('') : '<tr><td colspan="5" class="muted">ยังไม่มีรายการอัปโหลด</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

function bindDashboardHandlers(){
  const form = $('#uploadForm');
  if(form) form.onsubmit = (e) => {
    e.preventDefault();
    const file = $('#uploadFile').files[0];
    state.uploads.push({
      id:'f'+Date.now(),
      time:Date.now(),
      title:$('#uploadTitle').value.trim(),
      fileName:file.name,
      category:$('#uploadCategory').value,
      userId:state.currentUser.id,
      userName:state.currentUser.name
    });
    saveData();
    toast('บันทึกรายการอัปโหลดแล้ว');
    renderDashboard();
  };

  const add = $('#addUserBtn');
  if(add) add.onclick = () => editUser();
  $$('[data-edit-user]').forEach(btn => btn.onclick = () => editUser(btn.dataset.editUser));
}
function selectUploadCategory(id){ const sel = $('#uploadCategory'); if(sel && [...sel.options].some(o => o.value===id)) sel.value=id; }

function editUser(id){
  const existing = id ? state.users.find(u => u.id===id) : null;
  $('#userEditor').innerHTML = `
    <div class="upload-box">
      <h4>${existing ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน'}</h4>
      <form id="userForm">
        <div class="row">
          <label>ชื่อ-นามสกุล<input id="uName" required value="${existing ? attr(existing.name) : ''}" /></label>
          <label>อีเมล<input id="uEmail" type="email" required value="${existing ? attr(existing.email) : ''}" /></label>
        </div>
        <div class="row">
          <label>ชื่อผู้ใช้<input id="uUsername" required value="${existing ? attr(existing.username) : ''}" /></label>
          <label>รหัสผ่าน<input id="uPassword" ${existing ? '' : 'required'} placeholder="${existing ? 'เว้นว่างหากไม่เปลี่ยน' : ''}" /></label>
        </div>
        <div class="row">
          <label>บทบาท
            <select id="uRole">
              <option value="user" ${existing?.role==='user' ? 'selected' : ''}>ผู้ใช้งาน</option>
              <option value="admin" ${existing?.role==='admin' ? 'selected' : ''}>Admin</option>
            </select>
          </label>
          <label>สถานะ
            <select id="uActive">
              <option value="1" ${existing?.active!==false ? 'selected' : ''}>ใช้งาน</option>
              <option value="0" ${existing?.active===false ? 'selected' : ''}>ปิดใช้งาน</option>
            </select>
          </label>
        </div>

        <h4>สิทธิ์อัปโหลดรายหมวด</h4>
        <div class="permission-grid">
          ${CATEGORIES.map(c => `
            <label class="permission-item">
              <input type="checkbox" name="permission" value="${c.id}" ${(existing?.permissions || []).includes(c.id) ? 'checked' : ''}>
              ${c.name}
            </label>`).join('')}
        </div>

        <button class="btn btn-primary" type="submit" style="margin-top:14px">บันทึกผู้ใช้งาน</button>
      </form>
    </div>`;

  $('#userForm').onsubmit = (e) => {
    e.preventDefault();
    const role = $('#uRole').value;
    const permissions = role==='admin' ? CATEGORIES.map(c => c.id) : $$('input[name="permission"]:checked').map(x => x.value);
    const obj = {
      id: existing?.id || 'u'+Date.now(),
      name: $('#uName').value.trim(),
      email: $('#uEmail').value.trim(),
      username: $('#uUsername').value.trim(),
      password: $('#uPassword').value || existing?.password || 'ChangeMe123!',
      role,
      active: $('#uActive').value === '1',
      permissions
    };

    if(existing) Object.assign(existing, obj);
    else state.users.push(obj);

    saveData();
    toast('บันทึกผู้ใช้งานแล้ว');
    renderDashboard();
    setTimeout(() => { const t = $('[data-tab="users"]'); if(t) t.click(); }, 50);
  };
}

function bindStaticEvents(){
  $('#loginBtn').onclick = openLogin;
  $('#heroLoginBtn').onclick = openLogin;
  $('#staffLoginBtn').onclick = openLogin;
  $('#staffShortcutBtn').onclick = () => scrollToTarget('#staff');
  $('#openGuideBtn').onclick = () => toast('สามารถแก้ข้อความ หัวข้อย่อย และลิงก์ของแต่ละ พ.ร.บ. ได้จากไฟล์ app.js');
  $('#loginForm').onsubmit = login;
  $('#logoutBtn').onclick = logout;
  $('#prevSlide').onclick = () => { goSlide(state.slide-1); startSlider(); };
  $('#nextSlide').onclick = () => { goSlide(state.slide+1); startSlider(); };
  $('#categorySearch').addEventListener('input', (e) => renderServices(e.target.value));

  $$('[data-close-modal]').forEach(x => x.onclick = closeLogin);
  $$('[data-close-dashboard]').forEach(x => x.onclick = closeDashboard);
  $$('[data-close-category]').forEach(x => x.onclick = closeCategory);

  $$('.quick-card').forEach(card => card.onclick = () => scrollToTarget(card.dataset.scroll));
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      closeLogin(); closeDashboard(); closeCategory();
    }
  });

  $('#mobileMenuBtn').onclick = () => toast('บนมือถือให้เลื่อนลงเพื่อดูเมนู งานตาม พ.ร.บ. และช่องทางติดต่อด้านล่าง');
}

loadData();
renderBanners();
renderServices();
renderLines();
bindStaticEvents();
$('#year').textContent = new Date().getFullYear();

window.openCategory = openCategory;
window.requestUpload = requestUpload;
window.toast = toast;
