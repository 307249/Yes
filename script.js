// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDCZtE2gp4KfAbEUECskGuYtc0xxx",
  authDomain: "drosak-v2.firebaseapp.com",
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "drosak-v2",
  storageBucket: "drosak-v2.appspot.com",
  messagingSenderId: "759013079383",
  appId: "1:759013079383:web:abc123"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const startBtn = document.getElementById("startBtn");
const codeInput = document.getElementById("codeInput");
const message = document.getElementById("message");

startBtn.addEventListener("click", async () => {
  const code = codeInput.value.trim() || localStorage.getItem("savedCode");

  try {
    const snapshot = await db.ref("appSettings/lockEnabled").once("value");
    const lockEnabled = snapshot.val();

    if (!lockEnabled) {
      // لو القفل غير مفعل افتح التطبيق مباشرة
      window.location.href = "subjects.html";
      return;
    }

    if (!code) {
      message.textContent = "من فضلك ادخل كود التفعيل أولاً.";
      return;
    }

    const keySnapshot = await db.ref("validKeys/" + code).once("value");
    const keyData = keySnapshot.val();

    if (keyData && Date.now() < keyData.expiresAt) {
      localStorage.setItem("savedCode", code);
      window.location.href = "subjects.html";
    } else {
      message.innerHTML = `الكود خاطئ أو منتهي. <br><a href="https://t.me/yourTelegram" target="_blank">راسل الدعم</a>`;
    }
  } catch (err) {
    message.textContent = "حدث خطأ أثناء الاتصال بقاعدة البيانات.";
    console.error(err);
  }
});
