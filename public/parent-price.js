(function() {
  // Create price bar element dynamically (CMS strips HTML from content editor)
  // No inline styles — overrides.css handles all responsive styling
  var bar = document.createElement('div');
  bar.id = 'bashStartingPrice';
  bar.innerHTML = '<span class="price-label">Starting Price</span><span class="price-value"></span>';
  document.body.appendChild(bar);

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
