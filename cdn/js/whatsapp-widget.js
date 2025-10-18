// whatsapp-widget.js
// Toggles a floating WhatsApp chat panel and opens wa.me link with the typed message.

document.addEventListener('DOMContentLoaded', () => {
  // Target phone number in international format WITHOUT + or spaces
  // Read configuration from markup (allows non-dev edits)
  const widgetEl = document.querySelector('.whatsapp-widget');
  const WHATSAPP_PHONE = widgetEl?.getAttribute('data-phone') || '919110548556';
  const HOURS = widgetEl?.getAttribute('data-hours') || null; // format HH:MM-HH:MM (local or timezone)
  const TIMEZONE = widgetEl?.getAttribute('data-timezone') || null; // optional IANA timezone

  const waToggle = document.getElementById('wa-toggle');
  const waPanel = document.getElementById('wa-panel');
  const waClose = document.getElementById('wa-close');
  const waMinimize = document.getElementById('wa-minimize');
  const waReopen = document.getElementById('wa-reopen');
  const waSend = document.getElementById('wa-send');
  const waCopy = document.getElementById('wa-copy');
  const waMessage = document.getElementById('wa-message');
  const waFeedback = document.getElementById('wa-feedback');
  const waAvailability = document.getElementById('wa-availability');

  if (!waToggle || !waPanel) return;

  function showFeedback(text, isError) {
    if (!waFeedback) return;
    waFeedback.hidden = false;
    waFeedback.textContent = text;
    waFeedback.style.color = isError ? '#b21f1f' : '#0a6f2a';
    setTimeout(() => { waFeedback.hidden = true; }, 5000);
  }

  function openWhatsApp(text) {
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
    window.open(url, '_blank', 'noopener');
  }

  // Analytics helper: push to dataLayer if available, and dispatch custom event
  function trackEvent(name, payload = {}) {
    try {
      if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push(Object.assign({ event: name }, payload));
      }
      // also dispatch a DOM event for local consumers
      document.dispatchEvent(new CustomEvent(name, { detail: payload }));
    } catch (err) {
      // don't block on analytics errors
      // console.debug('analytics error', err);
    }
  }

  waToggle.addEventListener('click', () => {
    const isHidden = waPanel.hasAttribute('hidden');
    if (isHidden) {
      waPanel.removeAttribute('hidden');
      trackEvent('widget_open', { widget: 'whatsapp' });
    } else {
      waPanel.setAttribute('hidden', '');
      trackEvent('widget_close', { widget: 'whatsapp' });
    }
  });

  // Single-click full close: hide the entire widget and show the reopen button
  waClose?.addEventListener('click', () => {
    widgetEl.style.display = 'none';
    if (waReopen) waReopen.hidden = false;
    trackEvent('widget_close_full', { widget: 'whatsapp' });
  });

  // Reopen button handler
  waReopen?.addEventListener('click', () => {
    widgetEl.style.display = '';
    waReopen.hidden = true;
    trackEvent('widget_reopen', { widget: 'whatsapp' });
  });

  // Minimize / maximize handling
  waMinimize?.addEventListener('click', () => {
    if (!waPanel.classList.contains('minimized')) {
      waPanel.classList.add('minimized');
      trackEvent('widget_minimize', { widget: 'whatsapp' });
    } else {
      waPanel.classList.remove('minimized');
      trackEvent('widget_maximize', { widget: 'whatsapp' });
    }
  });

  waSend?.addEventListener('click', () => {
    const text = (waMessage?.value || '').trim();
    if (!text) { showFeedback('Please type a message before sending.', true); return; }
    const prefixed = `${text}\n\n--\nSent via CuraFe Health website`;
    openWhatsApp(prefixed);
    trackEvent('widget_send', { widget: 'whatsapp', phone: WHATSAPP_PHONE });
    showFeedback('Opening WhatsApp...');
  });

  waCopy?.addEventListener('click', async () => {
    const text = (waMessage?.value || '').trim();
    if (!text) { showFeedback('Nothing to copy.', true); return; }
    try {
      await navigator.clipboard.writeText(text);
      trackEvent('widget_copy', { widget: 'whatsapp' });
      showFeedback('Message copied to clipboard.');
    } catch (err) {
      showFeedback('Copy failed — please select and copy manually.', true);
    }
  });

  // Business hours availability handling
  function parseHoursWindow(windowStr) {
    if (!windowStr) return null;
    const parts = windowStr.split('-');
    if (parts.length !== 2) return null;
    const [start, end] = parts;
    return { start, end };
  }

  function inBusinessHours(windowStr) {
    const win = parseHoursWindow(windowStr);
    if (!win) return true; // if not configured, assume available
    try {
      // Use visitor local time unless TIMEZONE is provided (advanced timezone handling omitted for brevity)
      const now = new Date();
      const pad = (n) => (n < 10 ? '0' + n : String(n));
      const toMinutes = (hhmm) => {
        const [h, m] = hhmm.split(':').map(s => parseInt(s, 10));
        return h * 60 + (m || 0);
      };
      const currMin = now.getHours() * 60 + now.getMinutes();
      const startMin = toMinutes(win.start);
      const endMin = toMinutes(win.end);
      if (startMin <= endMin) return currMin >= startMin && currMin <= endMin;
      // overnight window (e.g., 22:00-06:00)
      return currMin >= startMin || currMin <= endMin;
    } catch (err) {
      return true;
    }
  }

  // apply availability state
  (function applyAvailability() {
    const available = inBusinessHours(HOURS);
    if (waAvailability) {
      waAvailability.textContent = available ? '• Available' : '• Offline';
      waAvailability.classList.toggle('off', !available);
    }
    // auto-hide the toggle if offline (optional: you might instead keep it but mark offline)
    if (!available) {
      // hide panel if open
      if (!waPanel.hasAttribute('hidden')) waPanel.setAttribute('hidden', '');
      // optionally remove/hide toggle after a delay
      // here we keep the toggle but dispatch an event
      trackEvent('widget_hidden_due_hours', { widget: 'whatsapp' });
    }
  })();
});
