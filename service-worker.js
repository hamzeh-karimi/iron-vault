self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("iron-vault-cache").then(cache => {
      return cache.addAll([
        "/",
        "index.html",
        "style.css",
        "app.js",
        "db.js"
      ]);
    })
  );
});
