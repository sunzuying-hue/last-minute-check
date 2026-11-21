'use strict';
(()=>{
 if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
 let readyShown=false;
 function showOfflineReady(){
  if(readyShown)return;
  readyShown=true;
  const notice=document.createElement('div');
  notice.className='pwa-ready';
  notice.setAttribute('role','status');
  notice.textContent='离线使用已准备好';
  document.body.append(notice);
  requestAnimationFrame(()=>notice.dataset.visible='true');
  setTimeout(()=>{delete notice.dataset.visible;setTimeout(()=>notice.remove(),220)},2600);
 }
 navigator.serviceWorker.addEventListener('message',event=>{
  if(event.data?.type==='OFFLINE_READY')showOfflineReady();
 });
 navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(async registration=>{
  const ready=await navigator.serviceWorker.ready;
  (ready.active||registration.active)?.postMessage({type:'CHECK_OFFLINE_READY'});
 }).catch(error=>console.warn('PWA registration failed',error));
})();
