'use strict';
const KEY='last-minute-demo-v2', LEGACY='last-minute-demo-v1';
const uid=()=>crypto.randomUUID();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function migrate(old){const names=[...new Set([...old.library,...old.scenes.flatMap(s=>s.items)])];const library=names.map(name=>({id:uid(),name}));const id=name=>library.find(i=>i.name===name).id;return {version:2,library,scenes:old.scenes.map(s=>({...s,items:[...new Set(s.items)].map(id),misses:Object.fromEntries(names.map(n=>[id(n),Math.max(0,Number(old.misses?.[s.id]?.[n])||0)]))}))}}
function load(){try{const current=JSON.parse(localStorage.getItem(KEY));if(current?.version===2&&Array.isArray(current.library)&&Array.isArray(current.scenes))return current;const old=JSON.parse(localStorage.getItem(LEGACY));return migrate(old||{library:['书本','笔记本','笔','电脑','手机','钥匙','钱包','工牌','充电器','身份证','衣物','洗漱用品'],scenes:[{id:'class',name:'上课',items:['书本','笔记本','笔','电脑']},{id:'work',name:'工作',items:['电脑','手机','钥匙','工牌']},{id:'travel',name:'旅行',items:['身份证','手机','充电器','衣物','洗漱用品']}],misses:{}})}catch{return migrate({library:[],scenes:[]})}}
const categories=['全部','随身基础','数码电子','学习用品','工作办公','衣物配饰','洗护美容','健康个人护理','运动健身','旅行住宿','演出娱乐','饮食购物','特殊与临时'];
const allCategoryNames=()=>[...categories,...(Array.isArray(data.customCategories)?data.customCategories:[]).map(c=>c.name)];
const normalized=s=>s.normalize('NFKC').trim().toLowerCase();
const catalog=[["手机","钥匙","钱包","身份证","银行卡","现金","公交卡","门禁卡","学生证","驾驶证","纸巾","湿巾","口罩","水杯"],['电脑','充电器','耳机','充电宝'],['书本','笔记本','笔'],['工牌','文件'],['衣物','帽子'],['洗漱用品','防晒霜'],['药品','口罩'],['运动鞋','水壶'],['护照','房卡'],['门票','相机'],['购物袋','餐盒'],[]];
let category='全部',query='',transitioning=false;
let data=load(),active=null,draft=null,view='home',confirmed=new Set(),temporary=[],entryCounts={};
const app=document.querySelector('#app'),dialog=document.querySelector('dialog');
const basicIllustrations={"手机":{"key":"basic-phone","src":"assets/items/basic-phone.png"},"钥匙":{"key":"basic-keys","src":"assets/items/basic-keys.png"},"钱包":{"key":"basic-wallet","src":"assets/items/basic-wallet.png"},"身份证":{"key":"basic-id-card","src":"assets/items/basic-id-card.png"},"银行卡":{"key":"basic-bank-card","src":"assets/items/basic-bank-card.png"},"现金":{"key":"basic-cash","src":"assets/items/basic-cash.png"},"公交卡":{"key":"basic-transit-card","src":"assets/items/basic-transit-card.png"},"门禁卡":{"key":"basic-access-card","src":"assets/items/basic-access-card.png"},"学生证":{"key":"basic-student-card","src":"assets/items/basic-student-card.png"},"驾驶证":{"key":"basic-driving-license","src":"assets/items/basic-driving-license.png"},"纸巾":{"key":"basic-tissues","src":"assets/items/basic-tissues.png"},"湿巾":{"key":"basic-wet-wipes","src":"assets/items/basic-wet-wipes.png"},"口罩":{"key":"basic-mask","src":"assets/items/basic-mask.png"},"水杯":{"key":"basic-cup","src":"assets/items/basic-cup.png"}};
const itemIllustrationCatalog={"随身基础":{"公交卡":{"key":"basic-transit-card","src":"assets/items/basic-transit-card.png"},"口罩":{"key":"basic-mask","src":"assets/items/basic-mask.png"},"学生证":{"key":"basic-student-card","src":"assets/items/basic-student-card.png"},"手机":{"key":"basic-phone","src":"assets/items/basic-phone.png"},"水杯":{"key":"basic-cup","src":"assets/items/basic-cup.png"},"湿巾":{"key":"basic-wet-wipes","src":"assets/items/basic-wet-wipes.png"},"现金":{"key":"basic-cash","src":"assets/items/basic-cash.png"},"纸巾":{"key":"basic-tissues","src":"assets/items/basic-tissues.png"},"身份证":{"key":"basic-id-card","src":"assets/items/basic-id-card.png"},"钥匙":{"key":"basic-keys","src":"assets/items/basic-keys.png"},"钱包":{"key":"basic-wallet","src":"assets/items/basic-wallet.png"},"银行卡":{"key":"basic-bank-card","src":"assets/items/basic-bank-card.png"},"门禁卡":{"key":"basic-access-card","src":"assets/items/basic-access-card.png"},"驾驶证":{"key":"basic-driving-license","src":"assets/items/basic-driving-license.png"}},"数码电子":{"U盘":{"key":"digital-usb-drive","src":"assets/items/digital-usb-drive.png"},"充电器":{"key":"digital-charger","src":"assets/items/digital-charger.png"},"充电宝":{"key":"digital-power-bank","src":"assets/items/digital-power-bank.png"},"充电线":{"key":"digital-charging-cable","src":"assets/items/digital-charging-cable.png"},"存储卡":{"key":"digital-memory-card","src":"assets/items/digital-memory-card.png"},"平板电脑":{"key":"digital-tablet","src":"assets/items/digital-tablet.png"},"相机":{"key":"digital-camera","src":"assets/items/digital-camera.png"},"相机电池":{"key":"digital-camera-battery","src":"assets/items/digital-camera-battery.png"},"移动硬盘":{"key":"digital-external-drive","src":"assets/items/digital-external-drive.png"},"笔记本电脑":{"key":"digital-laptop","src":"assets/items/digital-laptop.png"},"耳机":{"key":"digital-earphones","src":"assets/items/digital-earphones.png"},"触控笔":{"key":"digital-stylus","src":"assets/items/digital-stylus.png"},"转换器":{"key":"digital-adapter","src":"assets/items/digital-adapter.png"},"鼠标":{"key":"digital-mouse","src":"assets/items/digital-mouse.png"}},"学习用品":{"书签":{"key":"study-bookmark","src":"assets/items/study-bookmark.png"},"作业":{"key":"study-homework","src":"assets/items/study-homework.png"},"尺子":{"key":"study-ruler","src":"assets/items/study-ruler.png"},"打印资料":{"key":"study-printouts","src":"assets/items/study-printouts.png"},"文件夹":{"key":"study-folder","src":"assets/items/study-folder.png"},"文具盒":{"key":"study-pencil-case","src":"assets/items/study-pencil-case.png"},"画本":{"key":"study-sketchbook","src":"assets/items/study-sketchbook.png"},"画笔":{"key":"study-paintbrush","src":"assets/items/study-paintbrush.png"},"笔":{"key":"study-pen","src":"assets/items/study-pen.png"},"笔记本":{"key":"study-notebook","src":"assets/items/study-notebook.png"},"草稿纸":{"key":"study-draft-paper","src":"assets/items/study-draft-paper.png"},"计算器":{"key":"study-calculator","src":"assets/items/study-calculator.png"},"课本":{"key":"study-textbook","src":"assets/items/study-textbook.png"}},"工作办公":{"会议资料":{"key":"office-meeting-documents","src":"assets/items/office-meeting-documents.png"},"印章":{"key":"office-stamp","src":"assets/items/office-stamp.png"},"名片":{"key":"office-business-card","src":"assets/items/office-business-card.png"},"工作文件":{"key":"office-documents","src":"assets/items/office-documents.png"},"工作电脑":{"key":"office-computer","src":"assets/items/office-computer.png"},"工作钥匙":{"key":"office-keys","src":"assets/items/office-keys.png"},"工牌":{"key":"office-badge","src":"assets/items/office-badge.png"},"文件袋":{"key":"office-document-bag","src":"assets/items/office-document-bag.png"},"记事本":{"key":"office-notepad","src":"assets/items/office-notepad.png"}},"衣物配饰":{"发圈":{"key":"item05-c91ae11d6a1e","src":"assets/items/item05-c91ae11d6a1e.png"},"围巾":{"key":"item05-3f12713b4041","src":"assets/items/item05-3f12713b4041.png"},"备用衣物":{"key":"item05-5cb50d9b4b58","src":"assets/items/item05-5cb50d9b4b58.png"},"外套":{"key":"item05-a147f88dee08","src":"assets/items/item05-a147f88dee08.png"},"太阳镜":{"key":"item05-e089252fe095","src":"assets/items/item05-e089252fe095.png"},"帽子":{"key":"item05-47641b97b149","src":"assets/items/item05-47641b97b149.png"},"手套":{"key":"item05-5155aac6341d","src":"assets/items/item05-5155aac6341d.png"},"换洗内衣":{"key":"item05-cf1941962eeb","src":"assets/items/item05-cf1941962eeb.png"},"眼镜":{"key":"item05-07f4669267b1","src":"assets/items/item05-07f4669267b1.png"},"袜子":{"key":"item05-6b45c62e5684","src":"assets/items/item05-6b45c62e5684.png"},"雨伞":{"key":"item05-b29535e760df","src":"assets/items/item05-b29535e760df.png"},"雨衣":{"key":"item05-77301fb12993","src":"assets/items/item05-77301fb12993.png"},"鞋子":{"key":"item05-6254733b4f4c","src":"assets/items/item05-6254733b4f4c.png"}},"洗护美容":{"化妆包":{"key":"item06-df9f5f728173","src":"assets/items/item06-df9f5f728173.png"},"卸妆用品":{"key":"item06-e88ac0467e09","src":"assets/items/item06-e88ac0467e09.png"},"口红":{"key":"item06-67e964a1eaf8","src":"assets/items/item06-67e964a1eaf8.png"},"护手霜":{"key":"item06-192759b8e981","src":"assets/items/item06-192759b8e981.png"},"护理液":{"key":"item06-e45e5df98c31","src":"assets/items/item06-e45e5df98c31.png"},"梳子":{"key":"item06-d92fcc698a33","src":"assets/items/item06-d92fcc698a33.png"},"润唇膏":{"key":"item06-041f1d73322e","src":"assets/items/item06-041f1d73322e.png"},"牙刷":{"key":"item06-66fbdc55ee2f","src":"assets/items/item06-66fbdc55ee2f.png"},"牙膏":{"key":"item06-ae73fd9eea24","src":"assets/items/item06-ae73fd9eea24.png"},"镜子":{"key":"item06-ec3a25c50232","src":"assets/items/item06-ec3a25c50232.png"},"防晒霜":{"key":"item06-9cef860360b6","src":"assets/items/item06-9cef860360b6.png"},"隐形眼镜":{"key":"item06-246f87c5969a","src":"assets/items/item06-246f87c5969a.png"}},"健康个人护理":{"保温杯":{"key":"item07-6769249bf1c4","src":"assets/items/item07-6769249bf1c4.png"},"创可贴":{"key":"item07-ef5e5191e487","src":"assets/items/item07-ef5e5191e487.png"},"卫生巾":{"key":"item07-fc9ba433478d","src":"assets/items/item07-fc9ba433478d.png"},"常用药":{"key":"item07-95c68a4fa260","src":"assets/items/item07-95c68a4fa260.png"},"急救用品":{"key":"item07-05e8f1ee0ffd","src":"assets/items/item07-05e8f1ee0ffd.png"},"护垫":{"key":"item07-24fcaae54498","src":"assets/items/item07-24fcaae54498.png"},"护膝":{"key":"item07-ccfebcb11054","src":"assets/items/item07-ccfebcb11054.png"},"消毒用品":{"key":"item07-b5bfb721c976","src":"assets/items/item07-b5bfb721c976.png"}},"运动健身":{"健身卡":{"key":"item08-b5ca8004820a","src":"assets/items/item08-b5ca8004820a.png"},"护腕":{"key":"item08-bb3df9915fc5","src":"assets/items/item08-bb3df9915fc5.png"},"毛巾":{"key":"item08-8e07613812cc","src":"assets/items/item08-8e07613812cc.png"},"泳衣":{"key":"item08-c74cc5f0a9d2","src":"assets/items/item08-c74cc5f0a9d2.png"},"泳镜":{"key":"item08-324ae0a1690c","src":"assets/items/item08-324ae0a1690c.png"},"瑜伽垫":{"key":"item08-2e53ad77d40e","src":"assets/items/item08-2e53ad77d40e.png"},"跳绳":{"key":"item08-5b162aa87516","src":"assets/items/item08-5b162aa87516.png"},"运动服":{"key":"item08-1d98ebc5f916","src":"assets/items/item08-1d98ebc5f916.png"},"运动水壶":{"key":"item08-0eee172c35e0","src":"assets/items/item08-0eee172c35e0.png"},"运动鞋":{"key":"item08-fad6c945b774","src":"assets/items/item08-fad6c945b774.png"}},"旅行住宿":{"住宿资料":{"key":"item09-4b4993ea2520","src":"assets/items/item09-4b4993ea2520.png"},"护照":{"key":"item09-2cfd9c277004","src":"assets/items/item09-2cfd9c277004.png"},"旅行充电器":{"key":"item09-def5d0e28be9","src":"assets/items/item09-def5d0e28be9.png"},"旅行背包":{"key":"item09-f9e8ecb099de","src":"assets/items/item09-f9e8ecb099de.png"},"机票资料":{"key":"item09-20c737db7909","src":"assets/items/item09-20c737db7909.png"},"洗漱包":{"key":"item09-ab3695321985","src":"assets/items/item09-ab3695321985.png"},"睡衣":{"key":"item09-389ad45edec1","src":"assets/items/item09-389ad45edec1.png"},"签证材料":{"key":"item09-199fe72d0184","src":"assets/items/item09-199fe72d0184.png"},"行李箱":{"key":"item09-820d178eccdc","src":"assets/items/item09-820d178eccdc.png"},"行程单":{"key":"item09-cc4732b28a74","src":"assets/items/item09-cc4732b28a74.png"},"车票":{"key":"item09-b7248d9c9763","src":"assets/items/item09-b7248d9c9763.png"},"转换插头":{"key":"item09-d558904c58a2","src":"assets/items/item09-d558904c58a2.png"}},"演出娱乐":{"应援物":{"key":"item10-31cc12fa3038","src":"assets/items/item10-31cc12fa3038.png"},"手柄":{"key":"item10-debad45c0b3a","src":"assets/items/item10-debad45c0b3a.png"},"拍立得":{"key":"item10-b5b0ca71a352","src":"assets/items/item10-b5b0ca71a352.png"},"望远镜":{"key":"item10-d59d24fca8c8","src":"assets/items/item10-d59d24fca8c8.png"},"游戏机":{"key":"item10-e370f81ae74a","src":"assets/items/item10-e370f81ae74a.png"},"演出票":{"key":"item10-77aa52ec5ff8","src":"assets/items/item10-77aa52ec5ff8.png"},"电影票":{"key":"item10-beaf0976dd86","src":"assets/items/item10-beaf0976dd86.png"},"相机":{"key":"item10-f8b24bb0d641","src":"assets/items/item10-f8b24bb0d641.png"},"签名本":{"key":"item10-2d50a38dedb3","src":"assets/items/item10-2d50a38dedb3.png"},"荧光棒":{"key":"item10-d9b2d2b66f02","src":"assets/items/item10-d9b2d2b66f02.png"},"预约凭证":{"key":"item10-a541ee9443df","src":"assets/items/item10-a541ee9443df.png"}},"饮食购物":{"优惠券":{"key":"item11-26afef04a660","src":"assets/items/item11-26afef04a660.png"},"会员卡":{"key":"item11-e3a7040827c9","src":"assets/items/item11-e3a7040827c9.png"},"便当":{"key":"item11-eaa65b6e623b","src":"assets/items/item11-eaa65b6e623b.png"},"保温袋":{"key":"item11-679ee5da643c","src":"assets/items/item11-679ee5da643c.png"},"水果":{"key":"item11-d043ef6702f5","src":"assets/items/item11-d043ef6702f5.png"},"购物清单":{"key":"item11-f3adf9296ea3","src":"assets/items/item11-f3adf9296ea3.png"},"购物袋":{"key":"item11-64b8c51671d7","src":"assets/items/item11-64b8c51671d7.png"},"零食":{"key":"item11-653db6d7f476","src":"assets/items/item11-653db6d7f476.png"},"餐具":{"key":"item11-37de822222af","src":"assets/items/item11-37de822222af.png"}},"特殊与临时":{"借还书籍":{"key":"item12-be258de49ee3","src":"assets/items/item12-be258de49ee3.png"},"其他临时物品":{"key":"item12-52c3f9645b82","src":"assets/items/item12-52c3f9645b82.png"},"宠物牵引绳":{"key":"item12-309350e5dc5f","src":"assets/items/item12-309350e5dc5f.png"},"宠物用品":{"key":"item12-4d82f9eb0d68","src":"assets/items/item12-4d82f9eb0d68.png"},"待交材料":{"key":"item12-c764e47f0f36","src":"assets/items/item12-c764e47f0f36.png"},"待寄信件":{"key":"item12-a0f3a8d14d76","src":"assets/items/item12-a0f3a8d14d76.png"},"快递":{"key":"item12-d2391375285b","src":"assets/items/item12-d2391375285b.png"},"礼物":{"key":"item12-c05557eea3ee","src":"assets/items/item12-c05557eea3ee.png"},"退货物品":{"key":"item12-1877006bb139","src":"assets/items/item12-1877006bb139.png"}}};
const illustrationById=new Map();
const name=id=>data.library.find(i=>i.id===id)?.name||temporary.find(i=>i.id===id)?.name||'物品';
function itemLabel(id){if(!illustrationById.has(id)){const item=data.library.find(i=>i.id===id);if(item)bindItemIllustration(item)}const src=illustrationById.get(id);return `<span class="item-content">${src?`<img class="item-illustration" ${window.itemArtwork?window.itemArtwork.prepare(src):`src="${src}"`} width="24" height="24" alt="" aria-hidden="true" decoding="async">`:''}<span class="item-name">${esc(name(id))}</span></span>`}
const count=(s,id)=>s.misses?.[id]||0;
function persist(next){try{localStorage.setItem(KEY,JSON.stringify(next));data=next;return true}catch{alert('保存失败，请检查浏览器存储空间。');return false}}
let completionPending=null,returnTimer=null,checkRecordId=null,checkSnapshot=null;
const departures=()=>Array.isArray(data.departures)?data.departures:[];
function latestDeparture(){return departures().reduce((latest,r)=>!latest||Date.parse(r.completedAt)>Date.parse(latest.completedAt)?r:latest,null)}
function recentMarkup(){const r=latestDeparture();if(!r)return '';const date=new Date(r.completedAt),time=Number.isFinite(date.getTime())?date.toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'时间未记录';return `<section class="recent-departure" aria-label="最近一次出门"><div><p>最近一次出门</p><h2>${esc(r.sceneName)}</h2><time datetime="${esc(r.completedAt)}">${esc(time)}</time></div><button id="recentForget">记录遗漏</button></section>`}
function clearCompletionTimers(){clearTimeout(completionPending);clearTimeout(returnTimer);completionPending=null;returnTimer=null}
window.addEventListener('pagehide',clearCompletionTimers);
function home(){clearCompletionTimers();checkRecordId=null;checkSnapshot=null;view='home';active=null;temporary=[];confirmed.clear();app.dataset.view=view;app.innerHTML=`<div class="eyebrow">出门前最后一分钟</div><h1>要出门了吗？</h1><p class="intro">猫猫陪你，再看一眼。<br>轻点场景出门，长按卡片编辑。</p>${recentMarkup()}<div class="scene-section-heading"><h2>选择场景</h2><button id="create">新增场景</button></div><div class="gallery-scroll" tabindex="0" role="region" aria-label="场景画廊，可上下滚动"><div class="gallery">${data.scenes.map(s=>`<button class="scene" data-scene="${s.id}" aria-label="${esc(s.name)}，点击检查，长按或按 E 编辑"><div class="gallery-preview" aria-hidden="true">${s.items.slice(0,4).map(id=>`<span data-preview="${id}">${esc(name(id))}</span>`).join('')}</div><div class="scene-heading"><h2>${esc(s.name)}</h2><span class="item-count">${s.items.length} 件</span></div></button>`).join('')}</div></div>`;const recent=document.querySelector('#recentForget');if(recent)recent.onclick=()=>openForget(latestDeparture().recordId);
app.querySelectorAll('[data-scene]').forEach(b=>{let timer,start,held=false,moved=false;const cancel=()=>{clearTimeout(timer);b.classList.remove('holding')};b.onpointerdown=e=>{if(e.button!==0)return;held=false;moved=false;start={x:e.clientX,y:e.clientY};b.classList.add('holding');timer=setTimeout(()=>{held=true;cancel();edit(b.dataset.scene)},600)};b.onpointermove=e=>{if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>10){moved=true;cancel()}};b.onpointerup=cancel;b.onpointercancel=()=>{moved=true;cancel()};b.onpointerleave=cancel;b.oncontextmenu=e=>e.preventDefault();b.onclick=()=>{cancel();if(!held&&!moved&&!transitioning)expandScene(b)};b.onkeydown=e=>{if(e.key.toLowerCase()==='e'){e.preventDefault();cancel();edit(b.dataset.scene)}}});document.querySelector('#create').onclick=()=>edit()}
function edit(id){clearCompletionTimers();category='全部';query='';view='edit';temporary=[];const s=data.scenes.find(s=>s.id===id);draft=s?{...s,items:[...s.items],misses:{...s.misses}}:{id:uid(),name:'',items:[],misses:{}};renderEdit()}
function renderEdit(){app.dataset.view=view;app.innerHTML=`<button class="back" id="back">〈 场景</button><h1>${data.scenes.some(s=>s.id===draft.id)?'编辑场景':'创建场景'}</h1><p>把需要带上的，放进这个场景。</p><label for="sceneName">场景名称</label><input id="sceneName" maxlength="60" value="${esc(draft.name)}" placeholder="例如：上课"><section class="panel"><h2 id="selectedHeading">已添加 · ${draft.items.length}</h2><p class="hint edit-guide">轻点物品以添加或移除</p><div class="library selected-items" id="selectedItems">${draft.items.map(id=>`<button data-remove="${id}" aria-label="移除${esc(name(id))}">${itemLabel(id)}</button>`).join('')||'<p class="hint">还没有物品，可在下方添加。</p>'}</div><h2>物品库</h2><label for="itemSearch">搜索物品</label><input type="search" id="itemSearch" placeholder="搜索物品"><nav class="categories" aria-label="常用分类">${[['随身基础','随身','M8 8V6a4 4 0 0 1 8 0v2 M5 8h14v12H5z'],['数码电子','数码','M4 4h16v12H4z M2 20h20'],['学习用品','学习','M3 4h8l1 2 1-2h8v15h-8l-1 2-1-2H3z'],['panel','全部分类','M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z']].map(([c,t,path])=>`<button type="button" ${c==='panel'?'id="allCategories" aria-expanded="false" aria-controls="categoryPanel"':`data-category="${c}" aria-pressed="false"`}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="${path}"/></svg><span>${t}</span></button>`).join('')}</nav><div id="categoryPanel" hidden><div class="category-options" id="categoryOptions"></div></div><p class="current-category" id="currentCategory">全部</p><div id="library"></div><p id="editNotice" role="status"></p></section><button class="primary full" id="saveScene">完成</button>${data.scenes.some(s=>s.id===draft.id)?'<button class="full" id="deleteScene">删除场景</button>':''}`;
document.querySelector('#back').onclick=home;document.querySelector('#sceneName').oninput=e=>draft.name=e.target.value;function syncItems(){
 const selected=document.querySelector('#selectedItems');
 document.querySelector('#selectedHeading').textContent=`已添加 · ${draft.items.length}`;
 selected.innerHTML=draft.items.map(id=>`<button data-remove="${id}" aria-label="移除${esc(name(id))}">${itemLabel(id)}</button>`).join('')||'<p class="hint">还没有物品，可在下方添加。</p>';
 selected.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{draft.items=draft.items.filter(id=>id!==b.dataset.remove);syncItems()});
 library(document.querySelector('#itemSearch').value.trim());
}
let categoriesOpen=false,searchRestore=null,entryKind='item',entryCategory=null;
const customDialog=document.querySelector('#customItemDialog'),customInput=document.querySelector('#customItemName');
function updateNavigation(){const searching=!!query;document.querySelector('#categoryPanel').hidden=searching||!categoriesOpen;document.querySelector('#allCategories').setAttribute('aria-expanded',String(!searching&&categoriesOpen));app.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(!searching&&b.dataset.category===category)));document.querySelector('#currentCategory').textContent=searching?'搜索结果':category}
function selectCategory(c){if(query){document.querySelector('#itemSearch').value='';library('')}category=c;library('')}
// Reuse shortcut geometry and its 18px / 1.4px SVG treatment.
function categoryIcon(c){const paths={
'全部':'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
'随身基础':'M8 8V6a4 4 0 0 1 8 0v2 M5 8h14v12H5z',
'数码电子':'M4 4h16v12H4z M2 20h20',
'学习用品':'M3 4h8l1 2 1-2h8v15h-8l-1 2-1-2H3z',
'工作办公':'M8 7V4h8v3 M3 7h18v13H3z M3 11l9 3 9-3 M10 13v3h4v-3',
'衣物配饰':'M8 3l4 3 4-3 6 5-4 4-2-2v11H8V10l-2 2-4-4z',
'洗护美容':'M9 4h8 M13 4v4 M9 8h8v13H7V10l2-2z M10 12h4',
'健康个人护理':'M8 3h8v5h5v8h-5v5H8v-5H3V8h5z',
'运动健身':'M3 8v8 M6 5v14 M6 12h12 M18 5v14 M21 8v8',
'旅行住宿':'M9 6V3h6v3 M5 6h14v14H5z M9 9v8 M15 9v8 M8 20v2 M16 20v2',
'演出娱乐':'M9 17V5l11-2v12 M9 9l11-2 M9 17c-1-3-6-2-6 1s6 3 6-1 M20 15c-1-3-6-2-6 1s6 3 6-1',
'饮食购物':'M3 8h18l-2 12H5z M8 8l4-6 4 6 M9 11v6 M15 11v6',
'特殊与临时':'M3 6h7l2 3h9v11H3z M12 12v5 M9.5 14.5h5'
};const path=paths[c]||'M3 6h7l2 3h9v11H3z';return `<svg class="category-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`}
function renderCategories(){const grid=document.querySelector('#categoryOptions');grid.innerHTML=allCategoryNames().map(c=>`<button type="button" data-category="${esc(c)}" aria-pressed="${c===category}">${categoryIcon(c)}<span class="category-label">${esc(c)}</span></button>`).join('')+'<button type="button" class="category-plus" id="addCustomCategory" aria-label="新增分类">＋</button>';grid.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>selectCategory(b.dataset.category));document.querySelector('#addCustomCategory').onclick=()=>openEntry('category');updateNavigation()}
function openEntry(kind,c=null){entryKind=kind;entryCategory=c;customInput.value='';customInput.removeAttribute('aria-invalid');document.querySelector('#customItemTitle').textContent=kind==='category'?'添加分类':'添加物品';document.querySelector('#customItemDialog label').textContent=kind==='category'?'分类名称':'物品名称';document.querySelector('#customItemError').textContent='';document.querySelector('#confirmCustomItem').disabled=true;customDialog.showModal();customInput.focus()}
function library(q=''){
 q=q.trim();if(q&&!query)searchRestore={category,open:categoriesOpen};if(!q&&query&&searchRestore){category=searchRestore.category;categoriesOpen=searchRestore.open;searchRestore=null}query=q;
 const list=document.querySelector('#library');
 const tag=i=>`<button data-add="${i.id}" aria-pressed="${draft.items.includes(i.id)}" aria-label="${esc(i.name)}，${draft.items.includes(i.id)?'取消选择':'添加'}">${itemLabel(i.id)}${query?`<small>${esc(i.category)}</small>`:''}</button>`;
 if(query){const found=data.library.filter(i=>normalized(i.name).includes(normalized(query)));list.innerHTML=found.length?`<div class="library search-results">${found.map(tag).join('')}</div>`:'<p class="hint">没有找到匹配的物品。</p>'}
 else{const groups=category==='全部'?allCategoryNames().slice(1):[category];list.innerHTML=groups.map(c=>`<section class="library-group"><h3>${esc(c)}</h3><div class="library">${data.library.filter(i=>i.category===c).map(tag).join('')}<button type="button" class="custom-plus" data-new-item="${esc(c)}" aria-label="${esc(c)}：新增物品">＋</button></div></section>`).join('')}
 list.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const id=b.dataset.add;draft.items=draft.items.includes(id)?draft.items.filter(i=>i!==id):[...draft.items,id];syncItems()});list.querySelectorAll('[data-new-item]').forEach(b=>b.onclick=()=>openEntry('item',b.dataset.newItem));updateNavigation();
}
app.querySelectorAll('nav [data-category]').forEach(b=>b.onclick=()=>selectCategory(b.dataset.category));
document.querySelector('#allCategories').onclick=()=>{if(query){document.querySelector('#itemSearch').value='';library('')}categoriesOpen=!categoriesOpen;updateNavigation()};
renderCategories();syncItems();document.querySelector('#itemSearch').oninput=e=>library(e.target.value);
customInput.oninput=()=>{document.querySelector('#confirmCustomItem').disabled=!customInput.value.trim();customInput.removeAttribute('aria-invalid');document.querySelector('#customItemError').textContent=''};
document.querySelector('#cancelCustomItem').onclick=()=>customDialog.close();
document.querySelector('#customItemForm').onsubmit=e=>{e.preventDefault();if(!customDialog.open||view!=='edit')return;const n=customInput.value.trim();if(!n)return;
 if(entryKind==='category'){
 if(allCategoryNames().some(c=>normalized(c)===normalized(n))){document.querySelector('#customItemError').textContent='该分类已存在。';customInput.setAttribute('aria-invalid','true');return}
 const existing=Array.isArray(data.customCategories)?data.customCategories:[];if(!persist({...data,customCategories:[...existing,{id:uid(),name:n}]}))return;customDialog.close();categoriesOpen=true;renderCategories();library(query);document.querySelector('#editNotice').textContent='已创建分类，可在上方选择。';return;
 }
 if(!allCategoryNames().slice(1).includes(entryCategory))return;
 let item=data.library.find(i=>i.category===entryCategory&&normalized(i.name)===normalized(n));
 if(!item){const custom=(data.customCategories||[]).find(c=>c.name===entryCategory);item={id:uid(),name:n,category:entryCategory,categoryId:custom?.id||'builtin-'+categories.indexOf(entryCategory)};if(!persist({...data,library:[...data.library,item]}))return}
 if(!draft.items.includes(item.id))draft.items.push(item.id);customDialog.close();syncItems();document.querySelector('#editNotice').textContent='已添加物品。';
};
document.querySelector('#saveScene').onclick=()=>{if(!draft.name.trim()){document.querySelector('#editNotice').textContent='请输入场景名称。';return}const scene={...draft,name:draft.name.trim()};if(persist({...data,scenes:data.scenes.some(s=>s.id===scene.id)?data.scenes.map(s=>s.id===scene.id?scene:s):[...data.scenes,scene]}))home()};const del=document.querySelector('#deleteScene');if(del)del.onclick=()=>{if(confirm(`删除「${draft.name}」及其遗漏记录？`)&&persist({...data,archivedMisses:{...data.archivedMisses,[draft.id]:{...data.scenes.find(s=>s.id===draft.id)?.misses}},scenes:data.scenes.filter(s=>s.id!==draft.id)}))home()}}
function enter(id){clearCompletionTimers();active=data.scenes.find(s=>s.id===id);if(!active)return home();checkRecordId=uid();checkSnapshot={sceneId:active.id,sceneName:active.name,items:active.items.map(id=>({id,name:name(id)}))};view='check';app.dataset.view=view;temporary=[];confirmed=new Set();entryCounts=Object.fromEntries(active.items.map(id=>[id,count(active,id)]));app.innerHTML=`<button class="back" id="back">〈 场景</button><div class="eyebrow">出门检查</div><h1>${esc(active.name)}</h1><p>点一下，确认已带好；再点一下取消。</p><div class="board-scroll" tabindex="0" role="region" aria-label="检查物品，可上下滚动"><div class="board-stage"><div class="board" id="board"></div></div></div><div class="status" role="status" id="status"></div><details id="tempDetails"><summary>＋ 临时物品</summary><label for="tempName">仅本次检查使用</label><form id="tempForm" class="input-row"><input id="tempName" maxlength="60" required placeholder="输入临时物品名称"><button>添加</button></form><p id="tempNotice" role="status"></p><div id="tempList" class="library"></div></details><div class="actions"><button id="forget">记录遗漏</button><button id="restart">重新开始检查</button></div><p id="notice" class="notice" role="status"></p><p class="hint">猫猫会记住曾经漏带的物品，下次陪你多看一眼。</p>`;document.querySelector('#back').onclick=home;document.querySelector('#restart').onclick=()=>enter(id);document.querySelector('#forget').disabled=!active.items.length;document.querySelector('#forget').onclick=openForget;active.items.forEach(addCard);document.querySelector('#tempForm').onsubmit=e=>{e.preventDefault();const input=document.querySelector('#tempName'),n=input.value.trim();if(!n)return;if([...active.items,...temporary.map(i=>i.id)].some(id=>name(id).normalize('NFKC').toLowerCase()===n.normalize('NFKC').toLowerCase())){document.querySelector('#tempNotice').textContent='这件物品已在本次检查中。';return}const item={id:'temp-'+uid(),name:n};temporary.push(item);addCard(item.id);input.value='';document.querySelector('#tempNotice').textContent='';renderTemporary();layout(true);status()};layout();status()}
function addCard(id){const b=document.createElement('button');b.className='item-card';b.dataset.item=id;b.setAttribute('aria-pressed','false');b.innerHTML=(entryCounts[id]>0?'<img class="cat-head" src="assets/cat-peek.svg" alt="猫猫提醒，曾经漏带">':'')+itemLabel(id);b.onclick=()=>{confirmed.has(id)?confirmed.delete(id):confirmed.add(id);b.classList.toggle('confirmed',confirmed.has(id));b.setAttribute('aria-pressed',String(confirmed.has(id)));status()};document.querySelector('#board').append(b)}
function renderTemporary(){const list=document.querySelector('#tempList');list.innerHTML=temporary.map(i=>`<button data-temp="${i.id}">移除 ${esc(i.name)} ×</button>`).join('');list.querySelectorAll('[data-temp]').forEach(b=>b.onclick=()=>{temporary=temporary.filter(i=>i.id!==b.dataset.temp);confirmed.delete(b.dataset.temp);document.querySelector(`[data-item="${b.dataset.temp}"]`).remove();renderTemporary();layout(true);status()})}
function status(){if(view!=='check')return;clearTimeout(completionPending);completionPending=null;const total=active.items.length+temporary.length;document.querySelector('#status').textContent=total?`已确认 ${confirmed.size} / ${total} 件`:'还没有物品，添加一件再检查吧。';
if(total&&confirmed.size===total)completionPending=setTimeout(showComplete,180)}
function showComplete(){if(view!=='check'||!active||!confirmed.size||confirmed.size!==active.items.length+temporary.length)return;clearCompletionTimers();if(!departures().some(r=>r.recordId===checkRecordId)){const record={recordId:checkRecordId,...checkSnapshot,completedAt:new Date().toISOString(),missedItemIds:[]};if(!persist({...data,departures:[...departures(),record]}))return}if(dialog.open)dialog.close();view='complete';app.dataset.view=view;app.innerHTML=`<section class="completion" aria-labelledby="completeTitle"><p class="eyebrow">出门前最后一分钟</p><h1 id="completeTitle" tabindex="-1">可以出发了</h1><p>需要带的，都确认好了。</p><div class="greeting-slot" aria-hidden="true"></div><button class="primary full" id="completeHome">返回首页</button><p class="hint">稍后自动返回场景</p></section>`;document.querySelector('#completeHome').onclick=home;document.querySelector('#completeTitle').focus({preventScroll:true});returnTimer=setTimeout(()=>{if(view==='complete')home()},1600)}
function hash(s){let n=0;for(const c of s)n=(n*31+c.charCodeAt(0))>>>0;return n}
// Base dimensions are independent of item count; board transform is the single page factor k.
function layout(preserve=false){
 if(view!=='check')return;
 const board=document.querySelector('#board'),region=board.closest('.board-scroll'),vw=region.clientWidth,vh=Math.max(80,region.clientHeight);
 const cards=[...board.children].map((el,index)=>{const id=el.dataset.item,seed=hash(active.id+id),base=.8*Math.min(220,Math.max(170+seed%4*12,name(id).length*15+32)),scale=1+(entryCounts[id]||0)*.05;
 el.style.width=base+'px';el.style.transform=`scale(${scale})`;
 return {el,id,index,seed,scale,w:base*scale,h:el.offsetHeight*scale,cat:entryCounts[id]>0?base*.28*.7*scale:0};
 });
 const widthFit=Math.min(1,(vw-16)/Math.max(1,...cards.map(c=>c.w))),oldK=Number(board.dataset.fit)||1;
 function pack(k,scroll,keep){const W=vw/k,H=vh/k,gap=12/k,pad=8/k,placed=[];let bottom=0;
 for(const c of cards){const w=c.w,h=c.h+c.cat;let r=keep&&c.el._rect?{...c.el._rect}:null;
 const free=(x,y)=>x>=pad&&x+w<=W-pad+.01&&y>=pad&&(scroll||y+h<=H-pad)&&!placed.some(p=>x<p.x+p.w+gap&&x+w+gap>p.x&&y<p.y+p.h+gap&&y+h+gap>p.y);
 if(r&&!free(r.x,r.y))return null;
 if(!r){let n=hash(active.id+'|'+c.id+'|'+c.index);const rand=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};let score=Infinity;
 const maxY=scroll?Math.max(H-pad-h,bottom+gap+h):H-pad-h;
 for(let trial=0;trial<220;trial++){const x=pad+rand()*Math.max(0,W-2*pad-w),y=pad+rand()*Math.max(0,maxY-pad);if(!free(x,y))continue;
 const targetX=W*(.25+(c.seed%61)/120),targetY=scroll?Math.min(H*.5,bottom*.65+H*.2):H*(.28+((c.seed>>>8)%45)/100);
 const rank=Math.abs(x+w/2-targetX)*.3+Math.abs(y+h/2-targetY);if(rank<score){score=rank;r={x,y,w,h}}}
 if(!r&&scroll){for(let y=pad;!r;y+=8/k){for(let x=pad;x+w<=W-pad+.01;x+=8/k){if(free(x,y)){r={x,y,w,h};break}}}}
 if(!r)return null;
 }
 placed.push(r);bottom=Math.max(bottom,r.y+r.h);
 }
 // Center a compact group without moving preserved cards during temporary additions.
 if(!keep&&bottom+pad<H&&placed.length){const top=Math.min(...placed.map(p=>p.y)),offset=(H-(bottom-top))/2-top;for(const r of placed)r.y+=offset;bottom+=offset}
 return {k,W,placed,bottom};
 }
 let result=null;
 if(preserve&&oldK<=widthFit+.001)result=pack(oldK,true,true);
 if(!result){for(const k of [1,.95,.9,.85].filter(k=>k<=widthFit+.001)){result=pack(k,false,false);if(result)break}}
 if(!result)result=pack(Math.min(.85,widthFit),true,false);
 if(!result)return;
 const {k,W,placed,bottom}=result;
 cards.forEach((c,i)=>{c.el._rect=placed[i];c.el.style.left=placed[i].x+'px';c.el.style.top=placed[i].y+c.cat+'px'});
 board.style.width=W+'px';board.style.minWidth='0';board.style.height=bottom+8/k+'px';board.style.transform=`scale(${k})`;board.style.transformOrigin='top left';board.dataset.fit=String(k);board.parentElement.style.height=Math.max(vh,bottom*k+8)+'px';
}
let forgotten=new Set(),forgetContext=null;
function openForget(recordId){
 const record=typeof recordId==='string'?departures().find(r=>r.recordId===recordId):null;
 if(typeof recordId==='string'&&!record)return;
 if(!record&&!active)return;
 forgetContext=record?{recordId:record.recordId,sceneId:record.sceneId,sceneName:record.sceneName,items:Array.isArray(record.items)?record.items:[]}:{recordId:null,sceneId:active.id,sceneName:active.name,items:active.items.map(id=>({id,name:name(id)}))};
 forgotten=new Set((record?.missedItemIds||[]).filter(id=>forgetContext.items.some(i=>i.id===id)));
 const board=document.querySelector('#forgetBoard');board.replaceChildren(...forgetContext.items.map(item=>{const b=document.createElement('button');b.type='button';b.className='forget-node';b.dataset.id=item.id;b.setAttribute('aria-pressed',String(forgotten.has(item.id)));const span=document.createElement('span');span.textContent=item.name;b.append(span);b.onclick=()=>{forgotten.has(item.id)?forgotten.delete(item.id):forgotten.add(item.id);b.setAttribute('aria-pressed',String(forgotten.has(item.id)));updateForgotten()};return b}));
 document.querySelector('#forgetScene').textContent=forgetContext.sceneName;
 document.querySelector('#forgetDialog .back').textContent=record?'〈 返回首页':'〈 返回检查';document.querySelector('#recordForget').textContent=record?'保存记录':'确认记录';
 updateForgotten();dialog.showModal();document.querySelector('#forgetScroll').scrollTop=0;layoutForgotten();
}
function updateForgotten(){document.querySelector('#forgetCount').textContent=`已选择 ${forgotten.size} 件`;document.querySelector('#recordForget').disabled=!forgetContext?.recordId&&forgotten.size===0}
function layoutForgotten(){if(!dialog.open)return;const board=document.querySelector('#forgetBoard'),width=board.clientWidth,available=document.querySelector('#forgetScroll').clientHeight,placed=[];let bottom=0;
const base=Math.max(60,Math.min(82,Math.sqrt(width*available/Math.max(1,board.children.length)*.58)));
for(const b of board.children){const seed=hash(forgetContext.sceneId+b.dataset.id);let diameter=Math.min(width-8,base+seed%3*3);b.style.width=diameter+'px';b.style.height=diameter+'px';const label=b.firstElementChild;
while(label.scrollHeight>diameter*.68&&diameter<width-8){diameter=Math.min(width-8,diameter+6);b.style.width=diameter+'px';b.style.height=diameter+'px'}
let found;const preferred=4+(seed%101)/100*Math.max(0,width-diameter-8);
for(let y=8+seed%3*4;!found;y+=4){for(const x of [preferred,4,...Array.from({length:Math.ceil(width/6)},(_,i)=>4+i*6)]){if(x+diameter>width-4)continue;if(!placed.some(p=>Math.hypot(x+diameter/2-p.cx,y+diameter/2-p.cy)<diameter/2+p.r+8)){found={x,y,cx:x+diameter/2,cy:y+diameter/2,r:diameter/2};break}}}
placed.push(found);b.style.left=found.x+'px';b.style.top=found.y+'px';bottom=Math.max(bottom,found.y+diameter)}
const offset=Math.max(0,(available-bottom-8)/2);for(const b of board.children)b.style.top=parseFloat(b.style.top)+offset+'px';board.style.height=Math.max(available,bottom+8)+'px'}
document.querySelector('#recordForget').onclick=e=>{
 e.preventDefault();if(!dialog.open||!forgetContext)return;
 const context=forgetContext,ids=[...forgotten].filter(id=>context.items.some(i=>i.id===id));
 if(context.recordId){
 // Read the saved value again: repeated submissions must apply only the current delta.
 const record=departures().find(r=>r.recordId===context.recordId);if(!record)return;
 const previous=new Set(record.missedItemIds||[]),selected=new Set(ids),scene=data.scenes.find(s=>s.id===context.sceneId),misses={...(scene?.misses||data.archivedMisses?.[context.sceneId]||{})};
 for(const id of new Set([...previous,...selected])){const delta=Number(selected.has(id))-Number(previous.has(id));if(delta)misses[id]=Math.max(0,(Number(misses[id])||0)+delta)}
 const next={...data,departures:departures().map(r=>r.recordId===record.recordId?{...r,missedItemIds:ids}:r)};
 if(scene)next.scenes=data.scenes.map(s=>s.id===scene.id?{...s,misses}:s);else next.archivedMisses={...data.archivedMisses,[context.sceneId]:misses};
 if(!persist(next))return;dialog.close();forgetContext=null;home();
 }else{
 if(!active||!ids.length)return;const misses={...active.misses};for(const id of ids)misses[id]=count(active,id)+1;const scene={...active,misses};if(!persist({...data,scenes:data.scenes.map(s=>s.id===scene.id?scene:s)}))return;active=scene;dialog.close();document.querySelector('#notice').textContent=`已记录 ${ids.length} 件物品遗漏，下次检查时生效。`;
 }
};
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(dialog.open)layoutForgotten();if(view==='check'){document.querySelector('#board').style.minWidth='';layout()}},100)});
for(const item of data.library)if(!allCategoryNames().slice(1).includes(item.category)){const index=catalog.findIndex(ns=>ns.includes(item.name));item.category=index>=0?categories[index+1]:'特殊与临时'}
for(let index=0;index<catalog.length;index++)for(const n of catalog[index])if(!data.library.some(i=>i.name===n&&((index!==0&&n!=='口罩')||i.category===categories[index+1])))data.library.push({id:uid(),name:n,category:categories[index+1]});
// Approved generic names share existing illustration files; no aliases are added as library entries.
const itemIllustrationAliases={
 '书本':['学习用品','课本'],
 '文件':['工作办公','工作文件'],
 '衣物':['衣物配饰','备用衣物'],
 '衣服':['衣物配饰','备用衣物'],
 '洗漱用品':['旅行住宿','洗漱包'],
 '电脑':['数码电子','笔记本电脑'],
 '餐盒':['饮食购物','便当'],
 '门票':['演出娱乐','演出票'],
 '药品':['健康个人护理','常用药'],
 '口罩':['随身基础','口罩'],
 '水壶':['运动健身','运动水壶']
};
function bindItemIllustration(item){const catalog=itemIllustrationCatalog[item.category]||{},alias=itemIllustrationAliases[item.name];const asset=Object.values(catalog).find(a=>a.key===item.illustrationKey)||catalog[item.name]||(alias&&itemIllustrationCatalog[alias[0]]?.[alias[1]]);if(asset){item.illustrationKey=asset.key;illustrationById.set(item.id,asset.src)}}
// Populate the reusable library from approved illustration catalogs; never alter scene templates.
for(const [category,assets] of Object.entries(itemIllustrationCatalog))for(const [name,asset] of Object.entries(assets)){
 let item=data.library.find(i=>i.category===category&&normalized(i.name)===normalized(name));
 if(!item){item={id:uid(),name,category,categoryId:'builtin-'+categories.indexOf(category)};data.library.push(item)}
 item.illustrationKey=asset.key;
}
for(const item of data.library)bindItemIllustration(item);
persist(data);home();

