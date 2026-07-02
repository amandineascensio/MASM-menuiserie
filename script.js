// ===== ACCESSIBILITÉ =====
var a11yToggle = document.getElementById('a11yToggle');
var a11yPanel = document.getElementById('a11yPanel');
var fontLevel = 0;

// Restore saved prefs
(function restoreA11y() {
  var prefs = JSON.parse(localStorage.getItem('masm_a11y') || '{}');
  if (prefs.fontLevel) { fontLevel = prefs.fontLevel; applyFontSize(); }
  if (prefs.contrast) { document.body.classList.add('high-contrast'); document.getElementById('toggleContrast').classList.add('active'); document.getElementById('toggleContrast').setAttribute('aria-pressed', 'true'); }
  if (prefs.dyslexia) { document.body.classList.add('dyslexia-font'); document.getElementById('toggleDyslexia').classList.add('active'); document.getElementById('toggleDyslexia').setAttribute('aria-pressed', 'true'); }
  if (prefs.animations) { document.body.classList.add('reduce-motion'); document.getElementById('toggleAnimations').classList.add('active'); document.getElementById('toggleAnimations').setAttribute('aria-pressed', 'true'); }
  if (prefs.grayscale) { document.body.classList.add('grayscale'); document.getElementById('toggleGrayscale').classList.add('active'); document.getElementById('toggleGrayscale').setAttribute('aria-pressed', 'true'); }
  if (prefs.darkMode) { document.body.classList.add('dark-mode'); document.getElementById('toggleDarkMode').classList.add('active'); document.getElementById('toggleDarkMode').setAttribute('aria-pressed', 'true'); }
})();

function saveA11y() {
  localStorage.setItem('masm_a11y', JSON.stringify({
    fontLevel: fontLevel,
    contrast: document.body.classList.contains('high-contrast'),
    dyslexia: document.body.classList.contains('dyslexia-font'),
    animations: document.body.classList.contains('reduce-motion'),
    grayscale: document.body.classList.contains('grayscale'),
    darkMode: document.body.classList.contains('dark-mode')
  }));
}

function applyFontSize() {
  var scale = 1 + fontLevel * 0.1;
  document.body.style.zoom = scale;
}

// Toggle panel
a11yToggle.addEventListener('click', function() {
  var isOpen = a11yPanel.classList.toggle('open');
  a11yToggle.setAttribute('aria-expanded', isOpen);
  a11yPanel.setAttribute('aria-hidden', !isOpen);
});

// Close on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('#a11yWidget')) {
    a11yPanel.classList.remove('open');
    a11yToggle.setAttribute('aria-expanded', 'false');
    a11yPanel.setAttribute('aria-hidden', 'true');
  }
});

// Font size
document.getElementById('fontIncrease').addEventListener('click', function() {
  if (fontLevel < 3) { fontLevel++; applyFontSize(); saveA11y(); }
});
document.getElementById('fontDecrease').addEventListener('click', function() {
  if (fontLevel > -2) { fontLevel--; applyFontSize(); saveA11y(); }
});
document.getElementById('fontReset').addEventListener('click', function() {
  fontLevel = 0; applyFontSize(); saveA11y();
});

// Toggle options
function makeToggle(btnId, className) {
  document.getElementById(btnId).addEventListener('click', function() {
    document.body.classList.toggle(className);
    var isActive = document.body.classList.contains(className);
    this.classList.toggle('active', isActive);
    this.setAttribute('aria-pressed', isActive);
    saveA11y();
  });
}

makeToggle('toggleContrast', 'high-contrast');
makeToggle('toggleDyslexia', 'dyslexia-font');
makeToggle('toggleAnimations', 'reduce-motion');
makeToggle('toggleDarkMode', 'dark-mode');
makeToggle('toggleGrayscale', 'grayscale');

// Reset all
document.getElementById('a11yReset').addEventListener('click', function() {
  fontLevel = 0;
  applyFontSize();
  ['high-contrast', 'dyslexia-font', 'reduce-motion', 'dark-mode', 'grayscale'].forEach(function(cls) {
    document.body.classList.remove(cls);
  });
  ['toggleContrast', 'toggleDyslexia', 'toggleAnimations', 'toggleDarkMode', 'toggleGrayscale'].forEach(function(id) {
    var el = document.getElementById(id);
    el.classList.remove('active');
    el.setAttribute('aria-pressed', 'false');
  });
  localStorage.removeItem('masm_a11y');
});

