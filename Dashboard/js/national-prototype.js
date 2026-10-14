/* Workbook school geography with dummy device and usage data. No API calls. */
'use strict';
let coverageView='tabular';
const NATIONAL_TARGETS = {'Andhra Pradesh':196,'Arunachal Pradesh':11,'Assam':40,'Chhattisgarh':40,'Gujarat':3,'Haryana':14,'Jharkhand':46,'Karnataka':8,'Manipur':1,'Rajasthan':45,'Sikkim':1,'Telangana':165,'Uttar Pradesh':180};
const NATIONAL_STATES = [...new Set([...Object.keys(NATIONAL_TARGETS), ...window.KGBV_SCHOOLS.map(s=>s.state)])].sort();
let nationalSelectedStates = new Set(NATIONAL_STATES);
let nationalDraftStates = new Set(NATIONAL_STATES);
let nationalPath = {state:null,district:null,block:null,school:null,device:null};
let nationalPerformanceChoice=null;
let nationalPerformancePageNumber=1;
let nationalPerformanceRows=[];
const nationalRows = {};
let nationalDailyCacheKey='';
const nationalDailyCache=new Map();
const nationalBaseSchools = window.KGBV_SCHOOLS.map(school=>{
  const seed=Math.abs(hashStr(school.id));
  const devices=[1,2].map(index=>{
    const n=Math.abs(hashStr(school.id+'-'+index));
    return {serial:'DEMO-'+school.id.toUpperCase()+'-'+String(index).padStart(2,'0'),status:n%10<8?'Active':'Inactive',usageHours:Number((2+n%50/10).toFixed(1)),openTickets:index===1 && seed%3===0?1:0,resolvedTickets:index===1?seed%4:0,onTime:'09:00 AM',offTime:'03:00 PM',makeModel:'K-Yan teaching device',proc:'Quad-core',ramStorage:'8 GB / 64 GB',os:'Android',fw:'Demo 1.0',net:'Demo network',instDate:'Demo',war:'Demo'};
  });
  return {...school,district:coverageDistrictName(school.state,school.district),name:school.name,zone:school.block,rec:{state:school.state,zone:school.block,schoolId:school.id,udise:school.udise,ifpTotal:2,opsTotal:2,ifpActive:devices.filter(d=>d.status==='Active').length,opsActive:devices.filter(d=>d.status==='Active').length,cmpResolved:seed%4,cmpUnresolved:seed%3===0?1:0,baseHrs:devices.reduce((sum,d)=>sum+d.usageHours,0)/2,devices}};
});
function nationalScope() {
  const search=DOM.schId.value.trim().toLowerCase();
  return nationalBaseSchools.filter(s=>(typeof nationalMatchesFilter!=='function'||nationalMatchesFilter(s)) && nationalSelectedStates.has(s.state) && (!nationalPath.state||s.state===nationalPath.state) && (!nationalPath.district||s.district===nationalPath.district) && (!nationalPath.block||s.block===nationalPath.block) && (!nationalPath.school||s.id===nationalPath.school) && (!search||[s.id,s.udise,s.name].some(value=>value.toLowerCase().includes(search))))
    .map(s=>nationalPath.device ? {...s,rec:{...s.rec,devices:s.rec.devices.filter(d=>d.serial===nationalPath.device),ifpTotal:1,opsTotal:1}} : s);
}
function nationalTargetCount(states,schools) {
  if((typeof nationalHasGeoFilters==='function'&&nationalHasGeoFilters()) || nationalPath.district || nationalPath.block || nationalPath.school || DOM.schId.value.trim()) return schools.length;
  return states.reduce((sum,state)=>sum+Math.max(NATIONAL_TARGETS[state]||0,nationalBaseSchools.filter(s=>s.state===state).length),0);
}
function getSelectedStateLabel() {if(nationalPath.state){const school=nationalBaseSchools.find(s=>s.id===nationalPath.school);return [nationalPath.state,nationalPath.district,nationalPath.block,school?.name,school?.udise,nationalPath.device].filter(Boolean).join(' / ');}return nationalSelectedStates.size===NATIONAL_STATES.length?'All states':[...nationalSelectedStates].join(', ');}
function syncNationalStateControls() {
  const all=nationalDraftStates.size===NATIONAL_STATES.length;
  const selectedNames=[...nationalDraftStates];
  document.getElementById('stateFilterSummary').textContent=all?'All '+NATIONAL_STATES.length+' states':selectedNames.length<=2?selectedNames.join(', '):selectedNames[0]+' + '+(selectedNames.length-1)+' states';
  document.getElementById('stateFilterSummary').title=selectedNames.join(', ');
  document.getElementById('stateAllCheckbox').checked=all;
  document.getElementById('stateAllCheckbox').indeterminate=!all && nationalDraftStates.size>0;
  document.querySelectorAll('[data-national-state]').forEach(input=>input.checked=nationalDraftStates.has(input.dataset.nationalState));
  DOM.state.innerHTML='<option value="ALL">'+escapeHtml(getSelectedStateLabel())+'</option>';DOM.state.value='ALL';
}
function toggleNationalState(state,checked) {checked?nationalDraftStates.add(state):nationalDraftStates.delete(state);syncNationalStateControls();}
function selectAllNationalStates(checked) {nationalDraftStates=checked?new Set(NATIONAL_STATES):new Set();syncNationalStateControls();}
function searchNationalStates(value) {document.querySelectorAll('.state-option').forEach(label=>label.hidden=!label.dataset.stateName.toLowerCase().includes(value.toLowerCase()));}
function renderNationalStateSelector() {
  document.getElementById('stateOptions').innerHTML=NATIONAL_STATES.map((state,index)=>'<label class="state-option" data-state-name="'+escapeHtml(state)+'"><input type="checkbox" data-national-state="'+escapeHtml(state)+'" checked onchange="toggleNationalState(NATIONAL_STATES['+index+'],this.checked)"><span>'+escapeHtml(state)+'</span><small>'+nationalTargetCount([state],nationalBaseSchools.filter(s=>s.state===state))+'</small></label>').join('');
  syncNationalStateControls();
}
function nationalLevel() {return !nationalPath.state?'state':!nationalPath.district?'district':!nationalPath.block?'block':!nationalPath.school?'school':'device';}
function nationalHierarchyRows(scope) {
  const level=nationalLevel(),grouped=new Map();
  if(level==='device') return scope.flatMap(s=>s.rec.devices.map(d=>({label:d.serial,kind:'device',key:d.serial,school:s,device:d,items:[{...s,rec:{...s.rec,devices:[d]}}]})));
  for(const school of scope) {
    const id=level==='school'?school.id:level==='district'?JSON.stringify([school.state,school.district]):level==='block'?JSON.stringify([school.state,school.district,school.block]):school[level];
    if(!grouped.has(id)) grouped.set(id,{kind:level,key:id,label:level==='school'?school.name:level==='district'?school.district+(nationalSelectedStates.size>1?' · '+school.state:''):level==='block'?school.block+' · '+school.district+(nationalSelectedStates.size>1?' · '+school.state:''):school[level],items:[]});
    grouped.get(id).items.push(school);
  }
  if(level==='state' && !DOM.schId.value.trim() && !(typeof nationalHasGeoFilters==='function'&&nationalHasGeoFilters())) for(const state of nationalSelectedStates) if(!grouped.has(state))grouped.set(state,{kind:'state',key:state,label:state,items:[]});
  const rows=[...grouped.values()].sort((a,b)=>a.label.localeCompare(b.label));
  if(level==='district' && !DOM.schId.value.trim() && !(typeof nationalHasGeoFilters==='function'&&nationalHasGeoFilters())) {
    const missing=(NATIONAL_TARGETS[nationalPath.state]||0)-nationalBaseSchools.filter(s=>s.state===nationalPath.state).length;
    if(missing>0)rows.push({kind:'pending',key:'pending',label:'School details pending',items:[],pending:missing});
  }
  return rows;
}
function nationalTableIds(view) {
  return {'view-overview':['overviewGeoThead','overviewGeoTbody'],'view-device':['deviceThead','deviceTbody'],'view-app':['appThead','appTbody'],'view-content':['contentGeoThead','contentGeoTbody'],'view-complaints':['complaintGeoThead','complaintGeoTbody']}[view];
}
function nationalDrill(index) {
  const row=nationalRows[currentView]?.[index];if(!row||row.kind==='pending')return;
  const levels=['state','district','block','school','device'];
  nationalPerformanceChoice=null;nationalPerformancePageNumber=1;document.getElementById('performanceSearch').value='';
  nationalPath[row.kind]=row.key;
  levels.slice(levels.indexOf(row.kind)+1).forEach(key=>nationalPath[key]=null);
  render();
}
function nationalGoBack(level) {
  const keys=['state','district','block','school','device'];
  const cut=level==='all'?0:keys.indexOf(level)+1;
  keys.slice(cut).forEach(key=>nationalPath[key]=null);nationalPerformanceChoice=null;nationalPerformancePageNumber=1;document.getElementById('performanceSearch').value='';render();
}
function nationalShowStates() {nationalPath={state:null,district:null,block:null,school:null,device:null};switchTab('view-overview');document.getElementById('overviewGeographyCard').scrollIntoView({behavior:'smooth',block:'start'});}
function updateNationalBreadcrumb() {
  let html='<li class="breadcrumb-item"><button type="button" onclick="nationalGoBack(\'all\')">Selected states</button></li>';
  for(const key of ['state','district','block','school','device']) {
    if(!nationalPath[key])break;
    const label=key==='school'?nationalBaseSchools.find(s=>s.id===nationalPath.school)?.name:nationalPath[key];
    html+='<li class="breadcrumb-item"><button type="button" onclick="nationalGoBack(\''+key+'\')">'+escapeHtml(label||'School')+'</button></li>';
  }
  document.getElementById('navBreadcrumb').innerHTML=html;
}
function nationalRenderOverview(scope,metrics) {
  renderOverview(scope.map(s=>({...s,name:escapeHtml(s.name)})),getFactor());
  document.getElementById('opsTotal').textContent='Devices '+metrics.devices;
  document.getElementById('opsActive').textContent=metrics.active;
  document.getElementById('opsInactive').textContent=metrics.devices-metrics.active;
  opsChart.updateData([metrics.active,metrics.devices-metrics.active]);
  document.getElementById('cmpTotal').textContent='Complaints '+(metrics.open+metrics.resolved);
  document.getElementById('cmpResolved').textContent=metrics.resolved;
  document.getElementById('cmpUnresolved').textContent=metrics.open;
  cmpChart.updateData([metrics.resolved,metrics.open]);
  document.getElementById('overviewTitle').textContent=nationalPath.school?'School usage overview':nationalPath.block?'Block usage overview':nationalPath.district?'District usage overview':nationalPath.state?'State usage overview':'Device & usage overview';
}
render = function () {
  const scope=nationalScope(),metrics=nationalMetrics(scope);
  updateNationalBreadcrumb();updateWorkspaceHeading(currentView);renderAdminScope(scope);
  const states=nationalPath.state?[nationalPath.state]:[...nationalSelectedStates];
  document.getElementById('summaryStates').textContent=new Set(scope.map(s=>s.state)).size;
  document.getElementById('summarySchools').textContent=nationalTargetCount(states,scope).toLocaleString('en-IN');
  document.getElementById('summaryDevices').textContent=metrics.devices.toLocaleString('en-IN');
  document.getElementById('summaryActivity').textContent=metrics.devices?metrics.activity+'%':'—';
  document.getElementById('summaryTickets').textContent=metrics.open.toLocaleString('en-IN');
  const target=nationalTargetCount(states,scope);
  document.getElementById('nationalDataNote').textContent=nationalPath.school?'Device and usage figures for this school are dummy data.':'School details available: '+scope.length+' of '+target+'. Device and usage figures are dummy data.';
  renderNationalTable(currentView,scope);
  if(currentView==='view-overview'){nationalRenderOverview(scope,metrics);document.getElementById('nationalPerformanceCard').hidden=Boolean(nationalPath.device);if(!nationalPath.device)renderNationalPerformance(scope);}
  if(currentView==='view-device') {
    renderMdmSummary(scope);
    document.getElementById('mdmDeviceDetail').hidden=!nationalPath.school;
    if(nationalPath.school)renderMdmFleet(scope);
  }
  document.getElementById('reportModuleCustomUsage').style.display=currentView==='view-content'?'block':'none';
  if(currentView==='view-content')renderCustomReportTable();
  if(currentView==='view-audit')renderAuditLogsTable();
  if(currentView==='view-reports')renderSpecs(scope);
};
updateBreadcrumb = updateNationalBreadcrumb;
const originalNationalSwitchTab=switchTab;
switchTab=function(view){originalNationalSwitchTab(view);if(view==='view-content')document.getElementById('reportModuleCustomUsage').style.display='block';};
const previousNationalExport=exportTableReport;
exportTableReport=function(id,format,title){return previousNationalExport(id,format,title);};
function exportNationalReport(view,format) {
  const ids=nationalTableIds(view);if(!ids)return;
  const table=document.getElementById(ids[1]).closest('table');table.id='national-'+view;
  exportTableReport(table.id,format,WORKSPACE_PAGES[view][0]);
}
DOM.schId.oninput=()=>render();
document.getElementById('filterForm').onsubmit=function(event) {
  event.preventDefault();
  if(!nationalDraftStates.size)return showPrototypeMessage('Select at least one state.');
  if(DOM.fDate.value && DOM.tDate.value && DOM.fDate.value>DOM.tDate.value)return showPrototypeMessage('From date must be on or before To date.');
  nationalPerformanceChoice=null;nationalPerformancePageNumber=1;document.getElementById('performanceSearch').value='';
  const statesChanged=[...nationalDraftStates].sort().join('|')!==[...nationalSelectedStates].sort().join('|');
  nationalSelectedStates=new Set(nationalDraftStates);if(statesChanged)nationalPath={state:null,district:null,block:null,school:null,device:null};
  syncNationalStateControls();document.getElementById('nationalStateDropdown').open=false;render();
};
document.getElementById('resetBtn').onclick=function(){
  nationalPerformanceChoice=null;nationalPerformancePageNumber=1;document.getElementById('performanceSearch').value='';
  nationalSelectedStates=new Set(NATIONAL_STATES);nationalDraftStates=new Set(NATIONAL_STATES);nationalPath={state:null,district:null,block:null,school:null,device:null};
  DOM.schId.value='';DOM.fDate.value=DOM.tDate.value=localDateString(new Date());
  syncNationalStateControls();switchTab('view-overview');
};
renderSpecs=function(scope){
  document.getElementById('specsTbody').innerHTML=scope.slice(0,10).flatMap(s=>s.rec.devices.map(d=>'<tr>'+[s.name+' / '+d.serial,d.makeModel,d.proc,d.ramStorage,d.os+' / '+d.fw,d.net,d.serial,d.instDate,d.war].map(value=>'<td>'+escapeHtml(value)+'</td>').join('')+'</tr>')).join('');
};
renderNationalStateSelector();
WORKSPACE_PAGES['view-device']=['Device monitoring','Explore device activity by state, district, block, school, and device.'];
render();
function renderNationalPerformance(scope) {
  const distinctStates=new Set(scope.map(s=>s.state));
  const autoLevel=nationalPath.school?'device':nationalPath.block?'school':nationalPath.district?'block':distinctStates.size===1?'school':'state';
  const levels=nationalPath.school?['device']:nationalPath.block?['school']:nationalPath.district?['block','school']:distinctStates.size===1?['school','district','block']:['state','district','block','school'];
  const level=nationalPerformanceChoice && levels.includes(nationalPerformanceChoice)?nationalPerformanceChoice:autoLevel;
  const plurals={state:'States',district:'Districts',block:'Blocks',school:'Schools',device:'Devices'};
  const select=document.getElementById('performanceLevelSelect');
  select.innerHTML=levels.map(value=>'<option value="'+value+'">'+plurals[value]+'</option>').join('');select.value=level;
  const groups=new Map();
  for(const school of scope) {
    const members=level==='device'?school.rec.devices:[null];
    for(const device of members) {
      const key=level==='state'?school.state:level==='district'?school.state+' / '+school.district:level==='block'?school.state+' / '+school.district+' / '+school.block:level==='school'?school.id:device.serial;
      if(!groups.has(key))groups.set(key,{kind:level,key,label:level==='school'?school.name:level==='device'?device.serial:school[level],state:school.state,district:school.district,block:school.block,school:school.id,device:device?.serial,items:[]});
      groups.get(key).items.push(device?{...school,rec:{...school.rec,devices:[device]}}:school);
    }
  }
  const query=document.getElementById('performanceSearch').value.toLowerCase().trim();
  const sort=document.getElementById('performanceSort').value;
  let rows=[...groups.values()].map(row=>({...row,metrics:nationalMetrics(row.items)}));
  if(query)rows=rows.filter(row=>[row.label,row.state,row.district,row.block,row.items[0]?.udise].some(value=>String(value||'').toLowerCase().includes(query)));
  for(const row of rows)row.average=row.metrics.devices?row.metrics.hours/row.metrics.devices/Math.max(1,nationalDateKeys().length):0;
  rows.sort((a,b)=>sort==='name'?a.label.localeCompare(b.label):(sort==='high'?b.average-a.average:a.average-b.average)||a.label.localeCompare(b.label));
  const pageSize=level==='state'?25:10,pages=Math.max(1,Math.ceil(rows.length/pageSize));
  nationalPerformancePageNumber=Math.max(1,Math.min(pages,nationalPerformancePageNumber));
  const start=(nationalPerformancePageNumber-1)*pageSize;
  nationalPerformanceRows=rows.slice(start,start+pageSize);
  const singular=plurals[level].slice(0,-1);
  document.getElementById('nationalPerformanceTitle').textContent=singular+' utilisation';
  document.getElementById('nationalPerformanceSubtitle').textContent=level==='state'?'Compare programme usage across states. Select a state to explore its schools.':level==='school'?'Find schools with lower device use in the selected geography. Select a school for device details.':'Compare '+plurals[level].toLowerCase()+' within the selected geography.';
  document.getElementById('performanceThead').innerHTML='<tr><th>'+singular+'</th>'+(['school','device'].includes(level)?'':'<th>Schools</th>')+'<th>Teaching devices</th><th>Active devices</th><th>Avg. daily usage / device</th><th>Open tickets</th></tr>';
  document.getElementById('performanceTbody').innerHTML=nationalPerformanceRows.length?nationalPerformanceRows.map((row,index)=>{
    const schoolCount=level==='state' && !DOM.schId.value.trim() && !(typeof nationalHasGeoFilters==='function'&&nationalHasGeoFilters())?Math.max(NATIONAL_TARGETS[row.state]||0,row.metrics.schools):row.metrics.schools;
    const context=level==='school'?'UDISE '+(row.items[0].udise||'Not provided'):level==='district'?row.state:level==='block'?row.district+' / '+row.state:'';
    return '<tr><td><button class="national-drill-link" type="button" onclick="nationalPerformanceDrill('+index+')">'+escapeHtml(row.label)+' <i class="bi bi-chevron-right"></i></button>'+(context?'<small class="national-pending-note">'+escapeHtml(context)+'</small>':'')+'</td>'+(['school','device'].includes(level)?'':'<td>'+schoolCount+'</td>')+'<td>'+row.metrics.devices+'</td><td>'+row.metrics.activity+'%</td><td>'+row.average.toFixed(1)+' hrs</td><td>'+row.metrics.open+'</td></tr>';
  }).join(''):'<tr><td colspan="6" class="text-center py-4">No usage records match this selection.</td></tr>';
  document.getElementById('performanceEntries').textContent='Showing '+(rows.length?start+1:0)+'–'+Math.min(start+pageSize,rows.length)+' of '+rows.length+' '+plurals[level].toLowerCase();
  document.getElementById('performancePrevious').disabled=nationalPerformancePageNumber===1;
  document.getElementById('performanceNext').disabled=nationalPerformancePageNumber===pages;
}
function changeNationalPerformancePage(delta) {nationalPerformancePageNumber+=delta;renderNationalPerformance(nationalScope());}
function nationalPerformanceDrill(index) {
  const row=nationalPerformanceRows[index];if(!row)return;
  const keys=['state','district','block','school','device'];
  nationalPath={state:null,district:null,block:null,school:null,device:null};
  for(const key of keys){nationalPath[key]=row[key]||null;if(key===row.kind)break;}
  nationalPerformanceChoice=null;nationalPerformancePageNumber=1;document.getElementById('performanceSearch').value='';render();
}
function nationalDateKeys() {
  const fallback=localDateString(new Date()),from=DOM.fDate.value||fallback,to=DOM.tDate.value||from;
  const result=[],end=new Date(to+'T00:00:00Z');
  for(let date=new Date(from+'T00:00:00Z');date<=end;date.setUTCDate(date.getUTCDate()+1))result.push(date.toISOString().slice(0,10));
  return result;
}
function nationalDailyData(device) {
  const dates=nationalDateKeys(),key=dates[0]+'|'+dates.at(-1);
  if(nationalDailyCacheKey!==key){nationalDailyCacheKey=key;nationalDailyCache.clear();}
  if(nationalDailyCache.has(device.serial))return nationalDailyCache.get(device.serial);
  const records=dates.map(date=>{
    const seed=Math.abs(hashStr(device.serial+'|'+date));
    const minutes=seed%7===0?0:30+seed%391;
    const appMinutes=[Math.floor(minutes*.4),Math.floor(minutes*.25),Math.floor(minutes*.2)];appMinutes.push(minutes-appMinutes.reduce((a,b)=>a+b,0));
    const contentMinutes=Math.floor(minutes*.6);
    return {date,minutes,appMinutes,contentMinutes,sessions:Math.round(minutes/35),views:Math.floor(contentMinutes/12),contentSessions:Math.round(contentMinutes/30),subject:['Mathematics','Science','English'][seed%3]};
  });
  nationalDailyCache.set(device.serial,records);return records;
}
function nationalMetrics(schools) {
  const devices=schools.flatMap(s=>s.rec.devices),records=devices.flatMap(nationalDailyData);
  const active=devices.filter(device=>nationalDailyData(device).some(day=>day.minutes>0)).length;
  const sum=field=>records.reduce((total,day)=>total+day[field],0);
  return {schools:schools.length,devices:devices.length,active,activity:devices.length?Math.round(active/devices.length*100):0,hours:sum('minutes')/60,contentHours:sum('contentMinutes')/60,views:sum('views'),sessions:sum('sessions'),contentSessions:sum('contentSessions'),open:devices.reduce((sum,d)=>sum+d.openTickets,0),resolved:devices.reduce((sum,d)=>sum+d.resolvedTickets,0)};
}
function nationalDailyDetail(view,scope,ids) {
  const school=scope[0],device=school?.rec.devices[0];
  if(!device){document.getElementById(ids[0]).innerHTML='';document.getElementById(ids[1]).innerHTML='<tr><td>No device selected.</td></tr>';return;}
  const records=nationalDailyData(device),hours=minutes=>(minutes/60).toFixed(2)+' hrs';
  let columns=['Date'],rows=[];
  if(view==='view-app'){
    columns.push('DIKSHA','Browser','Smart Board','Notes / Office','Total app usage','Sessions');
    rows=records.map(day=>[day.date,...day.appMinutes.map(hours),hours(day.minutes),String(day.sessions)]);
  } else if(view==='view-content'){
    columns.push('Content usage','Content views','Sessions','Subject');
    rows=records.map(day=>[day.date,hours(day.contentMinutes),String(day.views),String(day.contentSessions),day.minutes?day.subject:'No usage']);
  } else if(view==='view-complaints'){
    columns=['Ticket reference','Reported date','Issue','Status'];
    const total=device.openTickets+device.resolvedTickets;
    rows=Array.from({length:total},(_,i)=>['DEMO-TKT-'+Math.abs(hashStr(device.serial+'-'+i)).toString().slice(0,6),records[i%records.length]?.date||DOM.fDate.value,['Connectivity issue','Content application issue','Device support'][i%3],i<device.openTickets?'Open':'Resolved']);
  } else {
    columns.push('Total device usage','Sessions','Activity');
    rows=records.map(day=>[day.date,hours(day.minutes),String(day.sessions),day.minutes?'Used':'No usage recorded']);
  }
  nationalRows[view]=records.map(day=>({kind:'date',label:day.date,key:day.date,day}));
  document.getElementById(ids[0]).innerHTML='<tr>'+columns.map(value=>'<th>'+value+'</th>').join('')+'</tr>';
  document.getElementById(ids[1]).innerHTML=rows.length?rows.map(row=>'<tr>'+row.map(value=>'<td>'+escapeHtml(value)+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+columns.length+'" class="text-center py-4">No tickets for this device.</td></tr>';
}
function renderNationalTable(view,scope) {
  const ids=nationalTableIds(view);if(!ids)return;
  const title=view==='view-device'?document.getElementById('deviceWorkflowTitle'):null;
  if(nationalPath.device){if(view==='view-overview')renderCoverageMap(scope);if(title)title.textContent='Daily device usage';nationalDailyDetail(view,scope,ids);document.querySelectorAll('[data-national-level]').forEach(el=>el.textContent=currentView==='view-complaints'?'Device ticket history':'Date-wise usage');return;}
  let rows=nationalHierarchyRows(scope);if(view==='view-overview')rows=rows.filter(row=>row.kind!=='pending');
  if(view==='view-app'){const query=(document.getElementById('appSearchInput')?.value||'').toLowerCase().trim();if(query)rows=rows.filter(row=>[row.label,row.items[0]?.state,row.items[0]?.udise].some(value=>String(value||'').toLowerCase().includes(query)));}
  nationalRows[view]=rows;if(view==='view-overview')renderCoverageMap(scope);
  const level=nationalLevel(),name={state:'State',district:'District',block:'Block',school:'School',device:'Device serial number'}[level];
  if(title)title.textContent=level==='device'?'School devices':'Device usage by '+name.toLowerCase();
  const showSchools=['state','district','block'].includes(level),isCoverage=view==='view-overview';
  let columns=isCoverage?[name]:['#',name];if(level==='school')columns.push('UDISE number');
  if(isCoverage){if(showSchools)columns.push('Programme schools');if(level==='state')columns.push('Districts','Blocks');else if(level==='district')columns.push('Blocks');else if(level==='school')columns.push('Teaching devices');else if(level==='device')columns.push('Model','Connection');}
  else if(view==='view-device'){if(showSchools)columns.push('Schools');columns.push(...(level==='device'?['Connection','Usage hours','Sessions','Open tickets']:['Teaching devices','Active devices','Device activity','Usage hours']));}
  else if(view==='view-app'){if(showSchools)columns.push('Schools');columns.push(...(level==='device'?['App usage hours','App sessions','Connection']:['Teaching devices','App usage hours','App sessions']));}
  else if(view==='view-content'){if(showSchools)columns.push('Schools');columns.push(...(level==='device'?['Content usage hours','Content views','Sessions']:['Teaching devices','Content usage hours','Content views']));}
  else{if(showSchools)columns.push('Schools');columns.push(...(level==='device'?['Open tickets','Resolved tickets','Status']:['Teaching devices','Open tickets','Resolved tickets']));}
  document.getElementById(ids[0]).innerHTML='<tr>'+columns.map(value=>'<th>'+value+'</th>').join('')+'</tr>';
  document.getElementById(ids[1]).innerHTML=rows.length?rows.map((row,index)=>{
    const metrics=nationalMetrics(row.items),isState=row.kind==='state',schoolCount=isState&&!DOM.schId.value.trim()&&!(typeof nationalHasGeoFilters==='function'&&nationalHasGeoFilters())?Math.max(NATIONAL_TARGETS[row.key]||0,metrics.schools):metrics.schools;
    const cells=[String(index+1),'<button class="national-drill-link" type="button" onclick="nationalDrill('+index+')" '+(row.kind==='pending'?'disabled':'')+'>'+escapeHtml(row.label)+(row.kind==='pending'?'':' <i class="bi bi-chevron-right"></i>')+'</button>'];
    if(isCoverage)cells.shift();
    if(level==='school')cells.push(escapeHtml(row.items[0].udise||'Not provided'));
    if(row.kind==='pending'){cells.push(String(row.pending));while(cells.length<columns.length)cells.push('—');return '<tr>'+cells.map(value=>'<td>'+value+'</td>').join('')+'</tr>';}
    if(showSchools)cells.push(String(schoolCount));
    if(isCoverage){if(level==='state')cells.push(String(new Set(row.items.map(s=>s.district)).size),String(new Set(row.items.map(s=>s.district+'|'+s.block)).size));else if(level==='district')cells.push(String(new Set(row.items.map(s=>s.block)).size));else if(level==='school')cells.push(String(metrics.devices));else if(level==='device')cells.push(escapeHtml(row.device.makeModel),getMdmHealthDevices(row.items)[0]?.online?'Online':'Offline');}
    else if(view==='view-device')cells.push(...(level==='device'?[getMdmHealthDevices(row.items)[0]?.online?'Online':'Offline',metrics.hours.toFixed(2)+' hrs',String(metrics.sessions),String(metrics.open)]:[String(metrics.devices),String(metrics.active),metrics.activity+'%',metrics.hours.toFixed(2)+' hrs']));
    else if(view==='view-app')cells.push(...(level==='device'?[metrics.hours.toFixed(2)+' hrs',String(metrics.sessions),getMdmHealthDevices(row.items)[0]?.online?'Online':'Offline']:[String(metrics.devices),metrics.hours.toFixed(2)+' hrs',String(metrics.sessions)]));
    else if(view==='view-content')cells.push(...(level==='device'?[metrics.contentHours.toFixed(2)+' hrs',String(metrics.views),String(metrics.contentSessions)]:[String(metrics.devices),metrics.contentHours.toFixed(2)+' hrs',String(metrics.views)]));
    else cells.push(...(level==='device'?[String(metrics.open),String(metrics.resolved),metrics.open?'Pending':'No open ticket']:[String(metrics.devices),String(metrics.open),String(metrics.resolved)]));
    if(isState&&!isCoverage&&schoolCount>metrics.schools)cells[1]+='<small class="national-pending-note">'+metrics.schools+' details available; '+(schoolCount-metrics.schools)+' pending</small>';
    return '<tr>'+cells.map(value=>'<td>'+value+'</td>').join('')+'</tr>';
  }).join(''):'<tr><td colspan="'+columns.length+'" class="text-center py-4">No records match these filters.</td></tr>';
  document.querySelectorAll('[data-national-level]').forEach(el=>el.textContent=name+'-wise summary · '+(nationalDateKeys().length===1?'Daily':'Selected period'));
}
function renderAdminScope(scope) {
  const parts=[];if(nationalPath.state)parts.push('State: '+nationalPath.state);else if(nationalSelectedStates.size===1)parts.push('State: '+[...nationalSelectedStates][0]);else parts.push(nationalSelectedStates.size+' selected states');
  if(nationalPath.district)parts.push('District: '+nationalPath.district);if(nationalPath.block)parts.push('Block: '+nationalPath.block);
  if(nationalPath.school){const school=scope[0]||nationalBaseSchools.find(s=>s.id===nationalPath.school);parts.push('School: '+(school?.name||'Not available'));if(school?.udise)parts.push('UDISE: '+school.udise);}
  if(nationalPath.device)parts.push('Device: '+nationalPath.device);
  document.getElementById('adminScopeLabel').textContent=parts.join(' / ');
}
/* Offline schematic geography; tiles share the table drilldown and current scope. */
function coverageGoBack() {
  const keys=['state','district','block','school','device'];
  let deepest=-1;keys.forEach((key,index)=>{if(nationalPath[key])deepest=index;});
  if(deepest>=0)nationalGoBack(deepest===0?'all':keys[deepest-1]);
}
function setCoverageView(view) {
  coverageView=view==='graphical'?'graphical':'tabular';
  for(const key of ['tabular','graphical']) {
    const tab=document.getElementById(key==='tabular'?'coverageTabularTab':'coverageGraphicalTab');
    const active=coverageView===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
    document.getElementById(key==='tabular'?'coverageTablePanel':'coverageGraphicalPanel').hidden=!active;
  }
}
function coverageTabKey(event,view) {
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const next=event.key==='Home'?'tabular':event.key==='End'?'graphical':view==='tabular'?'graphical':'tabular';
  setCoverageView(next);document.getElementById(next==='tabular'?'coverageTabularTab':'coverageGraphicalTab').focus();
}
function coverageSchoolCount(row) {
  return row.kind==='state'?nationalTargetCount([row.key],row.items):row.items.length;
}
function coverageDistrictName(state,name) {
  const normalized=String(name).toLowerCase().replace(/district/g,'').replace(/[^a-z0-9]/g,'');
  const aliases={'Andhra Pradesh':{ananthapur:'anantapuram',asr:'allurisitharamaraju',spsnellore:'sripottisriramulunellore',satyasai:'srisathyasai',vizainagaram:'vizianagaram',ysr:'ysrkadapa'},'Arunachal Pradesh':{pakkekesang:'pakkekessang'},'Assam':{morigaon:'marigaon',southsalmara:'southsalmaramankachar'},'Chhattisgarh':{baster:'bastar',gariyaband:'gariaband',kanker:'uttarbastarkanker',mcb:'manendragarhchirimiribharatpur'},'Gujarat':{chhotaudepur:'chhotaudaipur'},'Jharkhand':{hazaribag:'hazaribagh',koderma:'kodarma',pashchimisinghbhum:'westsinghbhum',saraikelakharsawan:'seraikelakharsawan'},'Karnataka':{vijayanagar:'vijayanagara',yadgiri:'yadgir'},'Telangana':{jayashankar:'jayashankarbhupalapally',narayanapet:'narayanpet',rajannasiricilla:'rajannasircilla'},'Uttar Pradesh':{badun:'badaun',bhaghpat:'baghpat',bulandshar:'bulandshahr',raibareli:'raebareli'}};
  const target=aliases[state]?.[normalized]||normalized;
  const feature=(window.KGBV_MAP_DISTRICTS||[]).find(f=>f.state===state&&f.name.toLowerCase().replace(/district/g,'').replace(/[^a-z0-9]/g,'')===target);
  return feature?feature.name.replace(/ district/ig,'').trim():name;
}
function coverageDrill(index) {
  if(currentView!=='view-overview')switchTab('view-overview');
  nationalDrill(index);
}
function coverageMapDrill(state) {
  const index=(nationalRows['view-overview']||[]).findIndex(row=>row.kind==='state'&&row.key===state);
  if(index>=0)coverageDrill(index);
}
function coverageDistrictDrill(index) {coverageDrill(index);}
function renderCoverageDistricts(scope,rows,level) {
  if(!nationalPath.state||level==='state')return;
  const features=(window.KGBV_MAP_DISTRICTS||[]).filter(f=>f.state===nationalPath.state);
  const selected=features.find(f=>coverageDistrictName(f.state,f.name)===nationalPath.district);
  const shown=selected&&level!=='district'?[selected]:features;
  if(!shown.length)return;
  const bounds=[Math.min(...shown.map(f=>f.bounds[0])),Math.min(...shown.map(f=>f.bounds[1])),Math.max(...shown.map(f=>f.bounds[2])),Math.max(...shown.map(f=>f.bounds[3]))];
  const viewBox=[bounds[0]-8,bounds[1]-8,bounds[2]-bounds[0]+16,bounds[3]-bounds[1]+16].join(' '),labels=[];
  const paths=shown.map(feature=>{
    const name=coverageDistrictName(feature.state,feature.name),index=rows.findIndex(row=>row.kind==='district'&&row.items[0]?.district===name);
    const items=scope.filter(s=>s.district===name),count=items.length,enabled=level==='district'&&index>=0;
    const fill=count>10?'coverage-map-high':count?'coverage-map-medium':'coverage-map-inactive';
    const label=name+' — '+count+' programme schools';
    if(count){const x=(feature.bounds[0]+feature.bounds[2])/2,y=(feature.bounds[1]+feature.bounds[3])/2;labels.push('<text class="coverage-district-label" x="'+x+'" y="'+y+'" text-anchor="middle">'+count+'</text>');}
    return '<path class="coverage-state '+fill+'" d="'+feature.path+'" '+(enabled?'role="button" tabindex="0" onclick="coverageDistrictDrill('+index+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();coverageDistrictDrill('+index+')}"':'')+' aria-label="'+escapeHtml(label)+'"><title>'+escapeHtml(label)+'</title></path>';
  }).join('');
  let html='<svg class="coverage-india-svg" viewBox="'+viewBox+'" aria-label="District-wise programme schools in '+escapeHtml(nationalPath.state)+'"><title>'+escapeHtml(nationalPath.district||nationalPath.state)+' programme schools</title>'+paths+labels.join('')+'</svg>';
  if(level!=='district'&&!nationalPath.device)html+='<div class="coverage-map-children">'+rows.map((row,index)=>'<button type="button" onclick="coverageDrill('+index+')"><strong>'+escapeHtml(row.label)+'</strong><span>'+ (row.kind==='device'?'1 teaching device':row.kind==='school'?nationalMetrics(row.items).devices+' teaching devices':coverageSchoolCount(row)+' programme schools')+' <i class="bi bi-chevron-right" aria-hidden="true"></i></span></button>').join('')+'</div>';
  document.getElementById('coverageMap').innerHTML=html;
  document.getElementById('coverageMapTitle').textContent=(nationalPath.district||nationalPath.state)+' · '+(level==='district'?'District coverage':'Coverage');
  document.getElementById('coverageMapLegend').innerHTML='<span><i class="coverage-key medium"></i>1–10 schools</span><span><i class="coverage-key high"></i>11+ schools</span><span><i class="coverage-key inactive"></i>No schools in current scope</span>';
  document.getElementById('coverageMapNote').textContent=level==='district'?'Select a district on the map or in the breakdown to view its blocks. Map numbers show programme schools.':'Select a block, school or device below the map or in the breakdown to continue.';
}
function renderCoverageMap(scope) {
  const keys=['state','district','block','school','device'];
  document.getElementById('coverageBackBtn').disabled=!keys.some(key=>nationalPath[key]);
  const school=nationalBaseSchools.find(s=>s.id===nationalPath.school);
  document.getElementById('coverageLocation').textContent=[nationalPath.state||'Selected states',nationalPath.district,nationalPath.block,school?.name,nationalPath.device].filter(Boolean).join(' / ');
  setCoverageView(coverageView);
  const level=nationalLevel(),rows=nationalHierarchyRows(scope).filter(row=>row.kind!=='pending');
  const features=window.KGBV_MAP_STATES||[];
  const focusedState=nationalPath.state||(nationalSelectedStates.size===1?[...nationalSelectedStates][0]:null);
  const shown=focusedState?features.filter(feature=>feature.name===focusedState):features;
  const bounds=shown.length?[Math.min(...shown.map(f=>f.bounds[0])),Math.min(...shown.map(f=>f.bounds[1])),Math.max(...shown.map(f=>f.bounds[2])),Math.max(...shown.map(f=>f.bounds[3]))]:[0,0,800,900];
  const pad=15,viewBox=[bounds[0]-pad,bounds[1]-pad,bounds[2]-bounds[0]+pad*2,bounds[3]-bounds[1]+pad*2].join(' ');
  document.getElementById('coverageMapTitle').textContent=focusedState?focusedState+' coverage':'India programme coverage';
  const stateRows=nationalHierarchyRows(scope).filter(row=>row.kind==='state');
  document.getElementById('coverageMap').innerHTML='<svg class="coverage-india-svg" viewBox="'+viewBox+'" aria-label="'+escapeHtml(focusedState||'India')+' programme coverage map"><title>Programme schools by state</title>'+shown.map(feature=>{
    const row=stateRows.find(row=>row.key===feature.name),selected=nationalSelectedStates.has(feature.name);
    const data=scope.filter(s=>s.state===feature.name),count=row?coverageSchoolCount(row):selected?nationalTargetCount([feature.name],data):0;
    const enabled=level==='state'&&Boolean(row),fill=!selected?'coverage-map-inactive':count>100?'coverage-map-high':count>20?'coverage-map-medium':'coverage-map-low';
    const label=feature.name+(selected?' — '+count+' programme schools':' — outside selected programme scope');
    return '<path class="coverage-state '+fill+'" d="'+feature.path+'" '+(enabled?'role="button" tabindex="0" onclick="coverageMapDrill(\''+feature.name+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();coverageMapDrill(\''+feature.name+'\')}"':'')+' aria-label="'+escapeHtml(label)+'"><title>'+escapeHtml(label)+'</title></path>';
  }).join('')+(!focusedState?shown.filter(feature=>['Andhra Pradesh','Telangana','Uttar Pradesh','Rajasthan','Gujarat','Jharkhand','Chhattisgarh','Karnataka'].includes(feature.name)&&nationalSelectedStates.has(feature.name)).map(feature=>{
    const row=stateRows.find(row=>row.key===feature.name);if(!row)return '';
    const abbreviations={'Andhra Pradesh':'AP','Telangana':'TS','Uttar Pradesh':'UP','Rajasthan':'RJ','Gujarat':'GJ','Jharkhand':'JH','Chhattisgarh':'CG','Karnataka':'KA'};
    const x=(feature.bounds[0]+feature.bounds[2])/2,y=(feature.bounds[1]+feature.bounds[3])/2;
    return '<text class="coverage-state-label" x="'+x+'" y="'+y+'" text-anchor="middle">'+abbreviations[feature.name]+' · '+coverageSchoolCount(row)+'</text>';
  }).join(''):'')+'</svg>';
  document.getElementById('coverageMapLegend').innerHTML='<span><i class="coverage-key low"></i>1–20 schools</span><span><i class="coverage-key medium"></i>21–100</span><span><i class="coverage-key high"></i>101+</span><span><i class="coverage-key inactive"></i>Outside scope</span>';
  const names={state:'state',district:'district',block:'block',school:'school',device:'device'};
  const isDevice=level==='device',isSchool=level==='school';
  document.getElementById('coverageChartTitle').textContent=nationalPath.device?'Daily device usage':(isDevice||isSchool?'Teaching devices':'Programme schools')+' by '+names[level];
  document.getElementById('coverageMapNote').textContent=nationalPath.device?'Usage hours per day · Dummy data':level==='state'?'Select a state on the map or a bar to view its districts.':'Select a bar to continue the drilldown. The map shows the selected state; district, block and school locations are represented in the breakdown.';
  renderCoverageDistricts(scope,rows,level);
  const chart=document.getElementById('coverageChart');
  if(nationalPath.device){
    const device=scope[0]?.rec.devices[0],days=device?nationalDailyData(device):[],max=Math.max(1,...days.map(day=>day.minutes));
    chart.innerHTML=days.map(day=>'<div class="coverage-bar-row coverage-daily-bar"><span class="coverage-bar-label">'+day.date+'</span><span class="coverage-bar-track"><span style="width:'+day.minutes/max*100+'%"></span></span><strong>'+(day.minutes/60).toFixed(2)+' hrs</strong></div>').join('');return;
  }
  const values=rows.map(row=>isDevice?1:isSchool?nationalMetrics(row.items).devices:coverageSchoolCount(row)),max=Math.max(1,...values);
  chart.innerHTML=rows.length?rows.map((row,index)=>{
    const count=values[index],districts=new Set(row.items.map(s=>s.district)).size,blocks=new Set(row.items.map(s=>s.district+'|'+s.block)).size;
    const subtitle=row.kind==='state'?districts+' districts · '+blocks+' blocks':row.kind==='district'?blocks+' blocks':row.kind==='school'?'UDISE: '+(row.items[0]?.udise||'Not provided'):row.kind==='device'?'Dummy serial number':'Programme schools';
    return '<button type="button" class="coverage-bar-row" onclick="coverageDrill('+index+')"><span class="coverage-bar-label">'+escapeHtml(row.label)+'<small>'+escapeHtml(subtitle)+'</small></span><span class="coverage-bar-track"><span style="width:'+count/max*100+'%"></span></span><strong>'+count+'</strong><i class="bi bi-chevron-right" aria-hidden="true"></i></button>';
  }).join(''):'<p class="coverage-map-note">No records match these filters.</p>';
}
