/* School device-use rankings: prototype telemetry, shared geography and date scope. */
(function () {
  'use strict';
  let displayed = {top: [], bottom: []};
  let rankingsOpen = false;
  function compareIdentity(a, b) {
    return [a.school.name, a.school.state, a.school.district, a.school.block, a.school.udise, a.school.id].join('|').localeCompare([b.school.name, b.school.state, b.school.district, b.school.block, b.school.udise, b.school.id].join('|'), 'en');
  }
  function calculate(scope, dayCount, metricFn) {
    const days = Math.max(1, dayCount);
    const rows = scope.map(school => {
      const metrics = metricFn([school]);
      return {school, metrics, average: metrics.devices ? metrics.hours / metrics.devices / days : 0};
    }).filter(row => row.metrics.devices > 0);
    const top = [...rows].sort((a, b) => b.average - a.average || compareIdentity(a, b)).slice(0, 10);
    const bottom = [...rows].sort((a, b) => a.average - b.average || compareIdentity(a, b)).slice(0, 10);
    const devices = rows.reduce((sum, row) => sum + row.metrics.devices, 0);
    const active = rows.reduce((sum, row) => sum + row.metrics.active, 0);
    const hours = rows.reduce((sum, row) => sum + row.metrics.hours, 0);
    return {top, bottom, count: rows.length, excluded: scope.length - rows.length,
      zeroUsage: rows.filter(row => row.metrics.hours === 0).length,
      average: devices ? hours / devices / days : 0, activity: devices ? Math.round(active / devices * 100) : 0};
  }
  window.calculateSchoolRankings = calculate;
  function mount() {
    let host = document.getElementById('schoolRankingsCard');
    if (host) return host;
    const previous = document.getElementById('nationalPerformanceCard');
    if (!previous) return null;
    host = document.createElement('section');
    host.id = 'schoolRankingsCard';
    host.className = 'card-surface school-rankings';
    host.setAttribute('aria-labelledby', 'schoolRankingsTitle');
    previous.insertAdjacentElement('afterend', host);
    return host;
  }
  function panel(rows, kind) {
    const title = kind === 'top' ? 'Top 10 Performers' : 'Bottom 10 Performers';
    const caption = kind === 'top' ? 'Highest average daily device use' : 'Lowest average daily device use';
    return '<section class="school-ranking-panel ' + kind + '" aria-labelledby="ranking-' + kind + '-title"><div class="school-ranking-heading"><div><h3 id="ranking-' + kind + '-title">' + title + '</h3><p>' + caption + '</p></div><span class="school-ranking-count">' + rows.length + ' schools</span></div><div class="table-responsive"><table class="data-table school-ranking-table"><thead><tr><th scope="col">Rank</th><th scope="col">School</th><th scope="col">Avg. daily use / device</th><th scope="col">Device activity</th></tr></thead><tbody>' + (rows.length ? rows.map((row, index) => {
      const s = row.school;
      const location = [s.state, s.district, s.block].filter(Boolean).join(' / ');
      return '<tr><td><span class="school-ranking-position">' + (index + 1) + '</span></td><td><button class="national-drill-link" type="button" onclick="openRankedSchool(\'' + kind + '\',' + index + ')">' + escapeHtml(s.name) + ' <i class="bi bi-chevron-right" aria-hidden="true"></i></button><small class="school-ranking-location">' + escapeHtml(location) + '</small><small class="school-ranking-udise">UDISE: ' + escapeHtml(s.udise || 'Not provided') + ' &middot; ' + row.metrics.devices + ' teaching devices</small></td><td><strong>' + row.average.toFixed(2) + ' hrs</strong></td><td>' + row.metrics.activity + '%<small class="school-ranking-udise">' + row.metrics.active + ' of ' + row.metrics.devices + ' used</small></td></tr>';
    }).join('') : '<tr><td colspan="4" class="school-ranking-empty">No schools with teaching devices match the current filters.</td></tr>') + '</tbody></table></div></section>';
  }
  window.renderSchoolRankings = function (scope) {
    const host = mount();
    if (!host) return;
    host.hidden = !rankingsOpen || currentView !== 'view-overview' || Boolean(nationalPath.device);
    if (host.hidden) return;
    const days = nationalDateKeys();
    const data = calculate(scope, days.length, nationalMetrics);
    displayed = {top: data.top, bottom: data.bottom};
    const note = data.count > 0 && data.count < 20 ? 'Some schools appear in both lists because fewer than 20 schools match the current scope. ' : '';
    const excluded = data.excluded ? data.excluded + ' schools without teaching devices are excluded. ' : '';
    const states = [...new Set(scope.map(s => s.state))];
    const target = nationalTargetCount(states, scope);
    const completeness = 'School details available: ' + scope.length + ' of ' + target + ' in this scope. Rankings include imported schools with teaching devices.';
    const range = days.length ? days[0] + (days.length > 1 ? ' to ' + days.at(-1) : '') : 'No dates selected';
    host.innerHTML = '<div class="school-rankings-header"><div><p class="school-rankings-eyebrow">ADMINISTRATOR INSIGHTS</p><h2 id="schoolRankingsTitle" class="section-title">Performance Overview &amp; School Rankings</h2><p class="section-sub">Compare school device utilisation in the selected geography and date range.</p></div><div class="school-rankings-actions"><span class="school-rankings-demo">Dummy usage data</span><button type="button" class="heading-action" onclick="closeSchoolRankings()"><i class="bi bi-arrow-left" aria-hidden="true"></i> Back to overview</button></div></div><p class="school-rankings-completeness">' + escapeHtml(completeness) + '</p><div class="school-rankings-summary"><div><span>Schools compared</span><strong>' + data.count.toLocaleString('en-IN') + '</strong></div><div><span>Avg. daily use / device</span><strong>' + data.average.toFixed(2) + ' <small>hrs</small></strong></div><div><span>Device activity</span><strong>' + data.activity + '<small>%</small></strong></div><div><span>Schools with no recorded use</span><strong>' + data.zeroUsage + '</strong></div></div><p class="school-rankings-method">Ranked by total usage hours &divide; teaching devices &divide; selected calendar days, including days with no use. Device activity is the share of devices used at least once in this period. <strong>' + escapeHtml(range) + '</strong></p><div class="school-rankings-grid">' + panel(data.top, 'top') + panel(data.bottom, 'bottom') + '</div><p class="school-rankings-footnote">' + note + excluded + 'Equal usage is ordered by school name and location. These rankings show device use; learning outcomes are not measured here. Select a school to review its devices and daily usage.</p>';
  };
  window.openRankedSchool = function (kind, index) {
    const row = displayed[kind]?.[index];
    if (!row) return;
    const s = row.school;
    nationalPath = {state: s.state, district: s.district, block: s.block, school: s.id, device: null};
    nationalPerformanceChoice = null;
    nationalPerformancePageNumber = 1;
    const search = document.getElementById('performanceSearch');
    if (search) search.value = '';
    rankingsOpen = false;
    if (currentView !== 'view-device') switchTab('view-device');
    else render();
    document.getElementById('deviceWorkflowTitle')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };
  window.closeSchoolRankings = function () {
    rankingsOpen = false;
    const host = mount();
    if (host) host.hidden = true;
    document.getElementById('summarySchools')?.scrollIntoView({behavior: 'smooth', block: 'center'});
  };
  window.openSchoolRankings = function () {
    rankingsOpen = true;
    if (currentView !== 'view-overview') switchTab('view-overview');
    if (nationalPath.device) {
      nationalPath.device = null;
      render();
    }
    window.renderSchoolRankings(nationalScope());
    const host = mount();
    if (!host) return;
    host.scrollIntoView({behavior: 'smooth', block: 'start'});
    host.tabIndex = -1;
    host.focus({preventScroll: true});
  };
  const existing = render;
  render = function () {
    existing();
    window.renderSchoolRankings(nationalScope());
  };
  window.renderSchoolRankings(nationalScope());
})();
