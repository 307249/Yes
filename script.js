// إعداد Firebase
const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app"
};
const dbURL = firebaseConfig.databaseURL;

// نثبت الصفحة الرئيسية في سجل التاريخ أول مرة
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

// دالة عرض صفحة وتسجيلها في التاريخ
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  history.pushState({ pageId: id }, "", `#${id}`);

  if (id === "settingsPage") {
    showSettingsInfo();
  }
}

// توليد معرّف الجهاز
function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "device-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

// معالجة الدخول أو فتح مباشر عند القفل غير مفعل
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

    const keyRes = await fetch(`${dbURL}/validKeys/${code}.json`);
    const keyData = await keyRes.json();
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
    document.getElementById("errorMsg").textContent = "❌ حدث خطأ أثناء الاتصال بقاعدة البيانات";
  }
}

// عرض بيانات صفحة الإعدادات
async function showSettingsInfo() {
  const container = document.getElementById("settingsContent");
  container.textContent = "⏳ جاري التحميل...";

  try {
    const lockRes = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const lockEnabled = await lockRes.json();

    if (!lockEnabled) {
      container.textContent = "سيتم إضافة التاريخ في النسخة المدفوعة.";
      return;
    }

    const code = localStorage.getItem("drosakKey");
    if (!code) {
      container.textContent = "⚠️ لا يوجد كود مسجل حالياً.";
      return;
    }

    const keyRes = await fetch(`${dbURL}/validKeys/${code}.json`);
    const keyData = await keyRes.json();

    if (!keyData || !keyData.expiresAt) {
      container.textContent = "⚠️ لم يتم العثور على بيانات هذا الكود.";
      return;
    }

    const now = Date.now();
    const diff = keyData.expiresAt - now;
    if (diff <= 0) {
      container.textContent = "⚠️ الكود الخاص بك منتهي الصلاحية.";
      return;
    }

    const days   = Math.floor(diff / (1000*60*60*24));
    const hours  = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const mins   = Math.floor((diff % (1000*60*60)) / (1000*60));

    container.textContent =
      `🔑 الكود: ${code}\n⏱️ المدة المتبقية: ${days} يوم، ${hours} ساعة، ${mins} دقيقة`;

  } catch (err) {
    console.error(err);
    container.textContent = "⚠️ حدث خطأ أثناء تحميل البيانات.";
  }
}
