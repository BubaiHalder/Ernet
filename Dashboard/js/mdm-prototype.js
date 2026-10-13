/* Dummy device data and command interactions for client approval. No API requests. */
'use strict';
let MDM_DEMO_FLEET = [];
const MDM_DEMO_OVERRIDES = new Map();
const MDM_DEMO_COMMANDS = [];
const MDM_DEMO_ACTIONS = {refresh:'Refresh device status', diagnostics:'Collect diagnostics', sync:'Synchronise usage records', restart:'Restart device'};
function getMdmHealthDevices(scope) {
  return scope.flatMap(school=>school.rec.devices.map(device=>{
    const id=school.rec.schoolId+'-'+device.serial,seed=Math.abs(hashStr(device.serial));
    return {id,serial:device.serial,school:school.name,online:device.status==='Active',uptime:2+seed%76,storage:24+seed%35,alert:seed%7===0,pending:3+seed%10,...MDM_DEMO_OVERRIDES.get(id)};
  }));
}
function renderMdmSummary(scope) {
  const devices=getMdmHealthDevices(scope);
  document.getElementById('mdmOnline').textContent=devices.filter(d=>d.online).length.toLocaleString('en-IN');
  document.getElementById('mdmOffline').textContent=devices.filter(d=>!d.online).length.toLocaleString('en-IN');
  document.getElementById('mdmStorage').textContent=devices.length?Math.round(devices.reduce((sum,d)=>sum+d.storage,0)/devices.length/64*100)+'%':'—';
  document.getElementById('mdmAlerts').textContent=devices.filter(d=>d.alert).length.toLocaleString('en-IN');
}
function renderMdmFleet(scope) {
  const previous=document.getElementById('mdmDeviceSelect').value;
  MDM_DEMO_FLEET=getMdmHealthDevices(scope);
  document.getElementById('mdmDeviceSelect').innerHTML='<option value="">Select a device</option>'+MDM_DEMO_FLEET.map(d=>'<option value="'+escapeHtml(d.id)+'">'+escapeHtml(d.serial)+' · '+(d.online?'Online':'Offline')+'</option>').join('');
  document.getElementById('mdmDeviceSelect').value=MDM_DEMO_FLEET.some(d=>d.id===previous)?previous:'';
  if(nationalPath.device && MDM_DEMO_FLEET.length===1)document.getElementById('mdmDeviceSelect').value=MDM_DEMO_FLEET[0].id;
  drawMdmFleet();updateMdmTarget();
}
function drawMdmFleet() {
  const rows = MDM_DEMO_FLEET;
  document.getElementById('mdmOnline').textContent = rows.filter(row=>row.online).length;
  document.getElementById('mdmOffline').textContent = rows.filter(row=>!row.online).length;
  document.getElementById('mdmStorage').textContent = rows.length ? Math.round(rows.reduce((sum,row)=>sum+row.storage,0)/rows.length/64*100)+'%' : '—';
  document.getElementById('mdmAlerts').textContent = rows.filter(row=>row.alert).length;
  document.getElementById('mdmHealthBody').innerHTML = rows.length ? rows.map(row=>`<tr><td><strong>${escapeHtml(row.serial)}</strong></td><td>${escapeHtml(row.school)}</td><td><span class="status-pill ${row.online?'demo':'pending'}">${row.online?'Online':'Offline'}</span></td><td>${row.online?row.uptime+' hrs':'Last: '+row.uptime+' hrs'}</td><td>${row.storage} / 64 GB<div class="mdm-storage-track"><span style="width:${Math.round(row.storage/64*100)}%"></span></div></td><td><span class="status-pill ${row.alert?'partial':'demo'}">${row.alert?'Needs attention':'Healthy'}</span></td><td>${row.online?'Up to date':row.pending+' records queued'}</td><td><button type="button" class="mdm-row-action" onclick="selectMdmDevice('${escapeHtml(row.id)}')">Select</button></td></tr>`).join('') : '<tr><td colspan="8" class="text-center py-4">No devices match the selected scope.</td></tr>';
}
function selectMdmDevice(id) {
  document.getElementById('mdmDeviceSelect').value=id;
  updateMdmTarget();
  document.getElementById('mdmDeviceSelect').focus();
}
function updateMdmTarget() {
  const device = MDM_DEMO_FLEET.find(row=>row.id===document.getElementById('mdmDeviceSelect').value);
  document.getElementById('mdmReconnectBtn').hidden = !device || device.online;
  document.getElementById('mdmTargetHint').textContent = !device ? 'Select a device to view its connection status.' : `${device.serial} · ${device.online?'Online — command can be delivered.':'Offline — command will wait for reconnection.'}`;
}
function drawMdmCommands() {
  document.getElementById('mdmCommandBody').innerHTML = MDM_DEMO_COMMANDS.length ? MDM_DEMO_COMMANDS.map(command=>`<tr><td class="font-mono">${escapeHtml(command.ref)}</td><td>${escapeHtml(command.serial)}</td><td>${escapeHtml(MDM_DEMO_ACTIONS[command.action])}</td><td><span class="status-pill ${command.status==='Queued (offline)'?'partial':'demo'}">${escapeHtml(command.status)}</span></td></tr>`).join('') : '<tr><td colspan="4" class="text-center py-4">No commands sent in this session.</td></tr>';
}
function completeMdmDemo(command) {
  command.status='Sending (demo)';drawMdmCommands();
  setTimeout(()=>{
    command.status='Completed (demo)';
    addAuditLogEntry(`Simulated ${MDM_DEMO_ACTIONS[command.action]} for ${command.serial}`, 'Demo command');
    drawMdmCommands();
  },900);
}
function submitMdmCommand() {
  const device=MDM_DEMO_FLEET.find(row=>row.id===document.getElementById('mdmDeviceSelect').value);
  const action=document.getElementById('mdmActionSelect').value;
  if (!device || !MDM_DEMO_ACTIONS[action]) return showPrototypeMessage('Select a device and command first.');
  const command={ref:'DEMO-'+String(MDM_DEMO_COMMANDS.length+1).padStart(3,'0'),id:device.id,serial:device.serial,action,status:device.online?'Sending (demo)':'Queued (offline)'};
  MDM_DEMO_COMMANDS.unshift(command);
  addAuditLogEntry(`Previewed ${MDM_DEMO_ACTIONS[action]} for ${device.serial}`, 'Demo command');
  drawMdmCommands();
  if (device.online) completeMdmDemo(command);
  showPrototypeMessage(device.online?'Command simulated. No live request was sent.':'Demo command queued until this device reconnects.');
}
function simulateMdmReconnect() {
  const device=MDM_DEMO_FLEET.find(row=>row.id===document.getElementById('mdmDeviceSelect').value);
  if (!device || device.online) return;
  device.online=true;device.pending=0;
  MDM_DEMO_OVERRIDES.set(device.id,{online:true,pending:0});
  const selected=device.id;
  document.getElementById('mdmDeviceSelect').innerHTML='<option value="">Select a device</option>'+MDM_DEMO_FLEET.map(row=>`<option value="${escapeHtml(row.id)}">${escapeHtml(row.serial)} · ${row.online?'Online':'Offline'}</option>`).join('');
  document.getElementById('mdmDeviceSelect').value=selected;
  drawMdmFleet();updateMdmTarget();renderMdmSummary(nationalScope());renderNationalTable(currentView,nationalScope());
  MDM_DEMO_COMMANDS.filter(command=>command.id===selected && command.status==='Queued (offline)').forEach(completeMdmDemo);
  addAuditLogEntry(`Simulated reconnection and usage synchronisation for ${device.serial}`, 'Demo command');
  showPrototypeMessage('Demo device reconnected. Queued commands and usage records are synchronised.');
}
function refreshMdmDemo() {drawMdmFleet();renderMdmSummary(nationalScope());showPrototypeMessage('Dummy device status refreshed. No API request was made.');}