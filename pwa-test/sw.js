'use strict';
const VERSION='pwa-test-v4-20261121';
const CACHE_NAME=`last-minute-pwa-${VERSION}`;
const CACHE_PREFIX='last-minute-pwa-';
const APP_SHELL=[
 './index.html','./style.css','./art-loader.js','./app.js','./pwa.js','./manifest.webmanifest',
 './assets/cat-peek.svg','./assets/cat-greeting.png','./assets/scene-trash.png','./assets/home-handdrawn.png',
 './assets/cat-peek-british-384-5aa5986f5f.webp','./assets/cat-peek-golden-384-de01d19d98.webp',
 './assets/cat-peek-tuxedo-384-47017d4aa4.webp','./assets/cat-peek-maine-384-ef48e7ba2a.webp',
 './assets/icons/apple-touch-icon-180.png','./assets/icons/app-icon-192.png','./assets/icons/app-icon-512.png'
];
const ITEM_PACKS=[
 './assets/item-packs/group-01-690f472c48.json','./assets/item-packs/group-02-94c899f7c6.json',
 './assets/item-packs/group-03-c052a03757.json','./assets/item-packs/group-04-0c3da3b3c9.json',
 './assets/item-packs/group-05-90e07ea9ef.json','./assets/item-packs/group-06-006bd57f1f.json',
 './assets/item-packs/group-07-ac9980346c.json','./assets/item-packs/group-08-39b00b108f.json',
 './assets/item-packs/group-09-5c91bc05ad.json','./assets/item-packs/group-10-0fc4d32bbf.json',
 './assets/item-packs/group-11-f930ffedf6.json','./assets/item-packs/group-12-91a6f6d691.json'
];
async function notifyReady(client){
 if(client){client.postMessage({type:'OFFLINE_READY'});return}
 const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
 windows.forEach(windowClient=>windowClient.postMessage({type:'OFFLINE_READY'}));
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const shellCache=await caches.open(CACHE_NAME);
 await shellCache.addAll(APP_SHELL);
 const artCache=await caches.open('last-minute-item-art-v1');
 for(const url of ITEM_PACKS){
  if(await caches.match(url))continue;
  const response=await fetch(url);
  if(!response.ok)throw Error(`Artwork bundle ${response.status}`);
  await artCache.put(url,response);
 }
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME).map(name=>caches.delete(name)));
 await clients.claim();
 await notifyReady();
})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='CHECK_OFFLINE_READY')event.waitUntil(caches.has(CACHE_NAME).then(ready=>ready&&notifyReady(event.source)));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(response=>response.ok?response:Promise.reject()).catch(()=>caches.match('./index.html')));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
