/* Direct date controls and ticket search for the static dashboard demonstration. */
'use strict';
(() => {
  const style = document.createElement('style');
  style.textContent = `
    #compactDateRange{display:none!important}.compact-date-controls{display:flex;align-items:center;gap:7px;padding:4px 8px;border:1px solid var(--line);border-radius:7px;background:var(--surface-sub)}
    .compact-date-field{display:flex;align-items:center;gap:5px;color:var(--muted);font-size:10px;white-space:nowrap}
    .compact-date-field input{width:126px;min-height:30px;padding:4px 6px;border:1px solid var(--line);border-radius:5px;background:var(--surface);color:var(--ink);font:inherit;font-size:11px}
    .compact-date-controls.is-invalid{border-color:var(--coral)}
    .compact-date-error{flex-basis:100%;color:var(--coral);font-size:10px}
    .filter-popup{width:min(1240px,96vw);max-height:92vh;border-radius:18px;box-shadow:0 28px 90px #10182838}
    .filter-popup-header{padding:24px 26px;background:linear-gradient(135deg,var(--surface),var(--surface-sub));border-bottom:1px solid var(--line)}
    .filter-popup-header h2{font-size:22px;letter-spacing:-.035em}.filter-popup-header p{font-size:12px}
    .filter-popup-body{padding:18px 24px 22px}.multi-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .multi-filter-column{background:var(--surface-sub);border:1px solid var(--line);border-radius:13px;padding:12px;box-shadow:0 2px 8px #10182808}
    .multi-filter-heading{margin-bottom:9px}.multi-filter-heading h3{font-size:13px;font-weight:650;letter-spacing:-.01em}
    .multi-filter-heading>span{padding:3px 7px;background:var(--surface);border:1px solid var(--line);border-radius:99px;font-variant-numeric:tabular-nums}
    .multi-select-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px;margin:8px 0;background:var(--surface);border:1px solid var(--line);border-radius:9px}
    .multi-select-actions button{padding:5px 8px;border:0;border-radius:6px;background:transparent;color:var(--muted);font-size:10px;font-weight:600}
    .multi-select-actions button:hover,.multi-select-actions .multi-select-all{background:var(--cyan-bg);color:var(--cyan)}
    .multi-filter-options{height:178px;padding-right:4px;overflow-y:auto!important;scrollbar-width:thin!important}
    #advancedFilterDialog .multi-option{display:flex;width:100%;min-height:46px;align-items:center;gap:9px;padding:7px 8px;margin:3px 0;border:1px solid transparent;border-radius:9px;background:transparent;text-align:left;color:var(--ink);cursor:pointer;transition:background .14s,border-color .14s,transform .14s}
    #advancedFilterDialog .multi-option:hover{background:var(--surface);border-color:var(--line);transform:translateY(-1px)}
    #advancedFilterDialog .multi-option:focus-visible{outline:3px solid color-mix(in srgb,var(--cyan) 35%,transparent);outline-offset:1px}
    #advancedFilterDialog .multi-option[aria-checked=true]{background:var(--cyan-bg);border-color:color-mix(in srgb,var(--cyan) 38%,var(--line))}
    .multi-option-mark{display:grid;place-items:center;width:20px;height:20px;flex:0 0 20px;order:2;margin-left:auto;border:0;border-radius:0;background:transparent;color:transparent;transition:color .14s}
    .multi-option[aria-checked=true] .multi-option-mark{background:transparent;border:0;color:var(--cyan)}
    .multi-option-mark i{font-size:17px;line-height:1}.multi-option-label{min-width:0;flex:1}
    #advancedFilterDialog .multi-option-label strong{font-size:11px;font-weight:580;line-height:1.35}
    #advancedFilterDialog .multi-option-label small{font-size:9px;line-height:1.35;margin-top:3px}
    .multi-match-count{padding:8px 11px;margin:0 0 13px;background:var(--cyan-bg);border:1px solid color-mix(in srgb,var(--cyan) 25%,var(--line));border-radius:9px;color:var(--ink);font-size:11px}
    .multi-match-count strong{color:var(--cyan)}
    .filter-popup-footer{padding:15px 24px;background:var(--surface-sub)}
    .filter-popup-footer>span{max-width:48ch;line-height:1.5}
    .multi-date-row{display:none!important}
    .ticket-explorer{margin-bottom:18px}.ticket-explorer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
    .ticket-explorer-head h3{font-size:15px;margin:0}.ticket-explorer-head p{font-size:11px;color:var(--muted);margin:4px 0 0}
    .ticket-explorer-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ticket-explorer-controls input{width:min(340px,70vw)}.ticket-explorer-controls select{width:145px}
    .ticket-explorer-count{font-size:11px;color:var(--muted);margin:0 0 8px}.ticket-explorer-table{max-height:470px;overflow:auto!important}.ticket-explorer-table table{min-width:880px}
    .ticket-id-link{padding:0;border:0;background:transparent;color:var(--cyan);font:600 12px ui-monospace,monospace;text-align:left;cursor:pointer}.ticket-id-link:hover{text-decoration:underline}
    .ticket-detail-row td{background:var(--surface-sub);color:var(--muted);font-size:11px;line-height:1.6}
    @media(max-width:767px){.compact-date-controls{order:3;flex:1 1 100%;justify-content:space-between}.compact-date-field{flex:1;justify-content:space-between}.compact-date-field input{width:min(145px,54vw)}.compact-period-buttons{order:4;flex:1 1 100%}.compact-period-buttons .period-btn{flex:1}.ticket-explorer-controls{width:100%}.ticket-explorer-controls input,.ticket-explorer-controls select{width:100%}}
    @media(max-width:575px){.multi-filter-grid{grid-template-columns:1fr}.multi-filter-options{height:150px}.filter-popup-header,.filter-popup-body,.filter-popup-footer{padding:15px}}
  `;
  document.head.appendChild(style);

  const bar = document.getElementById('compactFilterBar');
  if (!bar) return;
  const dialog = document.getElementById('advancedFilterDialog');
  dialog.querySelector('.multi-date-row')?.remove();
  const matchCount = document.createElement('p');
  matchCount.id = 'filterMatchCount';
  matchCount.className = 'multi-match-count';
  matchCount.setAttribute('role', 'status');
  matchCount.setAttribute('aria-live', 'polite');
  matchCount.innerHTML = '<strong>0</strong> detailed school records match your selection';
  dialog.querySelector('.multi-filter-grid')?.before(matchCount);
  const filterGroups=[...dialog.querySelectorAll('.multi-filter-column')];
  const filterNavigation=document.createElement('div');
  filterNavigation.className='location-filter-navigation';
  filterNavigation.setAttribute('aria-label','Location filter groups');
  ['States','Districts','Blocks','Schools'].forEach((label,index)=>{
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.setAttribute('aria-pressed',String(index===0));
    button.addEventListener('click',()=>{
      filterGroups.forEach((group,position)=>group.hidden=position!==index);
      [...filterNavigation.children].forEach((item,position)=>item.setAttribute('aria-pressed',String(position===index)));
      filterGroups[index].querySelector('input[type=search]')?.focus();
    });filterNavigation.appendChild(button);
  });
  filterGroups.forEach((group,index)=>group.hidden=index!==0);
  matchCount.after(filterNavigation);
  const filterStyle=document.createElement('style');
  filterStyle.textContent=`
    #advancedFilterDialog{width:min(820px,95vw)}
    #advancedFilterDialog .multi-filter-grid{display:block}
    #advancedFilterDialog .multi-filter-column[hidden]{display:none!important}
    #advancedFilterDialog .multi-filter-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;align-content:start;height:310px}
    #advancedFilterDialog .multi-filter-column{background:var(--surface);padding:16px}
    .location-filter-navigation{display:flex;gap:6px;margin:0 0 14px;padding:5px;border-radius:12px;background:var(--surface-sub)}
    .location-filter-navigation button{flex:1;padding:10px 6px;border:0;border-radius:8px;background:transparent;color:var(--muted);font:600 12px inherit;cursor:pointer}
    .location-filter-navigation button[aria-pressed=true]{background:var(--cyan-bg);color:var(--cyan);box-shadow:0 1px 4px #0001}
    @media(max-width:575px){#advancedFilterDialog .multi-filter-options{grid-template-columns:1fr;height:260px}.location-filter-navigation button{font-size:11px}}
  `;
  document.head.appendChild(filterStyle);
  ['state', 'district', 'block', 'school'].forEach(kind => {
    const actions = dialog.querySelector(`[aria-label="Select ${kind === 'block' ? 'blocks' : kind + (kind.endsWith('s') ? '' : 's')}"] .multi-select-actions`);
    const oldLabel = actions?.querySelector('label');
    if (!actions || !oldLabel) return;
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'multi-select-all';
    all.textContent = 'Select all';
    all.addEventListener('click', () => selectAllMulti(kind, true));
    oldLabel.replaceWith(all);
  });
  const periodButtons = bar.querySelector('.compact-period-buttons');
  const dates = document.createElement('div');
  dates.className = 'compact-date-controls';
  dates.setAttribute('aria-label', 'Selected date range');
  dates.innerHTML = '<label class="compact-date-field" for="compactFromDate">From <input id="compactFromDate" type="date" aria-label="From date"></label><label class="compact-date-field" for="compactToDate">To <input id="compactToDate" type="date" aria-label="To date"></label><span id="compactDateError" class="compact-date-error" role="alert" hidden>From date must be on or before To date.</span>';
  if (periodButtons) bar.insertBefore(dates, periodButtons);

  const fromInput = document.getElementById('compactFromDate');
  const toInput = document.getElementById('compactToDate');
  const dateControls = dates;
  function syncDateControls() {
    if (typeof DOM === 'undefined' || !DOM.fDate || !DOM.tDate) return;
    fromInput.value = DOM.fDate.value;
    toInput.value = DOM.tDate.value;
  }
  function applyBarDates() {
    const from = fromInput.value, to = toInput.value;
    const invalid = !from || !to || from > to;
    dateControls.classList.toggle('is-invalid', invalid);
    document.getElementById('compactDateError').hidden = !invalid;
    if (invalid) return;
    DOM.fDate.value = from;
    DOM.tDate.value = to;
    render();
  }
  fromInput.addEventListener('change', applyBarDates);
  toInput.addEventListener('change', applyBarDates);

  if (typeof renderCompactFilterToolbar === 'function') {
    const renderToolbar = renderCompactFilterToolbar;
    renderCompactFilterToolbar = function () { renderToolbar(); syncDateControls(); };
  }
  if (typeof setUsagePeriod === 'function') {
    const setPeriod = setUsagePeriod;
    setUsagePeriod = function (days) { setPeriod(days); syncDateControls(); };
  }

  const explorer = document.createElement('section');
  explorer.className = 'card-surface ticket-explorer';
  explorer.innerHTML = '<div class="ticket-explorer-head"><div><h3>Ticket search</h3><p>Search the selected schools and date range. Sample ticket records are demonstrative.</p></div><div class="ticket-explorer-controls"><label class="visually-hidden" for="ticketExplorerSearch">Search ticket ID or school</label><input id="ticketExplorerSearch" class="form-control" type="search" placeholder="Search ticket ID, school, UDISE, or location"><label class="visually-hidden" for="ticketExplorerStatus">Filter by ticket status</label><select id="ticketExplorerStatus" class="form-select"><option value="all">All statuses</option><option value="open">Open</option><option value="resolved">Resolved</option></select></div></div><div id="ticketExplorerVisuals"></div><p id="ticketExplorerCount" class="ticket-explorer-count" aria-live="polite"></p><div class="ticket-explorer-table"><table class="data-table w-100"><thead><tr><th>Ticket ID</th><th>School</th><th>State / District</th><th>Issue</th><th>Device</th><th>Logged</th><th>Status</th></tr></thead><tbody id="ticketExplorerBody"></tbody></table></div><div class="school-pagination ticket-explorer-pagination"><label>Rows per page <select id="ticketExplorerPageSize"><option>10</option><option>25</option><option>50</option></select></label><span id="ticketExplorerPageInfo"></span><button type="button" id="ticketExplorerPrevPage">Previous</button><button type="button" id="ticketExplorerNextPage">Next</button></div>';
  const complaintView = document.getElementById('view-complaints');
  if (complaintView) complaintView.insertBefore(explorer, complaintView.firstChild);

  const issueNames = ['Display or stylus issue', 'System startup issue', 'Classroom network issue', 'Audio issue', 'Learning content sync issue'];
  let ticketRows = [], ticketPage = 1, ticketPageSize = 10;
  function buildTickets() {
    const schools = typeof nationalScope === 'function' ? nationalScope() : [];
    const today = new Date();
    ticketRows = [];
    schools.forEach(school => {
      const addTicket = (status, index) => {
        const kind = status === 'open' ? 'u' : 'r';
        const ticketSeed = Math.abs(hashStr(school.name + kind + index));
        const date = new Date(today);
        date.setDate(date.getDate() - (status === 'open' ? 0 : ticketSeed % 90));
        const logged = localDateString(date);
        if (logged < DOM.fDate.value || logged > DOM.tDate.value) return;
        const device = school.rec.devices[index % school.rec.devices.length] || { serial: 'Demo device' };
        ticketRows.push({
          id: 'TK-' + ((status === 'open' ? 7000 : 4000) + (ticketSeed % 2900)),
          status, school: school.name, schoolId: school.id, state: school.state, district: school.district,
          issue: issueNames[ticketSeed % issueNames.length], device: device.serial, logged, seed: ticketSeed
        });
      };
      for (let i = 0; i < (school.rec.cmpUnresolved || 0); i++) addTicket('open', i);
      for (let i = 0; i < (school.rec.cmpResolved || 0); i++) addTicket('resolved', i);
    });
    ticketRows.sort((a, b) => (a.status === b.status ? b.logged.localeCompare(a.logged) : a.status === 'open' ? -1 : 1) || a.id.localeCompare(b.id));
  }
  window.toggleTicketDetails = function (id) {
    const row = document.querySelector('[data-ticket-detail="' + CSS.escape(id) + '"]');
    if (row) { row.hidden = !row.hidden; const button = document.querySelector('[data-ticket-toggle="' + CSS.escape(id) + '"]'); if (button) button.setAttribute('aria-expanded', String(!row.hidden)); }
  };
  function renderTicketExplorer() {
    const body = document.getElementById('ticketExplorerBody');
    if (!body || typeof DOM === 'undefined' || !DOM.fDate || typeof nationalBaseSchools === 'undefined') return;
    buildTickets();
    const query = document.getElementById('ticketExplorerSearch').value.trim().toLowerCase();
    const status = document.getElementById('ticketExplorerStatus').value;
    const visible = ticketRows.filter(row => (status === 'all' || row.status === status) && (!query || [row.id, row.school, row.schoolId, row.state, row.district, row.issue, row.device].some(value => value.toLowerCase().includes(query))));
    ticketPage=Math.min(ticketPage,Math.max(1,Math.ceil(visible.length/ticketPageSize)));
    const pageRows=visible.slice((ticketPage-1)*ticketPageSize,ticketPage*ticketPageSize);
    document.getElementById('ticketExplorerCount').textContent = visible.length.toLocaleString('en-IN') + ' ticket' + (visible.length === 1 ? '' : 's') + ' in the selected scope and date range';
    const openCount=visible.filter(row=>row.status==='open').length,resolvedCount=visible.length-openCount;
    const issues=new Map();visible.forEach(row=>issues.set(row.issue,(issues.get(row.issue)||0)+1));
    const issueRows=[...issues.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6),maxIssue=Math.max(1,...issueRows.map(row=>row[1]));
    document.getElementById('ticketExplorerVisuals').innerHTML='<div class="detail-visual-kpis"><div class="detail-visual-kpi"><span>Tickets shown</span><strong>'+visible.length.toLocaleString('en-IN')+'</strong></div><div class="detail-visual-kpi"><span>Open</span><strong>'+openCount.toLocaleString('en-IN')+'</strong></div><div class="detail-visual-kpi"><span>Resolved</span><strong>'+resolvedCount.toLocaleString('en-IN')+'</strong></div></div><section class="detail-chart-panel"><h3>Tickets by issue</h3><p>Breakdown of the currently visible ticket results.</p><div class="detail-bar-list">'+(issueRows.length?issueRows.map(([label,value])=>'<div class="detail-bar-row"><span class="detail-bar-label" title="'+escapeHtml(label)+'">'+escapeHtml(label)+'</span><span class="detail-bar-track" role="img" aria-label="'+escapeHtml(label+': '+value)+'"><span style="width:'+Math.max(3,value/maxIssue*100)+'%"></span></span><span class="detail-bar-value">'+value+'</span></div>').join(''):'<p class="dashboard-detail-note mb-0">No tickets match this search.</p>')+'</div></section>';
    body.innerHTML = pageRows.length ? pageRows.map(row => { const detailKey = row.id + '-' + row.schoolId; return '<tr><td><button type="button" class="ticket-id-link" data-ticket-toggle="' + escapeHtml(detailKey) + '" aria-expanded="false" onclick="toggleTicketDetails(\'' + escapeHtml(detailKey) + '\')">' + escapeHtml(row.id) + '</button></td><td>' + escapeHtml(row.school) + '<small class="d-block text-muted">' + escapeHtml(row.schoolId) + '</small></td><td>' + escapeHtml(row.state + ' / ' + row.district) + '</td><td>' + escapeHtml(row.issue) + '</td><td class="font-mono">' + escapeHtml(row.device) + '</td><td>' + escapeHtml(new Date(row.logged + 'T00:00:00').toLocaleDateString('en-IN')) + '</td><td><span class="status-badge ' + (row.status === 'open' ? 'status-inactive' : 'status-active') + '">' + (row.status === 'open' ? 'Open' : 'Resolved') + '</span></td></tr><tr class="ticket-detail-row" data-ticket-detail="' + escapeHtml(detailKey) + '" hidden><td colspan="7"><strong>' + escapeHtml(row.id) + '</strong> · ' + escapeHtml(row.issue) + ' reported for ' + escapeHtml(row.school) + ' (' + escapeHtml(row.schoolId) + '). Device ' + escapeHtml(row.device) + '. ' + (row.status === 'open' ? 'This sample ticket is pending resolution.' : 'This sample ticket is marked resolved.') + '</td></tr>'; }).join('') : '<tr><td colspan="7" class="text-center py-4 text-muted">No sample tickets match this search and date range.</td></tr>';
    document.getElementById('ticketExplorerPageSize').value=String(ticketPageSize);
    document.getElementById('ticketExplorerPageInfo').textContent=visible.length?((ticketPage-1)*ticketPageSize+1)+'–'+Math.min(ticketPage*ticketPageSize,visible.length)+' of '+visible.length:'0 records';
    document.getElementById('ticketExplorerPrevPage').disabled=ticketPage<=1;
    document.getElementById('ticketExplorerNextPage').disabled=ticketPage*ticketPageSize>=visible.length;
  }
  window.renderTicketExplorer = renderTicketExplorer;
  document.getElementById('ticketExplorerSearch').addEventListener('input',()=>{ticketPage=1;renderTicketExplorer();});
  document.getElementById('ticketExplorerStatus').addEventListener('change',()=>{ticketPage=1;renderTicketExplorer();});
  document.getElementById('ticketExplorerPageSize').addEventListener('change',event=>{ticketPageSize=Number(event.target.value);ticketPage=1;renderTicketExplorer();});
  document.getElementById('ticketExplorerPrevPage').addEventListener('click',()=>{ticketPage--;renderTicketExplorer();});
  document.getElementById('ticketExplorerNextPage').addEventListener('click',()=>{ticketPage++;renderTicketExplorer();});

  const existingRender = render;
  render = function () { existingRender(); syncDateControls(); renderTicketExplorer(); };
  window.openSupportTicketExplorer = function () {
    switchTab('view-complaints');
    document.getElementById('ticketExplorerSearch').focus({ preventScroll: true });
    explorer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  syncDateControls();
  renderTicketExplorer();
})();
