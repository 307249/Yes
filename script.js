const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app"
};

const dbURL = firebaseConfig.databaseURL;

function goBack() {
  document.getElementById("subjectsPage").style.display = "none";
  document.querySelector(".container").style.display = "block";
}

async function handleAccess() {
  const codeInput = document.getElementById("codeInput").value.trim();
  const errorBox = document.getElementById("errorMsg");

  try {
    // التحقق من حالة التفعيل
    const lockRes = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const isLocked = await lockRes.json();

    if (isLocked !== true) {
      // القفل غير مفعل → فتح التطبيق
      showSubjects();
      return;
    }

    // القفل مفعل → التحقق من الكود
    const keysRes = await fetch(`${dbURL}/validKeys.json`);
    const keys = await keysRes.json() || {};
    const now = Date.now();
    const saved = localStorage.getItem("drosakKey");

    // تحقق من الكود الجديد أو المحفوظ
    for (const key in keys) {
      const entry = keys[key];
      if ((key === codeInput || key === saved) && now < entry.expiresAt) {
        localStorage.setItem("drosakKey", key);
        showSubjects();
        return;
      }
    }

    // صلاحية منتهية أو كود خاطئ
    if (codeInput in keys && now >= keys[codeInput].expiresAt) {
      errorBox.textContent = "انتهت صلاحية الكود، للتجديد تواصل معنا: @AL_MAALA";
    } else {
      errorBox.textContent = "❌ الكود غير صحيح";
    }

  } catch (e) {
    console.error(e);
    errorBox.textContent = "حدث خطأ أثناء الاتصال. تأكد من الإنترنت.";
  }
}

function showSubjects() {
  document.querySelector(".container").style.display = "none";
  document.getElementById("subjectsPage").style.display = "block";
}
