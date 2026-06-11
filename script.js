// ===============================
// 🔓 AUDIO UNLOCK (Browser Fix)
// ===============================
document.addEventListener(
  "click",
  () => {
    adhanAudio
      .play()
      .then(() => {
        adhanAudio.pause();
        adhanAudio.currentTime = 0;
        console.log("Audio unlocked ✅");
      })
      .catch(() => {});
  },
  { once: true },
);
// ===============================
// STOP ADHAN FUNCTION
// ===============================
function stopAdhan() {
  adhanAudio.pause();
  adhanAudio.currentTime = 0;

  const stopBtn = document.getElementById("stop-adhan-btn");
  if (stopBtn) stopBtn.style.display = "none";
}
// ===============================
// REQUEST NOTIFICATION PERMISSION
// ===============================

let userInteracted = false;

document.body.addEventListener("click", () => {
  userInteracted = true;
});

const adhanAudio = new Audio("adhan.mp3");

function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      }
    });
  }
}

// Ask permission when page loads
requestNotificationPermission();

function showPrayerNotification(prayerName) {
  if (Notification.permission === "granted") {
    new Notification("🕌 Salah Time", {
      body: `It's time for ${prayerName} prayer.`,
      icon: "mosque.png",
    });
  }

  playAdhan(prayerName);

  // 👇 SHOW STOP BUTTON
  const stopBtn = document.getElementById("stop-adhan-btn");
  if (stopBtn) stopBtn.style.display = "block";

  const box = document.createElement("div");
  box.className = "adhan-alert";
  box.innerText = "🕌 " + prayerName + " time started";

  document.body.appendChild(box);

  setTimeout(() => {
    box.remove();
  }, 5000);
}

// ===============================
// PLAY ADHAN FUNCTION
// ===============================
function playAdhan(prayerName) {
  console.log("Trying to play adhan...");

  if (!userInteracted) {
    console.log("User has NOT interacted ❌");
    return;
  }

  console.log("User interacted ✅");

  if (prayerName === "Fajr") {
    adhanAudio.src = "fajr-adhan.mp3";
  } else {
    adhanAudio.src = "adhan.mp3";
  }

  adhanAudio.pause();
  adhanAudio.currentTime = 0;

  adhanAudio
    .play()
    .then(() => {
      console.log("Adhan playing ✅");
    })
    .catch((err) => {
      console.log("Error playing:", err);
    });

  setTimeout(() => {
    adhanAudio.pause();
  }, 120000);
}
// ===============================
// CHECK IF PRAYER TIME MATCHES
// ===============================

