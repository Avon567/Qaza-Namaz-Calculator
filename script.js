const prayers = [
  { key: 'fajr', name: 'Fajr', units: '2 Fard', obligatory: true },
  { key: 'dhuhr', name: 'Dhuhr', units: '4 Fard', obligatory: true },
  { key: 'asr', name: 'Asr', units: '4 Fard', obligatory: true },
  { key: 'maghrib', name: 'Maghrib', units: '3 Fard', obligatory: true },
  { key: 'isha', name: 'Isha', units: '4 Fard', obligatory: true },
  { key: 'witr', name: 'Witr', units: '3 Wajib', obligatory: false }
];

const el = {
  years: document.getElementById('yearsMissed'),
  months: document.getElementById('monthsMissed'),
  calendarType: document.getElementById('calendarType'),
  missedRatio: document.getElementById('missedRatio'),
  maleBtn: document.getElementById('maleBtn'),
  femaleBtn: document.getElementById('femaleBtn'),
  includeWitr: document.getElementById('includeWitr'),
  femaleFields: document.getElementById('femaleFields'),
  menstrualDays: document.getElementById('menstrualDays'),
  nifasDays: document.getElementById('nifasDays'),
  totalDays: document.getElementById('totalDays'),
  prayerCards: document.getElementById('prayerCards'),
  dailyTarget: document.getElementById('dailyTarget'),
  startDate: document.getElementById('startDate'),
  planOutput: document.getElementById('planOutput')
};

let selectedGender = 'male';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function setDefaultStartDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  el.startDate.value = `${yyyy}-${mm}-${dd}`;
}

function createCards() {
  el.prayerCards.innerHTML = '';
  prayers.forEach((prayer) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h4>${prayer.name}</h4>
      <small>${prayer.units}</small>
      <div class="count" data-count="${prayer.key}">0</div>
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

function getBaseDays(years, months) {
  const calendar = el.calendarType.value;
  if (calendar === 'solar') {
    return Math.round(years * 365 + months * (365 / 12));
  }
  return Math.round(years * 354 + months * 29.5);
}

function calculate() {
  const years = clamp(el.years.value, 0, 120);
  const months = clamp(el.months.value, 0, 11);
  const ratio = clamp(el.missedRatio.value, 1, 5);
  const includeWitr = el.includeWitr.checked;

  const baseDays = getBaseDays(years, months);

  let exemptDays = 0;
  if (selectedGender === 'female') {
    const menstrualDays = clamp(el.menstrualDays.value, 0, 15);
    const nifasDays = clamp(el.nifasDays.value, 0, 400);
    exemptDays = Math.round((years * 12 + months) * menstrualDays) + nifasDays;
  }

  const prayerDays = Math.max(0, baseDays - exemptDays);
  const effectivePrayerDays = Math.round(prayerDays * (ratio / 5));

  el.totalDays.textContent = effectivePrayerDays.toLocaleString();

  prayers.forEach((prayer) => {
    const countEl = document.querySelector(`[data-count="${prayer.key}"]`);
    if (!countEl) return;

    if (prayer.key === 'witr' && !includeWitr) {
      countEl.textContent = 'Excluded';
      return;
    }

    if (!prayer.obligatory || prayer.obligatory) {
      countEl.textContent = effectivePrayerDays.toLocaleString();
    }
  });

  const dailyTarget = clamp(el.dailyTarget.value, 1, 20);
  const totalUnitsPerDay = includeWitr ? 6 : 5;
  const totalPrayerUnits = effectivePrayerDays * totalUnitsPerDay;
  const planDays = Math.ceil(effectivePrayerDays / dailyTarget);

  if (effectivePrayerDays === 0) {
    el.planOutput.textContent = 'Enter your missed period to generate your plan.';
    return;
  }

  const startDate = new Date(el.startDate.value || Date.now());
  const finishDate = new Date(startDate);
  finishDate.setDate(finishDate.getDate() + planDays);

  const finishText = finishDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const yearsPart = Math.floor(planDays / 365);
  const monthsPart = Math.floor((planDays % 365) / 30);
  const daysPart = planDays % 30;

  const parts = [];
  if (yearsPart) parts.push(`${yearsPart} year${yearsPart > 1 ? 's' : ''}`);
  if (monthsPart) parts.push(`${monthsPart} month${monthsPart > 1 ? 's' : ''}`);
  if (daysPart) parts.push(`${daysPart} day${daysPart > 1 ? 's' : ''}`);

  el.planOutput.textContent = `Estimated qaza prayer-days: ${effectivePrayerDays.toLocaleString()} (${totalPrayerUnits.toLocaleString()} total prayer slots including${includeWitr ? '' : ' no'} Witr). If you complete ${dailyTarget} qaza day(s) per day, expected completion is about ${planDays.toLocaleString()} days (${parts.join(', ')}) by ${finishText}.`;
}

createCards();
setDefaultStartDate();
setGender('male');

[
  el.years,
  el.months,
  el.calendarType,
  el.missedRatio,
  el.includeWitr,
  el.menstrualDays,
  el.nifasDays,
  el.dailyTarget,
  el.startDate
].forEach((node) => node.addEventListener('input', calculate));

el.maleBtn.addEventListener('click', () => setGender('male'));
el.femaleBtn.addEventListener('click', () => setGender('female'));
