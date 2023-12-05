importScripts("./ngsw-worker.js");
self.addEventListener("fetch", (e) => {
  console.log("Fecth?", e);
  // e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
