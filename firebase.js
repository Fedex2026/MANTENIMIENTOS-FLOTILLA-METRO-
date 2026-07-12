import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    get,
    child,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_TGANBa25toDvj8LXltQLq3_-YCsbQ0A",
  authDomain: "mantenimiento--de-flotilla.firebaseapp.com",
  databaseURL: "https://mantenimiento--de-flotilla-default-rtdb.firebaseio.com",
  projectId: "mantenimiento--de-flotilla",
  storageBucket: "mantenimiento--de-flotilla.firebasestorage.app",
  messagingSenderId: "348935340353",
  appId: "1:348935340353:web:92eb3021548ec9ec9321c0"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

window.db = db;
window.ref = ref;
window.push = push;
window.set = set;
window.get = get;
window.child = child;
window.update = update;
window.remove = remove;
window.onValue = onValue;
