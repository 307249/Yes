document.getElementById("enter-btn").addEventListener("click", function () {
  const keyInput = document.getElementById("key-input");
  const userKey = keyInput.value.trim();
  const savedKey = localStorage.getItem("accessKey");

  fetch('https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app/appSettings/lockEnabled.json')
    .then(response => response.json())
    .then(lockEnabled => {
      if (!lockEnabled) {
        window.location.href = "main.html"; // القفل غير مفعل
        return;
      }

      const finalKey = savedKey || userKey;

      if (!finalKey) {
        alert("⚠️ من فضلك أدخل الكود الصحيح الذي حصلت عليه من المدرس.");
        return;
      }

      fetch(`https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app/validKeys/${finalKey}.json`)
        .then(response => response.json())
        .then(data => {
          if (data && data.expiresAt && Date.now() < data.expiresAt) {
            localStorage.setItem("accessKey", finalKey); // حفظ الكود الصالح
            window.location.href = "main.html";
          } else {
            alert("⚠️ الكود غير صحيح أو انتهت صلاحيته.\nتواصل مع المدرس للحصول على كود جديد.");
            localStorage.removeItem("accessKey"); // مسح الكود غير الصالح
          }
        })
        .catch(error => {
          alert("حدث خطأ أثناء التحقق من الكود.");
        });
    });
});
