const prayers = [
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
