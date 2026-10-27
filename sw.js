/* Offline cache for the Larsen Kids Playroom. The version changes whenever the page changes. */
var CACHE = 'playroom-fe9ea20693a2';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf('playroom-') === 0 && k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
/* Answer from the saved copy right away (works offline), and quietly refresh it when online */
self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  var key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(key, { ignoreSearch: true }).then(function(hit){
      var fresh = fetch(req).then(function(res){ if (res && res.ok && res.type === 'basic') c.put(key, res.clone()); return res; }).catch(function(){ return hit; });
      if (hit) { e.waitUntil(fresh.then(function(){}, function(){})); return hit; }
      return fresh;
    });
  }));
});
