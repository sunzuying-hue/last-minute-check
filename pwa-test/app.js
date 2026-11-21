'use strict';
const KEY='last-minute-demo-v2', LEGACY='last-minute-demo-v1';
const HOME_GUIDE_KEY='last-minute-home-guide-v1';
const HISTORY_SEEN_KEY='last-minute-history-seen-v1', HISTORY_BASELINE_KEY='last-minute-history-baseline-v1', HISTORY_GUIDE_KEY='last-minute-history-guide-v1', HISTORY_GUIDE_PENDING_KEY='last-minute-history-guide-pending-v1';
const THEME_KEY='last-minute-theme-v1';
const calicoPalette=Object.freeze({
 cream:'#FFF5E8',
 apricot:'#FCB692',
 taupe:'#B0703F',
 green:'#A6C97A',
});
const calicoColors=Object.values(calicoPalette);
const appThemes=Object.freeze({
 calico:{name:'三花猫',colors:calicoColors},
 british:{name:'英短蓝白',colors:['#F8FBFD','#6FA6CE','#35648C','#F0A93C']},
 golden:{name:'金渐层',colors:['#F7C63A','#D18A22','#5A3A16','#2FA36E']},
 tuxedo:{name:'奶牛猫',colors:['#FFFDF8','#2B3542','#C6CDD6','#45C2E0']},
 maine:{name:'缅因棕虎斑',colors:['#D08A4A','#A85A2C','#5C2E12','#A8C24A']},
});
// Future theme-specific cat PNGs can be added here without changing scene color logic.
const themeCatArtwork=Object.freeze({
  calico:{peek:'assets/cat-peek.svg',greeting:'assets/cat-greeting.png'},
  british:{peek:'assets/cat-peek-british-384-5aa5986f5f.webp'},
  golden:{peek:'assets/cat-peek-golden-384-de01d19d98.webp'},
  tuxedo:{peek:'assets/cat-peek-tuxedo-384-47017d4aa4.webp'},
  maine:{peek:'assets/cat-peek-maine-384-ef48e7ba2a.webp'}
});
function activeCatPeek(){return themeCatArtwork[activeThemeId]?.peek||themeCatArtwork.calico.peek}
const allThemeColors=Object.values(appThemes).flatMap(theme=>theme.colors).map(color=>color.toLowerCase());
const legacyCalicoColors=['#f3ebdd','#ebc5a7','#d1c9bf','#dce6d5'];
const legacySceneColors=calicoColors.slice(0,3);
const initialScenes=[
 {id:'class',name:'上课',items:['书本','笔记本','笔','电脑'],themeColor:calicoPalette.cream,colorSlot:0},
 {id:'work',name:'工作',items:['电脑','手机','钥匙','工牌'],themeColor:calicoPalette.apricot,colorSlot:1},
 {id:'travel',name:'旅行',items:['身份证','手机','充电器','衣物','洗漱用品'],themeColor:calicoPalette.taupe,colorSlot:2},
 {id:'shanghai',name:'去上海',items:['身份证','手机','充电器','钥匙'],themeColor:calicoPalette.green,colorSlot:3},
];
function validSceneColor(value){
 const color=typeof value==='string'?value.trim().toLowerCase():'';
 return allThemeColors.includes(color)?color:null;
}
function colorSlot(scene,index=0){const saved=Number(scene?.colorSlot);if(Number.isInteger(saved)&&saved>=0&&saved<4)return saved;const stored=String(scene?.themeColor||'').toLowerCase(),current=calicoColors.map(color=>color.toLowerCase()).indexOf(stored),legacy=legacyCalicoColors.indexOf(stored);return current>=0?current:legacy>=0?legacy:index%4}
function themeColor(scene,themeId=activeThemeId,index=0){return appThemes[themeId]?.colors[colorSlot(scene,index)]||calicoColors[colorSlot(scene,index)]}
function relativeLuminance(hex){const values=hex.slice(1).match(/.{2}/g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return .2126*values[0]+.7152*values[1]+.0722*values[2]}
function colorInk(hex){return relativeLuminance(hex)>.179?'#171614':'#fffdf8'}
function sceneThemeStyle(scene,themeId=activeThemeId,index=0,prefix='scene-card'){const color=themeColor(scene,themeId,index),ink=colorInk(color);return `--${prefix}-color:${color};--${prefix}-ink:${ink};--${prefix}-art-filter:${ink==='#fffdf8'?'invert(1) brightness(1.15)':'none'}`}
function applyCheckTheme(scene){
 const color=themeColor(scene),ink=colorInk(color);app.style.setProperty('--check-scene-color',color);app.style.setProperty('--check-scene-ink',ink);app.style.setProperty('--check-scene-art-filter',ink==='#fffdf8'?'invert(1) brightness(1.15)':'none');
}
const uid=()=>crypto.randomUUID();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function migrate(old){const names=[...new Set([...old.library,...old.scenes.flatMap(s=>s.items)])];const library=names.map(name=>({id:uid(),name}));const id=name=>library.find(i=>i.name===name).id;return {version:2,library,scenes:old.scenes.map(s=>({...s,items:[...new Set(s.items)].map(id),misses:Object.fromEntries(names.map(n=>[id(n),Math.max(0,Number(old.misses?.[s.id]?.[n])||0)]))}))}}
function load(){try{const current=JSON.parse(localStorage.getItem(KEY));if(current?.version===2&&Array.isArray(current.library)&&Array.isArray(current.scenes))return current;const old=JSON.parse(localStorage.getItem(LEGACY));return migrate(old||{library:['钱包'],scenes:initialScenes,misses:{}})}catch{return migrate({library:[],scenes:[]})}}
const categories=['全部','随身基础','数码电子','学习用品','工作办公','衣物配饰','洗护美容','健康个人护理','运动健身','旅行住宿','演出娱乐','饮食购物','特殊与临时'];
const allCategoryNames=()=>[...categories,...(Array.isArray(data.customCategories)?data.customCategories:[]).map(c=>c.name)];
const normalized=s=>s.normalize('NFKC').trim().toLowerCase();
const catalog=[["手机","钥匙","钱包","身份证","银行卡","现金","公交卡","门禁卡","学生证","驾驶证","纸巾","湿巾","口罩","水杯"],['电脑','充电器','耳机','充电宝'],['书本','笔记本','笔'],['工牌','文件'],['衣物','帽子'],['洗漱用品','防晒霜'],['药品','口罩'],['运动鞋','水壶'],['护照','房卡'],['门票','相机'],['购物袋','餐盒'],[]];
let category='全部',query='',transitioning=false;
let data=load(),active=null,draft=null,view='home',confirmed=new Set(),temporary=[],entryCounts={};
let activeThemeId='calico',themePreviewId='calico';try{const savedTheme=localStorage.getItem(THEME_KEY);if(appThemes[savedTheme])activeThemeId=savedTheme}catch{}
const app=document.querySelector('#app'),dialog=document.querySelector('dialog'),tempItemDialog=document.querySelector('#tempItemDialog'),themeDialog=document.querySelector('#themeDialog');
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let pageMotionReady=false,pageMotionTimer=null;
function animatePage(direction='forward'){
 if(!pageMotionReady){pageMotionReady=true;return}
 if(reduceMotion())return;
 clearTimeout(pageMotionTimer);app.classList.remove('page-enter-forward','page-enter-back');
 void app.offsetWidth;app.classList.add(direction==='back'?'page-enter-back':'page-enter-forward');
 pageMotionTimer=setTimeout(()=>app.classList.remove('page-enter-forward','page-enter-back'),310);
}
function closeSheet(sheet){
 if(!sheet.open)return;
 if(reduceMotion()){sheet.close();return}
 sheet.classList.add('sheet-closing');
 setTimeout(()=>{sheet.classList.remove('sheet-closing');if(sheet.open)sheet.close()},260);
}
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
let historySeenAt='',historyGuideDone=false,historyGuidePending=false;
const historyWasEmptyAtBoot=departures().length===0;
function readFlag(key){try{return localStorage.getItem(key)==='1'}catch{return false}}
function writeStorage(key,value){try{localStorage.setItem(key,value)}catch{}}
function hasUnreadHistory(){const latest=latestDeparture(),latestTime=Date.parse(latest?.completedAt),seenTime=Date.parse(historySeenAt);return Number.isFinite(latestTime)&&(!Number.isFinite(seenTime)||latestTime>seenTime)}
function markHistorySeen(){const latest=latestDeparture();if(latest?.completedAt){historySeenAt=latest.completedAt;writeStorage(HISTORY_SEEN_KEY,historySeenAt)}historyGuideDone=true;historyGuidePending=false;writeStorage(HISTORY_GUIDE_KEY,'1');writeStorage(HISTORY_GUIDE_PENDING_KEY,'0')}
let historyScrollY=0,historyRecordId=null;
const illustrationByKey=new Map(Object.values(itemIllustrationCatalog).flatMap(group=>Object.values(group).map(asset=>[asset.key,asset.src])));
function departureItems(record){
 const fixed=Array.isArray(record.fixedItems)?record.fixedItems:Array.isArray(record.items)?record.items.filter(item=>!item?.temporary):[];
 const temporaryItems=Array.isArray(record.temporaryItems)?record.temporaryItems:Array.isArray(record.items)?record.items.filter(item=>item?.temporary):[];
 return [...fixed.map(item=>({...item,temporary:false})),...temporaryItems.map(item=>({...item,temporary:true}))].filter(item=>item&&typeof item.id==='string');
}
function departureScene(record){return data.scenes.find(scene=>scene.id===record.sceneId)}
function normalizedDeparture(record,index=0){
 const scene=departureScene(record||{}),items=departureItems(record||{}).map(item=>({id:item.id,name:String(item.name||name(item.id)||'物品'),temporary:Boolean(item.temporary),illustrationKey:item.illustrationKey||data.library.find(entry=>entry.id===item.id)?.illustrationKey||null}));
 const fixedItems=items.filter(item=>!item.temporary),temporaryItems=items.filter(item=>item.temporary);
 return {...record,recordId:typeof record?.recordId==='string'&&record.recordId?record.recordId:`legacy-${index}-${uid()}`,sceneId:typeof record?.sceneId==='string'?record.sceneId:'',sceneName:String(record?.sceneName||scene?.name||'已删除场景'),themeColor:validSceneColor(record?.themeColor)||validSceneColor(scene?.themeColor)||calicoPalette.cream,completedAt:record?.completedAt||'',fixedItems,temporaryItems,items:[...fixedItems,...temporaryItems],missedItemIds:[...new Set(Array.isArray(record?.missedItemIds)?record.missedItemIds.filter(id=>typeof id==='string'):[])]};
}
function departureDate(record){const date=new Date(record.completedAt);return Number.isFinite(date.getTime())?date:null}
function departureItemName(record,id){return departureItems(record).find(item=>item.id===id)?.name||data.library.find(item=>item.id===id)?.name||'物品'}
function departureSummary(record){return record.missedItemIds?.length?`忘记了：${record.missedItemIds.map(id=>departureItemName(record,id)).join('、')}`:'尚未记录遗漏'}
function departureTime(record,full=false){const date=departureDate(record);if(!date)return '时间未记录';return date.toLocaleString('zh-CN',full?{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}:{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}
function historyGroup(record){const date=departureDate(record);if(!date)return '更早';const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),day=new Date(date.getFullYear(),date.getMonth(),date.getDate()),diff=Math.round((today-day)/86400000);return diff===0?'今天':diff===1?'昨天':'更早'}
function snapshotArtwork(item,className='history-item-art'){
 const libraryItem=data.library.find(entry=>entry.id===item.id);if(libraryItem)bindItemIllustration(libraryItem);
 const src=illustrationById.get(item.id)||illustrationByKey.get(item.illustrationKey);
 return src?`<img class="${className}" ${window.itemArtwork?window.itemArtwork.prepare(src):`src="${src}"`} width="48" height="48" alt="" aria-hidden="true" decoding="async">`:`<span class="history-item-fallback" aria-hidden="true">${categoryIcon('')}</span>`;
}
function recentMarkup(){
 const record=latestDeparture();
 if(!record)return '';
 const date=new Date(record.completedAt);
 const scene=data.scenes.find(scene=>scene.id===record.sceneId);
 const color=validSceneColor(record.themeColor)||validSceneColor(scene?.themeColor)||calicoPalette.cream;
 let time='时间未记录';
 if(Number.isFinite(date.getTime())){
  const day=date.toDateString()===new Date().toDateString()?'今天':date.toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'});
  const clock=date.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  time=`<time datetime="${esc(record.completedAt)}">${esc(day+clock)}</time>`;
 }
 return `<section class="recent-departure" aria-label="最近一次出门" style="--departure-color:${color}">
  <div><p>最近一次出门 · ${time}</p><h2 title="${esc(record.sceneName)}">${esc(record.sceneName)}</h2></div>
  <button id="recentForget" type="button">记录遗漏</button>
 </section>`;
}
let homeGuideDone=false;
try{homeGuideDone=localStorage.getItem(HOME_GUIDE_KEY)==='1'}catch{}
function homeGuideMarkup(){
 return !homeGuideDone&&data.scenes.length?`<aside class="home-guide" aria-label="场景操作提示"><p>轻点检查 · 长按编辑 · 左滑删除</p><button id="dismissHomeGuide" type="button">知道了</button></aside>`:'';
}
function dismissHomeGuide(){
 const guide=app.querySelector('.home-guide');
 if(!guide)return;
 homeGuideDone=true;
 guide.remove();
 try{localStorage.setItem(HOME_GUIDE_KEY,'1')}catch{}
 showHistoryGuideIfReady();
}
function historyGuideMarkup(){return historyGuidePending&&!historyGuideDone&&homeGuideDone?`<aside class="footprint-guide" aria-label="出门足迹提示"><p><strong>这次出门已经记下啦。</strong><span>以后可以在「出门足迹」里回看，也能补记忘带的东西。</span></p><button id="dismissHistoryGuide" type="button">知道了</button></aside>`:''}
function dismissHistoryGuide(){historyGuideDone=true;historyGuidePending=false;writeStorage(HISTORY_GUIDE_KEY,'1');writeStorage(HISTORY_GUIDE_PENDING_KEY,'0');app.querySelector('.footprint-guide')?.remove();app.querySelector('#historyLink')?.focus({preventScroll:true})}
function showHistoryGuideIfReady(){if(view!=='home'||!historyGuidePending||historyGuideDone||!homeGuideDone||app.querySelector('.footprint-guide'))return;const heading=app.querySelector('.scene-section-heading');if(!heading)return;heading.insertAdjacentHTML('beforeend',historyGuideMarkup());app.querySelector('#dismissHistoryGuide')?.addEventListener('click',dismissHistoryGuide)}
const homeBackButton='<button class="back home-back" id="back" type="button" aria-label="返回首页"></button>';
const checkResize=new ResizeObserver(()=>layout(true));
function clearCompletionTimers(){checkResize.disconnect();clearTimeout(completionPending);clearTimeout(returnTimer);completionPending=null;returnTimer=null}
window.addEventListener('pagehide',clearCompletionTimers);
window.addEventListener('pageshow',event=>{
 if(event.persisted&&view==='complete')home();
 if(event.persisted&&view==='check')checkResize.observe(app.querySelector('.board-scroll'));
});
function sceneCard(s){
 const previewIds=s.items.slice(0,4);
 const description=previewIds.length?`，预览物品：${previewIds.map(name).join('、')}`:'';
 const preview=previewIds.map(id=>{
  const src=illustrationById.get(id);
  const label=esc(name(id));
  const content=src?`<img ${window.itemArtwork?window.itemArtwork.prepare(src):`src="${src}"`} width="32" height="32" alt="" decoding="async" draggable="false">`:`<small class="preview-name">${label}</small>`;
  return `<span data-preview="${esc(id)}">${content}</span>`;
 }).join('');
 return `<div class="scene-shell" data-scene-id="${esc(s.id)}" style="${sceneThemeStyle(s)}">
  <button class="scene" data-scene="${esc(s.id)}" aria-label="${esc(s.name)}，${s.items.length} 件，点击检查，长按或按 E 编辑，左滑、右键或按 Delete 展开删除${esc(description)}">
   <div class="gallery-preview" aria-hidden="true">${preview}</div>
   <div class="scene-heading"><h2>${esc(s.name)}</h2><span class="item-count">${s.items.length} 件</span></div>
  </button>
  <button type="button" class="scene-trash" aria-label="删除${esc(s.name)}" disabled><img src="assets/scene-trash.png" alt=""></button>
 </div>`;
}
function home(){openSceneId=null;clearCompletionTimers();checkRecordId=null;checkSnapshot=null;historyRecordId=null;view='home';active=null;temporary=[];confirmed.clear();app.dataset.view=view;app.innerHTML=`<div class="home-topline"><div class="eyebrow">出门前最后一分钟</div><button id="themeButton" class="theme-button" type="button" aria-label="选择主题，当前${esc(appThemes[activeThemeId].name)}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6h-.7a1.4 1.4 0 0 1 0-2.8H15A6 6 0 0 0 15 3h-3Z" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="10" r="1" fill="currentColor"/><circle cx="10" cy="6.8" r="1" fill="currentColor"/><circle cx="7.8" cy="14" r="1" fill="currentColor"/></svg></button></div><h1>要出门了吗？</h1><p class="intro">猫猫陪你，再看一眼。</p>${recentMarkup()}<div class="scene-section-heading"><h2>选择场景</h2><button id="historyLink" class="history-link" type="button" aria-label="出门足迹${hasUnreadHistory()?'，有新记录':''}"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 5v5l3 2M4.7 5.2A7 7 0 1 1 3 10" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 5.5h3v-3" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg><span>出门足迹</span>${hasUnreadHistory()?'<i class="history-unread" aria-hidden="true"></i>':''}</button>${historyGuideMarkup()}</div><div class="gallery-scroll" tabindex="0" role="region" aria-label="场景画廊，可上下滚动">${homeGuideMarkup()}<div class="gallery">${data.scenes.map(sceneCard).join('')}
<button id="create" class="scene scene-create" type="button">
  <div class="gallery-preview" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
  <div class="scene-heading"><h2><span aria-hidden="true">＋</span> 新增场景</h2></div>
</button></div></div>`;
 const recent=app.querySelector('#recentForget');
 if(recent)recent.onclick=()=>{dismissHomeGuide();openForget(latestDeparture().recordId)};
 app.querySelector('#historyLink').onclick=()=>{markHistorySeen();openHistory()};
 app.querySelector('#themeButton').onclick=openThemeDialog;
 const guideButton=app.querySelector('#dismissHomeGuide');
 if(guideButton)guideButton.onclick=()=>{dismissHomeGuide();app.querySelector('[data-scene]')?.focus({preventScroll:true})};
 app.querySelector('#dismissHistoryGuide')?.addEventListener('click',dismissHistoryGuide);
 app.querySelectorAll('.scene-shell').forEach(bindSceneGesture);
 document.querySelector('#create').onclick=()=>edit();
 animatePage('back');
}

function pushAppState(nextView,recordId=null){window.history.pushState({lastMinuteView:nextView,recordId},'',nextView==='history'? '#history':nextView==='historyDetail'?`#history/${encodeURIComponent(recordId)}`:location.pathname)}
function listTime(record,group){const date=departureDate(record);if(!date)return '时间未记录';return date.toLocaleString('zh-CN',group==='更早'?{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}:{hour:'2-digit',minute:'2-digit',hourCycle:'h23'})}
function openHistory({push=true,restore=false,direction='forward'}={}){
 markHistorySeen();
 clearCompletionTimers();view='history';historyRecordId=null;active=null;app.dataset.view=view;
 const sorted=departures().map(normalizedDeparture).sort((a,b)=>(departureDate(b)?.getTime()||0)-(departureDate(a)?.getTime()||0));
 const groups=['今天','昨天','更早'].map(label=>[label,sorted.filter(record=>historyGroup(record)===label)]).filter(([,items])=>items.length);
 app.innerHTML=`<nav class="history-nav" aria-label="页面导航"><button class="back home-back history-back" type="button" aria-label="返回首页"></button></nav><header class="history-header"><h1 tabindex="-1">出门足迹</h1><p>每一次出门，都留下了一点痕迹。</p></header>${groups.length?`<div class="history-groups">${groups.map(([label,items])=>`<section class="history-group"><h2>${label}</h2><div class="history-records">${items.map(record=>`<button class="history-record" type="button" data-record-id="${esc(record.recordId)}" style="--history-color:${record.themeColor}" aria-label="${esc(record.sceneName)}，${esc(listTime(record,label))}，${esc(departureSummary(record))}"><span class="history-color" aria-hidden="true"></span><span class="history-record-copy"><span><strong>${esc(record.sceneName)}</strong><time datetime="${esc(record.completedAt)}">${esc(listTime(record,label))}</time></span><small>${esc(departureSummary(record))}</small></span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7.5 5 5 5-5 5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`).join('')}</div></section>`).join('')}</div>`:`<section class="history-empty"><h2>还没有出门记录</h2><p>完成一次检查后，足迹会出现在这里。</p><button type="button" id="emptyHome">返回首页</button></section>`}`;
 app.querySelector('.history-back').onclick=()=>window.history.state?.lastMinuteView==='history'?window.history.back():home();
 app.querySelector('#emptyHome')?.addEventListener('click',()=>window.history.back());
 app.querySelectorAll('[data-record-id]').forEach(button=>button.onclick=()=>{historyScrollY=window.scrollY;openHistoryDetail(button.dataset.recordId)});
 if(push)pushAppState('history');
 if(restore){const y=historyScrollY;setTimeout(()=>window.scrollTo(0,y),0)}else window.scrollTo(0,0);
 requestAnimationFrame(()=>app.querySelector('h1')?.focus({preventScroll:true}));
 animatePage(direction);
}
function historySnapshotMarkup(item){return `<li>${snapshotArtwork(item)}<span>${esc(item.name)}</span>${item.temporary?'<small>临时</small>':''}</li>`}
function openHistoryDetail(recordId,{push=true,direction='forward'}={}){
 const raw=departures().find(record=>record.recordId===recordId);if(!raw)return openHistory({push:false,restore:true,direction:'back'});
 const record=normalizedDeparture(raw),items=departureItems(record),missed=new Set(record.missedItemIds||[]);view='historyDetail';historyRecordId=record.recordId;app.dataset.view=view;
 app.innerHTML=`<nav class="history-nav" aria-label="页面导航"><button class="history-back" type="button"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12.5 4.5-5.5 5.5 5.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>出门足迹</span></button></nav><header class="history-detail-hero" style="--history-color:${record.themeColor}"><span aria-hidden="true"></span><h1 tabindex="-1">${esc(record.sceneName)}</h1><p>${esc(departureTime(record,true))} · 已完成检查</p></header><section class="history-detail-section"><div><h2>当时检查的物品</h2><span>${items.length} 件</span></div>${items.length?`<ul class="history-items">${items.map(historySnapshotMarkup).join('')}</ul>`:'<p class="history-note">这条旧记录没有保存物品快照。</p>'}</section><section class="history-detail-section"><div><h2>后来发现忘带了</h2><span>${missed.size} 件</span></div><div class="history-missed">${missed.size?`<ul>${items.filter(item=>missed.has(item.id)).map(item=>`<li>${snapshotArtwork(item,'history-missed-art')}<span>${esc(item.name)}</span>${item.temporary?'<small>临时</small>':''}</li>`).join('')}</ul>`:'<p>这次还没有记录后来发现忘带的物品。</p>'}</div><button type="button" id="editHistoryMisses" class="history-edit-misses"><span>${missed.size?'修改遗漏':'记录遗漏'}</span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7.5 5 5 5-5 5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg></button></section>`;
 app.querySelector('.history-back').onclick=()=>window.history.state?.lastMinuteView==='historyDetail'?window.history.back():openHistory({push:false,restore:true});
 app.querySelector('#editHistoryMisses').onclick=()=>openForget(record.recordId,'historyDetail');
 if(push)pushAppState('historyDetail',record.recordId);
 window.scrollTo(0,0);requestAnimationFrame(()=>app.querySelector('h1')?.focus({preventScroll:true}));
 animatePage(direction);
}

let openSceneId = null;
const sceneDeleteDialog = document.querySelector('#sceneDeleteDialog');
let pendingSceneDeleteId = null;
let deleteReturnFocus = null;
let deleteBackdropPressed = false;
function revealSceneAction(id) {
  openSceneId = id;
  for (const shell of app.querySelectorAll('.scene-shell')) {
    const isOpen = shell.dataset.sceneId === id;
    shell.toggleAttribute('data-open', isOpen);
    shell.querySelector('.scene-trash').disabled = !isOpen;
  }
}

document.addEventListener('pointerdown', event => {
  if (!sceneDeleteDialog.open && view === 'home' && openSceneId && event.target.closest('.scene-shell')?.dataset.sceneId !== openSceneId) {
    revealSceneAction(null);
  }
});

function deleteScene(id) {
  const scene = data.scenes.find(item => item.id === id);
  if (!scene || sceneDeleteDialog.open) return;
  pendingSceneDeleteId = id;
  deleteReturnFocus = [...app.querySelectorAll('[data-scene]')].find(card => card.dataset.scene === id);
  document.querySelector('#sceneDeleteTitle').textContent = `删除「${scene.name}」？`;
  document.documentElement.classList.add('scene-delete-modal-open');
  sceneDeleteDialog.showModal();
  document.querySelector('#cancelSceneDelete').focus();
}

document.querySelector('#cancelSceneDelete').onclick = () => sceneDeleteDialog.close();
document.querySelector('#confirmSceneDelete').onclick = () => {
  if (!sceneDeleteDialog.open || !pendingSceneDeleteId) return;
  const id = pendingSceneDeleteId;
  const scene = data.scenes.find(item => item.id === id);
  if (!scene) {
    sceneDeleteDialog.close();
    return;
  }
  const next = {
    ...data,
    archivedMisses: {...data.archivedMisses, [id]: {...scene.misses}},
    scenes: data.scenes.filter(item => item.id !== id),
  };
  if (persist(next)) {
    sceneDeleteDialog.close();
    home();
  }
};

sceneDeleteDialog.addEventListener('close', () => {
  pendingSceneDeleteId = null;
  deleteBackdropPressed = false;
  document.documentElement.classList.remove('scene-delete-modal-open');
  revealSceneAction(null);
  const target = deleteReturnFocus?.isConnected ? deleteReturnFocus : app.querySelector('[data-scene], #create');
  target?.focus({preventScroll: true});
  deleteReturnFocus = null;
});

function isDeleteBackdrop(event) {
  const bounds = sceneDeleteDialog.getBoundingClientRect();
  return event.target === sceneDeleteDialog && (
    event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
  );
}
sceneDeleteDialog.onpointerdown = event => {
  deleteBackdropPressed = isDeleteBackdrop(event);
};
sceneDeleteDialog.onpointerup = event => {
  if (deleteBackdropPressed && isDeleteBackdrop(event)) sceneDeleteDialog.close();
  deleteBackdropPressed = false;
};

function bindSceneGesture(shell) {
  const card = shell.querySelector('.scene');
  const trash = shell.querySelector('.scene-trash');
  const id = shell.dataset.sceneId;
  let gesture = null;
  let holdTimer;
  let suppressClick = false;

  function cancelHold() {
    clearTimeout(holdTimer);
    card.classList.remove('holding');
  }

  card.onpointerdown = event => {
    if (event.button !== 0 || !event.isPrimary) return;
    suppressClick = false;
    gesture = {pointer: event.pointerId, x: event.clientX, y: event.clientY, axis: null, wasOpen: openSceneId === id};
    card.setPointerCapture(event.pointerId);
    if (gesture.wasOpen) return;
    card.classList.add('holding');
    holdTimer = setTimeout(() => {
      suppressClick = true;
      cancelHold();
      edit(id);
    }, 600);
  };

  card.onpointermove = event => {
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 10) {
      cancelHold();
      suppressClick = true;
      if (Math.abs(dx) > Math.abs(dy) * 1.25) gesture.axis = 'x';
      else if (Math.abs(dy) >= Math.abs(dx)) gesture.axis = 'y';
    }
    if (gesture.axis !== 'x') return;
    const reveal = trash.getBoundingClientRect().width;
    const offset = (gesture.wasOpen ? -reveal : 0) + dx;
    shell.classList.add('scene-dragging');
    card.style.setProperty('--scene-offset', `${Math.max(-reveal, Math.min(0, offset))}px`);
  };

  function finishGesture(event, cancelled) {
    if (!gesture || gesture.pointer !== event.pointerId) return;
    cancelHold();
    if (cancelled) suppressClick = true;
    const dx = event.clientX - gesture.x;
    if (!cancelled && gesture.axis === 'x' && Math.abs(dx) >= 28) {
      revealSceneAction(dx < 0 ? id : null);
    }
    gesture = null;
    shell.classList.remove('scene-dragging');
    card.style.removeProperty('--scene-offset');
  }

  card.onpointerup = event => finishGesture(event, false);
  card.onpointercancel = event => finishGesture(event, true);
  card.onlostpointercapture = event => finishGesture(event, true);
  card.onclick = event => {
    if ((suppressClick && event.detail !== 0) || transitioning) return;
    if (openSceneId === id) revealSceneAction(null);
    else expandScene(card);
  };
  card.oncontextmenu = event => {
    event.preventDefault();
    if (event.pointerType === 'touch') return;
    revealSceneAction(id);
  };
  card.onkeydown = event => {
    if (event.key.toLowerCase() === 'e') {
      event.preventDefault();
      edit(id);
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      revealSceneAction(id);
      trash.focus();
    }
  };
  shell.onkeydown = event => {
    if (event.key === 'Escape' && openSceneId === id) {
      revealSceneAction(null);
      card.focus();
    }
  };
  trash.onclick = () => deleteScene(id);
}
function edit(id){dismissHomeGuide();clearCompletionTimers();category='全部';query='';view='edit';temporary=[];const s=data.scenes.find(s=>s.id===id);draft=s?{...s,items:[...s.items],misses:{...s.misses}}:{id:uid(),name:'',items:[],misses:{}};renderEdit()}
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
function renderEdit(){app.dataset.view=view;app.innerHTML=`${homeBackButton}<h1>${data.scenes.some(s=>s.id===draft.id)?'编辑场景':'创建场景'}</h1><p>把需要带上的，放进这个场景。</p><label for="sceneName">场景名称</label><input id="sceneName" maxlength="60" value="${esc(draft.name)}" placeholder="例如：上课"><section class="panel"><h2 id="selectedHeading">已添加 · ${draft.items.length}</h2><p class="hint edit-guide">轻点物品以添加或移除</p><div class="library selected-items" id="selectedItems">${draft.items.map(id=>`<button data-remove="${id}" aria-label="移除${esc(name(id))}">${itemLabel(id)}</button>`).join('')||'<p class="hint">还没有物品，可在下方添加。</p>'}</div><h2>物品库</h2><label for="itemSearch">搜索物品</label><input type="search" id="itemSearch" placeholder="搜索物品"><nav class="categories" aria-label="常用分类">${[['随身基础','随身','M8 8V6a4 4 0 0 1 8 0v2 M5 8h14v12H5z'],['数码电子','数码','M4 4h16v12H4z M2 20h20'],['学习用品','学习','M3 4h8l1 2 1-2h8v15h-8l-1 2-1-2H3z'],['panel','全部分类','M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z']].map(([c,t,path])=>`<button type="button" ${c==='panel'?'id="allCategories" aria-expanded="false" aria-controls="categoryPanel"':`data-category="${c}" aria-pressed="false"`}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="${path}"/></svg><span>${t}</span></button>`).join('')}</nav><div id="categoryPanel" hidden><div class="category-options" id="categoryOptions"></div></div><p class="current-category" id="currentCategory">全部</p><div id="library"></div><p id="editNotice" role="status"></p></section><button class="primary full" id="saveScene">完成</button>`;
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
document.querySelector('#saveScene').onclick=()=>{
 const name=draft.name.trim();
 if(!name){document.querySelector('#editNotice').textContent='请输入场景名称。';return}
 const existing=data.scenes.find(s=>s.id===draft.id);
 const slot=existing?colorSlot(existing):Math.floor(Math.random()*4),themeColor=existing?existing.themeColor:calicoColors[slot];
 const scene={...draft,name,themeColor,colorSlot:slot};
 const scenes=existing?data.scenes.map(s=>s.id===scene.id?scene:s):[...data.scenes,scene];
 if(persist({...data,scenes}))home();
}
animatePage('forward');
}
const greetingImage = new Image();
const greetingSource = "assets/cat-greeting.png";
let greetingPreloadHandle=null;
function loadGreetingImage(){greetingPreloadHandle=null;if(!greetingImage.src){greetingImage.src=greetingSource;greetingImage.decode?.().catch(()=>{})}}
function scheduleGreetingPreload(){if(greetingImage.src||greetingPreloadHandle!==null)return;greetingPreloadHandle='requestIdleCallback' in window?requestIdleCallback(loadGreetingImage,{timeout:900}):setTimeout(loadGreetingImage,0)}
function enter(id){clearCompletionTimers();active=data.scenes.find(s=>s.id===id);if(!active)return home();dismissHomeGuide();checkRecordId=uid();checkSnapshot={sceneId:active.id,sceneName:active.name,themeColor:themeColor(active),items:active.items.map(id=>({id,name:name(id)}))};view='check';applyCheckTheme(active);app.dataset.view=view;temporary=[];confirmed=new Set();entryCounts=Object.fromEntries(active.items.map(id=>[id,count(active,id)]));app.innerHTML=`${homeBackButton}<div class="eyebrow">出门检查</div><h1>${esc(active.name)}</h1><p>点一下，确认已带好；再点一下取消。</p><div class="board-scroll" tabindex="0" role="region" aria-label="检查物品，可上下滚动"><div class="board-stage"><div class="board" id="board"></div></div></div><section class="check-controls" aria-label="检查操作"><div class="status" role="status" id="status"></div><div class="check-actions"><button id="openTempItems" class="temp-item-entry" type="button"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg><span>临时物品</span><small id="tempCount" hidden></small></button><button id="restart" class="restart-check" type="button"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.2 6.2A6 6 0 1 1 4 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M3.5 4v3.5H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>重新检查</span></button></div></section>`;document.querySelector('#back').onclick=home;document.querySelector('#restart').onclick=()=>enter(id);document.querySelector('#openTempItems').onclick=openTempItems;active.items.forEach(addCard);renderTemporary();status();layout();checkResize.observe(app.querySelector('.board-scroll'));animatePage('forward')}
function addCard(id){const board=document.querySelector('#board'),b=document.createElement('button');b.className='item-card';b.dataset.item=id;b.style.setProperty('--item-enter-index',board.children.length);b.setAttribute('aria-pressed','false');b.innerHTML=(entryCounts[id]>0?`<img class="cat-head" src="${activeCatPeek()}" width="32" height="22.4" alt="" aria-hidden="true" onerror="this.onerror=null;this.src='${themeCatArtwork.calico.peek}'">`:'')+itemLabel(id);b.onclick=()=>{confirmed.has(id)?confirmed.delete(id):confirmed.add(id);b.classList.toggle('confirmed',confirmed.has(id));b.setAttribute('aria-pressed',String(confirmed.has(id)));status()};board.append(b)}
function renderTemporary(){const badge=document.querySelector('#tempCount');if(badge){badge.textContent=temporary.length;badge.hidden=!temporary.length;document.querySelector('#openTempItems')?.setAttribute('aria-label',`临时物品${temporary.length?`，已添加 ${temporary.length} 件`:''}`)}if(tempItemDialog.open)renderTempLibrary()}
let tempLibraryQuery='',tempDialogBackdropPressed=false;
function tempLibraryItemMarkup(item){bindItemIllustration(item);const src=illustrationById.get(item.id),selected=temporary.some(entry=>entry.sourceLibraryId===item.id),disabled=active.items.includes(item.id),state=disabled?'场景已有':selected?'已加入':'';return `<button type="button" data-temp-library="${esc(item.id)}" aria-pressed="${selected}" ${disabled?'disabled':''} aria-label="${esc(item.name)}${state?`，${state}`:''}">${src?`<img ${window.itemArtwork?window.itemArtwork.prepare(src):`src="${src}"`} width="32" height="32" alt="" aria-hidden="true" decoding="async">`:`<span class="temp-library-fallback" aria-hidden="true">${categoryIcon(item.category||'')}</span>`}<span>${esc(item.name)}</span>${state?`<small>${state}</small>`:''}</button>`}
function renderTempLibrary(){const options=document.querySelector('#tempLibraryOptions'),empty=document.querySelector('#tempLibraryEmpty'),query=normalized(tempLibraryQuery);const items=data.library.filter(item=>!query||normalized(item.name).includes(query));options.innerHTML=items.map(tempLibraryItemMarkup).join('');empty.hidden=items.length>0;options.querySelectorAll('[data-temp-library]').forEach(button=>button.onclick=()=>toggleLibraryTemporary(button.dataset.tempLibrary))}
function removeTemporary(id){temporary=temporary.filter(item=>item.id!==id);confirmed.delete(id);document.querySelector(`[data-item="${id}"]`)?.remove();renderTemporary();layout(true);status()}
function toggleLibraryTemporary(libraryId){const existing=temporary.find(item=>item.sourceLibraryId===libraryId);if(existing)return removeTemporary(existing.id);const source=data.library.find(item=>item.id===libraryId);if(!source||active.items.includes(source.id))return;const id='temp-'+uid(),item={id,name:source.name,temporary:true,sourceLibraryId:source.id,illustrationKey:source.illustrationKey||null};temporary.push(item);bindItemIllustration(source);const src=illustrationById.get(source.id);if(src)illustrationById.set(id,src);addCard(id);renderTemporary();layout(true);status()}
function addCustomTemporary(){const input=document.querySelector('#tempItemName'),notice=document.querySelector('#tempItemNotice'),value=input.value.trim();notice.textContent='';if(!value){notice.textContent='请输入物品名称';input.focus();return}if(active.items.some(id=>normalized(name(id))===normalized(value))||temporary.some(item=>normalized(item.name)===normalized(value))){notice.textContent='这件物品已在本次检查中';return}const item={id:'temp-'+uid(),name:value,temporary:true,sourceLibraryId:null,illustrationKey:null};temporary.push(item);addCard(item.id);input.value='';notice.textContent='已加入本次检查';renderTemporary();layout(true);status()}
function openTempItems(){if(view!=='check')return;tempLibraryQuery='';document.querySelector('#tempItemSearch').value='';document.querySelector('#tempItemName').value='';document.querySelector('#tempItemNotice').textContent='';renderTempLibrary();tempItemDialog.showModal();requestAnimationFrame(()=>document.querySelector('#tempItemSearch').focus({preventScroll:true}))}
document.querySelector('#tempItemSearch').addEventListener('input',event=>{tempLibraryQuery=event.target.value;renderTempLibrary()});
document.querySelector('#tempItemForm').addEventListener('submit',event=>{event.preventDefault();addCustomTemporary()});
document.querySelector('#closeTempItems').onclick=()=>closeSheet(tempItemDialog);
tempItemDialog.addEventListener('pointerdown',event=>{tempDialogBackdropPressed=event.target===tempItemDialog});
tempItemDialog.addEventListener('click',event=>{if(tempDialogBackdropPressed&&event.target===tempItemDialog)closeSheet(tempItemDialog);tempDialogBackdropPressed=false});
let themeDialogBackdropPressed=false;
function themeOptionMarkup([id,theme]){return `<button type="button" class="theme-option" data-theme-id="${id}" aria-pressed="${themePreviewId===id}" data-current="${activeThemeId===id}"><span class="theme-swatches" aria-hidden="true">${theme.colors.map(color=>`<i style="background:${color}"></i>`).join('')}</span><span>${theme.name}</span>${activeThemeId===id?'<small>当前主题</small>':''}</button>`}
function renderThemePreview(){const theme=appThemes[themePreviewId],scenes=Array.from({length:4},(_,index)=>data.scenes[index]||{name:`场景 ${index+1}`,colorSlot:index});document.querySelector('#themeOptions').innerHTML=Object.entries(appThemes).map(themeOptionMarkup).join('');document.querySelector('#themePreviewName').textContent=theme.name;document.querySelector('#themeScenePreview').innerHTML=scenes.map((scene,index)=>`<div style="${sceneThemeStyle(scene,themePreviewId,index)}"><span>${esc(scene.name)}</span><small>Slot ${colorSlot(scene,index)+1}</small></div>`).join('');document.querySelectorAll('[data-theme-id]').forEach(button=>button.onclick=()=>{themePreviewId=button.dataset.themeId;renderThemePreview()})}
function openThemeDialog(){themePreviewId=activeThemeId;renderThemePreview();themeDialog.showModal();requestAnimationFrame(()=>document.querySelector(`[data-theme-id="${themePreviewId}"]`)?.focus({preventScroll:true}))}
document.querySelector('#closeThemeDialog').onclick=()=>closeSheet(themeDialog);
function applyThemeInPlace(){
 app.querySelector('#themeButton')?.setAttribute('aria-label',`选择主题，当前${appThemes[activeThemeId].name}`);
 app.querySelectorAll('.scene-shell[data-scene-id]').forEach((shell,index)=>{const scene=data.scenes.find(item=>item.id===shell.dataset.sceneId);if(!scene)return;const color=themeColor(scene,activeThemeId,index),ink=colorInk(color);shell.style.setProperty('--scene-card-color',color);shell.style.setProperty('--scene-card-ink',ink);shell.style.setProperty('--scene-card-art-filter',ink==='#fffdf8'?'invert(1) brightness(1.15)':'none')});
}
document.querySelector('#applyTheme').onclick=()=>{activeThemeId=themePreviewId;writeStorage(THEME_KEY,activeThemeId);applyThemeInPlace();closeSheet(themeDialog)};
themeDialog.addEventListener('pointerdown',event=>{themeDialogBackdropPressed=event.target===themeDialog});
themeDialog.addEventListener('click',event=>{if(themeDialogBackdropPressed&&event.target===themeDialog)closeSheet(themeDialog);themeDialogBackdropPressed=false});
[tempItemDialog,themeDialog].forEach(sheet=>sheet.addEventListener('cancel',event=>{event.preventDefault();closeSheet(sheet)}));
function status(){if(view!=='check')return;clearTimeout(completionPending);completionPending=null;const ids=[...active.items,...temporary.map(item=>item.id)],total=ids.length,current=confirmed.size,statusElement=document.querySelector('#status');if(total<=12){statusElement.innerHTML=`<span>${total?`已确认 ${current} / ${total} 件`:'还没有物品，添加一件再检查吧。'}</span>${total?`<div class="check-progress" style="--progress-count:${total}" aria-hidden="true">${ids.map(id=>`<i${confirmed.has(id)?' data-complete':''}></i>`).join('')}</div>`:''}`}else{statusElement.innerHTML=`<span>已确认 ${current} / ${total} 件</span><div class="check-progress check-progress-continuous" aria-hidden="true"><i style="width:${current/total*100}%"></i></div>`}
if(total&&current>=Math.max(1,total-1))scheduleGreetingPreload();
if(total&&confirmed.size===total)completionPending=setTimeout(showComplete,180)}
function showComplete(){
 if(view!=='check'||!active||!confirmed.size||confirmed.size!==active.items.length+temporary.length)return;
 clearCompletionTimers();
 if(!departures().some(r=>r.recordId===checkRecordId)){
  const fixedItems=checkSnapshot.items.map(item=>({...item,temporary:false,illustrationKey:data.library.find(entry=>entry.id===item.id)?.illustrationKey||null}));
  const temporaryItems=temporary.map(item=>({id:item.id,name:item.name,temporary:true,illustrationKey:item.illustrationKey||null}));
  const record={recordId:checkRecordId,sceneId:checkSnapshot.sceneId,sceneName:checkSnapshot.sceneName,themeColor:checkSnapshot.themeColor,completedAt:new Date().toISOString(),fixedItems,temporaryItems,items:[...fixedItems,...temporaryItems],missedItemIds:[]};
  if(!persist({...data,departures:[...departures(),record]}))return;
  if(historyWasEmptyAtBoot&&!historyGuideDone&&departures().length===1){historyGuidePending=true;writeStorage(HISTORY_GUIDE_PENDING_KEY,'1')}
 }
 if(dialog.open)dialog.close();
 loadGreetingImage();
 view='complete';
 app.dataset.view=view;
 app.innerHTML=`<section class="completion" aria-labelledby="completeTitle">
  <header>
   <p class="eyebrow">出门前最后一分钟</p>
   <h1 id="completeTitle" tabindex="-1">可以出发了</h1>
   <p class="completion-farewell">一路顺风，回来见。</p>
  </header>
  <img class="greeting-slot" src="${greetingSource}" width="1122" height="1402" alt="女孩和猫咪玩耍" decoding="async">
  <footer>
   <button class="back home-back" id="completeHome" type="button">返回首页</button>
   <p class="completion-return-hint">即将自动返回</p>
  </footer>
 </section>`;
 app.querySelector('#completeHome').onclick=home;
 app.querySelector('#completeTitle').focus({preventScroll:true});
 returnTimer=setTimeout(()=>{if(view==='complete')home()},3000);
}
function hash(s){let n=0;for(const c of s)n=(n*31+c.charCodeAt(0))>>>0;return n}
// Place measured card footprints in viewport pixels, including the exposed cat.
function layout(preserve=false){
 if(view!=='check')return;
 const board=document.querySelector('#board'),region=board.closest('.board-scroll');
 const width=region.clientWidth,height=region.clientHeight,pad=5;
 if(width<=pad*2||height===0)return;
 const elements=[...board.children];
 const measure=compact=>{
  board.toggleAttribute('data-compact',compact);
  const bases=elements.map(el=>{
   const id=el.dataset.item,seed=hash(active.id+id),length=name(id).length;
   const base=compact?Math.min(224,Math.max(104+seed%2*2,82+length*4)):Math.min(240,Math.max(136+seed%4*10,112+length*4));
   el.style.width=base+'px';
   return {el,seed,history:1+(entryCounts[id]||0)*.05};
  });
  return bases.map(card=>{
   const cat=card.el.querySelector('.cat-head');
   return {...card,width:card.el.offsetWidth,height:card.el.offsetHeight,cat:cat?Math.max(0,-cat.offsetTop+card.el.clientTop):0};
  });
 };

 function pack(cards,k,gap,keep=false,edge=false){
  const placed=[];
  let bottom=pad;
  for(const card of cards){
   const scale=card.history*k;
   const w=card.width*scale,cat=card.cat*scale,h=card.height*scale+cat;
   const right=Math.max(pad,width-pad-w);
   const anchor=edge?(card.seed%2?pad:right):pad+(right-pad)*(.15+(card.seed%71)/100);
   const free=(x,y)=>x>=pad-.001&&x<=right+.001&&y>=pad&&
    !placed.some(p=>x<p.x+p.w+gap-.001&&x+w+gap>p.x+.001&&y<p.y+p.h+gap-.001&&y+h+gap>p.y+.001);
   let best;
   const previous=keep&&card.el._rect;
   if(previous&&free(previous.x,previous.y))best={x:previous.x,y:previous.y};
   if(previous&&!best)return null;
   if(!best){
    const xs=new Set([anchor,pad,right]);
    const ys=new Set([pad,bottom+gap]);
    for(const p of placed){
     xs.add(p.x+p.w+gap);
     xs.add(p.x-gap-w);
     ys.add(p.y+p.h+gap);
    }
    let score=Infinity;
    for(const y of ys)for(const x of xs){
     if(!free(x,y))continue;
     const rank=Math.max(bottom,y+h)+.25*y+.18*Math.abs(x-anchor);
     if(rank<score){score=rank;best={x,y}}
    }
   }
   const rect={...best,w,h,cat,scale,el:card.el};
   placed.push(rect);
   bottom=Math.max(bottom,rect.y+h);
  }
  return {placed,bottom,k,compact:board.hasAttribute('data-compact')};
 }
 const fits=result=>result&&result.bottom+pad<=height+.01;
 const widthFit=cards=>Math.min(1,...cards.map(c=>(width-2*pad)/(c.width*c.history)));
 let result;
 if(preserve&&board.dataset.fit){
  const cards=measure(board.hasAttribute('data-compact'));
  const k=Number(board.dataset.fit);
  if(k<=widthFit(cards)){
   // Reserve existing positions before looking for a new card's space.
   cards.sort((a,b)=>Number(Boolean(b.el._rect))-Number(Boolean(a.el._rect)));
   const retained=pack(cards,k,Number(board.dataset.gap),true);
   if(fits(retained))result={...retained,gap:Number(board.dataset.gap),retained:true};
  }
 }
 for(const compact of [false,true]){
  if(result)break;
  const cards=measure(compact),max=widthFit(cards);
  const candidates=[...new Set([1,.95,.9,.85,max])].filter(k=>k>=.85&&k<=max);
  for(const k of candidates.sort((a,b)=>b-a)){
   const gap=compact||k<1?8:10;
   const byArea=[...cards].sort((a,b)=>((b.height+b.cat)*b.width*b.history**2)-((a.height+a.cat)*a.width*a.history**2));
   for(const order of [byArea,cards,[...byArea].reverse()]){
    const organic=pack(order,k,gap);
    const attempt=fits(organic)?organic:pack(order,k,gap,false,true);
    if(fits(attempt)){result={...attempt,gap};break}
   }
   if(result)break;
  }
 }
 if(!result){
  let cards=measure(false);
  if(widthFit(cards)<.85)cards=measure(true);
  result={...pack(cards,widthFit(cards),8),gap:8};
 }
 board.toggleAttribute('data-compact',result.compact);
 const offset=result.retained?0:Math.max(0,(height-result.bottom-pad)/2);
 for(const r of result.placed){
  r.y+=offset;
  r.el._rect=r;
  r.el.style.left=r.x+'px';
  r.el.style.top=r.y+r.cat+'px';
  r.el.style.transform='scale('+r.scale+')';
 }
 const contentHeight=Math.ceil(result.bottom+pad+offset-.01);
 board.style.height=Math.max(height,contentHeight)+'px';
 board.dataset.fit=String(result.k);
 board.dataset.gap=String(result.gap||8);
 const scroll=contentHeight>height;
 region.toggleAttribute('data-scroll',scroll);
 region.setAttribute('aria-label',scroll?'检查物品，可在此区域上下滚动':'检查物品');
}
let forgotten=new Set(),forgetContext=null;
function openForget(recordId,returnView=view){
 const record=typeof recordId==='string'?departures().find(r=>r.recordId===recordId):null;
 if(typeof recordId==='string'&&!record)return;
 if(!record&&!active)return;
 const normalized=record?normalizedDeparture(record):null;
 forgetContext=record?{recordId:record.recordId,sceneId:normalized.sceneId,sceneName:normalized.sceneName,items:departureItems(normalized),returnView}:{recordId:null,sceneId:active.id,sceneName:active.name,items:active.items.map(id=>({id,name:name(id),temporary:false})),returnView:'check'};
 forgotten=new Set((record?.missedItemIds||[]).filter(id=>forgetContext.items.some(i=>i.id===id)));
 const board=document.querySelector('#forgetBoard');board.replaceChildren(...forgetContext.items.map(item=>{const b=document.createElement('button');b.type='button';b.className='forget-node';b.dataset.id=item.id;b.setAttribute('aria-pressed',String(forgotten.has(item.id)));const currentItem=data.library.find(i=>i.id===item.id);
 if(currentItem)bindItemIllustration(currentItem);
 const src=illustrationById.get(item.id);
 const artwork=src?`<img class="forget-illustration" ${window.itemArtwork?window.itemArtwork.prepare(src):`src="${src}"`} width="48" height="48" alt="" aria-hidden="true" decoding="async">`:categoryIcon('');
 b.setAttribute('aria-label',item.name);
 b.innerHTML=`<div class="forget-content"><div class="forget-art" aria-hidden="true">${artwork}</div><span class="forget-name">${esc(item.name)}</span></div>`;b.onclick=()=>{forgotten.has(item.id)?forgotten.delete(item.id):forgotten.add(item.id);b.setAttribute('aria-pressed',String(forgotten.has(item.id)));updateForgotten()};return b}));
 document.querySelector('#forgetScene').textContent=forgetContext.sceneName;
 const back=dialog.querySelector('.back');
 back.classList.toggle('home-back',Boolean(record));
 back.textContent=record?'':'〈 返回检查';
 if(record)back.setAttribute('aria-label',returnView==='historyDetail'?'返回历史详情':'返回首页');
 else back.removeAttribute('aria-label');
 document.querySelector('#recordForget').textContent=record?'保存记录':'确认记录';
 updateForgotten();dialog.showModal();document.querySelector('#forgetScroll').scrollTop=0;layoutForgotten();
}
function updateForgotten(){document.querySelector('#forgetCount').textContent=`已选择 ${forgotten.size} 件`;document.querySelector('#recordForget').disabled=!forgetContext?.recordId&&forgotten.size===0}
function layoutForgotten(){if(!dialog.open)return;const board=document.querySelector('#forgetBoard'),width=board.clientWidth,available=document.querySelector('#forgetScroll').clientHeight,placed=[];let bottom=0;
const base=Math.max(80,Math.min(104,Math.sqrt(width*available/Math.max(1,board.children.length)*.58)));
for(const b of board.children){const seed=hash(forgetContext.sceneId+b.dataset.id);let diameter=Math.min(width-8,base+seed%3*3);b.style.width=diameter+'px';b.style.height=diameter+'px';
while(b.firstElementChild.scrollHeight>diameter*.66&&diameter<width-8){diameter=Math.min(width-8,diameter+6);b.style.width=diameter+'px';b.style.height=diameter+'px'}
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
 const fixedIds=new Set(departureItems(normalizedDeparture(record)).filter(item=>!item.temporary).map(item=>item.id));
 for(const id of new Set([...previous,...selected])){if(!fixedIds.has(id))continue;const delta=Number(selected.has(id))-Number(previous.has(id));if(delta)misses[id]=Math.max(0,(Number(misses[id])||0)+delta)}
 const next={...data,departures:departures().map(r=>r.recordId===record.recordId?{...r,missedItemIds:ids}:r)};
 if(scene)next.scenes=data.scenes.map(s=>s.id===scene.id?{...s,misses}:s);else next.archivedMisses={...data.archivedMisses,[context.sceneId]:misses};
 if(!persist(next))return;dialog.close();forgetContext=null;if(context.returnView==='historyDetail')openHistoryDetail(record.recordId,{push:false});else home();
 }else{
 if(!active||!ids.length)return;const misses={...active.misses};for(const id of ids)misses[id]=count(active,id)+1;const scene={...active,misses};if(!persist({...data,scenes:data.scenes.map(s=>s.id===scene.id?scene:s)}))return;active=scene;dialog.close();document.querySelector('#notice').textContent=`已记录 ${ids.length} 件物品遗漏，下次检查时生效。`;
 }
};
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(dialog.open)layoutForgotten();},100)});
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
// Populate the reusable library from approved illustration catalogs.
for(const [category,assets] of Object.entries(itemIllustrationCatalog))for(const [name,asset] of Object.entries(assets)){
 let item=data.library.find(i=>i.category===category&&normalized(i.name)===normalized(name));
 if(!item){item={id:uid(),name,category,categoryId:'builtin-'+categories.indexOf(category)};data.library.push(item)}
 item.illustrationKey=asset.key;
}
for(const item of data.library)bindItemIllustration(item);
if(Array.isArray(data.departures))data.departures=data.departures.map(normalizedDeparture);
historyGuideDone=readFlag(HISTORY_GUIDE_KEY);
historyGuidePending=readFlag(HISTORY_GUIDE_PENDING_KEY)&&!historyGuideDone;
try{historySeenAt=localStorage.getItem(HISTORY_SEEN_KEY)||''}catch{}
if(!readFlag(HISTORY_BASELINE_KEY)){if(departures().length&&!historySeenAt){historySeenAt=latestDeparture()?.completedAt||'';writeStorage(HISTORY_SEEN_KEY,historySeenAt)}writeStorage(HISTORY_BASELINE_KEY,'1')}
if(departures().length&&!historyGuideDone&&!historyGuidePending){historyGuideDone=true;writeStorage(HISTORY_GUIDE_KEY,'1')}
const localPreviewMode=location.hostname==='localhost'||location.hostname==='127.0.0.1';
function initialSceneItemIds(template){return template.items.map(itemName=>{const category=categories[catalog.findIndex(group=>group.includes(itemName))+1];return data.library.find(item=>item.name===itemName&&(!category||item.category===category))?.id||data.library.find(item=>item.name===itemName)?.id}).filter(Boolean)}
if(!data.initialSceneColorsV1){
 const shanghai=initialScenes.find(scene=>scene.id==='shanghai');
 const hasLegacyDefaults=initialScenes.slice(0,3).every(template=>data.scenes.some(scene=>scene.id===template.id));
 const hasShanghai=data.scenes.some(scene=>scene.id===shanghai.id||normalized(scene.name)===normalized(shanghai.name));
 if(hasLegacyDefaults&&!hasShanghai&&!Object.hasOwn(data.archivedMisses||{},shanghai.id)){
  const items=shanghai.items.map(name=>{
   const category=categories[catalog.findIndex(group=>group.includes(name))+1];
   return data.library.find(item=>item.name===name&&item.category===category)?.id;
  }).filter(Boolean);
  data.scenes.push({...shanghai,items,misses:{}});
 }
 data.initialSceneColorsV1=true;
}
if(localPreviewMode){for(const template of initialScenes)if(!data.scenes.some(scene=>scene.id===template.id))data.scenes.push({...template,items:initialSceneItemIds(template),misses:{}});const initialIds=new Set(initialScenes.map(scene=>scene.id));data.scenes=[...initialScenes.map(template=>data.scenes.find(scene=>scene.id===template.id)),...data.scenes.filter(scene=>!initialIds.has(scene.id))]}
data.scenes.forEach((scene,index)=>{
 const template=initialScenes.find(template=>template.id===scene.id);
 const slot=colorSlot(scene,index);
 scene.colorSlot=slot;
 scene.themeColor=template?.themeColor||validSceneColor(scene.themeColor)||calicoColors[slot];
});
persist(data);
window.addEventListener('popstate',event=>{
 if(dialog.open){dialog.close();forgetContext=null}
 const state=event.state;
 if(state?.lastMinuteView==='historyDetail'&&state.recordId)openHistoryDetail(state.recordId,{push:false,direction:'back'});
 else if(state?.lastMinuteView==='history')openHistory({push:false,restore:true,direction:'back'});
 else home();
});
const historyMatch=location.hash.match(/^#history\/(.+)$/);
if(historyMatch){const recordId=decodeURIComponent(historyMatch[1]);window.history.replaceState({lastMinuteView:'historyDetail',recordId},'',location.href);openHistoryDetail(recordId,{push:false})}
else if(location.hash==='#history'){window.history.replaceState({lastMinuteView:'history'},'',location.href);openHistory({push:false})}
else{window.history.replaceState({lastMinuteView:'home'},'',location.pathname+location.search);home()}

function expandScene(scene){
 if(transitioning)return;
 transitioning=true;enter(scene.dataset.scene);window.scrollTo(0,0);
 setTimeout(()=>{transitioning=false},300);
}

