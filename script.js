// === PRELOADER ===
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelector('.preloader').classList.add('hide');
  }, 800);
});

// === HEADER SCROLL ===
const header = document.querySelector('.header');
const upBtn = document.querySelector('.float-btn.up');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
  if (window.scrollY > 500) upBtn.classList.add('show');
  else upBtn.classList.remove('show');
});

// === MOBILE MENU ===
function toggleMenu(){
  document.querySelector('.nav').classList.toggle('open');
}
document.querySelectorAll('.nav a').forEach(a => {
  a.addEventListener('click', () => document.querySelector('.nav').classList.remove('open'));
});

// === SCROLL TOP ===
function scrollTop(){
  window.scrollTo({top:0, behavior:'smooth'});
}

// === COTTAGES FILTER ===
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.cottage-card').forEach(card => {
      if (filter === 'all' || card.dataset.cat.includes(filter)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// === SPA TABS ===
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// === BOOKING MODAL ===
const bookingModal = document.getElementById('bookingModal');
let currentStep = 1;

function openBooking(cottage = null){
  bookingModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  resetSteps();
  
  // Перенос дат из quick-book
  const qbIn = document.getElementById('qb-in').value;
  const qbOut = document.getElementById('qb-out').value;
  const qbGuests = document.getElementById('qb-guests').value;
  if (qbIn) document.getElementById('bk-in').value = qbIn;
  if (qbOut) document.getElementById('bk-out').value = qbOut;
  if (qbGuests) {
    const g = qbGuests.match(/\d+/);
    if (g) document.getElementById('bk-guests').value = g[0];
  }
  
  // Preselect cottage
  if (cottage) {
    setTimeout(() => {
      const radio = document.querySelector(`input[name="cottage"][value="${cottage}"]`);
      if (radio) radio.checked = true;
    }, 100);
  }
}

function closeBooking(){
  bookingModal.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(resetSteps, 400);
}

function resetSteps(){
  currentStep = 1;
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step').forEach(s => {s.classList.remove('active', 'done')});
  document.getElementById('step-1').classList.add('active');
  document.querySelector('.step[data-step="1"]').classList.add('active');
}

function nextStep(n){
  // Валидация
  if (currentStep === 1) {
    const inDate = document.getElementById('bk-in').value;
    const outDate = document.getElementById('bk-out').value;
    if (!inDate || !outDate) { alert('Укажите даты заезда и выезда'); return; }
    if (new Date(outDate) <= new Date(inDate)) { alert('Дата выезда должна быть позже даты заезда'); return; }
  }
  if (currentStep === 2) {
    if (!document.querySelector('input[name="cottage"]:checked')) { alert('Выберите домик'); return; }
  }
  
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.booking-steps .step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.remove('active');
    if (sn < n) s.classList.add('done');
    if (sn === n) s.classList.add('active');
  });
  document.getElementById('step-' + n).classList.add('active');
  currentStep = n;
  
  if (n === 4) updateSummary();
  
  document.querySelector('.modal-content').scrollTo({top:0, behavior:'smooth'});
}

function prevStep(n){
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.booking-steps .step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.remove('active','done');
    if (sn < n) s.classList.add('done');
    if (sn === n) s.classList.add('active');
  });
  document.getElementById('step-' + n).classList.add('active');
  currentStep = n;
}

function updateSummary(){
  const inDate = document.getElementById('bk-in').value;
  const outDate = document.getElementById('bk-out').value;
  const guests = document.getElementById('bk-guests').value;
  const kids = document.getElementById('bk-kids').value;
  const cottageInput = document.querySelector('input[name="cottage"]:checked');
  const cottage = cottageInput ? cottageInput.value : '—';
  const pricePerNight = cottageInput ? parseInt(cottageInput.dataset.price) : 0;
  
  const d1 = new Date(inDate);
  const d2 = new Date(outDate);
  const nights = Math.ceil((d2 - d1) / (1000*60*60*24));
  
  const fmtDate = d => d.toLocaleDateString('ru-RU', {day:'2-digit', month:'short'});
  document.getElementById('sum-dates').textContent = `${fmtDate(d1)} — ${fmtDate(d2)} (${nights} ноч.)`;
  document.getElementById('sum-guests').textContent = `${guests} взр.${kids>0?', '+kids+' реб.':''}`;
  document.getElementById('sum-cottage').textContent = cottage;
  
  let servicesTotal = 0;
  const selectedServices = [];
  document.querySelectorAll('.service input:checked').forEach(inp => {
    servicesTotal += parseInt(inp.value);
    selectedServices.push(inp.dataset.name);
  });
  document.getElementById('sum-services').textContent = selectedServices.length ? selectedServices.join(', ') : 'Не выбрано';
  
  const total = (pricePerNight * nights) + servicesTotal;
  document.getElementById('sum-total').textContent = total.toLocaleString('ru-RU') + ' ₽';
}

function submitBooking(){
  const name = document.getElementById('bk-name').value;
  const phone = document.getElementById('bk-phone').value;
  const agree = document.querySelector('.agree input').checked;
  
  if (!name || !phone) { alert('Заполните имя и телефон'); return; }
  if (!agree) { alert('Подтвердите согласие с политикой'); return; }
  
  // Здесь отправка на сервер
  // fetch('/api/booking', {...})
  
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-success').classList.add('active');
  document.querySelectorAll('.booking-steps .step').forEach(s => s.classList.add('done'));
}

