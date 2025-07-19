const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app"
};

const dbURL = firebaseConfig.databaseURL;

// توليد ID للجهاز وتخزينه في localStorage
function getDeviceId() {
  let deviceId = localStorage.getItem("drosakDeviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("drosakDeviceId", deviceId);
  }
  return deviceId;
}

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
    // 1. التحقق من حالة القفل
    const res = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const lockEnabled = await res.json();

    // 2. لو القفل غير مفعّل → دخول مباشر
    if (!lockEnabled) {
      showPage("subjectsPage");
      return;
    }

    // 3. لو القفل مفعّل → لازم إدخال كود
    if (!code) {
      errorBox.textContent = "⚠️ من فضلك أدخل الكود";
      return;
    }

    const keysSnap = await fetch(`${dbURL}/validKeys.json`);
    const keysData = await keysSnap.json() || {};
    const now = Date.now();
    const deviceId = getDeviceId();

    const keyData = keysData[code];

    if (keyData) {
      const { expiresAt, deviceId: savedDeviceId } = keyData;

      if (now >= expiresAt) {
        errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
        return;
      }

      // لو مفيش جهاز مرتبط بالكود → نسجل الجهاز الحالي
      if (!savedDeviceId) {
        await fetch(`${dbURL}/validKeys/${code}/deviceId.json`, {
          method: "PUT",
          body: JSON.stringify(deviceId)
        });
        localStorage.setItem("drosakKey", code);
        showPage("subjectsPage");
        return;
      }

      // لو الجهاز هو نفسه → تمام
      if (savedDeviceId === deviceId) {
        localStorage.setItem("drosakKey", code);
        showPage("subjectsPage");
        return;
      }

      // لو جهاز مختلف
      errorBox.textContent = "❌ هذا الكود مستخدم بالفعل على جهاز آخر";

    } else {
      errorBox.textContent = "❌ الكود غير صحيح، تواصل معنا: @AL_MAALA";
    }

  } catch (err) {
    console.error(err);
    errorBox.textContent = "❌ حدث خطأ أثناء الاتصال بقاعدة البيانات";
  }
}
