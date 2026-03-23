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

/** B/D: global team; C: Objectives section team selector */
function getObjectiveContextTeamId() {
  if (cv === 'C') {
    const o = document.getElementById('objTeamSel');
    if (o && o.value) return o.value;
  }
  return activeTeam || document.getElementById('teamDropdown')?.value || 'emea';
}

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

  const isA = v === 'A';
  const obj3card = document.getElementById('obj3');
  if (obj3card) obj3card.classList.toggle('obj3-variant-a', isA);
  ['obj1WhdrTeam','obj2WhdrTeam'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', isA);
  });

  // KPI footers — always show "All teams"
  ['kf1','kf2','kf3','kf4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
  });
  // Listening + top objectives merged-data footers — variant A only (B/C/D use team context)
  ['lf1', 'lf2', 'lf3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', isA);
  });

  // Section selectors (C)
  document.getElementById('listenSel').classList.toggle('show', iC);
  document.getElementById('objSel').classList.toggle('show', iC);

  // Blue team headers on widgets: B/D (global team) + C (per-section selects)
  const teamHdr = iB || iD || iC;
  document.getElementById('ownedCtx').classList.toggle('show', teamHdr);
  document.getElementById('compCtx').classList.toggle('show', teamHdr);
  ['obj1ctx','obj2ctx','obj3ctx'].forEach(id=>document.getElementById(id).classList.toggle('show', teamHdr));

  document.querySelectorAll('.obj-pick-wrap-a').forEach(el => el.classList.toggle('show', isA));
  document.querySelectorAll('.obj-pick-wrap-bcd').forEach(el => el.classList.toggle('show', !isA));
  if (!isA) closeAllObjPickPops();
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
    const on = btn.dataset.team === team;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
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

/** Variant A — team → objective (teams mirror #teamDropdown) */
const OBJ_PICK_TEMPLATE = {
  obj1: [
    { title: 'Performance Measurement & ROI Optimization', period: 'Last 30 Days', val: '48.3', chgUp: true, chg: '+21%', meta1: 'Customer Acquisition Efficiency Index (CAEI)', meta2: 'Below 50 CAEI', onTrack: true },
    { title: 'Expand recurring revenue share', period: 'Last 90 Days', val: '32.1', chgUp: true, chg: '+8%', meta1: 'Net revenue retention', meta2: 'Above peer median', onTrack: true },
    { title: 'Social sentiment lift across channels', period: 'Last 30 Days', val: '72.4', chgUp: true, chg: '+12%', meta1: 'Brand sentiment score', meta2: 'vs. category benchmark', onTrack: true },
    { title: 'Campaign delivery SLA', period: 'Q1 2025', val: '94.0', chgUp: false, chg: '-2%', meta1: 'On-time delivery', meta2: 'Target 95%', onTrack: true },
  ],
  obj2: [
    { title: 'Performance Measurement & ROI Optimization', period: 'Last 30 Days', val: '12.2', chgUp: false, chg: '-74%', meta1: 'Customer Acquisition Efficiency Index (CAEI)', meta2: 'Below 50 CAEI', onTrack: false },
    { title: 'Cost per acquisition trend', period: 'Last 30 Days', val: '58.4', chgUp: false, chg: '-12%', meta1: 'Blended CPA', meta2: 'Above target band', onTrack: false },
    { title: 'Audience engagement rate', period: 'Last 30 Days', val: '4.1', chgUp: true, chg: '+6%', meta1: 'Engagement / impressions', meta2: 'Below category leader', onTrack: false },
    { title: 'Forecast accuracy', period: 'Last quarter', val: '81.0', chgUp: true, chg: '+4%', meta1: 'Rolling forecast vs actuals', meta2: 'Improving trend', onTrack: true },
  ],
};

let _objectivePickerData = null;

function getPickerTeamIds() {
  const dd = document.getElementById('teamDropdown');
  if (!dd || !dd.options.length) return Object.keys(TEAMS);
  return [...dd.options].map(o => o.value);
}

