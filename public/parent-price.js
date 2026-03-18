(function() {
  var wrapper = document.querySelector('.pricing-wrapper');
  if (!wrapper) return;

  // Create price bar — fixed below CMS header, visible only when iframe is on screen
  var bar = document.createElement('div');
  bar.id = 'bashStartingPrice';
  bar.innerHTML = '<span class="price-label">Starting Price</span><span class="price-value"></span>';

  // Use !important on all properties to beat overrides.css #bashStartingPrice rules
  var s = bar.style;
  s.setProperty('display', 'none', 'important');
  s.setProperty('position', 'fixed', 'important');
  s.setProperty('left', '0', 'important');
  s.setProperty('right', '0', 'important');
  s.setProperty('z-index', '99999', 'important');
  s.setProperty('background', 'rgba(255,255,255,0.95)', 'important');
  s.setProperty('backdrop-filter', 'blur(8px)', 'important');
  s.setProperty('-webkit-backdrop-filter', 'blur(8px)', 'important');
  s.setProperty('border-bottom', '1px solid #e5e5e5', 'important');
  s.setProperty('box-shadow', '0 4px 6px -1px rgba(0,0,0,0.1)', 'important');
  s.setProperty('padding', '12px 16px', 'important');
  s.setProperty('align-items', 'center', 'important');
  s.setProperty('justify-content', 'space-between', 'important');
  s.setProperty('font-family', 'Arial,Helvetica,sans-serif', 'important');

  document.body.appendChild(bar);

  var priceEl = bar.querySelector('.price-value');
  var hasPrice = false;

  function isMobile() {
    return window.innerWidth < 768;
  }

  // Measure CMS header height to position bar below it
  function getHeaderHeight() {
    // Mobile: hardcoded 70px per user specification
    if (isMobile()) return 70;

    // Desktop: measure actual header
    var desktop = document.querySelector('#ry-section-header');
    if (desktop) {
      var ds = window.getComputedStyle(desktop);
      if (ds.display !== 'none' && ds.visibility !== 'hidden') {
        return desktop.getBoundingClientRect().height;
      }
    }
    return 0;
  }

  function updatePosition() {
    s.setProperty('top', getHeaderHeight() + 'px', 'important');

    if (isMobile()) {
      // Full-width bar on mobile
      s.setProperty('left', '0', 'important');
      s.setProperty('right', '0', 'important');
      s.setProperty('width', 'auto', 'important');
      s.setProperty('border-radius', '0', 'important');
      s.setProperty('border', 'none', 'important');
      s.setProperty('border-bottom', '1px solid #e5e5e5', 'important');
    } else {
      // Card on the right side on desktop
      s.setProperty('left', 'auto', 'important');
      s.setProperty('right', '24px', 'important');
      s.setProperty('width', '256px', 'important');
      s.setProperty('border-radius', '16px', 'important');
      s.setProperty('border', '1px solid #e5e5e5', 'important');
      s.setProperty('border-bottom', '1px solid #e5e5e5', 'important');
      s.setProperty('padding', '16px', 'important');
      s.setProperty('flex-direction', 'column', 'important');
      s.setProperty('align-items', 'flex-start', 'important');
    }
  }

  // Add top padding to iframe on mobile so content isn't hidden behind price bar
  function updateIframePadding() {
    var iframe = document.querySelector('.pricing-wrapper iframe');
    if (iframe && isMobile()) {
      iframe.style.setProperty('padding-top', '50px', 'important');
    } else if (iframe) {
      iframe.style.removeProperty('padding-top');
    }
  }

  // Show bar only when the iframe wrapper is in the viewport
  function checkVisibility() {
    if (!hasPrice) return;
    var rect = wrapper.getBoundingClientRect();
    var inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      updatePosition();
      updateIframePadding();
      s.setProperty('display', 'flex', 'important');
    } else {
      s.setProperty('display', 'none', 'important');
    }
  }

  window.addEventListener('scroll', checkVisibility, { passive: true });
  window.addEventListener('resize', checkVisibility, { passive: true });

  function handler(event) {
    try {
      if (event.data && event.data.type === 'PRICE_UPDATE') {
        if (priceEl) {
          priceEl.textContent = event.data.data.price;
          hasPrice = true;
          checkVisibility();
        }
      }
      if (event.data && event.data.type === 'IFRAME_RESIZE') {
        var iframe = document.querySelector('.pricing-wrapper iframe');
        if (iframe && event.data.height) {
          iframe.style.height = event.data.height + 'px';
          iframe.style.minHeight = 'unset';
        }
      }
    } catch(e) {}
  }

  function install() {
    var _prev = window.onmessage;
    if (_prev && _prev._bashPrice) return;
    window.onmessage = function(e) {
      handler(e);
      if (_prev) _prev.call(window, e);
    };
    window.onmessage._bashPrice = true;
  }

  install();
  setInterval(install, 3000);
})();
