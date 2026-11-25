self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Pengingat Jadwal",
    body: "Waktunya menjalankan agenda Anda.",
    tag: "jadwal-push",
    scheduleId: null
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (_) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    tag: payload.tag || "jadwal-push",
    renotify: true,
    icon: "manifest.json",
    data: { scheduleId: payload.scheduleId || null }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const scheduleId = event.notification.data && event.notification.data.scheduleId;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.postMessage({ type: "OPEN_SCHEDULE_DETAIL", scheduleId });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        const targetUrl = scheduleId ? `./index_4.html?scheduleId=${scheduleId}` : "./index_4.html";
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
