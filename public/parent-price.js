(function() {
  var wrapper = document.querySelector('.pricing-wrapper');
  if (!wrapper) return;

  // Create price bar — fixed to viewport, only visible when iframe is on screen
  var bar = document.createElement('div');
  bar.id = 'bashStartingPrice';
  bar.innerHTML = '<span class="price-label">Starting Price</span><span class="price-value"></span>';

  bar.style.cssText = [
    'display:none',
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    'z-index:99999',
    'background:rgba(255,255,255,0.95)',
    'backdrop-filter:blur(8px)',
    '-webkit-backdrop-filter:blur(8px)',
    'border-bottom:1px solid #e5e5e5',
    'box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)',
    'padding:12px 16px',
    'align-items:center',
    'justify-content:space-between',
    'font-family:Arial,Helvetica,sans-serif'
  ].join(';') + ';';

  document.body.appendChild(bar);

  var priceEl = bar.querySelector('.price-value');
  var hasPrice = false;

  // Show bar only when the iframe wrapper is in the viewport
  function checkVisibility() {
    if (!hasPrice) return;
    var rect = wrapper.getBoundingClientRect();
    var inView = rect.top < window.innerHeight && rect.bottom > 0;
    bar.style.display = inView ? 'flex' : 'none';
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
