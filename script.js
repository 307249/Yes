// Firebase إعداد
const firebaseConfig = {
  apiKey: "AIzaSyC7-CmXyK2GJuX5apHHV-mRjzu9W5w-sfs",
  authDomain: "drosak-v2.firebaseapp.com",
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "drosak-v2",
  storageBucket: "drosak-v2.appspot.com",
  messagingSenderId: "179506730602",
  appId: "1:179506730602:web:5610ac152c660e9ae0e3c7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// تشغيل التطبيق عند الضغط على زر "يلا بينا"
async function handleAccess() {
  const codeInput = document.getElementById('codeInput');
  const errorMsg = document.getElementById('errorMsg');
  const noticeBox = document.querySelector('.notice-box');

  // التحقق من حالة القفل من Firebase
  const lockSnap = await db.ref("appSettings/lockEnabled").once("value");
  const lockEnabled = lockSnap.val();

  if (!lockEnabled) {
    // إذا القفل غير مفعل → ندخل التطبيق ونخفي الخانة
    codeInput.style.display = "none";
    noticeBox.style.display = "none";
    errorMsg.textContent = "";
    showPage("subjectsPage");
    return;
  } else {
    // لو القفل مفعل → نظهر الخانة للمستخدم
    codeInput.style.display = "block";
    noticeBox.style.display = "block";
  }

  // التأكد من وجود كود
  const enteredCode = codeInput.value.trim();
  if (!enteredCode) {
    errorMsg.textContent = "⚠️ من فضلك أدخل الكود أولاً.";
    return;
  }

  // التحقق من الكود في Firebase
  const keySnap = await db.ref("validKeys/" + enteredCode).once("value");
  const keyData = keySnap.val();

  if (!keyData) {
    errorMsg.textContent = "❌ الكود غير صحيح.";
    return;
  }

  // التأكد من صلاحية الكود
  const now = Date.now();
  if (keyData.expiry && now > keyData.expiry) {
    errorMsg.textContent = "⌛ انتهت صلاحية الكود.";
    return;
  }

  // ✅ الكود صحيح → نحفظه وندخل التطبيق
  localStorage.setItem("savedCode", enteredCode);
  errorMsg.textContent = "";
  showPage("subjectsPage");
}

// تحميل الكود المحفوظ تلقائيًا في خانة الإدخال (اختياري)
window.onload = async function () {
  const codeInput = document.getElementById("codeInput");
  const noticeBox = document.querySelector(".notice-box");

  // نتحقق من حالة القفل لإظهار أو إخفاء خانة الكود
  const lockSnap = await db.ref("appSettings/lockEnabled").once("value");
  const lockEnabled = lockSnap.val();

  if (!lockEnabled) {
    codeInput.style.display = "none";
    noticeBox.style.display = "none";
  } else {
    codeInput.style.display = "block";
    noticeBox.style.display = "block";
  }

  const savedCode = localStorage.getItem("savedCode");
  if (savedCode) {
    codeInput.value = savedCode;
  }
};

// التنقل بين الصفحات
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}
