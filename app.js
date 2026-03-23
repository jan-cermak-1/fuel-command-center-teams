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

  // Merge badge (A only)
  document.getElementById('gcMerge').classList.toggle('show', v==='A');

  // KPI footers — always show "All teams" for B and A; hide for C (per-widget context)
  ['kf1','kf2','kf3','kf4'].forEach(id=>{
    const el = document.getElementById(id);
    // In all variants KPI shows all teams — this label is always visible
    el.classList.add('show');
  });

  // Listening ctx strips (B and D)
  document.getElementById('ownedCtx').classList.toggle('show', iB || iD);
  document.getElementById('compCtx').classList.toggle('show', iB || iD);

  // Section selectors (C)
  document.getElementById('listenSel').classList.toggle('show', iC);
  document.getElementById('objSel').classList.toggle('show', iC);

  // Obj team ctx strips (B and D) — all 3 cards including top objectives
  ['obj1ctx','obj2ctx','obj3ctx'].forEach(id=>document.getElementById(id).classList.toggle('show', iB || iD));
}

function pickTeamFromSelect(sel) {
  const team = sel.value;
  applyTeam(team);
}


function applyTeam(team) {
  const t = TEAMS[team];
  if (!t) return;
  activeTeam = team;

  // Update all team name labels
  ['ownedTeam','compTeam','obj1team','obj2team','obj3team'].forEach(id=>{
    const e=document.getElementById(id); if(e) e.textContent=t.name;
  });
  // Header pills (B): keep active tab in sync with global team
  document.querySelectorAll('.ttab[data-team]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.team === team);
  });
  // Sync all team dropdowns
  ['teamDropdown','listenTeamSel','objTeamSel'].forEach(id => {
    const el = document.getElementById(id);
    if (el && [...el.options].some(o => o.value === team)) el.value = team;
  });
  // Flash team-dependent cards
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
// KPI footers: keep "All teams" label always visible as it's always true
['kf1','kf2','kf3','kf4'].forEach(id=>document.getElementById(id).classList.add('show'));
applyTeam(activeTeam);

function toggleSide() {
  const side = document.querySelector('.side');
  side.classList.toggle('collapsed');
  // CSS handles the chevron rotation via .collapsed class
}
