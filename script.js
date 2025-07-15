import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function handleAccess() {
  const codeInput = document.getElementById("codeInput");
  const errorBox = document.getElementById("errorMsg");
  const code = codeInput.value.trim();
  const savedKey = localStorage.getItem("drosakKey");
  const now = Date.now();

  try {
    const snapshot = await get(ref(db, "appSettings/lockEnabled"));
    const lockEnabled = snapshot.exists() ? snapshot.val() : false;

    // لو القفل غير مفعل → دخول مباشر
    if (!lockEnabled) {
      document.querySelector(".container").style.display = "none";
      document.getElementById("subjectsPage").style.display = "block";
      return;
    }

    // القفل مفعل → التحقق من الكود الحالي
    const keysSnapshot = await get(ref(db, "validKeys"));
    const keys = keysSnapshot.exists() ? keysSnapshot.val() : {};

    let validKey = null;
    for (const key in keys) {
      const entry = keys[key];
      if ((key === code || key === savedKey) && now < entry.expiresAt) {
        validKey = key;
        break;
      }
    }

    if (validKey) {
      localStorage.setItem("drosakKey", validKey);
      document.querySelector(".container").style.display = "none";
      document.getElementById("subjectsPage").style.display = "block";
    } else {
      if (code && keys[code] && now >= keys[code].expiresAt) {
        errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
      } else {
        errorBox.textContent = "❌ الكود خطأ للأشتراك كلمنا t.me/AL_MAALA";
      }
    }

  } catch (e) {
    console.error("Firebase error:", e);
    errorBox.textContent = "⚠️ حدث خطأ أثناء الاتصال بالسيرفر.";
  }
}

function goBack() {
  document.getElementById("subjectsPage").style.display = "none";
  document.querySelector(".container").style.display = "block";
}
