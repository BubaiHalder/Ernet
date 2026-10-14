/* Fixed desktop navigation with remembered collapse state; phone navigation drawer. */
(function(){
'use strict';
const key='ernet.dashboard.sidebar.v1';
const body=document.body,nav=document.getElementById('mainTabs'),toggle=document.getElementById('sidebarToggle'),mobileToggle=document.getElementById('mobileNavToggle'),header=document.querySelector('body > .navbar-custom');
const tooltip=document.createElement('div');tooltip.id='workspaceSidebarTooltip';tooltip.className='workspace-sidebar-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;body.appendChild(tooltip);
const backdrop=document.createElement('button');backdrop.id='mobileNavBackdrop';backdrop.type='button';backdrop.setAttribute('aria-label','Close navigation');backdrop.tabIndex=-1;backdrop.hidden=true;body.appendChild(backdrop);
let describedLink=null;
const isMobile=()=>window.innerWidth<=767;
const isCollapsed=()=>body.classList.contains('sidebar-collapsed');
function hideTooltip(){tooltip.hidden=true;if(describedLink)describedLink.removeAttribute('aria-describedby');describedLink=null;}
function syncControls(){
 const open=body.classList.contains('mobile-nav-open');nav.inert=isMobile()&&!open;
 toggle.setAttribute('aria-expanded',String(isMobile()?open:!isCollapsed()));toggle.setAttribute('aria-label',isMobile()?'Close navigation':isCollapsed()?'Expand sidebar':'Collapse sidebar');toggle.title=toggle.getAttribute('aria-label');
 mobileToggle.setAttribute('aria-expanded',String(open));mobileToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');backdrop.hidden=!isMobile()||!open;
}
function apply(collapsed,save){hideTooltip();body.classList.toggle('sidebar-collapsed',collapsed);syncControls();if(save){try{localStorage.setItem(key,collapsed?'collapsed':'expanded');}catch(error){}}}
function mobileOpen(open,focus){hideTooltip();body.classList.toggle('mobile-nav-open',open);syncControls();if(focus){(open?toggle:mobileToggle).focus({preventScroll:true});}}
function showTooltip(link){
 if(isMobile()||!isCollapsed())return;hideTooltip();tooltip.textContent=link.dataset.sidebarLabel;tooltip.hidden=false;
 const rect=link.getBoundingClientRect(),box=tooltip.getBoundingClientRect();tooltip.style.left=(nav.getBoundingClientRect().right+10)+'px';tooltip.style.top=Math.max(header.getBoundingClientRect().bottom+5,Math.min(rect.top+(rect.height-box.height)/2,window.innerHeight-box.height-8))+'px';describedLink=link;link.setAttribute('aria-describedby',tooltip.id);
}
nav.querySelectorAll('.nav-link').forEach(link=>{
 const label=link.textContent.trim();link.dataset.sidebarLabel=label;link.setAttribute('aria-label',label);
 for(const node of [...link.childNodes])if(node.nodeType===Node.TEXT_NODE&&node.textContent.trim()){const span=document.createElement('span');span.className='sidebar-nav-label';span.textContent=node.textContent.trim();node.replaceWith(span);}
 link.addEventListener('pointerenter',()=>showTooltip(link));link.addEventListener('pointerleave',hideTooltip);link.addEventListener('focus',()=>showTooltip(link));link.addEventListener('blur',hideTooltip);link.addEventListener('click',()=>{hideTooltip();if(isMobile())mobileOpen(false,true);});
});
toggle.addEventListener('click',()=>isMobile()?mobileOpen(false,true):apply(!isCollapsed(),true));mobileToggle.addEventListener('click',()=>mobileOpen(!body.classList.contains('mobile-nav-open'),true));backdrop.addEventListener('click',()=>mobileOpen(false,true));
nav.addEventListener('scroll',hideTooltip);window.addEventListener('scroll',hideTooltip,{passive:true});window.addEventListener('resize',()=>{hideTooltip();if(!isMobile())body.classList.remove('mobile-nav-open');syncControls();});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){hideTooltip();if(isMobile()&&body.classList.contains('mobile-nav-open'))mobileOpen(false,true);}
 if(event.key==='Tab'&&isMobile()&&body.classList.contains('mobile-nav-open')){const items=[toggle,...nav.querySelectorAll('.nav-link')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
function updateHeaderHeight(){body.style.setProperty('--workspace-header-height',header.getBoundingClientRect().height+'px');}
if(typeof ResizeObserver!=='undefined')new ResizeObserver(updateHeaderHeight).observe(header);else window.addEventListener('resize',updateHeaderHeight);
let stored=null;try{stored=localStorage.getItem(key);}catch(error){}
apply(stored==='collapsed'||(stored!=='expanded'&&window.innerWidth<=991),false);updateHeaderHeight();
})();