// ===== LOADER =====
var loader = document.getElementById('loader');

window.addEventListener('load', function() {
  setTimeout(function() {
    loader.classList.add('split');

    setTimeout(function() {
      loader.classList.add('gone');
      initReveal();
    }, 1000);
  }, 1400);
});

// ===== SCROLL REVEAL =====
function initReveal() {
  // Hero elements appear immediately after loader
  document.querySelectorAll('.hero .reveal').forEach(function(el, i) {
    el.style.transitionDelay = (i * 0.2) + 's';
    el.classList.add('visible');
  });

  // All other reveal elements
  var revealEls = document.querySelectorAll('.reveal:not(.hero .reveal), .reveal-line');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;

      var parent = entry.target.closest('.realisations__grid, .methode__grid');

      if (parent && !parent.dataset.revealed) {
        parent.dataset.revealed = 'true';
        parent.querySelectorAll('.reveal').forEach(function(item, i) {
          setTimeout(function() {
            item.classList.add('visible');
          }, i * 100);
        });
      } else if (!parent) {
        entry.target.classList.add('visible');
      }

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function(el) {
    observer.observe(el);
  });
}

// ===== NAVBAR SCROLL =====
var navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ===== PARALLAX HERO =====
var heroBg = document.querySelector('.hero__bg');

window.addEventListener('scroll', function() {
  var scrollY = window.scrollY;
  var heroHeight = document.querySelector('.hero').offsetHeight;
  if (scrollY <= heroHeight) {
    heroBg.style.transform = 'translateY(' + scrollY * 0.4 + 'px)';
  }
}, { passive: true });

// ===== DEVIS FORM =====
var devisForm = document.getElementById('devisForm');
var devisBtn = document.getElementById('devisBtn');
var devisSuccess = document.getElementById('devisSuccess');

if (devisForm) {
  devisForm.addEventListener('submit', function(e) {
    e.preventDefault();
    devisBtn.textContent = 'Envoi en cours...';
    devisBtn.disabled = true;

    var formData = new FormData(devisForm);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        devisForm.reset();
        devisBtn.textContent = 'Envoyer la demande';
        devisBtn.disabled = false;
        devisSuccess.style.display = 'block';
        setTimeout(function() {
          devisSuccess.style.display = 'none';
        }, 5000);
      } else {
        devisBtn.textContent = 'Envoyer la demande';
        devisBtn.disabled = false;
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    })
    .catch(function() {
      devisBtn.textContent = 'Envoyer la demande';
      devisBtn.disabled = false;
      alert('Une erreur est survenue. Veuillez réessayer.');
    });
  });
}

// ===== BURGER MENU =====
var burger = document.querySelector('.navbar__burger');
var mobileMenu = document.querySelector('.navbar__mobile');

