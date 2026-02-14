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

function  updateDateAndWorldTime() {
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
  const hijriDate = now.toLocaleDateString(
    "en-TN-u-ca-islamic",
    dateOptions
  );

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
    .forEach(li => li.classList.remove("active-prayer"));

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
    .forEach(li => li.classList.remove("active-nafl"));

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
  city
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
    document.getElementById("isha-end").innerText =timings.Fajr + " (next day)";

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
    document.getElementById("ishraq-start").innerText =
    addMinutes(timings.Sunrise, 15);
    document.getElementById("ishraq-end").innerText =
    addMinutes(timings.Sunrise, 30);

    // Chasht (Duha): Sunrise + 30 min → Dhuhr
    document.getElementById("chasht-start").innerText =
    addMinutes(timings.Sunrise, 30);
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
// AUTO-UPDATE PRAYER HIGHLIGHT
// Re-checks every minute
// ===============================

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
  }

}, 60000); // every 1 minute  


// ===============================
// DARK MODE TOGGLE
// ===============================

const darkBtn = document.getElementById("dark-toggle");

darkBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
