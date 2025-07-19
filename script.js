const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app"
};

const dbURL = firebaseConfig.databaseURL;

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function handleAccess() {
  const codeInput = document.getElementById("codeInput");
  const code = codeInput.value.trim();
  const errorBox = document.getElementById("errorMsg");

  try {
    const res = await fetch(`${dbURL}/appSettings.json`);
    const settings = await res.json();

    const lockEnabled = settings?.lockEnabled === true;

    if (!lockEnabled) {
      showPage("subjectsPage");
      return;
    }

    const keysSnap = await fetch(`${dbURL}/validKeys.json`);
    const keysData = await keysSnap.json() || {};
    const savedKey = localStorage.getItem("drosakKey");
    const now = Date.now();

    let matchedKey = null;

    for (const key in keysData) {
      const entry = keysData[key];
      if ((key === code || key === savedKey) && now < entry.expiresAt) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      localStorage.setItem("drosakKey", matchedKey);
      showPage("subjectsPage");
    } else {
      if (code && keysData[code] && now >= keysData[code].expiresAt) {
        errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
      } else {
        errorBox.textContent = "❌ الكود غير صحيح، تواصل معنا: @AL_MAALA";
      }
    }

  } catch (err) {
    console.error(err);
    errorBox.textContent = "❌ حدث خطأ أثناء الاتصال بقاعدة البيانات";
  }
}

// تحقق تلقائي عند أول فتح إذا الكود محفوظ وصالح
window.addEventListener("DOMContentLoaded", handleAccess);
