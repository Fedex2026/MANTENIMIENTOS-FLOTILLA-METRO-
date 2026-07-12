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

    apiKey: "TU_API_KEY",

    authDomain: "TU_AUTH_DOMAIN",

    databaseURL: "TU_DATABASE_URL",

    projectId: "TU_PROJECT_ID",

    storageBucket: "TU_STORAGE_BUCKET",

    messagingSenderId: "TU_MESSAGING_SENDER_ID",

    appId: "TU_APP_ID"

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