// === COTTAGE DETAIL MODAL ===
const cottageData = {
  premium: {
    name: 'Premium Suite',
    img: 'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=1400',
    price: '18 500 ₽',
    desc: 'Роскошный номер премиум-класса с джакузи на террасе и панорамным видом на горы. Авторский дизайн, натуральные материалы, собственная веранда с лаунж-зоной.',
    features: [
      {i:'fa-user-friends', l:'Вместимость', v:'2 гостя'},
      {i:'fa-bed', l:'Спальни', v:'1 спальня'},
      {i:'fa-ruler-combined', l:'Площадь', v:'65 м²'},
      {i:'fa-hot-tub', l:'Джакузи', v:'В наличии'}
    ]
  },
  forest: {
    name: 'Forest Lodge',
    img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1400',
    price: '24 900 ₽',
    desc: 'Уютный лесной домик с настоящим камином и большой гостиной. Идеально подходит для семейного отдыха с детьми и друзьями.',
    features: [
      {i:'fa-user-friends', l:'Вместимость', v:'4 гостя'},
      {i:'fa-bed', l:'Спальни', v:'2 спальни'},
      {i:'fa-ruler-combined', l:'Площадь', v:'95 м²'},
      {i:'fa-fire', l:'Камин', v:'Дровяной'}
    ]
  },
  sky: {
    name: 'Sky View',
    img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400',
    price: '29 500 ₽',
    desc: 'Эксклюзивный домик с панорамным остеклением от пола до потолка. Невероятные виды, терраса с мини-бассейном и приватная зона отдыха.',
    features: [
      {i:'fa-user-friends', l:'Вместимость', v:'3 гостя'},
      {i:'fa-mountain', l:'Вид', v:'Панорама'},
      {i:'fa-ruler-combined', l:'Площадь', v:'85 м²'},
      {i:'fa-wine-glass-alt', l:'Терраса', v:'40 м²'}
    ]
  },
  royal: {
    name: 'Royal Villa',
    img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400',
    price: '48 000 ₽',
    desc: 'Флагманская вилла класса VIP с собственным бассейном, SPA-зоной и приватной территорией. Максимальный уровень комфорта и уединения.',
    features: [
      {i:'fa-user-friends', l:'Вместимость', v:'6 гостей'},
      {i:'fa-bed', l:'Спальни', v:'3 спальни'},
      {i:'fa-ruler-combined', l:'Площадь', v:'180 м²'},
      {i:'fa-swimming-pool', l:'Бассейн', v:'Приватный'}
    ]
  },
  honey: {
    name: 'Honeymoon Chalet',
    img: 'https://images.unsplash.com/photo-1587061633885-2a6e9a1b3a5c?w=1400',
    price: '22 000 ₽',
    desc: 'Романтический домик для двоих с круглой кроватью, свечами, джакузи и встречей с шампанским. Идеальное место для медового месяца.',
    features: [
      {i:'fa-heart', l:'Атмосфера', v:'Романтика'},
      {i:'fa-user-friends', l:'Вместимость', v:'2 гостя'},
      {i:'fa-hot-tub', l:'SPA', v:'Приватно'},
      {i:'fa-champagne-glasses', l:'Welcome', v:'Шампанское'}
    ]
  },
  family: {
    name: 'Family House',
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1400',
    price: '26 500 ₽',
    desc: 'Просторный семейный дом с полностью оборудованной кухней, игровой зоной для детей и большой столовой. Всё для комфортного отдыха всей семьёй.',
    features: [
      {i:'fa-user-friends', l:'Вместимость', v:'5 гостей'},
      {i:'fa-bed', l:'Спальни', v:'2 спальни'},
      {i:'fa-utensils', l:'Кухня', v:'Полная'},
      {i:'fa-child', l:'Для детей', v:'Игровая'}
    ]
  }
};

function openCottage(key){
  const data = cottageData[key];
  if (!data) return;
  
  const html = `
    <div class="cd-hero">
      <img src="${data.img}" alt="${data.name}">
    </div>
    <div class="cd-body">
      <h2>${data.name}</h2>
      <div class="price">от ${data.price} / ночь</div>
      <p>${data.desc}</p>
      <div class="cd-features">
        ${data.features.map(f => `
          <div class="cd-feat">
            <i class="fas ${f.i}"></i>
            <span>${f.l}</span>
            <strong>${f.v}</strong>
          </div>
        `).join('')}
      </div>
      <button class="btn-primary" onclick="closeCottage();openBooking('${data.name}')" style="width:100%">
        Забронировать этот домик
      </button>
    </div>
  `;
  document.getElementById('cottageContent').innerHTML = html;
  document.getElementById('cottageModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCottage(){
  document.getElementById('cottageModal').classList.remove('active');
  document.body.style.overflow = '';
}

// === ESC to close modals ===
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeBooking();
    closeCottage();
  }
});

// === NEWSLETTER ===
function subscribe(e){
  e.preventDefault();
  const input = e.target.querySelector('input');
  alert(`Спасибо! Подписка оформлена для: ${input.value}`);
  input.value = '';
}

// === MIN DATES ===
const today = new Date().toISOString().split('T')[0];
document.getElementById('qb-in').min = today;
document.getElementById('qb-out').min = today;
document.getElementById('bk-in').min = today;
document.getElementById('bk-out').min = today;

document.getElementById('qb-in').addEventListener('change', e => {
  document.getElementById('qb-out').min = e.target.value;
});
document.getElementById('bk-in').addEventListener('change', e => {
  document.getElementById('bk-out').min = e.target.value;
});

// === SCROLL ANIMATIONS ===
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {threshold: 0.1});

document.querySelectorAll('.cottage-card, .review-card, .stat, .tab-grid').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .8s, transform .8s';
  observer.observe(el);
});
