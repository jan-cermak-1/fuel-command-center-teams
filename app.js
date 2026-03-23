const TEAMS = {
  emea:     { name:'EMEA Marketing',   color:'#0f62fe' },
  japac:    { name:'JAPAC Social',      color:'#20c54f' },
  hq:       { name:'HQ Leadership',     color:'#f5a623' },
  na_east:  { name:'NA East Coast',     color:'#e040fb' },
  na_west:  { name:'NA West Coast',     color:'#ff6d00' },
  latam:    { name:'LATAM Growth',      color:'#00bfa5' },
  uk:       { name:'UK & Ireland',      color:'#304ffe' },
  dach:     { name:'DACH Region',       color:'#c51162' },
  nordics:  { name:'Nordics',           color:'#64dd17' },
  france:   { name:'France',            color:'#aa00ff' },
  iberia:   { name:'Iberia',            color:'#dd2c00' },
  india:    { name:'India',             color:'#00c853' },
  sea:      { name:'Southeast Asia',    color:'#6200ea' },
  china:    { name:'Greater China',     color:'#d50000' },
  anz:      { name:'Australia & NZ',    color:'#0091ea' },
};
const DESCS = {
  A: 'All data from all teams aggregated. No team context — single unified view per user.',
  B: 'Global team selector in the header (pill buttons). Works well for 3–5 teams.',
  C: 'Per-widget selector. Each team-contextual widget has its own dropdown.',
  D: 'Global team selector as dropdown. Scales to 15+ teams without cluttering the header.',
};

let cv = 'A';
let activeTeam = 'emea';

function syncSectionSelectOptions() {
  const src = document.getElementById('teamDropdown');
  const targets = ['listenTeamSel','objTeamSel'].map(id=>document.getElementById(id)).filter(Boolean);
  if (!src || !targets.length) return;
  targets.forEach(sel => {
    sel.innerHTML = '';
    [...src.options].forEach(opt => sel.appendChild(opt.cloneNode(true)));
  });
}

function setV(v) {
  cv = v;
  document.querySelectorAll('.vbtn').forEach((b,i)=>b.classList.toggle('active',['A','B','C','D'][i]===v));
  const vdesc = document.getElementById('vdesc');
  if (vdesc) vdesc.textContent = DESCS[v];
  const iB=v==='B', iC=v==='C', iD=v==='D';

  // Header team tabs (B) vs select dropdown (D)
  document.getElementById('hdrDiv').classList.toggle('show', iB || iD);
  document.getElementById('hdrTabs').classList.toggle('show', iB);
  document.getElementById('hdrTeamSelect').classList.toggle('show', iD);
  const hdrInfo = document.getElementById('hdrInfo');
  if (hdrInfo) hdrInfo.classList.toggle('show', iB || iD);

  // Variant A: "Data from all 3 teams" in widget headers; team name in obj1/obj2 whdr (not in gc bar)
  const isA = v === 'A';
  ['mergeBadgeOwned','mergeBadgeComp','mergeBadgeObj3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', isA);
  });
  ['obj1WhdrTeam','obj2WhdrTeam'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', isA);
  });

  // KPI footers — always show "All teams" for B and A; hide for C (per-widget context)
  ['kf1','kf2','kf3','kf4'].forEach(id=>{
    const el = document.getElementById(id);
    // In all variants KPI shows all teams — this label is always visible
    el.classList.add('show');
  });

  // Section selectors (C)
  document.getElementById('listenSel').classList.toggle('show', iC);
  document.getElementById('objSel').classList.toggle('show', iC);

  // Blue team headers on widgets: B/D (global team) + C (per-section selects)
  const teamHdr = iB || iD || iC;
  document.getElementById('ownedCtx').classList.toggle('show', teamHdr);
  document.getElementById('compCtx').classList.toggle('show', teamHdr);
  ['obj1ctx','obj2ctx','obj3ctx'].forEach(id=>document.getElementById(id).classList.toggle('show', teamHdr));
}

function pickTeamFromSelect(sel) {
  const team = sel.value;
  if (sel.id === 'listenTeamSel') applyListenTeam(team);
  else if (sel.id === 'objTeamSel') applyObjTeam(team);
  else applyTeam(team);
}

/** Variant C: Social listening section — only listening cards */
function applyListenTeam(team) {
  const t = TEAMS[team];
  if (!t) return;
  ['ownedTeam','compTeam'].forEach(id=>{
    const e=document.getElementById(id); if(e) e.textContent=t.name;
  });
  ['ownedCard','compCard'].forEach(id=>{
    const e=document.getElementById(id);
    e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash');
  });
}

/** Variant C: Objectives section — only objective widgets */
function applyObjTeam(team) {
  const t = TEAMS[team];
  if (!t) return;
  ['obj1team','obj2team','obj3team','obj1WhdrTeam','obj2WhdrTeam'].forEach(id=>{
    const e=document.getElementById(id); if(e) e.textContent=t.name;
  });
  ['obj1','obj2','obj3'].forEach(id=>{
    const e=document.getElementById(id);
    e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash');
  });
}

/** Header / variant B+D — one global team for all team-scoped widgets */
function applyTeam(team) {
  const t = TEAMS[team];
  if (!t) return;
  activeTeam = team;

  ['ownedTeam','compTeam','obj1team','obj2team','obj3team','obj1WhdrTeam','obj2WhdrTeam'].forEach(id=>{
    const e=document.getElementById(id); if(e) e.textContent=t.name;
  });
  document.querySelectorAll('.ttab[data-team]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.team === team);
  });
  const dd = document.getElementById('teamDropdown');
  if (dd && [...dd.options].some(o => o.value === team)) dd.value = team;
  // Do not sync listenTeamSel / objTeamSel — variant C keeps them independent

  ['ownedCard','compCard','obj1','obj2','obj3'].forEach(id=>{
    const e=document.getElementById(id);
    e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash');
  });
}

function pickTeam(el, team) {
  const dd = document.getElementById('teamDropdown');
  if (dd) dd.value = team;
  applyTeam(team);
}

syncSectionSelectOptions();
// Init — Variant A by default, but KPI footers always show
setV('A');
['kf1','kf2','kf3','kf4'].forEach(id=>document.getElementById(id).classList.add('show'));
applyTeam(activeTeam);

function toggleSide() {
  const side = document.querySelector('.side');
  side.classList.toggle('collapsed');
}
