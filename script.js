const databaseURL = "https://drosak-v2-default-rtdb.europe-west1.firebasedatabase.app/";

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function handleAccess() {
  const input = document.getElementById("codeInput");
  const code = input.value.trim();
  const errorBox = document.getElementById("errorMsg");

  try {
    const res = await fetch(databaseURL + "/appSettings.json");
    const settings = await res.json();

    const isLocked = settings?.lockEnabled === true;
    const keys = settings?.validKeys || {};
    const savedKey = localStorage.getItem("drosakKey");
    const now = Date.now();

    if (!isLocked) {
      showPage("subjectsPage");
      return;
    }

    let validKey = null;
    for (const key in keys) {
      const entry = keys[key];
      if ((key === code || key === savedKey) && entry && now < entry.expiresAt) {
        validKey = key;
        break;
      }
    }

    if (validKey) {
      localStorage.setItem("drosakKey", validKey);
      showPage("subjectsPage");
    } else {
      if (code && keys[code] && now >= keys[code].expiresAt) {
        errorBox.textContent = "⚠️ انتهت صلاحية الكود الخاص بك للتجديد كلمنا هنا: @AL_MAALA";
      } else {
        errorBox.textContent = "❌ الكود خطأ، للأشتراك كلمنا: t.me/AL_MAALA";
      }
    }
  } catch (err) {
    console.error(err);
    errorBox.textContent = "❌ حدث خطأ أثناء التحقق من الكود.";
  }
}