burger.addEventListener('click', function() {
  var isOpen = burger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  burger.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.navbar__mobile a').forEach(function(link) {
  link.addEventListener('click', function() {
    burger.classList.remove('active');
    mobileMenu.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// ===== AVIS =====
var avisList = document.getElementById('avisList');
var avisLeft = document.getElementById('avisLeft');
var avisRight = document.getElementById('avisRight');
var avisToggleBtn = document.getElementById('avisToggleBtn');
var avisFormWrapper = document.getElementById('avisFormWrapper');
var avisForm = document.getElementById('avisForm');
var avisStarsInput = document.getElementById('avisStarsInput');

var avisData = JSON.parse(localStorage.getItem('masm_avis') || '[]');
var avisPage = 0;
var selectedRating = 0;

function renderStars(note) {
  var html = '';
  for (var i = 1; i <= 5; i++) {
    html += '<span class="' + (i <= note ? '' : 'empty') + '">&#9733;</span>';
  }
  return html;
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getVisibleCount() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1080) return 2;
  return 3;
}

function renderAvis() {
  avisList.innerHTML = '';

  if (avisData.length === 0) {
    avisList.innerHTML = '<div class="avis__empty"><p>Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p></div>';
    avisLeft.style.display = 'none';
    avisRight.style.display = 'none';
    return;
  }

  avisData.forEach(function(avis) {
    var card = document.createElement('div');
    card.className = 'avis__card';
    card.innerHTML =
      '<div class="avis__author">' + escapeHtml(avis.nom) + '</div>' +
      '<div class="avis__stars">' + renderStars(avis.note) + '</div>' +
      '<p class="avis__message">' + escapeHtml(avis.message) + '</p>';
    avisList.appendChild(card);
  });

  updateCarousel();
}

function updateCarousel() {
  var visible = getVisibleCount();
  var maxPage = Math.max(0, avisData.length - visible);
  if (avisPage > maxPage) avisPage = maxPage;

  var cardEl = avisList.querySelector('.avis__card');
  if (!cardEl) return;

  var gap = 32;
  var offset = avisPage * (cardEl.offsetWidth + gap);
  avisList.style.transform = 'translateX(-' + offset + 'px)';

  avisLeft.style.display = avisPage > 0 ? 'flex' : 'none';
  avisRight.style.display = avisPage < maxPage ? 'flex' : 'none';
}

avisLeft.addEventListener('click', function() {
  avisPage = Math.max(0, avisPage - 1);
  updateCarousel();
});

avisRight.addEventListener('click', function() {
  var visible = getVisibleCount();
  var maxPage = Math.max(0, avisData.length - visible);
  avisPage = Math.min(maxPage, avisPage + 1);
  updateCarousel();
});

window.addEventListener('resize', function() {
  if (avisData.length > 0) updateCarousel();
});

// Stars input
avisStarsInput.querySelectorAll('span').forEach(function(star) {
  star.addEventListener('click', function() {
    selectedRating = parseInt(this.dataset.value);
    updateStarsInput();
  });

  star.addEventListener('mouseenter', function() {
    var val = parseInt(this.dataset.value);
    avisStarsInput.querySelectorAll('span').forEach(function(s) {
      s.classList.toggle('active', parseInt(s.dataset.value) <= val);
    });
  });
});

avisStarsInput.addEventListener('mouseleave', function() {
  updateStarsInput();
});

function updateStarsInput() {
  avisStarsInput.querySelectorAll('span').forEach(function(s) {
    s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
  });
}

avisToggleBtn.addEventListener('click', function() {
  var isHidden = avisFormWrapper.style.display === 'none';
  avisFormWrapper.style.display = isHidden ? 'block' : 'none';
  avisToggleBtn.textContent = isHidden ? 'Annuler' : 'Laisser un avis';
});

avisForm.addEventListener('submit', function(e) {
  e.preventDefault();

  var nom = document.getElementById('avisNom').value.trim();
  var message = document.getElementById('avisMessage').value.trim();

  if (!nom || !message || selectedRating === 0) {
    alert('Veuillez remplir tous les champs et sélectionner une note.');
    return;
  }

  avisData.push({ nom: nom, note: selectedRating, message: message });
  localStorage.setItem('masm_avis', JSON.stringify(avisData));

  avisForm.reset();
  selectedRating = 0;
  updateStarsInput();
  avisFormWrapper.style.display = 'none';
  avisToggleBtn.textContent = 'Laisser un avis';
  avisPage = 0;
  renderAvis();
});

renderAvis();

// ===== BACK TO TOP =====
var backToTop = document.getElementById('backToTop');

if (backToTop) {
  window.addEventListener('scroll', function() {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });
}

// ===== COOKIE BANNER =====
var cookieBanner = document.getElementById('cookieBanner');
var cookieAccept = document.getElementById('cookieAccept');
var cookieRefuse = document.getElementById('cookieRefuse');

if (cookieBanner) {
  if (localStorage.getItem('masm_cookies') !== null) {
    cookieBanner.classList.add('hidden');
  }

  cookieAccept.addEventListener('click', function() {
    localStorage.setItem('masm_cookies', 'accepted');
    cookieBanner.classList.add('hidden');
  });

  cookieRefuse.addEventListener('click', function() {
    localStorage.setItem('masm_cookies', 'refused');
    cookieBanner.classList.add('hidden');
  });
}
