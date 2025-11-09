// sw.js - Service Worker file
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  return self.clients.claim();
});

// Handle push events (incoming notifications)
self.addEventListener("push", (event) => {
  console.log("Push notification received", event);

  let notificationData = {};

  try {
    // Try to get the data sent with the notification
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.error("Error parsing push notification data:", error);
    // Use default notification if parsing fails
    notificationData = {
      title: "Notification",
      options: {
        body: "New notification from Story App",
        icon: "/icons/icon-192x192.png",
      },
    };
  }

  // Ensure the service worker stays active until the notification is shown
  event.waitUntil(
    self.registration.showNotification(notificationData.title || "Story App", {
      body: notificationData.options?.body || "You have a new notification",
      icon: notificationData.options?.icon || "/icons/icon-192x192.png",
      badge: notificationData.options?.badge || "/icons/badge-72x72.png",
      data: notificationData.data || {},
    })
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked", event);

  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Get notification data (if any)
      const data = event.notification.data || {};
      // URL to open when notification is clicked (default to home)
      const urlToOpen = data.url || "/";

      // Check if there is already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }

      // If no window/tab is open or URL doesn't match, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
