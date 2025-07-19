// firebaseConfig هنا المفروض يكون معرف مسبقًا في كود HTML

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.onload = () => {
  const startButton = document.getElementById("startButton");

  startButton.addEventListener("click", async () => {
    try {
      const lockSnapshot = await get(ref(db, "appSettings/lockEnabled"));
      const lockEnabled = lockSnapshot.exists() ? lockSnapshot.val() : false;

      if (!lockEnabled) {
        window.location.href = "main.html";
        return;
      }

      // الزر مفعل - نكمل التحقق من الكود

      // هل فيه كود محفوظ في التخزين المحلي؟
      const storedCode = localStorage.getItem("accessCode");
      if (!storedCode) {
        alert("يرجى إدخال كود الوصول من التطبيق المولد أولاً.");
        return;
      }

      // تحقق من وجود الكود وصلاحيته في قاعدة البيانات
      const keySnapshot = await get(ref(db, `validKeys/${storedCode}`));

      if (keySnapshot.exists()) {
        const keyData = keySnapshot.val();
        const currentTime = Date.now();

        if (keyData.expiresAt && currentTime < keyData.expiresAt) {
          // كود صالح
          window.location.href = "main.html";
        } else {
          alert("انتهت صلاحية هذا الكود. يرجى إدخال كود جديد.");
        }
      } else {
        alert("الكود غير صحيح. يرجى إدخال كود تم إنشاؤه من التطبيق المولد.");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ أثناء التحقق من الكود. حاول مرة أخرى.");
    }
  });
};
