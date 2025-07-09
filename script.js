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
    const res = await fetch(databaseURL + "/appSettings.json");
    const settings = await res.json();
    const isLocked = settings.lockEnabled;

    if (!isLocked) {
      showPage("subjectsPage");
      return;
    }

    const keys = settings.validKeys || {};
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
    errorBox.textContent = "حدث خطأ أثناء التحقق. تأكد من الاتصال بالإنترنت.";
  }
}
