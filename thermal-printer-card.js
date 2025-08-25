// Minimal Thermal Printer Card - Troubleshooting Version
// This simplified version should definitely load

class ThermalPrinterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const card = document.createElement('ha-card');
    card.header = config.title || 'Thermal Printer';
    const content = document.createElement('div');
    content.className = 'card-content';

    content.innerHTML = `
      <style>
        .control-button {
          padding: 10px 20px;
          margin: 8px;
          border: none;
          border-radius: 8px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          cursor: pointer;
          font-size: 14px;
        }
        .control-button:hover {
          filter: brightness(1.1);
        }
        .text-input {
          width: 100%;
          padding: 8px;
          margin: 8px 0;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
        }
        .status-info {
          padding: 12px;
          margin: 8px 0;
          background: var(--secondary-background-color);
          border-radius: 8px;
          font-size: 14px;
        }
      </style>

      <div class="status-info">
        <strong>Printer Status:</strong> <span id="printer-status">Ready</span>
      </div>

      <div>
        <h3>Basic Controls</h3>
        <button class="control-button" id="test-print">Test Print</button>
        <button class="control-button" id="wake-printer">Wake</button>
        <button class="control-button" id="sleep-printer">Sleep</button>
      </div>

      <div>
        <h3>Text Printing</h3>
        <input type="text" class="text-input" id="text-input" placeholder="Enter text to print">
        <button class="control-button" id="print-text">Print Text</button>
      </div>

      <div>
        <h3>Label Printing (NEW)</h3>
        <input type="text" class="text-input" id="label-input" placeholder="Enter label text">
        <select id="label-size" style="margin: 8px; padding: 6px;">
          <option value="S">Small</option>
          <option value="M" selected>Medium</option>
          <option value="L">Large</option>
          <option value="XL">Extra Large</option>
        </select>
        <button class="control-button" id="print-label">🏷️ Print Label</button>
      </div>

      <div class="status-info">
        💡 Label printing combines rotation + vertical layout for perfect label-maker style output!
      </div>
    `;

    card.appendChild(content);
    root.appendChild(card);

    this._config = config;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const root = this.shadowRoot;

    // Basic controls
    root.getElementById('test-print').onclick = () => this.callService('test_print');
    root.getElementById('wake-printer').onclick = () => this.callService('wake_printer');
    root.getElementById('sleep-printer').onclick = () => this.callService('sleep_printer');

    // Text printing
    root.getElementById('print-text').onclick = () => {
      const text = root.getElementById('text-input').value;
      if (text.trim()) {
        this.callService('print_text', {
          message: text,
          text_size: 'M',
          alignment: 'L',
          bold: false,
          underline: false,
          inverse: false,
          rotation: 0
        });
      } else {
        alert('Please enter some text');
      }
    };

    // Label printing
    root.getElementById('print-label').onclick = () => {
      const text = root.getElementById('label-input').value;
      const size = root.getElementById('label-size').value;
      if (text.trim()) {
        this.callService('print_label_text', {
          message: text,
          size: size,
          spacing: 1
        });
      } else {
        alert('Please enter label text');
      }
    };
  }

  callService(service, data = {}) {
    try {
      // Extract device name from entity
      const entityParts = this._config.entity.split('.');
      let deviceName = entityParts[1];
      
      // Clean up common entity suffixes
      deviceName = deviceName.replace(/_printer_wake$/, '');
      deviceName = deviceName.replace(/_wake$/, '');
      
      const serviceName = `${deviceName}_${service}`;
      
      console.log(`Calling service: esphome.${serviceName}`, data);
      this._hass.callService('esphome', serviceName, data);
      
    } catch (error) {
      console.error('Service call failed:', error);
      alert(`Service call failed: ${error.message}`);
    }
  }

  set hass(hass) {
    this._hass = hass;
    
    // Update status
    const statusSpan = this.shadowRoot.getElementById('printer-status');
    const entity = hass.states[this._config.entity];
    
    if (entity) {
      statusSpan.textContent = entity.state === 'on' ? 'Online' : 'Offline';
    } else {
      statusSpan.textContent = 'Unknown';
    }
  }

  getCardSize() {
    return 4;
  }
}

// Register the card
customElements.define('thermal-printer-card', ThermalPrinterCard);

// Add to custom cards registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Thermal Printer Card',
  description: 'Simple thermal printer control card'
});

// Debug logging
console.log('Thermal Printer Card: Script loaded');
console.log('Custom cards registered:', window.customCards);
