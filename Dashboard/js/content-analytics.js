/* Scoped subject/class/school/teacher analytics using dummy content usage. No APIs. */
(function(){
'use strict';
const subjects=['Mathematics','Science','Computer Science','Social Studies','English'];
const labels={'Science':'Science (Physics/Chem/Bio)','Computer Science':'Computer Science & IT','Social Studies':'Social Studies (SST)','English':'English Language'};
let cacheKey='',records=[],rows=[],history=[];
function snapshot(){return {type:currentCustomReportType,subject:currentSubjectDrill,cls:currentClassDrill,school:currentSchoolDrill,teacher:currentTeacherDrill};}
function restore(s){currentCustomReportType=s.type;currentSubjectDrill=s.subject;currentClassDrill=s.cls;currentSchoolDrill=s.school;currentTeacherDrill=s.teacher;}
function refresh(scope){
 const key=nationalDateKeys().join('|')+'#'+scope.flatMap(s=>s.rec.devices.map(d=>d.serial)).join('|');
 if(key===cacheKey)return;cacheKey=key;history=[];currentSubjectDrill=currentClassDrill=currentSchoolDrill=currentTeacherDrill=null;
 records=scope.flatMap(school=>school.rec.devices.flatMap(device=>nationalDailyData(device).map(day=>{
  const subject=subjects[Math.abs(hashStr(device.serial+'|'+day.date+'|subject'))%subjects.length];
  const number=Math.abs(hashStr(device.serial+'|'+subject+'|teacher'))%3+1;
  return {school,device,date:day.date,subject,cls:'Class '+(6+Math.abs(hashStr(device.serial+'|class'))%7)+'th',teacher:school.id+'-TEACHER-'+number,teacherName:'Demo Teacher '+String(number).padStart(2,'0'),minutes:day.contentMinutes,sessions:day.contentSessions};
 })));
}
function filterRecords(){
 const subject=document.getElementById('customSubjectSelect').value||'ALL',cls=document.getElementById('customClassSelect').value||'ALL';
 return records.filter(r=>(!currentSubjectDrill||r.subject===currentSubjectDrill)&&(!currentClassDrill||r.cls===currentClassDrill)&&(!currentSchoolDrill||r.school.id===currentSchoolDrill)&&(!currentTeacherDrill||r.teacher===currentTeacherDrill)&&(subject==='ALL'||r.subject===subject)&&(cls==='ALL'||r.cls===cls));
}
function hasGeographicParent(){return ['state','district','block','school','device'].some(key=>Boolean(nationalPath[key]));}
window.contentLocationGoBack=function(){if(hasGeographicParent())coverageGoBack();};
window.analyticsGoBack=function(){const previous=history.pop();if(previous){restore(previous);renderCustomReportTable();}else window.contentLocationGoBack();};
window.analyticsDrill=function(index){
 const row=rows[index];if(!row||row.kind==='date')return;history.push(snapshot());
 if(row.kind==='subject'){currentSubjectDrill=row.key;currentCustomReportType='class';}
 else if(row.kind==='class'){currentClassDrill=row.key;currentCustomReportType='school';}
 else if(row.kind==='school'){currentSchoolDrill=row.key;currentCustomReportType='teacher';}
 else currentTeacherDrill=row.key;
 renderCustomReportTable();
};
switchCustomReportTab=function(type){currentCustomReportType=type;currentSubjectDrill=currentClassDrill=currentSchoolDrill=currentTeacherDrill=null;history=[];renderCustomReportTable();};
renderCustomReportTable=function(){
 const scope=nationalScope();refresh(scope);
 const kind=currentTeacherDrill?'date':currentCustomReportType;
 for(const tab of ['subject','class','school','teacher'])document.getElementById('btnSub'+tab[0].toUpperCase()+tab.slice(1)).classList.toggle('active',tab===currentCustomReportType);
 for(const id of ['subjectFilterWrap','classFilterWrap']){const el=document.getElementById(id);el.classList.remove('d-none');el.style.setProperty('display','flex','important');}
 const query=document.getElementById('customReportSearchInput').value.trim().toLowerCase();
 const grouped=new Map();
 for(const r of filterRecords()){
  const key=kind==='subject'?r.subject:kind==='class'?r.cls:kind==='school'?r.school.id:kind==='teacher'?r.teacher:r.date;
  if(!grouped.has(key))grouped.set(key,{kind,key,label:kind==='subject'?(labels[r.subject]||r.subject):kind==='class'?r.cls:kind==='school'?r.school.name:kind==='teacher'?r.teacherName:r.date,school:r.school,minutes:0,sessions:0});
  const row=grouped.get(key);row.minutes+=r.minutes;row.sessions+=r.sessions;
 }
 rows=[...grouped.values()].filter(row=>!query||[row.label,kind==='school'||kind==='teacher'?row.school.name:'',kind==='school'||kind==='teacher'?row.school.udise:'',kind==='school'||kind==='teacher'?row.school.state:'',kind==='teacher'?row.key:''].some(value=>value.toLowerCase().includes(query))).sort((a,b)=>kind==='subject'?subjects.indexOf(a.key)-subjects.indexOf(b.key):a.label.localeCompare(b.label)||a.key.localeCompare(b.key));
 const title={subject:'Subject',class:'Class',school:'School',teacher:'Teacher',date:'Date'}[kind];
 const columns=['Sl. No',title,...(kind==='school'?['State / District / Block','UDISE number']:kind==='teacher'?['School / Location','Demo teacher ID']:[]),'Duration','Frequency'];
 document.getElementById('customReportThead').innerHTML='<tr>'+columns.map(value=>'<th>'+value+'</th>').join('')+'</tr>';
 document.getElementById('customReportTbody').innerHTML=rows.length?rows.map((row,index)=>{
 const name=kind==='date'?escapeHtml(row.label):'<button type="button" class="national-drill-link" onclick="analyticsDrill('+index+')">'+escapeHtml(row.label)+' <i class="bi bi-chevron-right" aria-hidden="true"></i></button>';
 const context=kind==='school'?[escapeHtml([row.school.state,row.school.district,row.school.block].join(' / ')),escapeHtml(row.school.udise||'Not provided')]:kind==='teacher'?[escapeHtml([row.school.name,row.school.state,row.school.district,row.school.block].join(' / ')),escapeHtml(row.key)]:[];
 const days=kind==='date'?1:Math.max(1,nationalDateKeys().length);
 return '<tr>'+[index+1,name,...context,(row.minutes/60).toFixed(2)+' hrs',(row.sessions/days).toFixed(1)+' runs/day'].map(value=>'<td>'+value+'</td>').join('')+'</tr>';
 }).join(''):'<tr><td colspan="'+columns.length+'" class="text-center py-4">No usage records match this scope and these filters.</td></tr>';
 const school=nationalBaseSchools.find(s=>s.id===currentSchoolDrill),drill=[currentSubjectDrill,currentClassDrill,school?.name,currentTeacherDrill&&records.find(r=>r.teacher===currentTeacherDrill)?.teacherName].filter(Boolean);
 const scopeLabel=[nationalPath.state||getSelectedStateLabel(),nationalPath.district,nationalPath.block,nationalBaseSchools.find(s=>s.id===nationalPath.school)?.name,nationalPath.device].filter(Boolean).join(' / ');
 const dates=nationalDateKeys();document.getElementById('analyticsScopeNote').textContent=scopeLabel+' · '+scope.length+' school records · '+(dates[0]||'')+(dates.length>1?' to '+dates.at(-1):'')+(drill.length?' · '+drill.join(' / '):'')+' · Dummy subject, class and teacher data. Frequency = sessions per selected day.';
 const analyticsBack=document.getElementById('analyticsBackButton');analyticsBack.hidden=false;analyticsBack.disabled=!history.length&&!hasGeographicParent();
 analyticsBack.title=history.length?'Return to the previous analytics level':hasGeographicParent()?'Return to the parent location':'You are at the first level';
 document.getElementById('contentLocationBackButton').disabled=!hasGeographicParent();
 document.getElementById('customReportSearchInput').placeholder='Search '+title.toLowerCase()+((kind==='school'||kind==='teacher')?', school or UDISE':'');
 updateNationalBreadcrumb();
};
})();
