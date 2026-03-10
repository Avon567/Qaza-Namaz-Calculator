const prayers = [
  { name: "Fajr", rakats: "2 Fard" },
  { name: "Dhuhr", rakats: "4 Fard" },
  { name: "Asr", rakats: "4 Fard" },
  { name: "Maghrib", rakats: "3 Fard" },
  { name: "Isha", rakats: "4 Fard" },
  { name: "Witr", rakats: "3 Wajib" }
];

const elements = {
  years: document.getElementById("yearsMissed"),
  months: document.getElementById("monthsMissed"),
  menstrualDays: document.getElementById("menstrualDays"),
  femalePanel: document.getElementById("femalePanel"),
  totalDays: document.getElementById("totalDays"),
  prayerCards: document.getElementById("prayerCards"),
  planMessage: document.getElementById("planMessage"),
  dailyTarget: document.getElementById("dailyTarget"),
  genderSwitch: document.getElementById("genderSwitch")
};

const state = {
  gender: "male"
};

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function numberFromInput(input, fallback = 0) {
  const val = Number(input.value);
  return Number.isFinite(val) ? val : fallback;
}

function getTotalMissedDays() {
  const years = clamp(numberFromInput(elements.years), 0, 120);
  const months = clamp(numberFromInput(elements.months), 0, 11);
  const totalMonths = years * 12 + months;
  const rawDays = totalMonths * 30;

  if (state.gender === "female") {
    const menstrualDays = clamp(numberFromInput(elements.menstrualDays), 0, 15);
    return Math.max(rawDays - menstrualDays * totalMonths, 0);
  }

  return rawDays;
}

function renderPrayerCards(totalDays) {
  elements.prayerCards.innerHTML = "";

  prayers.forEach((prayer) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${prayer.name}</h3>
      <p>${prayer.rakats}</p>
      <strong>${totalDays.toLocaleString()}</strong>
    `;
    elements.prayerCards.appendChild(card);
  });
}

function updatePlan(totalDays) {
  const target = clamp(numberFromInput(elements.dailyTarget, 5), 1, 50);
  elements.dailyTarget.value = target;

  if (!totalDays) {
    elements.planMessage.textContent = "Enter missed years to see your plan.";
    return;
  }

  const neededDays = Math.ceil(totalDays / target);
  const years = Math.floor(neededDays / 365);
  const months = Math.floor((neededDays % 365) / 30);
  const days = neededDays % 30;

  elements.planMessage.textContent = `At ${target} full prayer-day(s) daily, you can finish in ~${years} years, ${months} months, ${days} days (${neededDays} days total).`;
}

function recalculate() {
  const totalDays = getTotalMissedDays();
  elements.totalDays.textContent = totalDays.toLocaleString();
  renderPrayerCards(totalDays);
  updatePlan(totalDays);
}

function setGender(nextGender) {
  state.gender = nextGender;
  [...elements.genderSwitch.querySelectorAll("button")].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.gender === nextGender);
  });
  elements.femalePanel.classList.toggle("hidden", nextGender !== "female");
  recalculate();
}

["input", "change"].forEach((eventName) => {
  [elements.years, elements.months, elements.menstrualDays, elements.dailyTarget].forEach((input) => {
    input.addEventListener(eventName, recalculate);
  });
});

elements.genderSwitch.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-gender]");
  if (button) {
    setGender(button.dataset.gender);
  }
});

recalculate();
