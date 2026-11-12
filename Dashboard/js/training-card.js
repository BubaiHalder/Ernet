/* Isolated overview training card. All training records below are illustrative. */
(() => {
  'use strict';
  const legacy = document.getElementById('summaryActivity');
  const card = legacy?.closest('button');
  if (!card) return;
  // Retain the existing metric target for older dashboard renderers without displaying it.
  if (legacy) {
    legacy.hidden = true;
    legacy.style.setProperty('display', 'none', 'important');
    legacy.textContent = '';
  }
  card.classList.add('training-modern-card');
  const statLabel = card.querySelector('.stat-label');
  if (statLabel) {
    statLabel.innerHTML = 'Training<i class="bi bi-mortarboard" aria-hidden="true"></i>';
  }
  card.querySelector('small')?.remove();
  let metrics = card.querySelector('.training-card-counts');
  if (!metrics) {
    metrics = document.createElement('div');
    metrics.className = 'training-card-counts';
    card.appendChild(metrics);
  }
  card.setAttribute('aria-label', 'Open training details');
  const style = document.createElement('style');
  style.textContent = `
    .training-card-counts{display:flex;flex-direction:column;justify-content:space-between;margin:0!important;flex:1}
    .training-card-counts>strong{margin:2px 0 2px!important;white-space:nowrap;display:flex!important;align-items:baseline!important;gap:4px!important;font-size:22px!important;font-weight:700!important;letter-spacing:-.03em!important;line-height:1.15!important;color:var(--ink)!important}
    .training-card-counts>strong span{font-size:11px!important;font-weight:500!important;color:var(--muted)!important;letter-spacing:normal!important;vertical-align:baseline!important}
    .training-card-secondary{display:flex!important;align-items:center!important;gap:6px!important;margin-top:2px!important;font-size:9.5px!important;color:var(--muted)!important;line-height:1.25!important;white-space:nowrap!important}
    .training-card-secondary span{display:inline-flex!important;align-items:baseline!important;gap:3px!important;font-size:9.5px!important}
    .training-card-secondary b{display:inline!important;font-size:11px!important;font-weight:700!important;color:var(--ink)!important}
    .training-card-secondary .training-dot{display:inline!important;opacity:.4!important;font-size:8px!important}
    #trainingCardDialog:not([open]){display:none}
    #trainingCardDialog .training-charts{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    #trainingCardDialog .training-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
    #trainingCardDialog .training-toolbar input{max-width:330px}
    @media(max-width:650px){#trainingCardDialog .training-charts{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
  const dialog = document.createElement('dialog');
  dialog.id = 'trainingCardDialog';
  dialog.className = 'dashboard-detail-popup';
  dialog.setAttribute('aria-labelledby','trainingCardTitle');
  dialog.innerHTML = `<header class="dashboard-detail-header"><div><h2 id="trainingCardTitle">Training</h2><p id="trainingCardScope"></p></div><div class="detail-header-actions"><button type="button" class="heading-action" data-export="excel">Excel</button><button type="button" class="heading-action" data-export="pdf">PDF</button><button type="button" class="heading-action" data-close>Back to overview</button></div></header><div class="dashboard-detail-body"><p class="dashboard-detail-note">Illustrative training cohorts. Counts represent participants in the selected period.</p><div class="training-toolbar"><input id="trainingCardSearch" class="form-control" type="search" aria-label="Search training records" placeholder="Search school, state, district or UDISE"></div><div id="trainingCardResults"></div></div>`;
  document.body.appendChild(dialog);
  let records = [];
  function buildRecords() {
    const from=DOM.fDate.value,to=DOM.tDate.value;
    if(!from||!to||from>to)return [];
    const months=[];
    for(let date=new Date(from.slice(0,7)+'-01T00:00:00Z');date.toISOString().slice(0,10)<=to;date.setUTCMonth(date.getUTCMonth()+1))months.push(date.toISOString().slice(0,7));
    return nationalScope().flatMap(s=>months.flatMap(month=>{
      const seed=Math.abs(hashStr('training|'+s.id+'|'+month));
      const date=month+'-'+String(1+seed%28).padStart(2,'0');
      return date<from||date>to?[]:[{id:s.id,school:s.name,state:s.state,district:s.district,udise:s.udise,date,teachers:3+seed%13,students:30+seed%151}];
    }));
  }
  function totals(rows){return {schools:new Set(rows.map(r=>r.id)).size,teachers:rows.reduce((n,r)=>n+r.teachers,0),students:rows.reduce((n,r)=>n+r.students,0)};}
  const fmt=n=>n.toLocaleString('en-IN');
  function chart(rows,field,title){
    const groups=new Map();rows.forEach(r=>groups.set(r.state,(groups.get(r.state)||0)+r[field]));
    const bars=[...groups].sort((a,b)=>b[1]-a[1]),max=Math.max(1,...bars.map(r=>r[1]));
    return '<section class="detail-chart-panel"><h3>'+title+'</h3><p>By state · selected results</p><div class="detail-bar-list">'+(bars.map(([name,value])=>'<div class="detail-bar-row"><span class="detail-bar-label" title="'+escapeHtml(name)+'">'+escapeHtml(name)+'</span><span class="detail-bar-track"><span style="width:'+value/max*100+'%"></span></span><span class="detail-bar-value">'+fmt(value)+'</span></div>').join('')||'<p>No training records in this period.</p>')+'</div></section>';
  }
  function renderPopup(){
    const query=document.getElementById('trainingCardSearch').value.trim().toLowerCase();
    const rows=records.filter(r=>[r.school,r.state,r.district,r.udise].some(v=>String(v).toLowerCase().includes(query)));
    const t=totals(rows);
    document.getElementById('trainingCardScope').textContent=DOM.fDate.value+' to '+DOM.tDate.value+' · '+getSelectedStateLabel();
    document.getElementById('trainingCardResults').innerHTML='<div class="detail-visual-kpis">'+[['Schools trained',t.teachers],['Teachers trained',t.schools],['Students trained',t.students]].map(([label,n])=>'<div class="detail-visual-kpi"><span>'+label+'</span><strong>'+fmt(n)+'</strong></div>').join('')+'</div><div class="training-charts">'+chart(rows,'teachers','Schools trained')+chart(rows,'students','Students trained')+'</div><div class="dashboard-detail-table"><table id="trainingCardTable" class="data-table w-100"><thead><tr>'+['School','State','District','UDISE','Training date','Teachers trained','Students trained'].map(v=>'<th>'+v+'</th>').join('')+'</tr></thead><tbody>'+(rows.map(r=>'<tr>'+[r.school,r.state,r.district,r.udise,r.date,r.teachers,r.students].map(v=>'<td>'+escapeHtml(v)+'</td>').join('')+'</tr>').join('')||'<tr><td colspan="7">No matching training records. Choose a wider date range on the main bar.</td></tr>')+'</tbody></table></div>';
  }
  function update(){
    records=buildRecords();const t=totals(records);
    const sEl=document.getElementById('trainingCardSchoolCount');
    const tEl=document.getElementById('trainingCardTeacherCount');
    const stEl=document.getElementById('trainingCardStudentCount');
    if(sEl&&tEl&&stEl){
      sEl.textContent=fmt(t.teachers);
      tEl.textContent=fmt(t.schools);
      stEl.textContent=fmt(t.students);
    }else{
      metrics.innerHTML='<div class="training-hero-row"><span class="training-hero-num" id="trainingCardSchoolCount">'+fmt(t.teachers)+'</span> <span class="training-hero-label">Schools</span></div><div class="training-capsules"><span class="training-chip"><i class="bi bi-person-video3"></i><b id="trainingCardTeacherCount">'+fmt(t.schools)+'</b> Teachers</span><span class="training-chip"><i class="bi bi-people-fill"></i><b id="trainingCardStudentCount">'+fmt(t.students)+'</b> Students</span></div>';
    }
    if(dialog.open)renderPopup();
  }
  card.onclick=()=>window.openDashboardDetail('training');
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>card.focus());
  dialog.querySelectorAll('[data-export]').forEach(button=>button.onclick=()=>exportTableReport('trainingCardTable',button.dataset.export,'Teacher and student training'));
  document.getElementById('trainingCardSearch').addEventListener('input',renderPopup);
  const previousRender=render;
  render=function(){previousRender();update();};
  update();
})();
