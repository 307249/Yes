// Firebase إعداد
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const startButton = document.getElementById("startButton");
const backButton = document.getElementById("backButton");
const openSettings = document.getElementById("openSettings");
const settingsButton = document.getElementById("settingsButton");
const backToSubjects = document.getElementById("backToSubjects");

const homeScreen = document.getElementById("homeScreen");
const subjectScreen = document.getElementById("subjectScreen");
const settingsScreen = document.getElementById("settingsScreen");
const codeInfo = document.getElementById("codeInfo");

startButton.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  subjectScreen.classList.remove("hidden");
});

backButton?.addEventListener("click", () => {
  subjectScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
});

settingsButton.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  settingsScreen.classList.remove("hidden");
  loadSettings();
});

openSettings.addEventListener("click", () => {
  subjectScreen.classList.add("hidden");
  settingsScreen.classList.remove("hidden");
  loadSettings();
});

backToSubjects.addEventListener("click", () => {
  settingsScreen.classList.add("hidden");
  subjectScreen.classList.remove("hidden");
});

function loadSettings() {
  const code = localStorage.getItem("usedCode");
  db.ref("appSettings/lockEnabled").once("value").then((snap) => {
    const isLocked = snap.val();
    if (isLocked && code) {
      db.ref("validKeys/" + code).once("value").then((codeSnap) => {
        const data = codeSnap.val();
        if (data && data.expiry) {
          const now = Date.now();
          const remaining = data.expiry - now;
          if (remaining > 0) {
            const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
            codeInfo.innerText = `المدة المتبقية على صلاحية الكود: ${days} يوم`;
          } else {
            codeInfo.innerText = "انتهت صلاحية الكود.";
          }
        } else {
          codeInfo.innerText = "لم يتم العثور على معلومات الكود.";
        }
      });
    } else {
      codeInfo.innerText = "سيتم إضافة التاريخ في النسخة المدفوعة.";
    }
  });
}
