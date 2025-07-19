const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app"
};

const dbURL = firebaseConfig.databaseURL;

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if (id === 'settingsPage') {
    loadKeyInfo();
  }
}

async function handleAccess() {
  const codeInput = document.getElementById("codeInput");
  const code = codeInput.value.trim();
  const errorBox = document.getElementById("errorMsg");
  errorBox.textContent = "";

  try {
    const res = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const lockEnabled = await res.json();

    if (!lockEnabled) {
      localStorage.setItem("drosakKey", "free_access");
      showPage("subjectsPage");
      return;
    }

    if (!code) {
      errorBox.textContent = "⚠️ من فضلك أدخل الكود";
      return;
    }

    const keysSnap = await fetch(`${dbURL}/validKeys.json`);
    const keysData = await keysSnap.json() || {};
    const now = Date.now();

    if (keysData[code] && now < keysData[code].expiresAt) {
      localStorage.setItem("drosakKey", code);
      showPage("subjectsPage");
    } else if (keysData[code] && now >= keysData[code].expiresAt) {
      errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
    } else {
      errorBox.textContent = "❌ الكود غير صحيح، تواصل معنا: @AL_MAALA";
    }
  } catch (err) {
    console.error(err);
    errorBox.textContent = "❌ حدث خطأ أثناء الاتصال بقاعدة البيانات";
  }
}

async function loadKeyInfo() {
  const keyDisplay = document.getElementById("keyDisplay");
  const userKey = localStorage.getItem("drosakKey");

  try {
    const lockRes = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const lockEnabled = await lockRes.json();

    if (!lockEnabled || userKey === "free_access") {
      keyDisplay.textContent = "سيتم إضافة التاريخ في النسخة المدفوعة";
      return;
    }

    const keyDataRes = await fetch(`${dbURL}/validKeys/${userKey}.json`);
    const keyData = await keyDataRes.json();

    if (keyData && keyData.expiresAt) {
      const now = Date.now();
      const diffMs = keyData.expiresAt - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      keyDisplay.textContent = `الكود: ${userKey} - المدة المتبقية: ${diffDays} يوم`;
    } else {
      keyDisplay.textContent = "لا يمكن جلب تفاصيل الكود";
    }
  } catch (e) {
    keyDisplay.textContent = "خطأ في تحميل البيانات";
    console.error(e);
  }
}
