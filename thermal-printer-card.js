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

    const cardConfig = Object.assign({}, config);

    const card = document.createElement('ha-card');
    card.header = config.title || 'Thermal Printer';
    const content = document.createElement('div');
    content.className = 'card-content';

    content.innerHTML = `
      <style>
        .printer-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-radius: 8px;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--success-color);
        }
        .status-dot.error {
          background: var(--error-color);
        }
        .status-dot.warning {
          background: var(--warning-color);
        }
        .usage-section {
          margin: 16px 0;
          padding: 12px;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
        }
        .usage-bar {
          width: 100%;
          height: 20px;
          background: var(--disabled-text-color);
          border-radius: 10px;
          overflow: hidden;
          margin: 8px 0;
        }
        .usage-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--success-color), var(--warning-color), var(--error-color));
          transition: width 0.3s ease;
        }
        .usage-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 0.9em;
          color: var(--secondary-text-color);
        }
        .control-section {
          margin: 16px 0;
        }
        .control-row {
          display: flex;
          gap: 8px;
          margin: 8px 0;
          flex-wrap: wrap;
        }
        .control-button {
          flex: 1;
          min-width: 100px;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s ease;
        }
        .control-button:hover {
          background: var(--primary-color);
          filter: brightness(1.1);
        }
        .control-button:disabled {
          background: var(--disabled-text-color);
          cursor: not-allowed;
        }
        .control-button.secondary {
          background: var(--secondary-color);
        }
        .control-button.danger {
          background: var(--error-color);
        }
        .text-input-section {
          margin: 16px 0;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
        }
        .text-input {
          width: 100%;
          min-height: 60px;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          resize: vertical;
          font-family: monospace;
          margin: 8px 0;
        }
        .format-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 8px;
          margin: 8px 0;
        }
        .format-select {
          padding: 6px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
        }
        .two-column-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 8px 0;
        }
        .column-input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
        }
        .section-header {
          font-weight: bold;
          margin: 16px 0 8px 0;
          color: var(--primary-text-color);
        }
        .barcode-section {
          margin: 12px 0;
          padding: 12px;
          background: var(--secondary-background-color);
          border-radius: 8px;
        }
        .collapsible {
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: var(--divider-color);
          border-radius: 4px;
          margin: 8px 0;
        }
        .collapsible-content {
          display: none;
          margin-top: 8px;
        }
        .collapsible.active + .collapsible-content {
          display: block;
        }
      </style>

      <div class="printer-status">
        <div class="status-indicator">
          <div class="status-dot" id="status-dot"></div>
          <span id="status-text">Checking...</span>
        </div>
        <div>
          <span id="paper-status">Unknown</span>
        </div>
      </div>

      <div class="usage-section">
        <div class="section-header">Paper Usage</div>
        <div class="usage-bar">
          <div class="usage-fill" id="usage-fill" style="width: 0%"></div>
        </div>
        <div class="usage-stats">
          <div>Used: <span id="usage-mm">0</span> mm</div>
          <div>Percentage: <span id="usage-percent">0</span>%</div>
          <div>Lines: <span id="lines-printed">0</span></div>
          <div>Characters: <span id="chars-printed">0</span></div>
        </div>
      </div>

      <div class="control-section">
        <div class="section-header">Quick Actions</div>
        <div class="control-row">
          <button class="control-button" id="test-print">Test Print</button>
          <button class="control-button secondary" id="wake-printer">Wake</button>
          <button class="control-button secondary" id="sleep-printer">Sleep</button>
          <button class="control-button danger" id="reset-usage">Reset Usage</button>
        </div>
        <div class="control-row">
          <button class="control-button" id="feed-paper">Feed Paper</button>
          <button class="control-button" id="print-separator">Print Separator</button>
        </div>
      </div>

      <div class="text-input-section">
        <div class="collapsible" id="text-toggle">
          <span class="section-header">Text Printing</span>
          <span>▼</span>
        </div>
        <div class="collapsible-content" id="text-content">
          <textarea class="text-input" id="text-input" placeholder="Enter text to print..."></textarea>
          <div class="format-controls">
            <select class="format-select" id="text-size">
              <option value="S">Small</option>
              <option value="M" selected>Medium</option>
              <option value="L">Large</option>
            </select>
            <select class="format-select" id="text-justify">
              <option value="L" selected>Left</option>
              <option value="C">Center</option>
              <option value="R">Right</option>
            </select>
            <label><input type="checkbox" id="text-bold"> Bold</label>
            <label><input type="checkbox" id="text-underline"> Underline</label>
            <label><input type="checkbox" id="text-inverse"> Inverse</label>
          </div>
          <button class="control-button" id="print-text">Print Text</button>
        </div>
      </div>

      <div class="text-input-section">
        <div class="collapsible" id="column-toggle">
          <span class="section-header">Two-Column Printing</span>
          <span>▼</span>
        </div>
        <div class="collapsible-content" id="column-content">
          <div class="two-column-section">
            <input class="column-input" id="left-column" placeholder="Left column text">
            <input class="column-input" id="right-column" placeholder="Right column text">
          </div>
          <label><input type="checkbox" id="fill-dots" checked> Fill with dots</label>
          <button class="control-button" id="print-columns">Print Two Columns</button>
        </div>
      </div>

      <div class="barcode-section">
        <div class="collapsible" id="barcode-toggle">
          <span class="section-header">Barcode Printing</span>
          <span>▼</span>
        </div>
        <div class="collapsible-content" id="barcode-content">
          <select class="format-select" id="barcode-type" style="width: 100%; margin: 8px 0;">
            <option value="0">UPC-A</option>
            <option value="1">UPC-E</option>
            <option value="2">EAN13</option>
            <option value="3">EAN8</option>
            <option value="4">CODE39</option>
            <option value="5">ITF</option>
            <option value="6">CODABAR</option>
            <option value="7">CODE93</option>
            <option value="8" selected>CODE128</option>
          </select>
          <input class="column-input" id="barcode-data" placeholder="Barcode data" style="width: 100%; margin: 8px 0;">
          <button class="control-button" id="print-barcode">Print Barcode</button>
        </div>
      </div>
    `;

    card.appendChild(content);
    root.appendChild(card);

    this._config = cardConfig;
    this.setupEventListeners();
    this.setupCollapsibles();
  }

  setupEventListeners() {
    const shadowRoot = this.shadowRoot;

    // Quick action buttons
    shadowRoot.getElementById('test-print').onclick = () => this.callService('test_print');
    shadowRoot.getElementById('wake-printer').onclick = () => this.callService('wake_printer');
    shadowRoot.getElementById('sleep-printer').onclick = () => this.callService('sleep_printer');
    shadowRoot.getElementById('reset-usage').onclick = () => this.confirmAction(() => this.callService('reset_paper_usage'));
    shadowRoot.getElementById('feed-paper').onclick = () => this.callService('feed_paper', { lines: 3 });
    shadowRoot.getElementById('print-separator').onclick = () => this.printSeparator();

    // Text printing
    shadowRoot.getElementById('print-text').onclick = () => this.printText();

    // Two-column printing
    shadowRoot.getElementById('print-columns').onclick = () => this.printTwoColumn();

    // Barcode printing
    shadowRoot.getElementById('print-barcode').onclick = () => this.printBarcode();
  }

  setupCollapsibles() {
    const shadowRoot = this.shadowRoot;
    const collapsibles = ['text-toggle', 'column-toggle', 'barcode-toggle'];

    collapsibles.forEach(id => {
      const toggle = shadowRoot.getElementById(id);
      toggle.onclick = () => {
        toggle.classList.toggle('active');
        const arrow = toggle.querySelector('span:last-child');
        arrow.textContent = toggle.classList.contains('active') ? '▲' : '▼';
      };
    });
  }

  printText() {
    const shadowRoot = this.shadowRoot;
    const text = shadowRoot.getElementById('text-input').value;
    if (!text.trim()) {
      alert('Please enter some text to print');
      return;
    }

    const data = {
      text: text,
      size: shadowRoot.getElementById('text-size').value,
      justify: shadowRoot.getElementById('text-justify').value,
      bold: shadowRoot.getElementById('text-bold').checked,
      underline: shadowRoot.getElementById('text-underline').checked,
      inverse: shadowRoot.getElementById('text-inverse').checked
    };

    this.callService('print_text', data);
  }

  printTwoColumn() {
    const shadowRoot = this.shadowRoot;
    const leftText = shadowRoot.getElementById('left-column').value;
    const rightText = shadowRoot.getElementById('right-column').value;

    if (!leftText.trim() && !rightText.trim()) {
      alert('Please enter text for at least one column');
      return;
    }

    const data = {
      left_text: leftText,
      right_text: rightText,
      fill_dots: shadowRoot.getElementById('fill-dots').checked
    };

    this.callService('print_two_column', data);
  }

  printBarcode() {
    const shadowRoot = this.shadowRoot;
    const barcodeData = shadowRoot.getElementById('barcode-data').value;
    if (!barcodeData.trim()) {
      alert('Please enter barcode data');
      return;
    }

    const data = {
      barcode_type: parseInt(shadowRoot.getElementById('barcode-type').value),
      barcode_data: barcodeData
    };

    this.callService('print_barcode', data);
  }

  printSeparator() {
    const data = {
      text: '================================',
      size: 'S',
      justify: 'C',
      bold: false,
      underline: false,
      inverse: false
    };
    this.callService('print_text', data);
  }

  confirmAction(action) {
    if (confirm('Are you sure you want to perform this action?')) {
      action();
    }
  }

  callService(service, data = {}) {
    const [domain, entityId] = this._config.entity.split('.');
    const serviceName = `${domain}.${service}`;

    this._hass.callService('esphome', `thermal_printer_${service}`, data);
  }

  set hass(hass) {
    this._hass = hass;
    
    const entity = hass.states[this._config.entity];
    if (!entity) return;

    this.updateStatus(hass);
  }

  updateStatus(hass) {
    const shadowRoot = this.shadowRoot;
    
    // Update paper status
    const paperEntity = hass.states[this._config.paper_sensor || 'binary_sensor.thermal_printer_paper_loaded'];
    const paperTextEntity = hass.states[this._config.paper_text_sensor || 'text_sensor.thermal_printer_paper_status'];
    
    if (paperEntity) {
      const statusDot = shadowRoot.getElementById('status-dot');
      const statusText = shadowRoot.getElementById('status-text');
      const paperStatus = shadowRoot.getElementById('paper-status');

      if (paperEntity.state === 'on') {
        statusDot.className = 'status-dot';
        statusText.textContent = 'Ready';
        paperStatus.textContent = 'Paper OK';
      } else {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'Paper Out';
        paperStatus.textContent = 'No Paper';
      }
    }

    // Update paper usage
    const usageEntity = hass.states[this._config.usage_sensor || 'sensor.thermal_printer_paper_usage_percent'];
    const usageMmEntity = hass.states[this._config.usage_mm_sensor || 'sensor.thermal_printer_paper_usage_mm'];
    const linesEntity = hass.states[this._config.lines_sensor || 'sensor.thermal_printer_lines_printed'];
    const charsEntity = hass.states[this._config.chars_sensor || 'sensor.thermal_printer_characters_printed'];

    if (usageEntity) {
      const usageFill = shadowRoot.getElementById('usage-fill');
      const usagePercent = shadowRoot.getElementById('usage-percent');
      const percentage = parseFloat(usageEntity.state) || 0;
      
      usageFill.style.width = `${Math.min(percentage, 100)}%`;
      usagePercent.textContent = percentage.toFixed(1);
    }

    if (usageMmEntity) {
      const usageMm = shadowRoot.getElementById('usage-mm');
      usageMm.textContent = parseFloat(usageMmEntity.state).toFixed(1);
    }

    if (linesEntity) {
      const linesPrinted = shadowRoot.getElementById('lines-printed');
      linesPrinted.textContent = linesEntity.state;
    }

    if (charsEntity) {
      const charsPrinted = shadowRoot.getElementById('chars-printed');
      charsPrinted.textContent = charsEntity.state;
    }
  }

  getCardSize() {
    return 6;
  }
}

customElements.define('thermal-printer-card', ThermalPrinterCard);

// Register the card with the card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Thermal Printer Card',
  description: 'A card for controlling thermal printers'
});