function buildObjectivePickerData() {
  const ids = getPickerTeamIds();
  const out = { obj1: {}, obj2: {} };
  ids.forEach((teamId, ti) => {
    out.obj1[teamId] = OBJ_PICK_TEMPLATE.obj1.map((row, i) => {
      const v = parseFloat(row.val);
      const delta = (ti % 5) * 0.4 + i * 0.12;
      return { ...row, val: Number.isFinite(v) ? (v + delta).toFixed(1) : row.val };
    });
    out.obj2[teamId] = OBJ_PICK_TEMPLATE.obj2.map((row, i) => {
      const v = parseFloat(row.val);
      const delta = (ti % 5) * 0.35 + i * 0.15;
      return { ...row, val: Number.isFinite(v) ? (v + delta).toFixed(1) : row.val };
    });
  });
  return out;
}

function getObjectivePickerData() {
  if (!_objectivePickerData) _objectivePickerData = buildObjectivePickerData();
  return _objectivePickerData;
}

const OBJ_PICK_FIELDS = {
  obj1: { wname: 'obj1Wname', period: 'obj1Period', val: 'obj1Val', chgWrap: 'obj1ChgWrap', chgTxt: 'obj1ChgTxt', meta1: 'obj1Meta1', meta2: 'obj1Meta2', status: 'obj1Status', whdrTeam: 'obj1WhdrTeam' },
  obj2: { wname: 'obj2Wname', period: 'obj2Period', val: 'obj2Val', chgWrap: 'obj2ChgWrap', chgTxt: 'obj2ChgTxt', meta1: 'obj2Meta1', meta2: 'obj2Meta2', status: 'obj2Status', whdrTeam: 'obj2WhdrTeam' },
};

function applyObjectivePick(widgetKey, teamId, itemIdx, doFlash) {
  const data = getObjectivePickerData()[widgetKey];
  const item = data[teamId]?.[itemIdx];
  if (!item) return;
  const ids = OBJ_PICK_FIELDS[widgetKey];
  document.getElementById(ids.wname).textContent = item.title;
  document.getElementById(ids.period).textContent = item.period;
  document.getElementById(ids.val).textContent = item.val;
  document.getElementById(ids.chgTxt).textContent = item.chg;
  const chg = document.getElementById(ids.chgWrap);
  chg.classList.toggle('up', item.chgUp);
  chg.classList.toggle('dn', !item.chgUp);
  document.getElementById(ids.meta1).textContent = item.meta1;
  document.getElementById(ids.meta2).textContent = item.meta2;
  const st = document.getElementById(ids.status);
  st.textContent = item.onTrack ? 'ON TRACK' : 'OFF TRACK';
  st.classList.remove('on-track', 'off-track');
  st.classList.add(item.onTrack ? 'on-track' : 'off-track');
  const whdrBadge = document.getElementById(ids.whdrTeam);
  if (whdrBadge) whdrBadge.textContent = TEAMS[teamId]?.name || teamId;
  if (doFlash) {
    const card = document.getElementById(widgetKey);
    if (card) {
      card.classList.remove('flash');
      void card.offsetWidth;
      card.classList.add('flash');
    }
  }
}

function showTeamStep(widgetKey) {
  const teams = document.getElementById(`${widgetKey}StepTeams`);
  const objs = document.getElementById(`${widgetKey}StepObjs`);
  if (teams) teams.hidden = false;
  if (objs) objs.hidden = true;
}

function renderTeamList(widgetKey) {
  const list = document.getElementById(`${widgetKey}TeamList`);
  if (!list) return;
  list.innerHTML = '';
  getPickerTeamIds().forEach(tid => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'obj-pick-item';
    b.setAttribute('role', 'option');
    b.textContent = TEAMS[tid]?.name || tid;
    b.dataset.teamId = tid;
    b.addEventListener('click', e => {
      e.stopPropagation();
      openObjectiveStep(widgetKey, tid);
    });
    list.appendChild(b);
  });
}

function fillObjectiveListEl(listEl, widgetKey, teamId) {
  listEl.innerHTML = '';
  const items = getObjectivePickerData()[widgetKey][teamId] || [];
  items.forEach((it, oi) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'obj-pick-item obj-pick-item--obj';
    b.setAttribute('role', 'option');
    b.textContent = it.title;
    b.addEventListener('click', e => {
      e.stopPropagation();
      applyObjectivePick(widgetKey, teamId, oi, true);
      closeAllObjPickPops();
    });
    listEl.appendChild(b);
  });
}

