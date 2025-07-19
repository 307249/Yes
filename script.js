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
  const errorBox = document.getElementById("errorMsg");
  errorBox.textContent = "";

  try {
    const res = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const lockEnabled = await res.json();

    if (!lockEnabled) {
      if (codeInput) codeInput.style.display = "none";
      showPage("subjectsPage");
      return;
    }

    if (codeInput) codeInput.style.display = "block";

    const code = codeInput ? codeInput.value.trim() : "";

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
