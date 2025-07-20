const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app"
};
const dbURL = firebaseConfig.databaseURL;

// عرض/إخفاء الصفحات
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// توليد معرف جهاز لحفظ المحاولة الأولى
function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "device-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

// التعامل مع زر "يلا بينا"
async function handleAccess() {
  const codeInput = document.getElementById("codeInput");
  const code = codeInput.value.trim();
  const errorBox = document.getElementById("errorMsg");
  errorBox.textContent = "";

  try {
    // جلب حالة القفل
    const res = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const lockEnabled = await res.json();

    // لو غير مفعل → مباشرة
    if (!lockEnabled) {
      showPage("subjectsPage");
      return;
    }

    // لو مفعل ولا يوجد كود
    if (!code) {
      errorBox.textContent = "⚠️ من فضلك أدخل الكود";
      return;
    }

    // جلب بيانات الكود
    const keyRes = await fetch(`${dbURL}/validKeys/${code}.json`);
    const keyData = await keyRes.json();
    const now = Date.now();
    const device = getDeviceId();

    if (!keyData) {
      errorBox.textContent = "❌ الكود غير صحيح، تواصل معنا: @AL_MAALA";
      return;
    }
    if (now >= keyData.expiresAt) {
      errorBox.textContent = "⚠️ انتهت صلاحية الكود";
      return;
    }
    if (keyData.deviceId && keyData.deviceId !== device) {
      errorBox.textContent = "❌ هذا الكود مرتبط بجهاز آخر";
      return;
    }

    // تخزين معرف الجهاز في المرة الأولى
    if (!keyData.deviceId) {
      await fetch(`${dbURL}/validKeys/${code}/deviceId.json`, {
        method: "PUT",
        body: JSON.stringify(device)
      });
    }

    // حفظ الكود محليًا
    localStorage.setItem("drosakKey", code);
    showPage("subjectsPage");
  } catch (e) {
    console.error(e);
    document.getElementById("errorMsg").textContent = "❌ خطأ في الاتصال";
  }
}

// عند فتح صفحة الإعدادات
async function loadKeyInfo() {
  const display = document.getElementById("keyInfoDisplay");
  const savedKey = localStorage.getItem("drosakKey");

  try {
    // جلب حالة القفل
    const lockRes = await fetch(`${dbURL}/appSettings/lockEnabled.json`);
    const locked = await lockRes.json();

    // لو غير مفعل
    if (!locked) {
      display.textContent = "🛈 سيتم إضافة التاريخ في النسخة المدفوعة";
      return;
    }

    // لو مفعل ويوجد كود محفوظ
    if (savedKey) {
      const keyRes = await fetch(`${dbURL}/validKeys/${savedKey}.json`);
      const keyData = await keyRes.json();
      const now = Date.now();

      if (keyData && keyData.expiresAt) {
        const days = Math.ceil((keyData.expiresAt - now) / (1000*60*60*24));
        display.textContent = `الكود: ${savedKey} - المتبقي: ${days} يوم`;
      } else {
        display.textContent = "⚠️ لا توجد معلومات صالحة للكود";
      }
    } else {
      display.textContent = "⚠️ لم تقم بإدخال أي كود بعد";
    }
  } catch (e) {
    console.error(e);
    display.textContent = "❌ خطأ في تحميل المعلومات";
  }
}

// استدعاء loadKeyInfo عند عرض صفحة الإعدادات
document.getElementById("settingsPage").addEventListener("transitionend", () => {
  if (document.getElementById("settingsPage").classList.contains("active")) {
    loadKeyInfo();
  }
});
