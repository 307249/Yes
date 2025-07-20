const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app"
};
const dbURL = firebaseConfig.databaseURL;

// عند تحميل الصفحة أول مرة، نثبت الصفحة الرئيسية في سجل التنقل
window.addEventListener("DOMContentLoaded", () => {
  history.replaceState({ pageId: "homePage" }, "", "#homePage");
});

// التعامل مع زر الرجوع في الهاتف/المتصفح
window.addEventListener("popstate", (event) => {
  const pageId = event.state && event.state.pageId;
  if (pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
  }
});

// دالة التنقل بين الصفحات وتسجيلها في التاريخ
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  history.pushState({ pageId: id }, "", `#${id}`);

  if (id === "settingsPage") {
    showSettingsInfo(); // استدعاء عرض معلومات الإعدادات
  }
}

// جلب معرّف الجهاز
function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "device-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

// محاولة الدخول عبر الكود أو فتح مباشر إذا القفل غير مفعّل
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

    const keysSnap = await fetch(`${dbURL}/validKeys/${code}.json`);
    const keyData = await keysSnap.json();
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

    if (!keyData.deviceId) {
      await fetch(`${dbURL}/validKeys/${code}/deviceId.json`, {
        method: "PUT",
        body: JSON.stringify(currentDevice)
      });
    }

    localStorage.setItem("drosakKey", code);
    showPage("subjectsPage");

  } catch (err) {
    console.error(err);
    errorBox.textContent = "❌ حدث خطأ أثناء الاتصال بقاعدة البيانات";
  }
}

// عرض بيانات صفحة الإعدادات حسب حالة القفل
async function showSettingsInfo() {
  const settingsPage = document.getElementById("settingsPage");
  const info = settingsPage.querySelector("div") || settingsPage.querySelector("p");
  info.textContent = "⏳ جاري التحميل...";

  try {
    const res = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const lockEnabled = await res.json();

    if (!lockEnabled) {
      info.textContent = "سيتم إضافة التاريخ في النسخة المدفوعة.";
      return;
    }

    const code = localStorage.getItem("drosakKey");
    if (!code) {
      info.textContent = "⚠️ لا يوجد كود مسجل حالياً.";
      return;
    }

    const keySnap = await fetch(`${dbURL}/validKeys/${code}.json`);
    const keyData = await keySnap.json();

    if (!keyData || !keyData.expiresAt) {
      info.textContent = "⚠️ لم يتم العثور على بيانات هذا الكود.";
      return;
    }

    const now = Date.now();
    const remainingTime = keyData.expiresAt - now;
    if (remainingTime <= 0) {
      info.textContent = "⚠️ الكود الخاص بك منتهي الصلاحية.";
      return;
    }

    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

    info.textContent = `⏱️ المدة المتبقية للكود: ${days} يوم، ${hours} ساعة، ${minutes} دقيقة`;

  } catch (err) {
    console.error(err);
    info.textContent = "⚠️ حدث خطأ أثناء تحميل البيانات.";
  }
}
```0
