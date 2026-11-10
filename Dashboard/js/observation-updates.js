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

  const ticketDetailsData = [
    {
      num: 1,
      ticket: 'DL000796',
      incidentType: "Display Issue - No light in Screen and it's not work",
      loggedOn: '2026-11-05 11:38:51',
      closedOn: '2026-11-06 16:17:15',
      slaDays: '0 Days',
      slaCost: '₹0',
      udiseCode: '7020100705',
      schoolName: 'SKV BURARI',
      deviceType: 'K-Yan',
      deviceId: '602PMEM023348',
      engineerAssigned: 'SNET',
      team: 'Customer Care',
      partner: 'LG',
      serviceCategory: 'K-Yan - 75TR3DK-i',
      project: 'Smart_Classroom_1405_Delhi',
      zoneName: 'Delhi',
      closureReport: 'Report PDF'
    },
    {
      num: 2,
      ticket: 'DL000795',
      incidentType: 'Speaker Issue - Sound is distorted and not audible',
      loggedOn: '2026-11-05 11:35:53',
      closedOn: '2026-11-06 16:17:10',
      slaDays: '0 Days',
      slaCost: '₹0',
      udiseCode: '7020100705',
      schoolName: 'SKV BURARI',
      deviceType: 'K-Yan',
      deviceId: '602PMND023663',
      engineerAssigned: 'SNET',
      team: 'Customer Care',
      partner: 'LG',
      serviceCategory: 'K-Yan - 75TR3DK-i',
      project: 'Smart_Classroom_1405_Delhi',
      zoneName: 'Delhi',
      closureReport: 'Report PDF'
    },
    {
      num: 3,
      ticket: 'DL000794',
      incidentType: 'App Issue - Not working properly,<br> PC is not opening at all and android is working some time, problem in YouTube.',
      loggedOn: '2026-11-05 11:31:12',
      closedOn: '2026-11-06 16:17:05',
      slaDays: '0 Days',
      slaCost: '₹0',
      udiseCode: '7020100705',
      schoolName: 'SKV BURARI',
      deviceType: 'K-Yan',
      deviceId: '602PMZR024085',
      engineerAssigned: 'SNET',
      team: 'Customer Care',
      partner: 'LG',
      serviceCategory: 'K-Yan - 75TR3DK-i',
      project: 'Smart_Classroom_1405_Delhi',
      zoneName: 'Delhi',
      closureReport: 'Report PDF'
    },
    {
      num: 4,
      ticket: 'DL000791',
      incidentType: 'Hinges loose or damaged - Cabinet is loose',
      loggedOn: '2026-11-02 14:23:19',
      closedOn: '2026-11-03 12:07:34',
      slaDays: '0 Days',
      slaCost: '₹0',
      udiseCode: '7010104501',
      schoolName: 'CM SHRI SCHOOL SECTOR-02 ROHINI',
      deviceType: 'K-Yan',
      deviceId: 'CBNTSCR2026204',
      engineerAssigned: 'SNET',
      team: 'Customer Care',
      partner: 'Cabinet',
      serviceCategory: 'K-Yan',
      project: 'Smart_Classroom_1405_Delhi',
      zoneName: 'Delhi',
      closureReport: 'Report PDF'
    },
    {
      num: 5,
      ticket: 'DL000790',
      incidentType: 'Other - UPS is not working',
      loggedOn: '2026-11-02 14:20:59',
      closedOn: '2026-11-03 12:10:45',
      slaDays: '0 Days',
      slaCost: '₹0',
      udiseCode: '7010104501',
      schoolName: 'CM SHRI SCHOOL SECTOR-02 ROHINI',
      deviceType: 'UPS',
      deviceId: 'M0316K2503699',
      engineerAssigned: 'SNET',
      team: 'Customer Care',
      partner: 'BPE',
      serviceCategory: 'BP1000',
      project: 'Smart_Classroom_1405_Delhi',
      zoneName: 'Delhi',
      closureReport: 'Report PDF'
    },
    {
      num: 6,
      ticket: 'DL000789',
      incidentType: 'OS Issue - OPS Windows not working',
      loggedOn: '2026-11-02 14:15:43',
      closedOn: '2026-11-03 12:10:18',
      slaDays: '0 Days',
      slaCost: '₹0',
      udiseCode: '7010104501',
      schoolName: 'CM SHRI SCHOOL SECTOR-02 ROHINI',
      deviceType: 'K-Yan',
      deviceId: 'XVX260812194',
      engineerAssigned: 'SNET',
      team: 'Customer Care',
      partner: 'View Sonic',
      serviceCategory: 'OPS- VS19531',
      project: 'Smart_Classroom_1405_Delhi',
      zoneName: 'Delhi',
      closureReport: 'Report PDF'
    }
  ];

  window.renderTicketDetailsTable = function () {
    const tbody = document.getElementById('ticketDetailBody');
    if (!tbody) return;

    const query = (document.getElementById('ticketDetailSearchInput')?.value || '').toLowerCase().trim();
    const limit = parseInt(document.getElementById('ticketDetailEntriesSelect')?.value || '10', 10);

    let rows = ticketDetailsData;
    if (query) {
      rows = rows.filter(r => [
        r.ticket, r.incidentType, r.udiseCode, r.schoolName, r.deviceType,
        r.deviceId, r.engineerAssigned, r.partner, r.serviceCategory, r.project, r.zoneName
      ].some(val => String(val).toLowerCase().includes(query)));
    }

    const total = rows.length;
    const paginated = rows.slice(0, limit);

    const deviceBadge = type => {
      if (type === 'K-Yan' || type === 'k-yan' || type === 'K-YAN' || type === 'IFP' || type === 'Cabinet' || type === 'OPS') {
        return '<span class="badge d-inline-flex align-items-center gap-1" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-weight:600; padding:3px 7px; border-radius:6px; font-size:11px;"><i class="bi bi-display"></i> K-Yan</span>';
      }
      if (type === 'UPS') {
        return '<span class="badge d-inline-flex align-items-center gap-1" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; font-weight:600; padding:3px 7px; border-radius:6px; font-size:11px;"><i class="bi bi-gear"></i> UPS</span>';
      }
      return type;
    };

    tbody.innerHTML = paginated.length ? paginated.map(r => `
      <tr style="border-bottom:1px solid var(--line);">
        <td style="padding:10px 12px; text-align:center; font-weight:600; color:var(--muted); font-size:11.5px;">${r.num}</td>
        <td style="padding:10px 12px; font-weight:700; color:var(--ink); white-space:nowrap; font-size:12px;">${r.ticket}</td>
        <td style="padding:10px 12px;">
          <span class="badge text-start text-wrap" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1; font-weight:500; font-size:11px; padding:4px 9px; border-radius:12px; line-height:1.45; max-width:400px; display:inline-block;">${r.incidentType}</span>
        </td>
        <td style="padding:10px 12px; white-space:nowrap; font-weight:500; font-family:monospace; font-size:11.5px; color:var(--ink);">${r.loggedOn}</td>
        <td style="padding:10px 12px; white-space:nowrap; font-weight:500; font-family:monospace; font-size:11.5px; color:var(--ink);">${r.closedOn}</td>
        <td style="padding:10px 12px; font-weight:700; white-space:nowrap; color:var(--ink); font-size:12px;"><strong>0</strong> Days</td>
        <td style="padding:10px 12px; font-weight:600; white-space:nowrap; color:var(--ink); font-size:12px;">${r.slaCost}</td>
        <td style="padding:10px 12px; font-weight:700; white-space:nowrap; color:var(--ink); font-family:monospace; font-size:12px;">${r.udiseCode}</td>
        <td style="padding:10px 12px; font-weight:700; color:var(--ink); font-size:11.5px; white-space:nowrap;">${r.schoolName}</td>
        <td style="padding:10px 12px; white-space:nowrap;">${deviceBadge(r.deviceType)}</td>
        <td style="padding:10px 12px; font-weight:700; font-family:monospace; font-size:11.5px; white-space:nowrap; color:var(--ink);">${r.deviceId}</td>
        <td style="padding:10px 12px; font-weight:600; color:var(--muted); font-size:11.5px; white-space:nowrap;">${r.engineerAssigned}</td>
        <td style="padding:10px 12px; white-space:nowrap;">
          <span class="badge" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1; font-weight:500; padding:3px 9px; border-radius:12px; font-size:11px;">${r.team}</span>
        </td>
        <td style="padding:10px 12px; font-weight:600; font-size:11.5px; color:var(--ink); white-space:nowrap;">${r.partner}</td>
        <td style="padding:10px 12px; white-space:nowrap;">
          <span class="badge" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1; font-weight:500; padding:3px 8px; border-radius:6px; font-size:11px;">${r.serviceCategory}</span>
        </td>
        <td style="padding:10px 12px; white-space:nowrap;">
          <span class="badge" style="background:#dbeafe; color:#1d4ed8; font-weight:600; padding:3px 9px; border-radius:12px; font-size:11px;">${r.project}</span>
        </td>
        <td style="padding:10px 12px; font-weight:700; color:var(--ink); white-space:nowrap; font-size:12px;">${r.zoneName}</td>
        <td style="padding:10px 12px; text-align:center; white-space:nowrap;">
          <button type="button" class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" style="font-size:11px; padding:2px 8px; border-radius:6px; border-color:#cbd5e1; color:#475569; background:#fff;" onclick="exportSingleClosureReport('${r.ticket}')">
            <i class="bi bi-file-earmark-pdf"></i> Report PDF
          </button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="18" class="text-center py-4 text-muted">No tickets match this filter.</td></tr>';

    const info = document.getElementById('ticketDetailEntriesInfo');
    if (info) {
      info.textContent = total ? `Showing 1 to ${Math.min(limit, total)} of ${total} entries` : '0 entries';
    }
  };

  window.exportTicketDetailsTable = function (format) {
    if (typeof exportTableReport === 'function') {
      exportTableReport('ticketDetailTable', format, 'Support tickets details');
    }
  };

  window.exportSingleClosureReport = function (ticketId) {
    if (typeof exportTableReport === 'function') {
      exportTableReport('ticketDetailTable', 'pdf', 'Closure Report - ' + ticketId);
    }
  };

  const issueNames = ['Display or stylus issue', 'System startup issue', 'Classroom network issue', 'Audio issue', 'Learning content sync issue'];
  let ticketRows = [];
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
        if (typeof DOM !== 'undefined' && DOM.fDate && DOM.tDate && (logged < DOM.fDate.value || logged > DOM.tDate.value)) return;
        const device = (school.rec && school.rec.devices && school.rec.devices[index % school.rec.devices.length]) || { serial: 'Demo device' };
        ticketRows.push({
          id: 'TK-' + ((status === 'open' ? 7000 : 4000) + (ticketSeed % 2900)),
          status, school: school.name, schoolId: school.id, state: school.state, district: school.district,
          issue: issueNames[ticketSeed % issueNames.length], device: device.serial, logged, seed: ticketSeed
        });
      };
      for (let i = 0; i < ((school.rec && school.rec.cmpUnresolved) || 0); i++) addTicket('open', i);
      for (let i = 0; i < ((school.rec && school.rec.cmpResolved) || 0); i++) addTicket('resolved', i);
    });
    ticketRows.sort((a, b) => (a.status === b.status ? b.logged.localeCompare(a.logged) : a.status === 'open' ? -1 : 1) || a.id.localeCompare(b.id));
  }

  let ticketPage = 1;
  let ticketPageSize = 10;

  function renderTicketExplorer() {
    const visuals = document.getElementById('ticketExplorerVisuals');
    if (!visuals) return;
    buildTickets();
    const searchEl = document.getElementById('ticketExplorerSearch');
    const statusEl = document.getElementById('ticketExplorerStatus');
    const query = (searchEl?.value || '').trim().toLowerCase();
    const status = statusEl?.value || 'all';
    const visible = ticketRows.filter(row => (status === 'all' || row.status === status) && (!query || [row.id, row.school, row.schoolId, row.state, row.district, row.issue, row.device].some(value => value.toLowerCase().includes(query))));
    const openCount = visible.filter(row => row.status === 'open').length;
    const resolvedCount = visible.length - openCount;
    const issues = new Map();
    visible.forEach(row => issues.set(row.issue, (issues.get(row.issue) || 0) + 1));
    const issueRows = [...issues.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxIssue = Math.max(1, ...issueRows.map(row => row[1]));

    const formatTicketDate = str => {
      if (!str) return '';
      const p = String(str).split('-');
      return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0]) : str;
    };

    const isPopup = Boolean(document.getElementById('dashboardDetailDialog')?.contains(visuals) || document.getElementById('dashboardDetailDialog')?.open);

    const total = visible.length;
    const totalPages = Math.max(1, Math.ceil(total / ticketPageSize));
    if (ticketPage > totalPages) ticketPage = totalPages;
    if (ticketPage < 1) ticketPage = 1;
    const startIdx = (ticketPage - 1) * ticketPageSize;
    const endIdx = Math.min(startIdx + ticketPageSize, total);
    const pageRows = visible.slice(startIdx, endIdx);

        let tableHtml = '';
    if (isPopup) {
      tableHtml = '<p class="dashboard-detail-note mt-3 mb-2" style="font-size:12.5px; color:var(--muted); font-weight:500;">' + visible.length.toLocaleString('en-IN') + ' tickets in the selected scope and date range</p>';
    }

    visuals.innerHTML = '<div class="detail-visual-kpis"><div class="detail-visual-kpi"><span>Tickets shown</span><strong id="ticketKpiShown">' + visible.length.toLocaleString('en-IN') + '</strong></div><div class="detail-visual-kpi"><span>Open</span><strong id="ticketKpiOpen">' + openCount.toLocaleString('en-IN') + '</strong></div><div class="detail-visual-kpi"><span>Resolved</span><strong id="ticketKpiResolved">' + resolvedCount.toLocaleString('en-IN') + '</strong></div></div><section class="detail-chart-panel mb-0"><h3>Tickets by issue</h3><p>Breakdown of the currently visible ticket results.</p><div class="detail-bar-list" id="ticketIssueBarList">' + (issueRows.length ? issueRows.map(([label, value]) => '<div class="detail-bar-row"><span class="detail-bar-label" title="' + escapeHtml(label) + '">' + escapeHtml(label) + '</span><span class="detail-bar-track" role="img" aria-label="' + escapeHtml(label + ': ' + value) + '"><span style="width:' + Math.max(3, (value / maxIssue) * 100) + '%"></span></span><span class="detail-bar-value">' + value + '</span></div>').join('') : '<p class="dashboard-detail-note mb-0">No tickets match this search.</p>') + '</div></section>' + tableHtml;

    if (isPopup) {
      const sizeSel = document.getElementById('ticketPageSize');
      if (sizeSel) {
        sizeSel.onchange = e => {
          ticketPageSize = Number(e.target.value) || 10;
          ticketPage = 1;
          renderTicketExplorer();
        };
      }
      const prev = document.getElementById('ticketPrevPage');
      if (prev) {
        prev.onclick = () => {
          if (ticketPage > 1) {
            ticketPage--;
            renderTicketExplorer();
          }
        };
      }
      const next = document.getElementById('ticketNextPage');
      if (next) {
        next.onclick = () => {
          if (ticketPage < totalPages) {
            ticketPage++;
            renderTicketExplorer();
          }
        };
      }
    }
  }

  window.renderTicketExplorer = renderTicketExplorer;
  document.getElementById('ticketExplorerSearch')?.addEventListener('input', () => {
    ticketPage = 1;
    renderTicketExplorer();
  });
  document.getElementById('ticketExplorerStatus')?.addEventListener('change', () => {
    ticketPage = 1;
    renderTicketExplorer();
  });

  const existingRender = render;
  render = function () { existingRender(); syncDateControls(); if (typeof renderTicketExplorer === 'function') renderTicketExplorer(); if (typeof renderTicketDetailsTable === 'function') renderTicketDetailsTable(); };
  window.openSupportTicketExplorer = function () {
    if (typeof openDashboardDetail === 'function') {
      openDashboardDetail('tickets');
    } else {
      switchTab('view-complaints');
    }
  };
  syncDateControls();
  if (typeof renderTicketDetailsTable === 'function') renderTicketDetailsTable();

  window.setSupportTicketView = function (view) {
    const isLocation = (view === 'location');
    const tabLoc = document.getElementById('supportTabLocation');
    const tabDet = document.getElementById('supportTabDetails');
    const panelLoc = document.getElementById('supportLocationPanel');
    const panelDet = document.getElementById('supportDetailsPanel');

    if (tabLoc) {
      tabLoc.setAttribute('aria-selected', String(isLocation));
      tabLoc.tabIndex = isLocation ? 0 : -1;
    }
    if (tabDet) {
      tabDet.setAttribute('aria-selected', String(!isLocation));
      tabDet.tabIndex = !isLocation ? 0 : -1;
    }
    if (panelLoc) panelLoc.hidden = !isLocation;
    if (panelDet) {
      panelDet.hidden = isLocation;
      if (!isLocation && typeof renderTicketDetailsTable === 'function') {
        renderTicketDetailsTable();
      }
    }
    if (isLocation && typeof renderNationalTable === 'function') {
      renderNationalTable('view-complaints', typeof nationalScope === 'function' ? nationalScope() : []);
    }
  };

  window.supportTabKey = function (event, view) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'location' : event.key === 'End' ? 'details' : (view === 'location' ? 'details' : 'location');
    setSupportTicketView(next);
    const targetTab = document.getElementById(next === 'location' ? 'supportTabLocation' : 'supportTabDetails');
    if (targetTab) targetTab.focus();
  };
})();
