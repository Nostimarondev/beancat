const video = document.getElementById('v0');
const enterBtn = document.getElementById('enter-btn');
const loader = document.getElementById('loader');
const soundBtn = document.getElementById('sound-btn');
const volumeSlider = document.getElementById('volume-slider');
const bgAudio = document.getElementById('bg-audio');
const progressFill = document.getElementById('progress-fill');
const loaderIconFill = document.getElementById('loader-icon-fill');
const loaderIconContainer = document.getElementById('loader-icon-container');

bgAudio.volume = 0.2;

let loaded = false;

// Configuración de la altura de la página para permitir scroll largo
const PLAYBACK_SCROLL_HEIGHT = 400; // Cuántos píxeles de scroll para reproducir todo el video
// La altura se determina dinámicamente por el contenido (#scroll-content)

// Simulación de carga hacker (más lenta para dar tiempo al video)
let p = 0;
const interval = setInterval(() => {
  p += Math.random() * 4 + 0.5;
  if (p >= 100) {
    p = 100;
    clearInterval(interval);
    loaded = true;
    progressFill.style.width = '100%';
    if (loaderIconFill) loaderIconFill.style.clipPath = 'inset(-50%)';
    if (loaderIconContainer) loaderIconContainer.classList.add('ready');
    document.querySelector('.glitch-text').innerText = 'SYSTEM_READY';
    enterBtn.style.display = 'inline-block';
  } else {
    progressFill.style.width = p + '%';
    if (loaderIconFill) loaderIconFill.style.clipPath = `inset(${100 - p}% 0 0 0)`;
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
      entry.target.querySelectorAll('.js-text-reveal').forEach(el => el.classList.add('is-revealed'));
    } else {
      entry.target.classList.remove('visible');
      entry.target.querySelectorAll('.js-text-reveal').forEach(el => el.classList.remove('is-revealed'));
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.step').forEach(step => {
  observer.observe(step);
});

// Modal Logic
const proofBtn = document.getElementById('proof-btn');
const proofModal = document.getElementById('proof-modal');
const closeModal = document.getElementById('close-modal');

if (proofBtn) {
  proofBtn.addEventListener('click', () => {
    proofModal.classList.remove('hidden');
  });
}

if (closeModal) {
  closeModal.addEventListener('click', () => {
    proofModal.classList.add('hidden');
  });
}

if (proofModal) {
  proofModal.addEventListener('click', (e) => {
    if (e.target === proofModal) {
      proofModal.classList.add('hidden');
    }
  });
}

// Copy to Clipboard Logic
const copyBtn = document.getElementById('copy-btn');
const contractAddress = document.getElementById('contract-address');

if (copyBtn && contractAddress) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(contractAddress.value).then(() => {
      const overlay = document.getElementById('copy-overlay');
      if (overlay) {
        overlay.innerText = 'COPIED TO CLIPBOARD';
        overlay.style.background = '#fff';
        
        setTimeout(() => {
          overlay.innerText = 'CLICK TO COPY';
          overlay.style.background = '';
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  });
}

// Navbar scroll effect
const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    mainNav.classList.add('scrolled');
  } else {
    mainNav.classList.remove('scrolled');
  }
});

// Navbar active indicator logic
const sections = document.querySelectorAll('section.step');
const navLinks = document.querySelectorAll('.nav-link');
const indicator = document.querySelector('.nav-indicator');

function updateIndicator(link) {
  if (!link || !indicator) return;
  const linkRect = link.getBoundingClientRect();
  const navRect = link.closest('nav').getBoundingClientRect();

  indicator.style.width = `${linkRect.width}px`;
  indicator.style.left = `${linkRect.left - navRect.left}px`;
}

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
          updateIndicator(link);
        }
      });
    }
  });
}, { threshold: 0.3 }); // Lower threshold to trigger active state earlier

sections.forEach(section => {
  if (['about', 'legend', 'community'].includes(section.id)) {
    navObserver.observe(section);
  }
});

// Handle resize to fix indicator position
window.addEventListener('resize', () => {
  const activeLink = document.querySelector('.nav-link.active');
  if (activeLink) updateIndicator(activeLink);
});

// Click behavior for indicator
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    navLinks.forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
    updateIndicator(e.currentTarget);
  });
});

// Hamburger Menu Logic
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinksContainer = document.getElementById('nav-links');

if (hamburgerBtn && navLinksContainer) {
  hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
  });

  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburgerBtn.classList.remove('active');
      navLinksContainer.classList.remove('active');
    });
  });
}

// Text Reveal Effect
class TextReveal {
  constructor(element) {
    this.element = element;
    this.preset = element.getAttribute('data-preset') || 'fade';
    this.delay = parseFloat(element.getAttribute('data-delay')) || 0;
    this.speedReveal = parseFloat(element.getAttribute('data-speed')) || 1.2;
    this.text = element.innerText;
    this.init();
  }

  init() {
    this.element.classList.add(`preset-${this.preset}`);
    const words = this.text.trim().split(' ');
    this.element.innerHTML = '';

    words.forEach((word, index) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'word-wrap';

      const inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.innerText = word;

      const wordDelay = this.delay + (index * 0.99); // Slower sequence
      inner.style.animationDelay = `${wordDelay}s`;
      inner.style.animationDuration = `${this.speedReveal}s`;

      wrapper.appendChild(inner);
      this.element.appendChild(wrapper);

      if (index < words.length - 1) {
        this.element.appendChild(document.createTextNode(' '));
      }
    });
  }
}

document.querySelectorAll('.js-text-reveal').forEach(el => {
  new TextReveal(el);
});

// Encrypted Text Effect
class EncryptedText {
  constructor(el) {
    this.el = el;
    this.originalText = el.innerText;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const observer = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting) {
        this.start();
        observer.disconnect();
      }
    });
    observer.observe(this.el);
  }
  
  start() {
    let iteration = 0;
    clearInterval(this.interval);
    
    this.interval = setInterval(() => {
      this.el.innerText = this.originalText.split('').map((letter, index) => {
        if (index < iteration) {
          return this.originalText[index];
        }
        if (this.originalText[index] === ' ') return ' ';
        return this.chars[Math.floor(Math.random() * this.chars.length)];
      }).join('');
      
      if (iteration >= this.originalText.length) {
        clearInterval(this.interval);
      }
      iteration += 1 / 3;
    }, 30);
  }
}

document.querySelectorAll('.js-encrypted-text').forEach(el => {
  new EncryptedText(el);
});

