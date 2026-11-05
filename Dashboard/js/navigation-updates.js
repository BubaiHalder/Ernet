/* Navigation history and summary-card detail popups for the dashboard demo. */
'use strict';
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .navigation-history-controls{position:fixed;right:18px;bottom:18px;z-index:1040;display:flex;align-items:center;gap:5px;margin-left:auto;padding:5px;border:1px solid var(--line);border-radius:11px;background:var(--surface);box-shadow:0 8px 28px #1018282b}
    .navigation-history-controls button,.detail-history-controls button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);font-size:11px;font-weight:600}
    .navigation-history-controls button:hover:not(:disabled),.detail-history-controls button:hover:not(:disabled){border-color:var(--cyan);color:var(--cyan)}
    .navigation-history-controls button:disabled,.detail-history-controls button:disabled{opacity:.42;cursor:not-allowed}
    .dashboard-detail-popup{width:min(1120px,95vw);max-width:1120px;max-height:92vh;padding:0;border:1px solid var(--line);border-radius:16px;background:var(--surface);color:var(--ink);box-shadow:0 30px 100px #10182855;overflow:auto}
    .dashboard-detail-popup::backdrop{background:#13233a99;backdrop-filter:blur(4px)}
    .dashboard-detail-header{position:sticky;top:0;z-index:3;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;background:var(--surface);border-bottom:1px solid var(--line)}
    .dashboard-detail-header h2{margin:0;font-size:19px;letter-spacing:-.03em}.dashboard-detail-header p{margin:4px 0 0;color:var(--muted);font-size:11px}
    .detail-header-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}
    .detail-header-actions .heading-action{padding:7px 9px;font-size:10px}
    .detail-history-controls{display:flex;gap:5px}
    .detail-date-range{display:flex;align-items:center;gap:6px;padding:5px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface-sub)}
    .detail-date-range label{display:flex;align-items:center;gap:4px;color:var(--muted);font-size:10px}
    .detail-date-range input{width:123px;min-height:28px;padding:3px 5px;border:1px solid var(--line);border-radius:5px;background:var(--surface);color:var(--ink);font:inherit;font-size:10px}
    .dashboard-detail-body{padding:18px 22px 22px}.dashboard-detail-note{color:var(--muted);font-size:11px;margin:0 0 12px}
    .dashboard-detail-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}
    .dashboard-detail-toolbar input{width:min(360px,100%)}.dashboard-detail-count{font-size:11px;color:var(--muted);margin:0}
    .detail-visual-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0}
    .detail-visual-kpi{padding:12px 14px;border:1px solid var(--line);border-radius:11px;background:linear-gradient(145deg,var(--surface),var(--surface-sub))}
    .detail-visual-kpi span{display:block;color:var(--muted);font-size:10px}.detail-visual-kpi strong{display:block;margin-top:5px;font-size:21px;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
    .detail-chart-panel{padding:14px 16px;margin:10px 0 16px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
    .detail-chart-panel h3{margin:0;font-size:13px;font-weight:650}.detail-chart-panel>p{margin:3px 0 12px;color:var(--muted);font-size:10px}
    .detail-bar-list{display:grid;gap:9px}.detail-bar-row{display:grid;grid-template-columns:minmax(120px,1.15fr) minmax(100px,2fr) 58px;align-items:center;gap:10px;font-size:10px}
    .detail-bar-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink)}.detail-bar-track{height:9px;overflow:hidden;border-radius:99px;background:var(--surface-sub)}.detail-bar-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--cyan),#60c7d4)}
    .detail-bar-value{text-align:right;color:var(--muted);font-variant-numeric:tabular-nums;font-weight:600}
    .state-school-bar{display:inline-grid;grid-template-columns:auto 58px;align-items:center;justify-content:start;gap:8px;min-width:0}.state-school-bar .detail-bar-track{display:block;width:58px;height:8px}.state-school-bar .detail-bar-track>span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--cyan),#60c7d4)}
    .state-sort{border:0;background:transparent;color:inherit;font:inherit;font-weight:650;text-transform:inherit;padding:4px 2px;cursor:pointer}.state-sort:hover{color:var(--cyan)}.state-drill-toolbar{display:flex;align-items:center;gap:10px;margin:0 0 10px}.state-drill-back{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;padding:7px 11px;font-size:12px}.state-drill-path{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:12px}.state-breadcrumb{border:0;background:transparent;color:inherit;padding:0;font:inherit;cursor:pointer}.state-breadcrumb:hover{color:var(--cyan);text-decoration:underline}.state-breadcrumb-separator{color:var(--muted);font-weight:700;opacity:1}.state-drill-row{cursor:pointer}.state-drill-row:hover{background:var(--surface-sub)}
    .school-pagination{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap;padding:12px 2px;color:var(--muted);font-size:12px}.school-pagination label{display:flex;align-items:center;gap:6px}.school-pagination select,.school-pagination button{border:1px solid var(--line);border-radius:7px;background:var(--surface);color:var(--ink);padding:6px 9px;font:inherit}.school-pagination button:disabled{opacity:.45;cursor:not-allowed}
    #schoolUsageCharts{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:14px;width:100%;margin-top:18px}#schoolUsageCharts>.detail-chart-panel{min-width:0;margin:0}@media(max-width:767px){#schoolUsageCharts{grid-template-columns:1fr}}
    .detail-scroll-top{position:sticky;display:block;margin:10px 12px 12px auto;bottom:12px;z-index:4;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--ink);box-shadow:0 4px 16px #10182822;padding:8px 13px;font-size:12px;font-weight:600}.detail-scroll-top:hover{border-color:var(--cyan);color:var(--cyan)}
    #stateDetailCharts{margin-top:20px}#stateDetailCharts .state-utilization-heading{margin:22px 0 4px;font-size:16px}#stateDetailCharts .state-ranking-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}#stateDetailCharts .state-ranking-grid .detail-bar-row{grid-template-columns:minmax(100px,1.2fr) minmax(50px,1fr) 65px}#stateDetailCharts .state-ranking-grid .detail-chart-panel{margin-bottom:0}@media(max-width:767px){#stateDetailCharts .state-ranking-grid{grid-template-columns:1fr}}
    .dashboard-detail-table{max-height:56vh;overflow:auto!important;border:1px solid var(--line);border-radius:10px}
    .dashboard-detail-table table{min-width:680px;margin:0}.dashboard-detail-table thead th{position:sticky;top:0;z-index:1;background:var(--surface-sub)}
    .dashboard-detail-table tbody tr:hover{background:var(--surface-sub)}
    .detail-popup-close{width:36px;height:36px;padding:0;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--muted)}
    .detail-popup-close:hover{color:var(--coral);border-color:var(--coral)}
    @media(max-width:767px){.navigation-history-controls button{width:38px;padding:6px}.navigation-history-controls button span{display:none}.dashboard-detail-header{padding:15px;flex-direction:column}.detail-header-actions{width:100%;justify-content:flex-start}.detail-date-range{width:100%;justify-content:space-between}.detail-date-range label{flex:1;justify-content:space-between}.detail-date-range input{width:min(140px,55vw)}.dashboard-detail-body{padding:14px}.dashboard-detail-table{max-height:58vh}.detail-bar-row{grid-template-columns:minmax(95px,1fr) minmax(70px,1.4fr) 45px;gap:7px}}
    @media(max-width:420px){.detail-visual-kpis{grid-template-columns:1fr}.detail-visual-kpi{padding:9px 12px}.detail-visual-kpi strong{font-size:18px}}
  `;
  document.head.appendChild(style);

  const heading = document.querySelector('.workspace-heading');
  const reportsButton = heading?.querySelector('button');
  const historyControls = document.createElement('div');
  historyControls.className = 'navigation-history-controls';
  historyControls.innerHTML = '<button id="dashboardBackButton" type="button" aria-label="Go back" title="Go back" disabled><i class="bi bi-arrow-left" aria-hidden="true"></i><span>Back</span></button><button id="dashboardForwardButton" type="button" aria-label="Go forward" title="Go forward" disabled><span>Forward</span><i class="bi bi-arrow-right" aria-hidden="true"></i></button>';
  if (heading) heading.insertBefore(historyControls, reportsButton || null);

  const detailDialog = document.createElement('dialog');
  detailDialog.id = 'dashboardDetailDialog';
  detailDialog.className = 'dashboard-detail-popup';
  detailDialog.innerHTML = `<header class="dashboard-detail-header"><div><h2 id="dashboardDetailTitle"></h2><p id="dashboardDetailSubtitle"></p></div><div class="detail-header-actions"><div class="detail-history-controls"><button id="detailBackButton" type="button" aria-label="Go back" title="Go back"><i class="bi bi-arrow-left" aria-hidden="true"></i></button><button id="detailForwardButton" type="button" aria-label="Go forward" title="Go forward"><i class="bi bi-arrow-right" aria-hidden="true"></i></button></div><div class="detail-date-range"><label for="detailFromDate">From<input id="detailFromDate" type="date"></label><label for="detailToDate">To<input id="detailToDate" type="date"></label></div><button type="button" class="heading-action" onclick="exportDashboardDetail('excel')"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel</button><button type="button" class="heading-action" onclick="exportDashboardDetail('pdf')"><i class="bi bi-file-earmark-pdf me-1"></i>PDF</button><button type="button" class="detail-popup-close" aria-label="Close details" title="Close details"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div></header><div id="dashboardDetailBody" class="dashboard-detail-body"></div>`;
  document.body.appendChild(detailDialog);
  const scrollTopButton=document.createElement('button');scrollTopButton.type='button';scrollTopButton.className='detail-scroll-top';scrollTopButton.textContent='↑ Back to top';scrollTopButton.setAttribute('aria-label','Scroll popup to top');scrollTopButton.addEventListener('click',()=>detailDialog.scrollTo({top:0,behavior:'smooth'}));detailDialog.appendChild(scrollTopButton);

  const ticketExplorer = document.querySelector('.ticket-explorer');
  const ticketHome = ticketExplorer?.parentNode;
  const ticketMarker = ticketExplorer ? document.createComment('Ticket explorer home') : null;
  if (ticketExplorer && ticketHome) ticketHome.insertBefore(ticketMarker, ticketExplorer);

  const initialView = typeof currentView === 'string' ? currentView : 'view-overview';
  const routes = [{ type: 'view', id: initialView }];
  let routeIndex = 0;
  let activeDetail = null;
  let applyingRoute = false;
  const originalSwitchTab = switchTab;

  function updateHistoryButtons() {
    const backDisabled = routeIndex <= 0;
    const forwardDisabled = routeIndex >= routes.length - 1;
    ['dashboardBackButton','detailBackButton'].forEach(id => { const button=document.getElementById(id); if(button)button.disabled=backDisabled; });
    ['dashboardForwardButton','detailForwardButton'].forEach(id => { const button=document.getElementById(id); if(button)button.disabled=forwardDisabled; });
  }
  function sameRoute(a,b){return Boolean(a&&b&&a.type===b.type&&(a.type==='view'?a.id===b.id:a.key===b.key));}
  function pushRoute(route){
    if (sameRoute(routes[routeIndex], route)) return;
    routes.splice(routeIndex + 1);
    routes.push(route);
    routeIndex = routes.length - 1;
    updateHistoryButtons();
  }
  function restoreTicketExplorer(){
    if (ticketExplorer && ticketMarker?.parentNode && ticketExplorer.parentNode !== ticketMarker.parentNode) ticketMarker.parentNode.insertBefore(ticketExplorer, ticketMarker.nextSibling);
  }
  function closeDetailPopup(){
    if (detailDialog.open) detailDialog.close();
    restoreTicketExplorer();
    activeDetail = null;
  }
  function setDetailDates(){
    if (typeof DOM === 'undefined') return;
    document.getElementById('detailFromDate').value = DOM.fDate.value;
    document.getElementById('detailToDate').value = DOM.tDate.value;
  }
  function applyDetailDates(){
    const from=document.getElementById('detailFromDate').value,to=document.getElementById('detailToDate').value;
    if(!from||!to||from>to){showPrototypeMessage('Choose a valid From and To date.');setDetailDates();return;}
    DOM.fDate.value=from;DOM.tDate.value=to;
    const barFrom=document.getElementById('compactFromDate'),barTo=document.getElementById('compactToDate');
    if(barFrom)barFrom.value=from;if(barTo)barTo.value=to;
    render();
  }
  document.getElementById('detailFromDate').addEventListener('change',applyDetailDates);
  document.getElementById('detailToDate').addEventListener('change',applyDetailDates);

  const columnSets = {
    states: {title:'State overview', subtitle:'School and device totals for the selected scope.', columns:['State','Schools','Teaching devices','Active devices','Devices usage %','Avg. daily usage / device','Open tickets']},
    schools: {title:'Schools in this view', subtitle:'School level metrics for the selected geography and date range.', columns:['School','State','District','UDISE','Teaching devices','Active devices','Avg. usage / device (h)','Open tickets']},
    training: {title:'Teachers trained', subtitle:'Illustrative training records for the selected geography and date range.', columns:['School','State','District','UDISE','Training date','Teachers trained','Students trained']},
    devices: {title:'Teaching devices', subtitle:'Device inventory and status for the selected schools.', columns:['Device serial','School','State','Status','Usage hours','Open tickets']},
    activity: {title:'Device activity', subtitle:'Sample activity metrics for devices in the selected scope and date range.', columns:['Device serial','School','State','Activity','Usage hours','Sessions']},
  };
  let stateDrill={level:0,state:null,district:null,block:null,school:null},tableSort={column:-1,direction:1};
  let schoolPage=1,schoolPageSize=10;
  function getDetailRows(key){
    const schools=typeof nationalScope==='function'?nationalScope():[];
    const dayCount=Math.max(1,nationalDateKeys().length);
    const used=d=>nationalDailyData(d).some(day=>day.minutes>0);
    const hours=d=>nationalDailyData(d).reduce((total,day)=>total+day.minutes,0)/60;
    if(key==='states'){
      const levels=['state','district','block','school','device'],level=levels[stateDrill.level];
      if(stateDrill.level>0){
        const scoped=schools.filter(s=>(!stateDrill.state||s.state===stateDrill.state)&&(!stateDrill.district||s.district===stateDrill.district)&&(!stateDrill.block||s.block===stateDrill.block)&&(!stateDrill.school||s.id===stateDrill.school));
        const groups=new Map();
        scoped.forEach(s=>{const key=level==='district'?s.district:level==='block'?s.block:level==='school'?s.id:s.id;const label=level==='school'?s.name:level==='device'?s.id:key;if(!groups.has(key))groups.set(key,{label,schools:[],devices:[]});const g=groups.get(key);g.schools.push(s);if(level==='device')g.devices.push(...s.rec.devices);});
        const entities=[...groups.values()];
        return entities.flatMap(g=>{const ds=level==='device'?g.schools.flatMap(s=>s.rec.devices.filter(d=>d.serial===g.label)):g.schools.flatMap(s=>s.rec.devices);if(level==='device'&&!ds.length)return [];const count=level==='school'?1:g.schools.length,active=ds.filter(used).length,days=ds.reduce((n,d)=>n+nationalDailyData(d).length,0),h=ds.reduce((n,d)=>n+hours(d),0);return [[g.label,count,ds.length,active,(ds.length?Math.round(active/ds.length*100):0)+'%',(days?h/days:0).toFixed(1)+' h',ds.reduce((n,d)=>n+(d.openTickets||0),0)]];});
      }
      const grouped=new Map();
      schools.forEach(s=>{const row=grouped.get(s.state)||{state:s.state,schools:0,devices:0,active:0,open:0,hours:0,days:0};row.schools++;row.devices+=s.rec.devices.length;row.active+=s.rec.devices.filter(used).length;s.rec.devices.forEach(d=>nationalDailyData(d).forEach(day=>{row.hours+=day.minutes/60;row.days++;}));row.open+=s.rec.devices.reduce((sum,d)=>sum+d.openTickets,0);grouped.set(s.state,row);});
      return [...grouped.values()].sort((a,b)=>a.state.localeCompare(b.state)).map(r=>[r.state,r.schools,r.devices,r.active,(r.devices?Math.round(r.active/r.devices*100):0)+'%',r.days?(r.hours/r.days).toFixed(1)+' h': '0.0 h',r.open]);
    }
    if(key==='training'){
      const from=DOM.fDate.value,to=DOM.tDate.value;
      if(!from||!to||from>to)return [];
      const months=[];
      for(let date=new Date(from.slice(0,7)+'-01T00:00:00Z');date.toISOString().slice(0,10)<=to;date.setUTCMonth(date.getUTCMonth()+1))months.push(date.toISOString().slice(0,7));
      return schools.flatMap(s=>months.flatMap(month=>{
        const seed=Math.abs(hashStr('training|'+s.id+'|'+month));
        const date=month+'-'+String(1+seed%28).padStart(2,'0');
        return date<from||date>to?[]:[[s.name,s.state,s.district,s.udise,date,3+seed%13,30+seed%151]];
      }));
    }
    if(key==='schools')return schools.map(s=>[s.name,s.state,s.district,s.udise,s.rec.devices.length,s.rec.devices.filter(used).length,(s.rec.devices.reduce((sum,d)=>sum+hours(d),0)/Math.max(1,s.rec.devices.length)/dayCount).toFixed(1),s.rec.devices.reduce((sum,d)=>sum+d.openTickets,0)]);
    return schools.flatMap(s=>s.rec.devices.map(d=>key==='devices'?[d.serial,s.name,s.state,used(d)?'Active':'Inactive',hours(d).toFixed(1),d.openTickets||0]:[d.serial,s.name,s.state,used(d)?'Active':'No usage in period',hours(d).toFixed(1),nationalDailyData(d).reduce((sum,day)=>sum+day.sessions,0)]));
  }
  function renderDetailTable(){
    if(!activeDetail||activeDetail==='tickets')return;
    const baseConfig=columnSets[activeDetail];if(!baseConfig)return;
    const drillNames=['State','District','Block','School'];
    const config=activeDetail==='states'&&stateDrill.level>0?{...baseConfig,title:drillNames[stateDrill.level]+' overview',columns:[drillNames[stateDrill.level],...baseConfig.columns.slice(1).filter((_,index)=>!(stateDrill.level===3&&index===0))]}:baseConfig;
    const content=document.getElementById('dashboardDetailBody');
    const previousSearch=document.getElementById('dashboardDetailSearch');
    const keepSearchFocus=document.activeElement===previousSearch;
    const searchText=previousSearch?.value||'';
    const query=searchText.trim().toLowerCase();
    let rows=getDetailRows(activeDetail).filter(row=>!query||row.some(value=>String(value).toLowerCase().includes(query)));
    if(tableSort.column>=0)rows=rows.slice().sort((a,b)=>{const x=Number.parseFloat(a[tableSort.column])||0,y=Number.parseFloat(b[tableSort.column])||0;return (typeof a[tableSort.column]==='number'?x-y:String(a[tableSort.column]).localeCompare(String(b[tableSort.column]),undefined,{numeric:true}))*tableSort.direction;});
    if(activeDetail==='schools'||activeDetail==='devices'||activeDetail==='training')schoolPage=Math.min(schoolPage,Math.max(1,Math.ceil(rows.length/schoolPageSize)));
    document.getElementById('dashboardDetailTitle').textContent=config.title;
    document.getElementById('dashboardDetailSubtitle').textContent=config.subtitle;
    const maxSchools=activeDetail==='states'?Math.max(1,...rows.map(row=>Number(row[1]))):1;
    const renderCells=row=>row.map((value,index)=>{if(activeDetail==='states'&&stateDrill.level===3&&index===1)return '';return activeDetail==='states'&&stateDrill.level<3&&index===1?'<td><div class="state-school-bar"><span class="detail-bar-value">'+escapeHtml(value)+'</span><span class="detail-bar-track" role="img" aria-label="'+escapeHtml(value+' school records')+'"><span style="width:'+(Number(value)/maxSchools*100)+'%"></span></span></div></td>':'<td>'+escapeHtml(value)+'</td>';}).join('');
    const drillPath=[{label:'Selected states',level:0},{label:stateDrill.state,level:1},{label:stateDrill.district,level:2},{label:stateDrill.block,level:3}].filter(item=>item.label);
    const pageRows=activeDetail==='schools'||activeDetail==='devices'||activeDetail==='training'?rows.slice((schoolPage-1)*schoolPageSize,schoolPage*schoolPageSize):rows;
    content.innerHTML='<p class="dashboard-detail-note">Sample data · Current geography and date range are applied.</p><div id="dashboardDetailVisuals"></div>'+(activeDetail==='states'?'<div class="state-drill-toolbar">'+(stateDrill.level?'<button type="button" id="stateDrillBack" class="state-drill-back">← Back one level</button>':'')+'<nav class="state-drill-path" aria-label="Drill-down path">'+drillPath.map(item=>'<button type="button" class="state-breadcrumb" data-level="'+item.level+'">'+escapeHtml(item.label)+'</button>').join('<span class="state-breadcrumb-separator" aria-hidden="true">→</span>')+'</nav></div>':'')+'<div class="dashboard-detail-toolbar"><label class="visually-hidden" for="dashboardDetailSearch">Search table</label><input id="dashboardDetailSearch" class="form-control" type="search" placeholder="Search this table"><p class="dashboard-detail-count">'+rows.length.toLocaleString('en-IN')+' rows</p></div><div class="dashboard-detail-table"><table id="dashboardDetailTable" class="data-table w-100"><thead><tr>'+config.columns.map((c,i)=>'<th><button type="button" class="state-sort" data-sort="'+i+'">'+escapeHtml(c)+' ↕</button></th>').join('')+'</tr></thead><tbody>'+(rows.length?pageRows.map((row,i)=>'<tr class="state-drill-row">'+renderCells(row)+'</tr>').join(''):'<tr><td colspan="'+config.columns.length+'" class="text-center py-4 text-muted">No rows match this scope.</td></tr>')+'</tbody></table></div>'+(activeDetail==='schools'||activeDetail==='devices'||activeDetail==='training'?'<div class="school-pagination"><label>Rows per page <select id="schoolPageSize"><option>10</option><option>25</option><option>50</option></select></label><span id="schoolPageInfo"></span><button type="button" id="schoolPrevPage">Previous</button><button type="button" id="schoolNextPage">Next</button></div>':'');
    if(activeDetail==='states')content.insertAdjacentHTML('beforeend','<div id="stateDetailCharts"></div>');
    renderDetailVisuals(activeDetail,rows);
    if(activeDetail==='schools'||activeDetail==='devices'||activeDetail==='training'){const body=document.getElementById('dashboardDetailBody'),charts=document.getElementById(activeDetail==='schools'?'schoolUsageCharts':'deviceUsageCharts');if(charts)body.appendChild(charts);document.getElementById('schoolPageSize').value=String(schoolPageSize);document.getElementById('schoolPageInfo').textContent=rows.length?((schoolPage-1)*schoolPageSize+1)+'–'+Math.min(schoolPage*schoolPageSize,rows.length)+' of '+rows.length:'0 records';document.getElementById('schoolPrevPage').disabled=schoolPage<=1;document.getElementById('schoolNextPage').disabled=schoolPage*schoolPageSize>=rows.length;document.getElementById('schoolPageSize').onchange=e=>{schoolPageSize=Number(e.target.value);schoolPage=1;renderDetailTable();};document.getElementById('schoolPrevPage').onclick=()=>{schoolPage--;renderDetailTable();};document.getElementById('schoolNextPage').onclick=()=>{schoolPage++;renderDetailTable();};}
    const searchInput=document.getElementById('dashboardDetailSearch');
    document.getElementById('stateDrillBack')?.addEventListener('click',()=>{stateDrill.level--;if(stateDrill.level<0)stateDrill={level:0,state:null,district:null,block:null,school:null};else if(stateDrill.level===0)stateDrill={level:0,state:null,district:null,block:null,school:null};else if(stateDrill.level===1)stateDrill={...stateDrill,district:null,block:null,school:null};else if(stateDrill.level===2)stateDrill={...stateDrill,block:null,school:null};else stateDrill={...stateDrill,school:null};renderDetailTable();});
    document.querySelectorAll('.state-breadcrumb').forEach(button=>button.addEventListener('click',()=>{const level=Number(button.dataset.level);if(level===0)stateDrill={level:0,state:null,district:null,block:null,school:null};else if(level===1)stateDrill={level:1,state:stateDrill.state,district:null,block:null,school:null};else if(level===2)stateDrill={level:2,state:stateDrill.state,district:stateDrill.district,block:null,school:null};else stateDrill={level:3,...stateDrill};renderDetailTable();}));
    document.querySelectorAll('#dashboardDetailTable [data-sort]').forEach(button=>button.addEventListener('click',()=>{const column=Number(button.dataset.sort);tableSort={column,direction:tableSort.column===column?-tableSort.direction:1};renderDetailTable();}));
    if(activeDetail==='states')document.querySelectorAll('#dashboardDetailTable tbody tr').forEach((tr,index)=>tr.addEventListener('click',()=>{const row=rows[index],level=stateDrill.level;if(level===0)stateDrill={level:1,state:row[0],district:null,block:null,school:null};else if(level===1)stateDrill={...stateDrill,level:2,district:row[0]};else if(level===2)stateDrill={...stateDrill,level:3,block:row[0]};renderDetailTable();}));
    searchInput.value=searchText;
    searchInput.addEventListener('input',()=>{schoolPage=1;renderDetailTable();});
    if(keepSearchFocus){searchInput.focus();searchInput.setSelectionRange(searchText.length,searchText.length);}
  }
  function renderDetailVisuals(key,rows){
    const host=document.getElementById('dashboardDetailVisuals');if(!host)return;
    let kpis=[],title='',caption='',bars=[];
    if(key==='states'){
      const schools=rows.reduce((sum,row)=>sum+Number(row[1]),0),devices=rows.reduce((sum,row)=>sum+Number(row[2]),0);
      kpis=[['States',rows.length],['Schools',schools.toLocaleString('en-IN')],['Teaching Devices',devices.toLocaleString('en-IN')]];
      host.innerHTML='<div class="detail-visual-kpis">'+kpis.map(item=>'<div class="detail-visual-kpi"><span>'+escapeHtml(item[0])+'</span><strong>'+escapeHtml(item[1])+'</strong></div>').join('')+'</div>';
      renderStateCharts(rows);
      return;
    }else if(key==='schools'){
      const devices=rows.reduce((sum,row)=>sum+Number(row[4]),0),open=rows.reduce((sum,row)=>sum+Number(row[7]),0),average=rows.length?rows.reduce((sum,row)=>sum+Number(row[6]),0)/rows.length:0;
      kpis=[['Schools',rows.length.toLocaleString('en-IN')],['Teaching devices',devices.toLocaleString('en-IN')],['Avg. use / device',average.toFixed(1)+' h']];
      const ranked=rows.map(row=>({label:row[0],value:Number(row[6]),display:Number(row[6]).toFixed(1)+' h'})).filter(row=>row.value>0).sort((a,b)=>b.value-a.value);
      kpis=[['Schools',rows.length.toLocaleString('en-IN')],['Teaching devices',devices.toLocaleString('en-IN')],['Avg. use / device',average.toFixed(1)+' h']];
      const section=(label,caption,items)=>'<section class="detail-chart-panel"><h3>'+label+'</h3><p>'+caption+'</p><div class="detail-bar-list">'+items.map(item=>'<div class="detail-bar-row"><span class="detail-bar-label">'+escapeHtml(item.label)+'</span><span class="detail-bar-track"><span style="width:'+(item.value/Math.max(1,...ranked.map(x=>x.value))*100)+'%"></span></span><span class="detail-bar-value">'+item.display+'</span></div>').join('')+'</div></section>';
      host.innerHTML='<div class="detail-visual-kpis">'+kpis.map(item=>'<div class="detail-visual-kpi"><span>'+escapeHtml(item[0])+'</span><strong>'+escapeHtml(item[1])+'</strong></div>').join('')+'</div>'+(ranked.length>=10?'<div id="schoolUsageCharts" class="state-ranking-grid">'+section('Top 5 schools','Highest average daily usage per device',ranked.slice(0,5))+section('Bottom 5 schools','Lowest average daily usage per device',ranked.slice(-5).reverse())+'</div>':'');
      return;
    }else if(key==='training'){
      const teachers=rows.reduce((sum,row)=>sum+Number(row[5]),0),students=rows.reduce((sum,row)=>sum+Number(row[6]),0),schools=new Set(rows.map(row=>row[0])).size;
      kpis=[['Schools with training',schools.toLocaleString('en-IN')],['Teachers trained',teachers.toLocaleString('en-IN')],['Students trained',students.toLocaleString('en-IN')]];
      const groups=new Map();rows.forEach(row=>groups.set(row[1],(groups.get(row[1])||0)+Number(row[5])));
      bars=[...groups].map(([label,value])=>({label,value,display:value.toLocaleString('en-IN')})).sort((a,b)=>b.value-a.value);
      title='Teachers trained by state';caption='Illustrative training records in the selected period.';
    }else if(key==='devices'){
      const active=rows.filter(row=>row[3]==='Active').length,inactive=rows.length-active,open=rows.reduce((sum,row)=>sum+Number(row[5]),0);
      kpis=[['Devices',rows.length.toLocaleString('en-IN')],['Active',active.toLocaleString('en-IN')],['Open tickets',open.toLocaleString('en-IN')]];
      title='Device status';caption='Status breakdown for devices in the selected scope.';bars=[{label:'Active',value:active,display:active.toLocaleString('en-IN')},{label:'Inactive',value:inactive,display:inactive.toLocaleString('en-IN')}];
    }else{
      const active=rows.filter(row=>row[3]==='Active').length,usage=rows.reduce((sum,row)=>sum+Number(row[4]),0),sessions=rows.reduce((sum,row)=>sum+Number(row[5]),0);
      kpis=[['Devices',rows.length.toLocaleString('en-IN')],['Active now',active.toLocaleString('en-IN')],['Sample sessions',sessions.toLocaleString('en-IN')]];
      title='Highest sample usage by device';caption='Usage hours shown for the selected date range.';bars=rows.map(row=>({label:row[1]+' · '+row[0],value:Number(row[4]),display:Number(row[4]).toFixed(1)+' h'})).sort((a,b)=>b.value-a.value).slice(0,8);
    }
    const max=Math.max(1,...bars.map(bar=>bar.value));
    const barHtml=bars.length?bars.map(bar=>'<div class="detail-bar-row"><span class="detail-bar-label" title="'+escapeHtml(bar.label)+'">'+escapeHtml(bar.label)+'</span><span class="detail-bar-track" role="img" aria-label="'+escapeHtml(bar.label+': '+bar.display)+'"><span style="width:'+(bar.value/max*100)+'%"></span></span><span class="detail-bar-value">'+escapeHtml(bar.display)+'</span></div>').join(''):'<p class="dashboard-detail-note mb-0">No chart data for this selection.</p>';
    host.innerHTML='<div class="detail-visual-kpis">'+kpis.map(item=>'<div class="detail-visual-kpi"><span>'+escapeHtml(item[0])+'</span><strong>'+escapeHtml(item[1])+'</strong></div>').join('')+'</div><section '+(key==='devices'?'id="deviceUsageCharts" ':'')+'class="detail-chart-panel"><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(caption)+'</p><div class="detail-bar-list">'+barHtml+'</div></section>';
  }
  function renderStateCharts(rows){
    const host=document.getElementById('stateDetailCharts');if(!host)return;
    const fmt=value=>Number(value).toLocaleString('en-IN');
    const chart=(title,caption,items,column,max)=>'<section class="detail-chart-panel"><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(caption)+'</p><div class="detail-bar-list">'+(items.length?items.map(row=>{const numeric=column===5?(parseFloat(row[column])||0):Number(row[column]);const display=column===5?numeric.toFixed(1)+' h':fmt(numeric);return '<div class="detail-bar-row"><span class="detail-bar-label" title="'+escapeHtml(row[0])+'">'+escapeHtml(row[0])+'</span><span class="detail-bar-track" role="img" aria-label="'+escapeHtml(row[0]+': '+display+(column===5?' average daily hours per device':' schools'))+'"><span style="width:'+(numeric/max*100)+'%"></span></span><span class="detail-bar-value">'+escapeHtml(display)+'</span></div>';}).join(''):'<p class="dashboard-detail-note">No states match this selection.</p>')+'</div></section>';
    const schools=[...rows].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    const utilizationRows=rows.filter(row=>Number.isFinite(parseFloat(row[5]))&&parseFloat(row[5])>0);
    const top=[...utilizationRows].sort((a,b)=>(parseFloat(b[5])||0)-(parseFloat(a[5])||0)||a[0].localeCompare(b[0])).slice(0,5);
    const bottom=[...utilizationRows].sort((a,b)=>(parseFloat(a[5])||0)-(parseFloat(b[5])||0)||a[0].localeCompare(b[0])).slice(0,5);
    const maxUsage=Math.max(1,...utilizationRows.map(row=>parseFloat(row[5])||0));
    host.innerHTML=utilizationRows.length>=10?'<section aria-labelledby="stateUtilizationTitle"><h3 id="stateUtilizationTitle" class="state-utilization-heading">Device utilization by state</h3><p class="dashboard-detail-note">Ranked by average daily usage per device. Rankings appear when at least 10 records have usage data.</p><div class="state-ranking-grid">'+chart('Top 5 states','Highest average daily usage per device',top,5,maxUsage)+chart('Bottom 5 states','Lowest average daily usage per device',bottom,5,maxUsage)+'</div></section>':'';
  }
  function showDetail(key){
    if(activeDetail!==key){restoreTicketExplorer();document.getElementById('dashboardDetailBody').innerHTML='';}
    activeDetail=key;
    if(key==='tickets'){
      document.getElementById('dashboardDetailTitle').textContent='Support tickets';
      document.getElementById('dashboardDetailSubtitle').textContent='Search tickets in the selected geography and date range.';
      document.getElementById('dashboardDetailBody').innerHTML='';
      if(ticketExplorer)document.getElementById('dashboardDetailBody').appendChild(ticketExplorer);
    } else renderDetailTable();
    setDetailDates();
    if(!detailDialog.open)detailDialog.showModal();
    if(key==='tickets'&&typeof window.renderTicketExplorer==='function')window.renderTicketExplorer();
    updateHistoryButtons();
  }
  function applyRoute(route){
    applyingRoute=true;
    if(route.type==='detail')showDetail(route.key);
    else{closeDetailPopup();originalSwitchTab(route.id);}
    applyingRoute=false;
    updateHistoryButtons();
  }
  window.dashboardGoBack=function(){if(routeIndex<=0)return;routeIndex--;applyRoute(routes[routeIndex]);};
  window.dashboardGoForward=function(){if(routeIndex>=routes.length-1)return;routeIndex++;applyRoute(routes[routeIndex]);};
  window.openDashboardDetail=function(key){schoolPage=1;tableSort={column:-1,direction:1};pushRoute({type:'detail',key});applyRoute(routes[routeIndex]);};
  window.exportDashboardDetail=function(format){
    let tableId=activeDetail==='tickets'?'ticketExplorerTable':'dashboardDetailTable';
    const table=activeDetail==='tickets'?ticketExplorer?.querySelector('table'):document.getElementById('dashboardDetailTable');
    if(!table)return showPrototypeMessage('The selected table is unavailable.');
    if(activeDetail==='tickets'&&!table.id)table.id='ticketExplorerTable';
    if(activeDetail!=='tickets')tableId='dashboardDetailTable';
    exportTableReport(tableId,format,document.getElementById('dashboardDetailTitle').textContent);
  };
  window.switchTab=function(view){
    if(!applyingRoute){pushRoute({type:'view',id:view});if(detailDialog.open)closeDetailPopup();}
    const result=originalSwitchTab(view);updateHistoryButtons();return result;
  };
  document.getElementById('dashboardBackButton').addEventListener('click',window.dashboardGoBack);
  document.getElementById('dashboardForwardButton').addEventListener('click',window.dashboardGoForward);
  document.getElementById('detailBackButton').addEventListener('click',window.dashboardGoBack);
  document.getElementById('detailForwardButton').addEventListener('click',window.dashboardGoForward);
  detailDialog.querySelector('.detail-popup-close').addEventListener('click',window.dashboardGoBack);
  detailDialog.addEventListener('cancel',event=>{event.preventDefault();window.dashboardGoBack();});
  detailDialog.addEventListener('click',event=>{if(event.target===detailDialog)window.dashboardGoBack();});

  const cards={summaryStates:'states',summarySchools:'schools',summaryDevices:'devices',summaryActivity:'training',summaryTickets:'tickets'};
  Object.entries(cards).forEach(([id,key])=>{
    const value=document.getElementById(id);
    const card=value?.closest('button');
    if(card)card.onclick=()=>openDashboardDetail(key);
  });
  const originalRender=render;
  render=function(){originalRender();if(detailDialog.open){setDetailDates();if(activeDetail==='tickets'&&typeof window.renderTicketExplorer==='function')window.renderTicketExplorer();else renderDetailTable();}};
  updateHistoryButtons();
})();
