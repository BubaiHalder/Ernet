/* Modal multi-selection filters; staged changes and local dummy data only. */
'use strict';
let multiApplied={district:null,block:null,school:null};
let multiDraft={district:null,block:null,school:null};
let multiOptions={state:[],district:[],block:[],school:[]};
const multiClone=set=>set===null?null:new Set(set);
const multiDistrictKey=s=>JSON.stringify([s.state,s.district]);
const multiBlockKey=s=>JSON.stringify([s.state,s.district,s.block]);
function nationalHasGeoFilters(){return Object.values(multiApplied).some(set=>set!==null);}
function nationalMatchesFilter(s){return (multiApplied.district===null||multiApplied.district.has(multiDistrictKey(s)))&&(multiApplied.block===null||multiApplied.block.has(multiBlockKey(s)))&&(multiApplied.school===null||multiApplied.school.has(s.id));}
function multiEligibleSchools(draft=true){const sets=draft?multiDraft:multiApplied,states=draft?nationalDraftStates:nationalSelectedStates;return nationalBaseSchools.filter(s=>states.has(s.state)&&(sets.district===null||sets.district.has(multiDistrictKey(s)))&&(sets.block===null||sets.block.has(multiBlockKey(s)))&&(sets.school===null||sets.school.has(s.id)));}
function multiPrune(set,values){if(set===null||set.size===0)return set;const valid=new Set(values),next=new Set([...set].filter(value=>valid.has(value)));return next.size?next:null;}
function rebuildMultiOptions(){
  multiOptions.state=NATIONAL_STATES.map(state=>({value:state,label:state,meta:String(NATIONAL_TARGETS[state]||nationalBaseSchools.filter(s=>s.state===state).length)+' schools'}));
  const schools=nationalBaseSchools.filter(s=>nationalDraftStates.has(s.state)),districts=new Map();
  schools.forEach(s=>districts.set(multiDistrictKey(s),{value:multiDistrictKey(s),label:s.district,meta:s.state}));
  multiOptions.district=[...districts.values()];multiDraft.district=multiPrune(multiDraft.district,multiOptions.district.map(o=>o.value));
  const districtSchools=schools.filter(s=>multiDraft.district===null||multiDraft.district.has(multiDistrictKey(s))),blocks=new Map();
  districtSchools.forEach(s=>blocks.set(multiBlockKey(s),{value:multiBlockKey(s),label:s.block,meta:s.district+' · '+s.state}));
  multiOptions.block=[...blocks.values()];multiDraft.block=multiPrune(multiDraft.block,multiOptions.block.map(o=>o.value));
  const blockSchools=districtSchools.filter(s=>multiDraft.block===null||multiDraft.block.has(multiBlockKey(s)));
  multiOptions.school=blockSchools.map(s=>({value:s.id,label:s.name,meta:(s.udise||'UDISE unavailable')+' · '+s.block+' · '+s.state}));
  multiDraft.school=multiPrune(multiDraft.school,multiOptions.school.map(o=>o.value));
  for(const kind of ['state','district','block','school']){multiOptions[kind].sort((a,b)=>a.label.localeCompare(b.label)||a.meta.localeCompare(b.meta));renderMultiList(kind);}
  document.getElementById('filterMatchCount').textContent=multiEligibleSchools().length+' detailed school records match';
}
function renderMultiList(kind){
  const search=document.getElementById('multiSearch-'+kind).value.toLowerCase().trim(),options=multiOptions[kind],selected=kind==='state'?nationalDraftStates:multiDraft[kind];
  const count=selected===null?options.length:options.filter(o=>selected.has(o.value)).length;
  document.getElementById('multiCount-'+kind).textContent=count+' / '+options.length;
  const checkbox=document.getElementById('multiAll-'+kind);checkbox.checked=options.length>0&&count===options.length;checkbox.indeterminate=count>0&&count<options.length;checkbox.disabled=!options.length;
  const visible=options.map((option,index)=>({option,index})).filter(({option})=>[option.label,option.meta].some(value=>value.toLowerCase().includes(search)));
  document.getElementById('multiOptions-'+kind).innerHTML=visible.length?visible.map(({option,index})=>'<label class="multi-option"><input type="checkbox" '+(selected===null||selected.has(option.value)?'checked ':'')+'onchange="toggleMultiOption(\''+kind+'\','+index+',this.checked)"><span class="multi-option-label"><strong>'+escapeHtml(option.label)+'</strong><small>'+escapeHtml(option.meta)+'</small></span></label>').join(''):'<p class="multi-empty">'+(options.length?'No matching names.':'Select the parent geography first.')+'</p>';
}
function toggleMultiOption(kind,index,checked){const option=multiOptions[kind][index];if(!option)return;if(kind==='state'){checked?nationalDraftStates.add(option.value):nationalDraftStates.delete(option.value);}else{if(multiDraft[kind]===null)multiDraft[kind]=new Set(multiOptions[kind].map(o=>o.value));checked?multiDraft[kind].add(option.value):multiDraft[kind].delete(option.value);}rebuildMultiOptions();}
function selectAllMulti(kind,checked){if(kind==='state')nationalDraftStates=checked?new Set(NATIONAL_STATES):new Set();else multiDraft[kind]=checked?null:new Set();rebuildMultiOptions();}
function openMultiFilterPopup(){
  nationalDraftStates=new Set(nationalPath.state?[nationalPath.state]:nationalSelectedStates);
  multiDraft={district:multiClone(multiApplied.district),block:multiClone(multiApplied.block),school:multiClone(multiApplied.school)};
  if(nationalPath.district)multiDraft.district=new Set([JSON.stringify([nationalPath.state,nationalPath.district])]);
  if(nationalPath.block)multiDraft.block=new Set([JSON.stringify([nationalPath.state,nationalPath.district,nationalPath.block])]);
  if(nationalPath.school)multiDraft.school=new Set([nationalPath.school]);
  for(const kind of ['state','district','block','school'])document.getElementById('multiSearch-'+kind).value='';
  document.getElementById('filterFromDate').value=DOM.fDate.value;document.getElementById('filterToDate').value=DOM.tDate.value;document.getElementById('filterValidationMessage').hidden=true;
  rebuildMultiOptions();document.getElementById('advancedFilterDialog').showModal();document.getElementById('filterToggleBtn').setAttribute('aria-expanded','true');
}
function closeMultiFilterPopup(){document.getElementById('advancedFilterDialog').close();document.getElementById('filterToggleBtn').setAttribute('aria-expanded','false');nationalDraftStates=new Set(nationalSelectedStates);}
function toggleAdvancedFilters(){const dialog=document.getElementById('advancedFilterDialog');dialog.open?closeMultiFilterPopup():openMultiFilterPopup();}
function applyAdvancedFilters(event){
  event.preventDefault();const error=message=>{const el=document.getElementById('filterValidationMessage');el.textContent=message;el.hidden=false;};
  if(!nationalDraftStates.size)return error('Select at least one state.');
  for(const kind of ['district','block','school'])if(multiOptions[kind].length&&multiDraft[kind]!==null&&!multiDraft[kind].size)return error('Select at least one '+kind+', or use Select all.');
  const from=document.getElementById('filterFromDate').value,to=document.getElementById('filterToDate').value;if(!from||!to||from>to)return error('Choose a valid From and To date.');
  const before=JSON.stringify({states:[...nationalSelectedStates].sort(),...Object.fromEntries(Object.entries(multiApplied).map(([key,set])=>[key,set===null?null:[...set].sort()]))});
  const after=JSON.stringify({states:[...nationalDraftStates].sort(),...Object.fromEntries(Object.entries(multiDraft).map(([key,set])=>[key,set===null?null:[...set].sort()]))});
  const previousDevice=nationalPath.device,previousSchool=nationalPath.school;
  nationalSelectedStates=new Set(nationalDraftStates);multiApplied={district:multiClone(multiDraft.district),block:multiClone(multiDraft.block),school:multiClone(multiDraft.school)};
  if(before!==after){nationalPath={state:nationalSelectedStates.size===1?[...nationalSelectedStates][0]:null,district:null,block:null,school:null,device:null};if(multiApplied.school?.size===1){const school=nationalBaseSchools.find(s=>s.id===[...multiApplied.school][0]);nationalPath={state:school.state,district:school.district,block:school.block,school:school.id,device:null};}else if(multiApplied.block?.size===1){const [state,district,block]=JSON.parse([...multiApplied.block][0]);nationalPath={state,district,block,school:null,device:null};}else if(multiApplied.district?.size===1){const [state,district]=JSON.parse([...multiApplied.district][0]);nationalPath={state,district,block:null,school:null,device:null};}}
  if(previousDevice&&previousSchool===nationalPath.school)nationalPath.device=previousDevice;
  DOM.fDate.value=from;DOM.tDate.value=to;DOM.schId.value='';nationalPerformanceChoice=null;nationalPerformancePageNumber=1;document.getElementById('performanceSearch').value='';closeMultiFilterPopup();render();
}
function clearAdminFilters(){multiApplied={district:null,block:null,school:null};multiDraft={district:null,block:null,school:null};nationalSelectedStates=new Set(NATIONAL_STATES);nationalDraftStates=new Set(NATIONAL_STATES);nationalPath={state:null,district:null,block:null,school:null,device:null};DOM.schId.value='';DOM.fDate.value=DOM.tDate.value=localDateString(new Date());nationalPerformanceChoice=null;nationalPerformancePageNumber=1;if(document.getElementById('advancedFilterDialog').open)closeMultiFilterPopup();render();}
function removeAdminFilter(key){const keys=['district','block','school'];if(key==='state'){multiApplied={district:null,block:null,school:null};nationalSelectedStates=new Set(NATIONAL_STATES);nationalPath={state:null,district:null,block:null,school:null,device:null};}else if(key==='search')DOM.schId.value='';else if(key==='device')nationalPath.device=null;else{keys.slice(keys.indexOf(key)).forEach(kind=>multiApplied[kind]=null);const hierarchy=['state','district','block','school','device'];hierarchy.slice(hierarchy.indexOf(key)).forEach(kind=>nationalPath[kind]=null);}nationalPerformanceChoice=null;nationalPerformancePageNumber=1;render();}
const beforeMultiLevel=nationalLevel;
nationalLevel=function(){if(nationalPath.device||nationalPath.school)return 'device';if(multiApplied.school!==null)return 'school';if(multiApplied.block!==null&&!nationalPath.block)return 'block';if(multiApplied.district!==null&&!nationalPath.district)return 'district';return beforeMultiLevel();};
nationalDrill=function(index){const row=nationalRows[currentView]?.[index];if(!row||['pending','date'].includes(row.kind))return;const s=row.items[0];if(row.kind==='state')nationalPath={state:row.key,district:null,block:null,school:null,device:null};else{nationalPath.state=s.state;nationalPath.district=s.district;nationalPath.block=['block','school','device'].includes(row.kind)?s.block:null;nationalPath.school=['school','device'].includes(row.kind)?s.id:null;nationalPath.device=row.kind==='device'?row.device.serial:null;}nationalPerformanceChoice=null;nationalPerformancePageNumber=1;render();};
function multiSelectionLabel(kind,set){if(set===null)return null;const names=[...set].map(value=>kind==='school'?nationalBaseSchools.find(s=>s.id===value)?.name:JSON.parse(value).at(-1)).filter(Boolean);return {label:names.length<=2?names.join(', '):names.length+' '+({district:'districts',block:'blocks',school:'schools'}[kind]),title:names.join(', ')};}
function renderCompactFilterToolbar(){
  const chips=[],states=nationalPath.state?[nationalPath.state]:[...nationalSelectedStates];
  if(states.length!==NATIONAL_STATES.length)chips.push({key:'state',label:states.length<=2?states.join(', '):states.length+' states',title:states.join(', ')});
  for(const kind of ['district','block','school']){let label=multiSelectionLabel(kind,multiApplied[kind]);if(nationalPath[kind]){const name=kind==='school'?nationalBaseSchools.find(s=>s.id===nationalPath.school)?.name:nationalPath[kind];label={label:name,title:name};}if(label)chips.push({key:kind,...label});}
  if(nationalPath.device)chips.push({key:'device',label:nationalPath.device,title:nationalPath.device});
  const date=value=>new Date(value+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'});document.getElementById('compactDateRange').textContent=DOM.fDate.value===DOM.tDate.value?date(DOM.fDate.value):date(DOM.fDate.value)+' – '+date(DOM.tDate.value);
  document.getElementById('activeFilterChips').innerHTML=chips.length?chips.map(chip=>'<button class="active-filter-chip" type="button" title="'+escapeHtml(chip.title)+'" onclick="removeAdminFilter(\''+chip.key+'\')"><span>'+escapeHtml(chip.label)+'</span><i class="bi bi-x"></i></button>').join(''):'<span class="compact-all-scope">All '+NATIONAL_STATES.length+' states · All schools</span>';
  const today=localDateString(new Date()),count=chips.length+(DOM.fDate.value!==today||DOM.tDate.value!==today?1:0);document.getElementById('filterAppliedCount').textContent=count;document.getElementById('filterAppliedCount').hidden=!count;document.getElementById('resetBtn').hidden=!count;
  document.querySelectorAll('[data-period]').forEach(button=>button.setAttribute('aria-pressed',String(DOM.tDate.value===today&&Number(button.dataset.period)===nationalDateKeys().length)));
}
const beforeMultiScope=renderAdminScope;
renderAdminScope=function(scope){beforeMultiScope(scope);if(nationalHasGeoFilters()&&!nationalPath.school){const states=[...new Set(scope.map(s=>s.state))];document.getElementById('adminScopeLabel').textContent='States: '+states.join(', ')+' / '+scope.length+' selected school records';}};
const beforeMultiRender=render;render=function(){beforeMultiRender();renderCompactFilterToolbar();};
setUsagePeriod=function(days){const end=new Date(),start=new Date(end);start.setDate(start.getDate()-days+1);DOM.fDate.value=localDateString(start);DOM.tDate.value=localDateString(end);render();};
document.getElementById('filterForm').onsubmit=applyAdvancedFilters;document.getElementById('resetBtn').onclick=clearAdminFilters;
document.getElementById('advancedFilterDialog').addEventListener('cancel',()=>{nationalDraftStates=new Set(nationalSelectedStates);document.getElementById('filterToggleBtn').setAttribute('aria-expanded','false');});
render();
const beforeMultiExportScopeLabel=getSelectedStateLabel;
getSelectedStateLabel=function(){const base=beforeMultiExportScopeLabel();if(!nationalHasGeoFilters())return base;return base+' / '+['district','block','school'].filter(kind=>multiApplied[kind]!==null).map(kind=>kind+': '+multiSelectionLabel(kind,multiApplied[kind]).title).join(' / ');};
