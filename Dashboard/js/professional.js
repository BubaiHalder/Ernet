/* Presentation and exports for the static client demonstration. No production security claims. */
'use strict';

const WORKSPACE_PAGES = {
  'view-overview': ['Programme overview', 'A central view of device activity, learning resource usage, and school performance.'],
  'view-device': ['Device monitoring', 'Explore device activity by district, zone, school, and classroom.'],
  'view-app': ['Application usage', 'Understand how classroom applications are used across the selected schools.'],
  'view-content': ['Learning content', 'Explore subject, class, school, and teacher usage, with downloadable reports.'],
  'view-reports': ['Reports & analytics', 'Access device uptime, content usage, training, and operational reports.'],
  'view-complaints': ['Support tickets', 'Review sample complaints and school support activity.'],
  'view-audit': ['Activity logs', 'Review sample user events and exports from this demonstration session.'],
};

function updateWorkspaceHeading(viewId) {
  const page = WORKSPACE_PAGES[viewId] || WORKSPACE_PAGES['view-overview'];
  document.getElementById('workspaceTitle').textContent = page[0];
  document.getElementById('workspaceSubtitle').textContent = page[1];
  document.querySelectorAll('#mainTabs .nav-link').forEach(link => {
    if (link.dataset.target === viewId) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updatePresentationSummary(scope) {
  const sum = field => scope.reduce((total, school) => total + (school.rec[field] || 0), 0);
  const count = sum('ifpTotal');
  const ratios = getDateSeedRatios(DOM.fDate.value, DOM.tDate.value, 'ALL', 'ALL', 'ALL');
  document.getElementById('summarySchools').textContent = scope.length.toLocaleString('en-IN');
  document.getElementById('summaryDevices').textContent = count.toLocaleString('en-IN');
  document.getElementById('summaryActivity').textContent = count ? Math.round(ratios.ifpActRatio * 100) + '%' : '—';
  document.getElementById('summaryTickets').textContent = sum('cmpUnresolved').toLocaleString('en-IN');
}

function localDateString(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function setUsagePeriod(days) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  DOM.fDate.value = localDateString(start);
  DOM.tDate.value = localDateString(end);
  document.querySelectorAll('[data-period]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.period) === days)));
  document.getElementById('filterForm').requestSubmit();
}

function showPrototypeMessage(message) {
  document.querySelector('.toast-message')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 6000);
}


// Clear, flat charts replace the extruded 3D pies without changing the original data engine.
ThreeDPieChart.prototype.draw = function () {
  if (!this.ensureContext()) return;
  const canvas = this.canvas, ctx = this.ctx;
  const size = 84, dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.width = canvas.style.height = size + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  const values = this.data.map(value => Math.max(0, Number(value) || 0));
  const total = values.reduce((a, b) => a + b, 0);
  const palettes = {
    ifpChart: ['#3479b9', '#8376b8', '#c16b71', '#c3a062', '#3a917c'],
    opsChart: ['#8376b8', '#ccd5e1'],
    cmpChart: ['#3a917c', '#c16b71'],
    appChart: ['#c16b71', '#3479b9', '#c3a062', '#3a917c', '#8376b8', '#a6b4c6']
  };
  const palette = palettes[this.canvasId] || this.colors;
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#dce3ec';
  ctx.beginPath(); ctx.arc(42, 42, 31, 0, Math.PI * 2); ctx.stroke();
  let angle = -Math.PI / 2;
  if (total) values.forEach((value, index) => {
    if (!value) return;
    const next = angle + value / total * Math.PI * 2;
    ctx.beginPath(); ctx.strokeStyle = palette[index % palette.length];
    ctx.arc(42, 42, 31, angle, next); ctx.stroke(); angle = next;
  });
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${this.canvasId.replace('Chart', '')} sample distribution: ${values.join(', ')}`);
};

function reportRows(table) {
  return Array.from(table.rows).filter(row => row.cells.length && !Array.from(row.cells).some(cell => cell.colSpan > 1))
    .map(row => Array.from(row.cells).map(cell => cell.textContent.replace(/\s+/g, ' ').trim()));
}

function saveReport(bytes, filename, type) {
  const blob = new Blob([bytes], {type});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function xmlEscape(value) {
  return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;'}[char]));
}

function columnName(index) {
  let name = '';
  do { name = String.fromCharCode(65 + index % 26) + name; index = Math.floor(index / 26) - 1; } while (index >= 0);
  return name;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// An uncompressed ZIP package keeps genuine XLSX export independent of external scripts.
function zipPackage(files) {
  const encoder = new TextEncoder(), chunks = [], directory = [];
  let offset = 0, directorySize = 0;
  for (const [path, content] of Object.entries(files)) {
    const name = encoder.encode(path), data = encoder.encode(content), crc = crc32(data);
    const header = new Uint8Array(30 + name.length), view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true);
    view.setUint16(10, 0, true); view.setUint16(12, 33, true);
    view.setUint32(14, crc, true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true); header.set(name, 30);
    const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(14, 33, true); cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); central.set(name, 46);
    chunks.push(header, data); directory.push(central);
    offset += header.length + data.length; directorySize += central.length;
  }
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, directory.length, true); ev.setUint16(10, directory.length, true);
  ev.setUint32(12, directorySize, true); ev.setUint32(16, offset, true);
  const result = new Uint8Array(offset + directorySize + end.length);
  let cursor = 0;
  for (const chunk of [...chunks, ...directory, end]) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}

function makeWorkbook(rows, title, context) {
  const values = [[title], ['ERNET India | Client preview | Sample data'], [context], [], ...rows];
  const sheetRows = values.map((row, index) => `<row r="${index + 1}">${row.map((value, col) => `<c r="${columnName(col)}${index + 1}" t="inlineStr" s="${index === 0 || index === 4 ? 1 : 0}"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`).join('')}</row>`).join('');
  const maxColumns = Math.max(1, ...rows.map(row => row.length));
  const cols = Array.from({length:maxColumns}, (_, i) => `<col min="${i + 1}" max="${i + 1}" width="${i ? 32 : 42}" customWidth="1"/>`).join('');
  const ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  return zipPackage({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': `<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml': `<styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    'xl/worksheets/sheet1.xml': `<worksheet xmlns="${ns}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="5" topLeftCell="A6" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${sheetRows}</sheetData></worksheet>`
  });
}

function pdfText(value) {
  return String(value).replace(/[–—]/g, '-').replace(/[^\x20-\x7e]/g, '?').replace(/[\\()]/g, char => '\\' + char);
}

function wrapReportLine(value, limit = 92) {
  const words = String(value).split(/\s+/), lines = [];
  let line = '';
  for (let word of words) {
    if (line && line.length + word.length + 1 > limit) { lines.push(line); line = ''; }
    while (word.length > limit) { if (line) { lines.push(line); line = ''; } lines.push(word.slice(0, limit)); word = word.slice(limit); }
    line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  return lines;
}

function makePdf(rows, title, context) {
  const headers = rows[0] || [], lines = [];
  rows.slice(1).forEach((row, index) => {
    lines.push(`Record ${index + 1}`);
    row.forEach((value, col) => lines.push(...wrapReportLine(`${headers[col] || 'Value'}: ${value}`)));
    lines.push('');
  });
  if (!lines.length) lines.push('No records in this view.');
  const pages = [];
  for (let i = 0; i < lines.length; i += 48) pages.push(lines.slice(i, i + 48));
  const objects = ['', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const kids = [];
  pages.forEach((page, index) => {
    const pageId = objects.length + 1, streamId = pageId + 1;
    kids.push(`${pageId} 0 R`);
    const contextLines = wrapReportLine(context, 88).slice(0, 2);
    const content = `BT /F1 16 Tf 42 793 Td (${pdfText(title)}) Tj /F1 9 Tf 0 -22 Td (ERNET India | Client preview | Sample data) Tj ${contextLines.map(line => `0 -13 Td (${pdfText(line)}) Tj`).join(' ')} 0 -24 Td /F1 10 Tf 14 TL ${page.map(line => `(${pdfText(line)}) Tj T*`).join('\n')} ET\nBT /F1 9 Tf 42 28 Td (Page ${index + 1} of ${pages.length}) Tj ET`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamId} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });
  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${kids.length} >>`;
  let pdf = '%PDF-1.4\n', offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { pdf += String(offset).padStart(10, '0') + ' 00000 n \n'; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

function exportTableReport(tableId, format, title) {
  const table = document.getElementById(tableId);
  if (!table) return showPrototypeMessage('The selected report is unavailable.');
  const rows = reportRows(table);
  if (rows.length < 2) return showPrototypeMessage('No records match this view. Adjust the filters and try again.');
  const context = `Scope: ${DOM.state.value === 'ALL' ? 'All available states (Delhi demo)' : DOM.state.value} | Dates: ${DOM.fDate.value} to ${DOM.tDate.value} | School ID: ${DOM.schId.value || 'All'} | Exported: ${localDateString(new Date())}`;
  const name = 'ERNET_' + title.replace(/[^a-zA-Z0-9]+/g, '_');
  if (format === 'excel') saveReport(makeWorkbook(rows, title, context), name + '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  else saveReport(makePdf(rows, title, context), name + '.pdf', 'application/pdf');
  addAuditLogEntry(`Exported ${title} (${format === 'excel' ? 'XLSX' : 'PDF'})`, 'Demo export');
  showPrototypeMessage(`${format === 'excel' ? 'Excel' : 'PDF'} report downloaded with the rows currently displayed.`);
}

// Replace placeholder export handlers with exports of the current searched/drilled table.
exportCustomReport = function (format) {
  exportTableReport('customReportTable', format, `${currentCustomReportType.charAt(0).toUpperCase() + currentCustomReportType.slice(1)} usage report`);
};
exportAuditLogs = function (format) { exportTableReport('auditLogTable', format, 'Activity logs'); };
function exportAppUsageTable() { exportTableReport('applicationUsageTable', 'excel', 'Application usage'); }

document.getElementById('customReportTbody').closest('table').id = 'customReportTable';
document.getElementById('auditTbody').closest('table').id = 'auditLogTable';
document.getElementById('appTbody').closest('table').id = 'applicationUsageTable';

const previousFilterSubmit = document.getElementById('filterForm').onsubmit;
document.getElementById('filterForm').onsubmit = function (event) {
  if (DOM.fDate.value && DOM.tDate.value && DOM.fDate.value > DOM.tDate.value) {
    event.preventDefault(); showPrototypeMessage('From date must be on or before To date.'); return;
  }
  if (previousFilterSubmit) previousFilterSubmit.call(this, event);
};
DOM.state.addEventListener('change', () => render());
[DOM.fDate, DOM.tDate].forEach(input => input.addEventListener('change', () => {
  document.querySelectorAll('[data-period]').forEach(button => button.setAttribute('aria-pressed', 'false'));
}));
document.getElementById('resetBtn').addEventListener('click', () => {
  document.querySelectorAll('[data-period]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.period === '1')));
});
document.querySelectorAll('.report-card[onclick],.report-card[data-bs-toggle],.kpi-card-highlight[onclick]').forEach(card => {
  card.tabIndex = 0; card.setAttribute('role', 'button');
  card.addEventListener('keydown', event => {
    if (event.target === card && ['Enter', ' '].includes(event.key)) { event.preventDefault(); card.click(); }
  });
});
document.querySelectorAll('a[onclick]:not([href])').forEach(link => {
  link.tabIndex = 0; link.setAttribute('role', 'button');
  link.addEventListener('keydown', event => { if (['Enter',' '].includes(event.key)) { event.preventDefault(); link.click(); } });
});
new MutationObserver(() => [ifpChart, opsChart, cmpChart, appChart].forEach(chart => chart.draw()))
  .observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
const originalTrainingRender = renderTeacherTrainingTable;
renderTeacherTrainingTable = function () {
  originalTrainingRender();
  document.getElementById('trainingTeachers').textContent = TEACHER_TRAINING_SCHOOL_SUMMARY.reduce((sum, row) => sum + (parseInt(row.trained, 10) || 0), 0).toLocaleString('en-IN');
  document.getElementById('trainingSchools').textContent = TEACHER_TRAINING_SCHOOL_SUMMARY.length;
  document.getElementById('trainingRecords').textContent = TEACHER_TRAINING_DETAILS.length;
  document.getElementById('trainingModules').textContent = new Set(TEACHER_TRAINING_DETAILS.map(row => row.training)).size;
};
updateWorkspaceHeading(currentView);
render();