function openObjectiveStep(widgetKey, teamId) {
  const teams = document.getElementById(`${widgetKey}StepTeams`);
  const objs = document.getElementById(`${widgetKey}StepObjs`);
  const hdr = document.getElementById(`${widgetKey}PickObjHdr`);
  const list = document.getElementById(`${widgetKey}ObjList`);
  if (!teams || !objs || !hdr || !list) return;
  teams.hidden = true;
  objs.hidden = false;
  hdr.textContent = TEAMS[teamId]?.name || teamId;
  fillObjectiveListEl(list, widgetKey, teamId);
  const btn = document.getElementById(`${widgetKey}PickBtn`);
  const pop = document.getElementById(`${widgetKey}PickPop`);
  if (btn && pop && !pop.hidden) positionObjPickPop(btn, pop);
}

function positionObjPickPop(btn, pop) {
  const r = btn.getBoundingClientRect();
  const w = Math.min(320, window.innerWidth - 24);
  let left = r.right - w;
  if (left < 12) left = 12;
  if (left + w > window.innerWidth - 12) left = window.innerWidth - 12 - w;
  pop.style.width = `${w}px`;
  pop.style.top = `${r.bottom + 6}px`;
  pop.style.left = `${left}px`;
}

function closeAllObjPickPops() {
  ['obj1', 'obj2'].forEach(widgetKey => {
    const btn = document.getElementById(`${widgetKey}PickBtn`);
    const pop = document.getElementById(`${widgetKey}PickPop`);
    if (pop) pop.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
    showTeamStep(widgetKey);
  });
  [['obj1BcdBtn', 'obj1BcdPop'], ['obj2BcdBtn', 'obj2BcdPop']].forEach(([bid, pid]) => {
    const btn = document.getElementById(bid);
    const pop = document.getElementById(pid);
    if (pop) pop.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

function initObjectivePickers() {
  _objectivePickerData = null;
  (['obj1', 'obj2']).forEach(widgetKey => {
    const btn = document.getElementById(`${widgetKey}PickBtn`);
    const pop = document.getElementById(`${widgetKey}PickPop`);
    const back = document.getElementById(`${widgetKey}PickBack`);
    if (!btn || !pop) return;

    const firstTeam = getPickerTeamIds()[0] || 'emea';
    applyObjectivePick(widgetKey, firstTeam, 0, false);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = pop.hidden;
      closeAllObjPickPops();
      if (willOpen) {
        showTeamStep(widgetKey);
        renderTeamList(widgetKey);
        pop.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        positionObjPickPop(btn, pop);
      }
    });

    if (back) {
      back.addEventListener('click', e => {
        e.stopPropagation();
        showTeamStep(widgetKey);
        renderTeamList(widgetKey);
        positionObjPickPop(document.getElementById(`${widgetKey}PickBtn`), document.getElementById(`${widgetKey}PickPop`));
      });
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.obj-pick-wrap')) closeAllObjPickPops();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllObjPickPops();
  });

  window.addEventListener('resize', () => {
    [['obj1PickBtn', 'obj1PickPop'], ['obj2PickBtn', 'obj2PickPop'], ['obj1BcdBtn', 'obj1BcdPop'], ['obj2BcdBtn', 'obj2BcdPop']].forEach(([bid, pid]) => {
      const btn = document.getElementById(bid);
      const pop = document.getElementById(pid);
      if (btn && pop && !pop.hidden) positionObjPickPop(btn, pop);
    });
  });
}

function initBcdObjectivePickers() {
  (['obj1', 'obj2']).forEach(widgetKey => {
    const btn = document.getElementById(`${widgetKey}BcdBtn`);
    const pop = document.getElementById(`${widgetKey}BcdPop`);
    const hdr = document.getElementById(`${widgetKey}BcdHdr`);
    const list = document.getElementById(`${widgetKey}BcdObjList`);
    if (!btn || !pop || !hdr || !list) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = pop.hidden;
      closeAllObjPickPops();
      if (willOpen) {
        const teamId = getObjectiveContextTeamId();
        hdr.textContent = TEAMS[teamId]?.name || teamId;
        fillObjectiveListEl(list, widgetKey, teamId);
        pop.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        positionObjPickPop(btn, pop);
      }
    });
  });
}

syncSectionSelectOptions();
// Init — Variant A by default, but KPI footers always show
setV('A');
['kf1','kf2','kf3','kf4'].forEach(id=>document.getElementById(id).classList.add('show'));
applyTeam(activeTeam);
initObjectivePickers();
initBcdObjectivePickers();

function toggleSide() {
  const side = document.querySelector('.side');
  side.classList.toggle('collapsed');
}
