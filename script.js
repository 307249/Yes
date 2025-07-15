const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app/"
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function handleAccess() {
  const codeInput = document.getElementById("codeInput");
  const code = codeInput.value.trim();
  const errorBox = document.getElementById("errorMsg");

  try {
    const res = await fetch(firebaseConfig.databaseURL + "/appSettings/lockEnabled.json");
    const isLocked = await res.json();

    if (!isLocked) {
      showPage("subjectsPage");
      return;
    }

    const savedKey = localStorage.getItem("drosakKey") || "";
    const res2 = await fetch(firebaseConfig.databaseURL + "/validKeys.json");
    const keys = await res2.json();
    const now = Date.now();

    let foundValid = false;

    for (const key in keys) {
      const data = keys[key];
      if ((key === code || key === savedKey) && now < data.expiresAt) {
        foundValid = true;
        localStorage.setItem("drosakKey", key);
        break;
      }
    }

    if (foundValid) {
      showPage("subjectsPage");
    } else {
      if (keys[code] && now >= keys[code].expiresAt) {
        errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
      } else {
        errorBox.textContent = "❌ الكود غير صحيح أو لم يتم إنشاؤه.";
      }
    }

  } catch (e) {
    console.error("حدث خطأ:", e);
    errorBox.textContent = "⚠️ حدث خطأ أثناء الاتصال بقاعدة البيانات.";
  }
}
