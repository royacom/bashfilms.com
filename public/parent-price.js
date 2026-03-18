(function() {
  // Create price bar element dynamically (CMS strips HTML from content editor)
  var bar = document.createElement('div');
  bar.id = 'bashStartingPrice';
  bar.innerHTML = '<span style="font-weight:bold">Starting Price: </span><span id="bashPriceValue">$0</span>';
  bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1a1a1a;color:#fff;padding:12px 20px;z-index:99999;display:none;font-size:16px;text-align:center;';
  document.body.appendChild(bar);

  function handler(event) {
    try {
      if (event.data && event.data.type === 'PRICE_UPDATE') {
        var el = document.getElementById('bashPriceValue');
        if (el) {
          el.textContent = event.data.data.price;
          bar.style.display = '';
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
