(function() {
  // Insert price bar inside .pricing-wrapper (before iframe) so it stays
  // within the iframe area. Uses position:sticky so it sticks at the top
  // only while scrolling through the calculator, not covering the CMS header.
  var wrapper = document.querySelector('.pricing-wrapper');
  if (!wrapper) return;

  var bar = document.createElement('div');
  bar.id = 'bashStartingPrice';
  bar.innerHTML = '<span class="price-label">Starting Price</span><span class="price-value"></span>';

  // Inline styles override overrides.css (which uses position:fixed + display:none)
  bar.style.cssText = [
    'display:flex',
    'position:sticky',
    'top:0',
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

  wrapper.insertBefore(bar, wrapper.firstChild);

  var priceEl = bar.querySelector('.price-value');

  function handler(event) {
    try {
      if (event.data && event.data.type === 'PRICE_UPDATE') {
        if (priceEl) {
          priceEl.textContent = event.data.data.price;
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
