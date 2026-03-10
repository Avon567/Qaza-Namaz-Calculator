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
  { name: 'Fajr', rakat: '2 Fard' },
  { name: 'Dhuhr', rakat: '4 Fard' },
  { name: 'Asr', rakat: '4 Fard' },
  { name: 'Maghrib', rakat: '3 Fard' },
  { name: 'Isha', rakat: '4 Fard' },
  { name: 'Witr', rakat: '3 Wajib' }
];

const el = {
  years: document.getElementById('yearsMissed'),
  months: document.getElementById('monthsMissed'),
  maleBtn: document.getElementById('maleBtn'),
  femaleBtn: document.getElementById('femaleBtn'),
  femaleFields: document.getElementById('femaleFields'),
  menstrualDays: document.getElementById('menstrualDays'),
  totalDays: document.getElementById('totalDays'),
  prayerCards: document.getElementById('prayerCards'),
  dailyTarget: document.getElementById('dailyTarget'),
  planOutput: document.getElementById('planOutput')
};

let selectedGender = 'male';

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, Number(num) || 0));
}

function createPrayerCards() {
  el.prayerCards.innerHTML = '';
  prayers.forEach((prayer) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${prayer.name}</h3>
      <small>${prayer.rakat}</small>
      <div class="count" data-prayer="${prayer.name}">0</div>
    `;
    el.prayerCards.append(card);
  });
}

function setGender(gender) {
  selectedGender = gender;
  const female = gender === 'female';
  el.femaleFields.hidden = !female;
  el.maleBtn.classList.toggle('active', !female);
  el.femaleBtn.classList.toggle('active', female);
  el.maleBtn.setAttribute('aria-pressed', String(!female));
  el.femaleBtn.setAttribute('aria-pressed', String(female));
  calculate();
}

function calculate() {
  const years = clamp(el.years.value, 0, 120);
  const months = clamp(el.months.value, 0, 11);
  const baseDays = Math.round((years * 12 + months) * 30.4375);

  let deductedDays = 0;
  if (selectedGender === 'female') {
    const periodDays = clamp(el.menstrualDays.value, 0, 15);
    deductedDays = Math.round((years * 12 + months) * periodDays);
  }

  const totalDays = Math.max(0, baseDays - deductedDays);
  el.totalDays.textContent = totalDays.toLocaleString();

  document.querySelectorAll('[data-prayer]').forEach((item) => {
    item.textContent = totalDays.toLocaleString();
  });

  const dailyTarget = clamp(el.dailyTarget.value, 1, 20) || 1;
  const requiredDays = Math.ceil(totalDays / dailyTarget);

  if (totalDays === 0) {
    el.planOutput.textContent = 'Enter missed years/months to see your plan.';
    return;
  }

  const yearsPart = Math.floor(requiredDays / 365);
  const monthsPart = Math.floor((requiredDays % 365) / 30);
  const daysPart = requiredDays % 30;

  const parts = [];
  if (yearsPart) parts.push(`${yearsPart} year${yearsPart > 1 ? 's' : ''}`);
  if (monthsPart) parts.push(`${monthsPart} month${monthsPart > 1 ? 's' : ''}`);
  if (daysPart) parts.push(`${daysPart} day${daysPart > 1 ? 's' : ''}`);

  const duration = parts.join(', ');
  el.planOutput.textContent = `If you complete ${dailyTarget} full day(s) of qaza daily, it will take approximately ${requiredDays.toLocaleString()} days (${duration}).`;
}

createPrayerCards();
setGender('male');

[el.years, el.months, el.menstrualDays, el.dailyTarget].forEach((input) => {
  input.addEventListener('input', calculate);
});

el.maleBtn.addEventListener('click', () => setGender('male'));
el.femaleBtn.addEventListener('click', () => setGender('female'));
