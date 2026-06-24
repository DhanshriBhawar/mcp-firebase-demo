import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyAYWI2jTHIHgQfkUiNQqqa8kmy9QHjHua8",
    authDomain: "mcp-firebase-demo-52bfd.firebaseapp.com",
    projectId: "mcp-firebase-demo-52bfd",
    storageBucket: "mcp-firebase-demo-52bfd.firebasestorage.app",
    messagingSenderId: "591730809249",
    appId: "1:591730809249:web:1f0818f75026bcd3a493e0",
    measurementId: "G-TNFNRH8HZ6"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const vapidKey = 'BE8l4NxNWjd7O_PmuS8y8imsF3cDpkKGCDGzJ-KUmhZjvahfXlP4qiSOF-xFsfpDFndduhEYqciZfD18_QTCxT8';

export { messaging, vapidKey };
