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
  errorBox.textContent = "";

  try {
    const res = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const lockEnabled = await res.json();

    if (!lockEnabled) {
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
      // حفظ بيانات الكود
      localStorage.setItem("drosakKey", code);
      localStorage.setItem("accessCode", code);
      localStorage.setItem("expiresAt", keysData[code].expiresAt);
      localStorage.setItem("deviceId", getDeviceId());

      // تحقق من الجهاز
      if (keysData[code].deviceId && keysData[code].deviceId !== getDeviceId()) {
        errorBox.textContent = "❌ هذا الكود مخصص لجهاز آخر";
        return;
      }

      // أول مرة نحفظ الجهاز
      if (!keysData[code].deviceId) {
        await fetch(`${dbURL}/validKeys/${code}/deviceId.json`, {
          method: "PUT",
          body: JSON.stringify(getDeviceId())
        });
      }

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

function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

// فتح نافذة الإعدادات
function openSettings() {
  const code = localStorage.getItem("accessCode") || "غير متوفر";
  const expiresAt = localStorage.getItem("expiresAt");

  document.getElementById("settingsCode").textContent = code;

  if (expiresAt) {
    const now = Date.now();
    const remainingTime = parseInt(expiresAt) - now;

    if (remainingTime > 0) {
      const daysLeft = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      document.getElementById("settingsCountdown").textContent = `${daysLeft} يوم`;
    } else {
      document.getElementById("settingsCountdown").textContent = "انتهت الصلاحية";
    }
  } else {
    document.getElementById("settingsCountdown").textContent = "غير متوفر";
  }

  document.getElementById("settingsModal").style.display = "flex";
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}
