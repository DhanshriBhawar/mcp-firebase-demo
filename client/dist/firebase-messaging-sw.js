importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAYWI2jTHIHgQfkUiNQqqa8kmy9QHjHua8",
  authDomain: "mcp-firebase-demo-52bfd.firebaseapp.com",
  projectId: "mcp-firebase-demo-52bfd",
  storageBucket: "mcp-firebase-demo-52bfd.firebasestorage.app",
  messagingSenderId: "591730809249",
  appId: "1:591730809249:web:1f0818f75026bcd3a493e0",
  measurementId: "G-TNFNRH8HZ6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'FleetEdge Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message from FleetEdge.',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
