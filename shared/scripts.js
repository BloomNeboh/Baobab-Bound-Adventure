// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});
if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');

// Multilingual
const langSelect = document.getElementById('lang-select');
if(langSelect){
  langSelect.value = localStorage.getItem('siteLang') || 'en';
  langSelect.addEventListener('change', () => {
    localStorage.setItem('siteLang', langSelect.value);
    loadTranslations(langSelect.value);
  });
  loadTranslations(localStorage.getItem('siteLang') || 'en');
}

function loadTranslations(lang){
  fetch(`../shared/lang/${lang}.json`)
    .then(res=>res.json())
    .then(data=>{
      document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key = el.dataset.i18n;
        if(data[key]) el.textContent = data[key];
      });
    });
}

// Testimonials Carousel
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

function showSlide(index){
  slides.forEach((s,i)=> s.style.display = i===index?'block':'none');
}
if(slides.length){
  showSlide(currentSlide);
  nextBtn.addEventListener('click', ()=>{ currentSlide=(currentSlide+1)%slides.length; showSlide(currentSlide); });
  prevBtn.addEventListener('click', ()=>{ currentSlide=(currentSlide-1+slides.length)%slides.length; showSlide(currentSlide); });
}

// Lightbox
document.querySelectorAll('.lightbox').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    const overlay = document.createElement('div');
    overlay.classList.add('lightbox-overlay');
    const img = document.createElement('img');
    img.src = link.href;
    overlay.appendChild(img);
    overlay.addEventListener('click', ()=> overlay.remove());
    document.body.appendChild(overlay);
  });
});

// Booking Engine Demo
function bookTour(tourId){
  fetch('../functions/create-checkout-session.js',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({tourId})
  }).then(res=>res.json()).then(data=>{
    window.location=data.url;
  });
}
