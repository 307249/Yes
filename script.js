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

async function handleAccess() {
  const codeInput = document.getElementById('codeInput');
  const errorMsg = document.getElementById('errorMsg');
  const noticeBox = document.querySelector('.notice-box');

  // 1. التحقق من حالة القفل
  const lockEnabledSnap = await db.ref('appSettings/lockEnabled').once('value');
  const lockEnabled = lockEnabledSnap.val();

  if (!lockEnabled) {
    // إذا القفل غير مفعل → إخفاء خانة الكود والرسالة وفتح التطبيق
    codeInput.style.display = 'none';
    noticeBox.style.display = 'none';
    errorMsg.textContent = '';
    showPage('subjectsPage');
    return;
  } else {
    // إذا القفل مفعل → إظهار خانة الكود والرسالة
    codeInput.style.display = 'block';
    noticeBox.style.display = 'block';
  }

  // 2. الحصول على الكود من localStorage أو من خانة الإدخال
  let userCode = localStorage.getItem('savedCode') || codeInput.value.trim();

  if (!userCode) {
    errorMsg.textContent = "⚠️ من فضلك أدخل الكود أولاً أو تواصل معنا عبر تليجرام.";
    return;
  }

  // 3. التحقق من الكود داخل Firebase
  const codeSnap = await db.ref('validKeys/' + userCode).once('value');
  const codeData = codeSnap.val();

  if (!codeData) {
    errorMsg.textContent = "❌ الكود غير صحيح. إذا كانت هناك مشكلة، تواصل معنا على تليجرام.";
    return;
  }

  // 4. التحقق من انتهاء صلاحية الكود
  const now = Date.now();
  if (codeData.expiry && now > codeData.expiry) {
    errorMsg.textContent = "⌛ انتهت صلاحية الكود. من فضلك اطلب كود جديد.";
    return;
  }

  // ✅ الكود صحيح وصالح → نحفظه وندخل
  localStorage.setItem('savedCode', userCode);
  errorMsg.textContent = '';
  showPage('subjectsPage');
}