async function expandScene(scene){
 if(transitioning)return;transitioning=true;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const origins=new Map([...scene.querySelectorAll('[data-preview]')].map(e=>[e.dataset.preview,e.getBoundingClientRect()]));
 const snapshot=app.cloneNode(true),bounds=app.getBoundingClientRect();
 snapshot.removeAttribute('id');snapshot.setAttribute('aria-hidden','true');snapshot.inert=true;
 Object.assign(snapshot.style,{position:'fixed',left:bounds.left+'px',top:bounds.top+'px',width:bounds.width+'px',height:bounds.height+'px',margin:'0',zIndex:'10',pointerEvents:'none'});
 try{
 enter(scene.dataset.scene);window.scrollTo(0,0);
 if(reduce||!Element.prototype.animate)return;
 app.inert=true;document.body.append(snapshot);
 const animations=[snapshot.animate([{opacity:1},{opacity:0}],{duration:170,fill:'forwards'}).finished];
 for(const card of app.querySelectorAll('.item-card')){
 const start=origins.get(card.dataset.item),end=card.getBoundingClientRect(),scale=1+(entryCounts[card.dataset.item]||0)*.05,fit=Number(document.querySelector('#board').dataset.fit)||1;
 if(start)animations.push(card.animate([{transform:`translate(${(start.x-end.x)/fit}px,${(start.y-end.y)/fit}px) scale(${scale*start.width/end.width},${scale*start.height/end.height})`},{transform:`scale(${scale})`}],{duration:280,easing:'cubic-bezier(.2,.65,.3,1)'}).finished);
 else animations.push(card.animate([{opacity:0},{opacity:1}],{duration:220}).finished);
 }
 await Promise.allSettled(animations);
 }catch{ /* Navigation remains usable if animation APIs fail. */ }
 finally{snapshot.remove();app.inert=false;transitioning=false}
}

