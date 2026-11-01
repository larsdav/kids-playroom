/* Offline cache for the Larsen Kids Playroom. The version changes whenever the page changes. */
var CACHE = 'playroom-860297634cfc';
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
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  var key = req.mode === 'navigate' ? './index.html' : req;
  /* only the playroom page itself may replace the saved page, not another file opened in a tab */
  var root = new URL('./', self.location).pathname;
  var keep = req.mode !== 'navigate' || url.pathname === root || url.pathname === root + 'index.html';
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(key, { ignoreSearch: true }).then(function(hit){
      var fresh = fetch(req).then(function(res){ if (keep && res && res.ok && res.type === 'basic') c.put(key, res.clone()); return res; }).catch(function(){ return hit; });
      if (hit) { e.waitUntil(fresh.then(function(){}, function(){})); return hit; }
      return fresh;
    });
  }));
});
