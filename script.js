const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app"
};

const dbURL = firebaseConfig.databaseURL;

function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "device-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
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
      alert("✅ تم الدخول بنجاح، القفل غير مفعل.");
      return;
    }

    if (!code) {
      errorBox.textContent = "⚠️ من فضلك أدخل الكود";
      return;
    }

    const keySnap = await fetch(`${dbURL}/validKeys/${code}.json`);
    const keyData = await keySnap.json();
    const now = Date.now();
    const currentDevice = getDeviceId();

    if (!keyData) {
      errorBox.textContent = "❌ الكود غير صحيح، تواصل معنا: @AL_MAALA";
      return;
    }

    if (now >= keyData.expiresAt) {
      errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
      return;
    }

    if (keyData.deviceId && keyData.deviceId !== currentDevice) {
      errorBox.textContent = "❌ هذا الكود مرتبط بجهاز آخر بالفعل.";
      return;
    }

    // حفظ deviceId إذا لم يكن موجود
    if (!keyData.deviceId) {
      await fetch(`${dbURL}/validKeys/${code}/deviceId.json`, {
        method: "PUT",
        body: JSON.stringify(currentDevice)
      });
    }

    localStorage.setItem("drosakKey", code);
    alert("✅ تم التحقق بنجاح، سيتم فتح التطبيق.");

  } catch (err) {
    console.error(err);
    errorBox.textContent = "❌ حدث خطأ أثناء الاتصال بقاعدة البيانات";
  }
}
