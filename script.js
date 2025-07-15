const firebaseConfig = {
  databaseURL: "https://drosak-2f9fe-default-rtdb.europe-west1.firebasedatabase.app"
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
    const lockRes = await fetch(databaseURL + "/appSettings/lockEnabled.json");
    const lockEnabled = await lockRes.json();

    // لو القفل مش مفعّل
    if (!lockEnabled) {
      showPage("subjectsPage");
      return;
    }

    const keysRes = await fetch(databaseURL + "/validKeys.json");
    const keys = await keysRes.json() || {};
    const savedKey = localStorage.getItem("drosakKey");
    const now = Date.now();

    let validKey = null;
    for (const key in keys) {
      const entry = keys[key];
      if ((key === code || key === savedKey) && entry && now < entry.expiry) {
        validKey = key;
        break;
      }
    }

    if (validKey) {
      localStorage.setItem("drosakKey", validKey);
      showPage("subjectsPage");
    } else {
      if (code && keys[code] && now >= keys[code].expiry) {
        errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
      } else {
        errorBox.textContent = "❌ الكود خطأ للأشتراك كلمنا t.me/AL_MAALA";
      }
    }

  } catch (e) {
    console.error(e);
    errorBox.textContent = "⚠️ حدث خطأ أثناء الاتصال بـ Firebase.";
  }
}
