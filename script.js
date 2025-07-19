// firebase config هنا بتحط بيانات مشروعك
const firebaseConfig = {
  databaseURL: "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app/"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const startButton = document.getElementById("startButton");
const keyInput = document.getElementById("keyInput");
const message = document.getElementById("message");

startButton.addEventListener("click", async () => {
  message.textContent = "";

  try {
    const lockSnapshot = await database.ref("appSettings/lockEnabled").get();
    const isLocked = lockSnapshot.val();

    if (!isLocked) {
      window.location.href = "home.html";
      return;
    }

    const enteredKey = keyInput.value.trim();
    if (!enteredKey) {
      message.textContent = "يرجى إدخال المفتاح.";
      return;
    }

    const keySnapshot = await database.ref("validKeys/" + enteredKey).get();

    if (keySnapshot.exists()) {
      const expiresAt = keySnapshot.val().expiresAt;
      if (Date.now() < expiresAt) {
        window.location.href = "home.html";
      } else {
        message.textContent = "انتهت صلاحية المفتاح.";
      }
    } else {
      message.textContent = "المفتاح غير صحيح. تواصل معنا على تيليجرام.";
    }
  } catch (error) {
    message.textContent = "حدث خطأ. حاول مرة أخرى.";
    console.error(error);
  }
});
