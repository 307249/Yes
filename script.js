const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app/"
};
const databaseURL = firebaseConfig.databaseURL;

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function handleAccess() {
  const input = document.getElementById("codeInput");
  const code = input.value.trim();
  const errorBox = document.getElementById("errorMsg");

  try {
    const res = await fetch(`${databaseURL}/appSettings/lockEnabled.json`);
    const isLocked = await res.json();

    if (!isLocked) {
      showPage("subjectsPage");
      return;
    }

    const keysRes = await fetch(`${databaseURL}/validKeys.json`);
    const keys = await keysRes.json() || {};

    const now = Date.now();
    const savedKey = localStorage.getItem("drosakKey");

    let valid = false;
    for (const key in keys) {
      const k = keys[key];
      if ((key === code || key === savedKey) && now < k.expiry) {
        valid = true;
        localStorage.setItem("drosakKey", key);
        break;
      }
    }

    if (valid) {
      showPage("subjectsPage");
    } else {
      if (code && keys[code] && now >= keys[code].expiry) {
        errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
      } else {
        errorBox.textContent = "❌ الكود خطأ. تواصل معنا: t.me/AL_MAALA";
      }
    }

  } catch (err) {
    console.error(err);
    errorBox.textContent = "❌ حدث خطأ أثناء الاتصال بـ Firebase.";
  }
}
