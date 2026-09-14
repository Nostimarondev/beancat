const video = document.getElementById('v0');
const enterBtn = document.getElementById('enter-btn');
const loader = document.getElementById('loader');
const soundBtn = document.getElementById('sound-btn');
const volumeSlider = document.getElementById('volume-slider');
const bgAudio = document.getElementById('bg-audio');
const progressFill = document.getElementById('progress-fill');

bgAudio.volume = 0.2;

let loaded = false;

// Configuración de la altura de la página para permitir scroll largo
const PLAYBACK_SCROLL_HEIGHT = 400; // Cuántos píxeles de scroll para reproducir todo el video
// Pero la ajustaremos más dinámicamente si es necesario, 
// o usaremos un valor muy alto para que sea fluido.
document.body.style.height = '500vh';

// Simulación de carga hacker
let p = 0;
const interval = setInterval(() => {
  p += Math.random() * 15;
  if (p >= 100) {
    p = 100;
    clearInterval(interval);
    loaded = true;
    progressFill.style.width = '100%';
    document.querySelector('.glitch-text').innerText = 'SYSTEM_READY';
    enterBtn.style.display = 'inline-block';
  } else {
    progressFill.style.width = p + '%';
  }
}, 100);


enterBtn.addEventListener('click', () => {
  loader.classList.add('hidden');
  bgAudio.play().catch(e => console.log('Audio autoplay blocked'));
  soundBtn.innerText = 'SOUND: ON';
  // Hacer scroll al principio al entrar
  window.scrollTo(0, 0);
  
  // Mostrar la primera sección con retraso
  setTimeout(() => {
    document.querySelector('.hero').classList.add('visible');
  }, 500);
});

// Control de sonido
let soundOn = true;
soundBtn.addEventListener('click', () => {
  if (soundOn) {
    bgAudio.pause();
    soundBtn.innerText = 'SOUND: OFF';
  } else {
    bgAudio.play();
    soundBtn.innerText = 'SOUND: ON';
  }
  soundOn = !soundOn;
});

// Control de volumen con la barra (detecta mientras se arrastra y al soltar)
['input', 'change'].forEach(evt => {
  volumeSlider.addEventListener(evt, (e) => {
    const vol = parseFloat(e.target.value);
    bgAudio.volume = vol;
    
    if (vol > 0 && !soundOn) {
      bgAudio.play();
      soundBtn.innerText = 'SOUND: ON';
      soundOn = true;
    } else if (vol === 0 && soundOn) {
      bgAudio.pause();
      soundBtn.innerText = 'SOUND: OFF';
      soundOn = false;
    }
  });
});

// MOTOR DE SCROLLYTELLING
let targetTime = 0;
let currentTime = 0;
let duration = 0;

video.addEventListener('loadedmetadata', () => {
  duration = video.duration;
});

// Si ya tiene metadatos cargados por el navegador
if (video.readyState >= 1) {
  duration = video.duration;
}

window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollFraction = window.scrollY / maxScroll;
  
  if (duration > 0) {
    targetTime = scrollFraction * duration;
  }
});

// RequestAnimationFrame para animar suavemente (easing)
function loop() {
  if (duration > 0) {
    // Interpolación suave (LOWER IS SMOOTHER BUT MORE DELAY)
    currentTime += (targetTime - currentTime) * 0.1;
    
    if (Math.abs(currentTime - video.currentTime) > 0.05) {
      video.currentTime = currentTime;
    }
  }
  requestAnimationFrame(loop);
}
loop();

// Animación de entrada de las secciones mediante scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.step').forEach(step => {
  observer.observe(step);
});