let lastAdhan = "";
function checkPrayerNotification(timings) {
  const now = new Date();
  const currentTime = now.toLocaleTimeString("en-GB", {
    timeZone: currentTimezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  for (let prayer in timings) {
    if (timings[prayer] === currentTime && lastAdhan !== prayer) {
      showPrayerNotification(prayer);
      lastAdhan = prayer;
    }
  }
}

// ===============================
// GLOBAL TIMEZONE (DEFAULT)
// ===============================

let currentTimezone = "Asia/Kolkata";

// ===============================
// TIME HELPER FUNCTION
// Converts "HH:MM" → total minutes
// Used for prayer time comparison
// ===============================

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// ===============================
// HELPER: ADD MINUTES TO TIME
// Used for Nafl prayers (Ishraq, Chasht)
// ===============================

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
}

// ===============================
//  WORLD TIME, ENGLISH DATE, HIJRI DATE
// ===============================

function updateDateAndWorldTime() {
  const now = new Date();

  // English Date
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: currentTimezone,
  };
  const englishDate = now.toLocaleDateString("en-US", dateOptions);

  // World Time (based on selected city timezone)
  const worldTime = now.toLocaleTimeString("en-US", {
    timeZone: currentTimezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Hijri Date (works in your browser)
  const hijriDate = now.toLocaleDateString("en-TN-u-ca-islamic", dateOptions);

  // Put into HTML
  document.getElementById("english-date").innerText = englishDate;
  document.getElementById("live-time").innerText = worldTime;
  document.getElementById("islamic-date").innerText = hijriDate;
}

// Update clock every second
setInterval(updateDateAndWorldTime, 1000);

// ===============================
// CURRENT PRAYER HIGHLIGHT LOGIC
// Highlights active prayer based on
// START → END Islamic time window
// ===============================

function highlightCurrentPrayer(timings) {
  const now = new Date();

  // Get current time in selected city timezone
  const currentTime = now.toLocaleTimeString("en-US", {
    timeZone: currentTimezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const nowMinutes = timeToMinutes(currentTime);

  // Convert prayer times to minutes
  const fajr = timeToMinutes(timings.Fajr);
  const sunrise = timeToMinutes(timings.Sunrise);
  const dhuhr = timeToMinutes(timings.Dhuhr);
  const asr = timeToMinutes(timings.Asr);
  const maghrib = timeToMinutes(timings.Maghrib);
  const isha = timeToMinutes(timings.Isha);

  // Remove previous highlights
  document
    .querySelectorAll("#prayers li")
    .forEach((li) => li.classList.remove("active-prayer"));

  // Apply highlight based on current time
  if (nowMinutes >= fajr && nowMinutes < sunrise) {
    document.getElementById("prayer-fajr").classList.add("active-prayer");
  } else if (nowMinutes >= dhuhr && nowMinutes < asr) {
    document.getElementById("prayer-dhuhr").classList.add("active-prayer");
  } else if (nowMinutes >= asr && nowMinutes < maghrib) {
    document.getElementById("prayer-asr").classList.add("active-prayer");
  } else if (nowMinutes >= maghrib && nowMinutes < isha) {
    document.getElementById("prayer-maghrib").classList.add("active-prayer");
  } else if (nowMinutes >= isha || nowMinutes < fajr) {
    document.getElementById("prayer-isha").classList.add("active-prayer");
  }
}

// ===============================
// HIGHLIGHT CURRENT NAFL PRAYER
// ===============================

function highlightCurrentNaflPrayer(timings) {
  const now = new Date();

  const currentTime = now.toLocaleTimeString("en-US", {
    timeZone: currentTimezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const nowMinutes = timeToMinutes(currentTime);

  const tahajjudStart = timeToMinutes(timings.Midnight);
  const tahajjudEnd = timeToMinutes(timings.Fajr);

  const ishraqStart = timeToMinutes(addMinutes(timings.Sunrise, 15));
  const ishraqEnd = timeToMinutes(addMinutes(timings.Sunrise, 30));

  const chashtStart = ishraqEnd;
  const chashtEnd = timeToMinutes(timings.Dhuhr);

  const awwabinStart = timeToMinutes(timings.Maghrib);
  const awwabinEnd = timeToMinutes(timings.Isha);

  // Remove old highlight
  document
    .querySelectorAll("#nafl-prayers li")
    .forEach((li) => li.classList.remove("active-nafl"));

  if (nowMinutes >= tahajjudStart && nowMinutes < tahajjudEnd) {
    document.getElementById("nafl-tahajjud").classList.add("active-nafl");
  } else if (nowMinutes >= ishraqStart && nowMinutes < ishraqEnd) {
    document.getElementById("nafl-ishraq").classList.add("active-nafl");
  } else if (nowMinutes >= chashtStart && nowMinutes < chashtEnd) {
    document.getElementById("nafl-chasht").classList.add("active-nafl");
  } else if (nowMinutes >= awwabinStart && nowMinutes < awwabinEnd) {
    document.getElementById("nafl-awwabin").classList.add("active-nafl");
  }
}

// ===============================
// FARZ PRAYER TIMES + SEHRI / IFTAR
// ===============================

async function loadPrayerTimes(cityValue) {
  const [city, country] = cityValue.split("|");

  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
    city,
  )}&country=${encodeURIComponent(country)}&method=3`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const timings = data.data.timings;
    const timezone = data.data.meta.timezone;

    // Update timezone globally
    currentTimezone = timezone;

    // Farz prayers
    document.getElementById("fajr").innerText = timings.Fajr;
    document.getElementById("dhuhr").innerText = timings.Dhuhr;
    document.getElementById("asr").innerText = timings.Asr;
    document.getElementById("maghrib").innerText = timings.Maghrib;
    document.getElementById("isha").innerText = timings.Isha;

    // End times (Islamic logic)
    document.getElementById("fajr-end").innerText = timings.Sunrise;
    document.getElementById("dhuhr-end").innerText = timings.Asr;
    document.getElementById("asr-end").innerText = timings.Maghrib;
    document.getElementById("maghrib-end").innerText = timings.Isha;
    document.getElementById("isha-end").innerText =
      timings.Fajr + " (next day)";

    // Sehri & Iftartimes
    document.getElementById("sehri-start").innerText = timings.Lastthird;
    document.getElementById("sehri-end").innerText = timings.Fajr;
    document.getElementById("iftar").innerText = timings.Maghrib;

    // ===============================
    // NAFIL PRAYER TIMES (CALCULATED)
    // ===============================

    // Tahajjud: Midnight → Fajr
    document.getElementById("tahajjud-start").innerText = timings.Midnight;
    document.getElementById("tahajjud-end").innerText = timings.Fajr;

    // Ishraq: Sunrise + 15 min → Sunrise + 30 min
    document.getElementById("ishraq-start").innerText = addMinutes(
      timings.Sunrise,
      15,
    );
    document.getElementById("ishraq-end").innerText = addMinutes(
      timings.Sunrise,
      30,
    );

    // Chasht (Duha): Sunrise + 30 min → Dhuhr
    document.getElementById("chasht-start").innerText = addMinutes(
      timings.Sunrise,
      30,
    );
    document.getElementById("chasht-end").innerText = timings.Dhuhr;

    // Awwabin: Maghrib → Isha
    document.getElementById("awwabin-start").innerText = timings.Maghrib;
    document.getElementById("awwabin-end").innerText = timings.Isha;

    // ===============================
    // APPLY CURRENT PRAYER HIGHLIGHT
    // Runs after prayer times load
    // ===============================

    highlightCurrentPrayer(timings);

    highlightCurrentNaflPrayer(timings);

    // Update date & time immediately after city change
    updateDateAndWorldTime();

    //  Enable/disable prayer buttons
    updatePrayerButtons(timings);
  } catch (error) {
    alert("Unable to load prayer times. Check internet connection.");
  }
}

// ===============================
// CITY CHANGE HANDLING
// ===============================

const citySelect = document.getElementById("city");

// Load default city on page load
loadPrayerTimes(citySelect.value);

// Reload when city changes
citySelect.addEventListener("change", function () {
  loadPrayerTimes(this.value);
});

// ===============================
// ENABLE MARK DONE BUTTON ONLY DURING PRAYER TIME
// ===============================

function updatePrayerButtons(timings) {
  const now = new Date();

  const currentTime = now.toLocaleTimeString("en-GB", {
    timeZone: currentTimezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const nowMinutes = timeToMinutes(currentTime);

  const fajr = timeToMinutes(timings.Fajr);
  const sunrise = timeToMinutes(timings.Sunrise);
  const dhuhr = timeToMinutes(timings.Dhuhr);
  const asr = timeToMinutes(timings.Asr);
  const maghrib = timeToMinutes(timings.Maghrib);
  const isha = timeToMinutes(timings.Isha);

  toggleBtn("fajr", nowMinutes >= fajr && nowMinutes < sunrise);
  toggleBtn("dhuhr", nowMinutes >= dhuhr && nowMinutes < asr);
  toggleBtn("asr", nowMinutes >= asr && nowMinutes < maghrib);
  toggleBtn("maghrib", nowMinutes >= maghrib && nowMinutes < isha);
  toggleBtn("isha", nowMinutes >= isha || nowMinutes < fajr);
}

function toggleBtn(prayer, condition) {
  const btn = document.getElementById(`btn-${prayer}`);
  if (btn) {
    btn.disabled = !condition;
  }
}
setInterval(() => {
  const fajr = document.getElementById("fajr").innerText;

  if (fajr !== "--") {
    const timings = {
      Midnight: document.getElementById("tahajjud-start").innerText,
      Fajr: document.getElementById("fajr").innerText,
      Sunrise: document.getElementById("fajr-end").innerText,
      Dhuhr: document.getElementById("dhuhr").innerText,
      Asr: document.getElementById("asr").innerText,
      Maghrib: document.getElementById("maghrib").innerText,
      Isha: document.getElementById("isha").innerText,
    };

    highlightCurrentPrayer(timings);
    highlightCurrentNaflPrayer(timings);
    checkPrayerNotification(timings);
    updatePrayerButtons(timings); // 🔥 NEW LINE ADDED
  }
}, 60000);

// ===============================
// DARK MODE TOGGLE
// ===============================

const darkBtn = document.getElementById("dark-toggle");

darkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// ===============================
// PRAYER TRACKING SYSTEM (TOGGLE VERSION)
// ===============================

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

window.markPrayer = function (prayerName) {
  const today = getTodayDate();
  let data = JSON.parse(localStorage.getItem("prayerData")) || {};

  if (!data[today]) {
    data[today] = {};
  }

  // Toggle logic
  if (data[today][prayerName]) {
    delete data[today][prayerName];
  } else {
    data[today][prayerName] = true;
  }

  localStorage.setItem("prayerData", JSON.stringify(data));
  if (data[today][prayerName]) {
    alert(`${prayerName} marked as completed ✅`);
  } else {
    alert(`${prayerName} removed ❌`);
  }
  updatePrayerStatus();
  updateProgressBar();
  calculateStreak();
};

// ===============================
// STREAK COUNTER SYSTEM
// ===============================

function calculateStreak() {
  let data = JSON.parse(localStorage.getItem("prayerData")) || {};
  let streak = 0;

  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const formatted = date.toISOString().split("T")[0];

    if (data[formatted] && Object.keys(data[formatted]).length === 5) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("streak-count").innerText = streak + " Days";
}

function updatePrayerStatus() {
  const today = getTodayDate();
  let data = JSON.parse(localStorage.getItem("prayerData")) || {};

  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  prayers.forEach((prayer) => {
    const li = document.getElementById(`prayer-${prayer.toLowerCase()}`);
    const button = li.querySelector("button");

    if (data[today] && data[today][prayer]) {
      li.classList.add("completed-prayer");
      button.innerText = "Undo";
    } else {
      li.classList.remove("completed-prayer");
      button.innerText = "Mark Done";
    }
  });
}

updatePrayerStatus();

// ===============================
// DAILY PRAYER PROGRESS TRACKER
// ===============================

function updateProgressBar() {
  const today = getTodayDate();
  let data = JSON.parse(localStorage.getItem("prayerData")) || {};

  let completedCount = 0;
  const totalPrayers = 5;

  if (data[today]) {
    completedCount = Object.keys(data[today]).length;
  }

  const percentage = Math.round((completedCount / totalPrayers) * 100);

  document.getElementById("progress-fill").style.width = percentage + "%";
  document.getElementById("progress-text").innerText = percentage + "%";
}
updatePrayerStatus();
updateProgressBar();
calculateStreak();
monthlyAnalytics();
loadPrayerHeatmap();

// ===============================
// PRAYER HISTORY FUNCTION
// ===============================

function loadPrayerHeatmap() {
  let data = JSON.parse(localStorage.getItem("prayerData")) || {};
  const container = document.getElementById("history-heatmap");

  if (!container) return;

  container.innerHTML = "";

  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const formatted = date.toISOString().split("T")[0];

    let prayers = data[formatted] ? Object.keys(data[formatted]).length : 0;

    const box = document.createElement("div");

    box.classList.add("day-box");

    if (prayers === 0) {
      box.classList.add("day-0");
    } else if (prayers <= 2) {
      box.classList.add("day-1");
    } else if (prayers <= 4) {
      box.classList.add("day-2");
    } else {
      box.classList.add("day-4");
    }

    container.appendChild(box);
  }
}

function monthlyAnalytics() {
  let data = JSON.parse(localStorage.getItem("prayerData")) || {};

  const month = new Date().getMonth();
  const year = new Date().getFullYear();

  let totalDays = 0;
  let fullDays = 0;

  Object.keys(data).forEach((date) => {
    const d = new Date(date);

    if (d.getMonth() === month && d.getFullYear() === year) {
      totalDays++;

      if (Object.keys(data[date]).length === 5) {
        fullDays++;
      }
    }
  });

  document.getElementById("days-tracked").innerText =
    "Days tracked: " + totalDays;

  document.getElementById("full-days").innerText =
    "Full prayer days: " + fullDays;

  const percent = totalDays ? (fullDays / totalDays) * 100 : 0;

  document.getElementById("analytics-fill").style.width = percent + "%";
}
// ===============================
// AUTO LOCATION DETECTION
// ===============================

const autoLocationBtn = document.getElementById("auto-location-btn");

autoLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          const timings = data.data.timings;
          currentTimezone = data.data.meta.timezone;

          // Update prayer times
          document.getElementById("fajr").innerText = timings.Fajr;
          document.getElementById("dhuhr").innerText = timings.Dhuhr;
          document.getElementById("asr").innerText = timings.Asr;
          document.getElementById("maghrib").innerText = timings.Maghrib;
          document.getElementById("isha").innerText = timings.Isha;

          updateDateAndWorldTime();
          highlightCurrentPrayer(timings);

          alert("Location detected successfully ✅");
        } catch (error) {
          alert("Error fetching prayer times.");
        }
      },
      () => {
        alert("Location access denied ❌");
      },
    );
  } else {
    alert("Geolocation not supported by browser.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadPrayerHeatmap();
});
