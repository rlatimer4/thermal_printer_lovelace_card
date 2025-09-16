class ThermalPrinterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentPrintQueue = [];
    this.isProcessingQueue = false;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity (the main thermal printer device)');
    }

    // Auto-detect entity naming pattern
    this.entityBase = config.entity.replace(/^switch\./, '').replace(/_printer_wake$/, '').replace(/_wake$/, '');
    
    const root = this.shadowRoot;
    root.innerHTML = '';

    // Add enhanced styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        --thermal-primary: var(--primary-color);
        --thermal-success: var(--success-color, #4caf50);
        --thermal-warning: var(--warning-color, #ff9800);
        --thermal-error: var(--error-color, #f44336);
        --thermal-info: var(--info-color, #2196f3);
      }
      
      .thermal-card {
        padding: 16px;
        background: var(--card-background-color);
        border-radius: 8px;
        box-shadow: var(--ha-card-box-shadow);
      }
      
      .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        margin-bottom: 16px;
        background: var(--thermal-primary);
        color: var(--text-primary-color);
        border-radius: 8px;
        position: relative;
        overflow: hidden;
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
        background: var(--thermal-success);
        transition: all 0.3s ease;
      }
      
      .status-dot.offline { background: var(--thermal-error); }
      .status-dot.warning { background: var(--thermal-warning); }
      .status-dot.printing { 
        background: var(--thermal-info);
        animation: pulse 1.5s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }
      
      .queue-indicator {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--thermal-info);
        animation: progress 2s linear infinite;
      }
      
      .queue-indicator.active { display: block; }
      
      @keyframes progress {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .paper-usage {
        margin: 16px 0;
        padding: 16px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
      }
      
      .usage-bar {
        width: 100%;
        height: 24px;
        background: var(--disabled-text-color);
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        margin: 12px 0;
      }
      
      .usage-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--thermal-success) 0%, var(--thermal-warning) 70%, var(--thermal-error) 100%);
        transition: width 0.5s ease;
        width: 0%;
      }
      
      .usage-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--primary-text-color);
        font-size: 13px;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      }
      
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
        margin: 16px 0;
      }
      
      .thermal-button {
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        background: var(--thermal-primary);
        color: var(--text-primary-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
      }
      
      .thermal-button:hover {
        filter: brightness(1.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      
      .thermal-button:active {
        transform: translateY(0);
      }
      
      .thermal-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      
      .thermal-button.success { background: var(--thermal-success); }
      .thermal-button.warning { background: var(--thermal-warning); }
      .thermal-button.error { background: var(--thermal-error); }
      .thermal-button.info { background: var(--thermal-info); }
      
      .section {
        margin: 16px 0;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .section-header {
        padding: 12px 16px;
        background: var(--divider-color);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s ease;
      }
      
      .section-header:hover {
        background: var(--secondary-background-color);
      }
      
      .section-content {
        padding: 16px;
        display: none;
      }
      
      .section-content.open {
        display: block;
      }
      
      .form-group {
        margin: 12px 0;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      
      .form-control {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }
      
      .form-control:focus {
        outline: none;
        border-color: var(--thermal-primary);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }
      
      .checkbox-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
        margin: 12px 0;
      }
      
      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .checkbox-item:hover {
        background: var(--divider-color);
      }
      
      .two-column {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      .three-column {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }
      
      .validation-error {
        background: var(--thermal-error);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        margin: 8px 0;
        font-size: 12px;
        display: none;
      }
      
      .validation-error.show {
        display: block;
      }
      
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 8px 0;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        border-left: 3px solid var(--thermal-info);
      }
      
      .queue-status {
        margin: 8px 0;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        font-size: 12px;
        display: none;
      }
      
      .queue-status.active {
        display: block;
        border-left: 3px solid var(--thermal-info);
      }
    `;
    root.appendChild(style);

    const card = document.createElement('ha-card');
    card.setAttribute('header', config.title || 'Thermal Printer');
    
    const content = document.createElement('div');
    content.className = 'thermal-card';

    // Status Bar with Queue Indicator
    const statusBar = document.createElement('div');
    statusBar.className = 'status-bar';
    statusBar.innerHTML = `
      <div class="queue-indicator" id="queue-indicator"></div>
      <div class="status-indicator">
        <div class="status-dot" id="status-dot"></div>
        <span id="status-text">Initializing...</span>
      </div>
      <button class="thermal-button" id="refresh-btn">🔄 Refresh</button>
    `;

    // Queue Status
    const queueStatus = document.createElement('div');
    queueStatus.id = 'queue-status';
    queueStatus.className = 'queue-status';
    queueStatus.innerHTML = 'Queue: 0 jobs pending';

    // Paper Usage Section
    const paperSection = document.createElement('div');
    paperSection.className = 'paper-usage';
    paperSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong>📄 Paper Usage</strong>
        <button class="thermal-button" id="reset-usage" style="padding: 4px 8px; font-size: 12px;">Reset</button>
      </div>
      <div class="usage-bar">
        <div class="usage-fill" id="usage-fill"></div>
        <div class="usage-text" id="usage-text">0%</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 13px; color: var(--secondary-text-color);">
        <div>Used: <span id="usage-mm">0</span> mm</div>
        <div>Lines: <span id="lines-printed">0</span></div>
        <div>Chars: <span id="chars-printed">0</span></div>
      </div>
    `;

    // Quick Actions
    const quickActions = document.createElement('div');
    quickActions.innerHTML = `
      <h3 style="margin: 16px 0 8px 0;">⚡ Quick Actions</h3>
      <div class="actions-grid">
        <button class="thermal-button" id="test-btn">🖨️ Test</button>
        <button class="thermal-button success" id="wake-btn">⚡ Wake</button>
        <button class="thermal-button warning" id="sleep-btn">😴 Sleep</button>
        <button class="thermal-button info" id="feed-btn">📄 Feed</button>
        <button class="thermal-button" id="separator-btn">➖ Separator</button>
        <button class="thermal-button error" id="clear-queue-btn">🗑️ Clear Queue</button>
      </div>
    `;

    // Enhanced Text Printing Section
    const textSection = this.createSection('📝 Text Printing', `
      <div class="form-group">
        <label for="text-input">Text to Print</label>
        <textarea id="text-input" class="form-control" rows="4" placeholder="Enter text to print..."></textarea>
        <div class="hint" id="text-hint">Characters remaining: calculating...</div>
      </div>
      
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input type="checkbox" id="bold-check">
          <label for="bold-check">Bold</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="underline-check">
          <label for="underline-check">Underline</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="inverse-check">
          <label for="inverse-check">Inverse</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="rotate-check">
          <label for="rotate-check">90° Rotate</label>
        </div>
      </div>
      
      <div class="two-column">
        <div class="form-group">
          <label for="size-select">Text Size</label>
          <select id="size-select" class="form-control">
            <option value="S">Small (32 chars/line)</option>
            <option value="M" selected>Medium (24 chars/line)</option>
            <option value="L">Large (16 chars/line)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="align-select">Alignment</label>
          <select id="align-select" class="form-control">
            <option value="L" selected>← Left</option>
            <option value="C">⚬ Center</option>
            <option value="R">→ Right</option>
          </select>
        </div>
      </div>
      
      <button class="thermal-button success" id="print-text-btn" style="width: 100%; margin-top: 12px;">
        🖨️ Add to Print Queue
      </button>
    `);

    // Two-Column Printing
    const twoColSection = this.createSection('📊 Receipt Printing', `
      <div class="form-group">
        <label>Receipt Items</label>
        <div class="two-column">
          <input type="text" id="left-col" class="form-control" placeholder="Item name">
          <input type="text" id="right-col" class="form-control" placeholder="Price">
        </div>
        <div class="hint">Perfect for receipts: "Coffee..................$3.50"</div>
      </div>
      
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input type="checkbox" id="fill-dots" checked>
          <label for="fill-dots">Fill with dots</label>
        </div>
        <div class="form-group" style="margin: 0;">
          <select id="receipt-size" class="form-control">
            <option value="S" selected>Small (32 chars)</option>
            <option value="M">Medium (24 chars)</option>
            <option value="L">Large (16 chars)</option>
          </select>
        </div>
      </div>
      
      <button class="thermal-button info" id="print-receipt-btn" style="width: 100%; margin-top: 12px;">
        📊 Add Receipt Line
      </button>
    `);

    // Advanced Features
    const advancedSection = this.createSection('🚀 Advanced Features', `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <h4>🏷️ Label Printing</h4>
          <div class="form-group">
            <input type="text" id="label-text" class="form-control" placeholder="Label text" maxlength="20">
            <div class="hint">Prints vertically down the roll</div>
          </div>
          <button class="thermal-button success" id="print-label-btn" style="width: 100%;">
            🏷️ Print Label
          </button>
        </div>
        
        <div>
          <h4>📱 QR Code</h4>
          <div class="form-group">
            <input type="text" id="qr-data" class="form-control" placeholder="URL or text">
            <select id="qr-size" class="form-control" style="margin-top: 8px;">
              <option value="1">Small</option>
              <option value="2">Medium</option>
              <option value="3" selected>Large</option>
              <option value="4">Extra Large</option>
            </select>
          </div>
          <button class="thermal-button info" id="print-qr-btn" style="width: 100%;">
            📱 Print QR Code
          </button>
        </div>
      </div>
      
      <div style="margin-top: 16px;">
        <h4>📱 Barcode</h4>
        <div class="two-column">
          <select id="barcode-type" class="form-control">
            <option value="0">UPC-A (12 digits)</option>
            <option value="1">UPC-E (6-8 digits)</option>
            <option value="2">EAN13 (12-13 digits)</option>
            <option value="3">EAN8 (7-8 digits)</option>
            <option value="4">CODE39 (alphanumeric)</option>
            <option value="5">ITF (even digits)</option>
            <option value="6">CODABAR (numeric + special)</option>
            <option value="7">CODE93 (alphanumeric)</option>
            <option value="8" selected>CODE128 (full ASCII)</option>
          </select>
          <input type="text" id="barcode-data" class="form-control" placeholder="Barcode data">
        </div>
        <div class="validation-error" id="barcode-error"></div>
        <button class="thermal-button warning" id="print-barcode-btn" style="width: 100%; margin-top: 8px;">
          📱 Print Barcode
        </button>
      </div>
    `);

    // Assembly
    content.appendChild(statusBar);
    content.appendChild(queueStatus);
    content.appendChild(paperSection);
    content.appendChild(quickActions);
    content.appendChild(textSection);
    content.appendChild(twoColSection);
    content.appendChild(advancedSection);

    card.appendChild(content);
    root.appendChild(card);

    this._config = config;
    this.setupEventListeners();
  }

  createSection(title, content) {
    const section = document.createElement('div');
    section.className = 'section';
    
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
      <span style="font-weight: 600;">${title}</span>
      <span class="section-arrow">▼</span>
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'section-content';
    contentDiv.innerHTML = content;
    
    section.appendChild(header);
    section.appendChild(contentDiv);
    
    // Toggle functionality
    header.addEventListener('click', () => {
      const isOpen = contentDiv.classList.contains('open');
      contentDiv.classList.toggle('open', !isOpen);
      header.querySelector('.section-arrow').textContent = isOpen ? '▼' : '▲';
    });
    
    return section;
  }

  setupEventListeners() {
    const root = this.shadowRoot;
    
    // Quick actions
    root.getElementById('refresh-btn').addEventListener('click', () => this.callService('wake_printer'));
    root.getElementById('test-btn').addEventListener('click', () => this.addToQueue('test_print', {}));
    root.getElementById('wake-btn').addEventListener('click', () => this.callService('wake_printer'));
    root.getElementById('sleep-btn').addEventListener('click', () => this.callService('sleep_printer'));
    root.getElementById('feed-btn').addEventListener('click', () => this.addToQueue('feed_paper', { lines: 3 }));
    root.getElementById('separator-btn').addEventListener('click', () => this.addToQueue('print_text', {
      message: '================================',
      text_size: 'S',
      alignment: 'C'
    }));
    root.getElementById('clear-queue-btn').addEventListener('click', () => this.clearQueue());
    root.getElementById('reset-usage').addEventListener('click', () => {
      if (confirm('Reset paper usage counters?')) {
        this.callService('reset_paper_usage');
      }
    });
    
    // Text printing
    const textInput = root.getElementById('text-input');
    const textHint = root.getElementById('text-hint');
    const updateCharLimits = () => {
      const size = root.getElementById('size-select').value;
      const rotate = root.getElementById('rotate-check').checked;
      let maxChars = size === 'S' ? 32 : size === 'M' ? 24 : 16;
      if (rotate) maxChars = Math.floor(maxChars * 0.7);
      
      const remaining = Math.max(0, maxChars - textInput.value.length);
      textHint.textContent = `Characters remaining: ${remaining}/${maxChars}`;
      textHint.style.color = remaining < 5 ? 'var(--thermal-error)' : 'var(--secondary-text-color)';
    };
    
    textInput.addEventListener('input', updateCharLimits);
    root.getElementById('size-select').addEventListener('change', updateCharLimits);
    root.getElementById('rotate-check').addEventListener('change', updateCharLimits);
    updateCharLimits();
    
    root.getElementById('print-text-btn').addEventListener('click', () => {
      const text = textInput.value.trim();
      if (!text) {
        alert('Please enter some text to print');
        return;
      }
      
      const data = {
        message: text,
        text_size: root.getElementById('size-select').value,
        alignment: root.getElementById('align-select').value,
        bold: root.getElementById('bold-check').checked,
        underline: root.getElementById('underline-check').checked,
        inverse: root.getElementById('inverse-check').checked,
        rotation: root.getElementById('rotate-check').checked ? 1 : 0
      };
      
      if (data.rotation) {
        this.addToQueue('print_rotated_text', data);
      } else {
        this.addToQueue('print_text', data);
      }
      
      textInput.value = '';
      updateCharLimits();
    });
    
    // Receipt printing
    root.getElementById('print-receipt-btn').addEventListener('click', () => {
      const leftText = root.getElementById('left-col').value.trim();
      const rightText = root.getElementById('right-col').value.trim();
      
      if (!leftText && !rightText) {
        alert('Please enter text for at least one column');
        return;
      }
      
      this.addToQueue('print_two_column', {
        left_text: leftText,
        right_text: rightText,
        fill_dots: root.getElementById('fill-dots').checked,
        text_size: root.getElementById('receipt-size').value
      });
      
      root.getElementById('left-col').value = '';
      root.getElementById('right-col').value = '';
    });
    
    // Label printing
    root.getElementById('print-label-btn').addEventListener('click', () => {
      const text = root.getElementById('label-text').value.trim();
      if (!text) {
        alert('Please enter label text');
        return;
      }
      
      this.addToQueue('print_rotated_text', {
        message: text,
        rotation: 1,
        size: 'M'
      });
      
      root.getElementById('label-text').value = '';
    });
    
    // QR Code
    root.getElementById('print-qr-btn').addEventListener('click', () => {
      const data = root.getElementById('qr-data').value.trim();
      if (!data) {
        alert('Please enter QR code data');
        return;
      }
      
      this.addToQueue('print_qr_code', {
        data: data,
        size: parseInt(root.getElementById('qr-size').value),
        error_correction: 1,
        label: ''
      });
      
      root.getElementById('qr-data').value = '';
    });
    
    // Barcode validation and printing
    const validateBarcode = () => {
      const type = parseInt(root.getElementById('barcode-type').value);
      const data = root.getElementById('barcode-data').value.trim();
      const errorDiv = root.getElementById('barcode-error');
      
      if (!data) {
        errorDiv.classList.remove('show');
        return true;
      }
      
      let error = null;
      switch (type) {
        case 0: if (!/^\d{11,12}$/.test(data)) error = 'UPC-A requires 11-12 digits'; break;
        case 1: if (!/^\d{6,8}$/.test(data)) error = 'UPC-E requires 6-8 digits'; break;
        case 2: if (!/^\d{12,13}$/.test(data)) error = 'EAN13 requires 12-13 digits'; break;
        case 3: if (!/^\d{7,8}$/.test(data)) error = 'EAN8 requires 7-8 digits'; break;
        case 5: if (!/^\d+$/.test(data) || data.length % 2 !== 0) error = 'ITF requires even number of digits'; break;
        case 8: if (data.length < 2 || data.length > 255) error = 'CODE128: 2-255 characters required'; break;
      }
      
      if (error) {
        errorDiv.textContent = error;
        errorDiv.classList.add('show');
        return false;
      } else {
        errorDiv.classList.remove('show');
        return true;
      }
    };
    
    root.getElementById('barcode-data').addEventListener('input', validateBarcode);
    root.getElementById('barcode-type').addEventListener('change', validateBarcode);
    
    root.getElementById('print-barcode-btn').addEventListener('click', () => {
      const data = root.getElementById('barcode-data').value.trim();
      if (!data) {
        alert('Please enter barcode data');
        return;
      }
      
      if (!validateBarcode()) {
        alert('Please fix barcode validation errors');
        return;
      }
      
      this.addToQueue('print_barcode', {
        barcode_type: parseInt(root.getElementById('barcode-type').value),
        barcode_data: data
      });
      
      root.getElementById('barcode-data').value = '';
    });
  }

  // Enhanced queue management
  addToQueue(service, data) {
    this.currentPrintQueue.push({ service, data, timestamp: Date.now() });
    this.updateQueueStatus();
    
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.currentPrintQueue.length === 0) {
      this.isProcessingQueue = false;
      this.updateQueueStatus();
      return;
    }

    this.isProcessingQueue = true;
    this.updateQueueStatus();

    while (this.currentPrintQueue.length > 0) {
      const job = this.currentPrintQueue.shift();
      
      try {
        await this.callServiceAsync(job.service, job.data);
        // Add delay between print jobs for printer stability
        await this.delay(500);
      } catch (error) {
        console.error('Print job failed:', error);
        // Continue with next job rather than stopping the entire queue
      }
      
      this.updateQueueStatus();
    }

    this.isProcessingQueue = false;
    this.updateQueueStatus();
  }

  clearQueue() {
    this.currentPrintQueue = [];
    this.updateQueueStatus();
  }

  updateQueueStatus() {
    const queueIndicator = this.shadowRoot.getElementById('queue-indicator');
    const queueStatus = this.shadowRoot.getElementById('queue-status');
    const statusDot = this.shadowRoot.getElementById('status-dot');
    
    if (this.isProcessingQueue && this.currentPrintQueue.length > 0) {
      queueIndicator.classList.add('active');
      queueStatus.classList.add('active');
      queueStatus.textContent = `Queue: ${this.currentPrintQueue.length} jobs pending`;
      statusDot.className = 'status-dot printing';
    } else if (this.currentPrintQueue.length > 0) {
      queueIndicator.classList.remove('active');
      queueStatus.classList.add('active');
      queueStatus.textContent = `Queue: ${this.currentPrintQueue.length} jobs queued`;
      statusDot.className = 'status-dot warning';
    } else {
      queueIndicator.classList.remove('active');
      queueStatus.classList.remove('active');
      statusDot.className = 'status-dot';
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  callService(service, data = {}) {
    if (!this._hass) {
      console.error('Home Assistant not available');
      return;
    }
    
    const serviceName = `${this.entityBase}_${service}`;
    console.log(`Calling service: esphome.${serviceName}`, data);
    
    try {
      this._hass.callService('esphome', serviceName, data);
    } catch (error) {
      console.error('Service call failed:', error);
      alert(`Service call failed: ${error.message}`);
    }
  }

  async callServiceAsync(service, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this._hass) {
        reject(new Error('Home Assistant not available'));
        return;
      }
      
      const serviceName = `${this.entityBase}_${service}`;
      console.log(`Calling async service: esphome.${serviceName}`, data);
      
      try {
        this._hass.callService('esphome', serviceName, data).then(resolve).catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  set hass(hass) {
    this._hass = hass;
    
    if (!this._config || !this._config.entity) return;

    const root = this.shadowRoot;
    
    // Update printer status
    const entity = hass.states[this._config.entity];
    const statusText = root.getElementById('status-text');
    const statusDot = root.getElementById('status-dot');
    
    if (entity) {
      const isOnline = entity.state === 'on';
      statusText.textContent = isOnline ? 'Printer Ready' : 'Printer Offline';
      
      if (!this.isProcessingQueue) {
        statusDot.className = isOnline ? 'status-dot' : 'status-dot offline';
      }
    }

    // Update paper status
    const paperEntity = hass.states[`binary_sensor.${this.entityBase}_paper_loaded`];
    if (paperEntity && paperEntity.state === 'off') {
      statusText.textContent = 'Paper Out';
      statusDot.className = 'status-dot error';
    }

    // Update usage sensors
    this.updateUsageSensors(hass);
  }

  updateUsageSensors(hass) {
    const root = this.shadowRoot;
    
    // Paper usage percentage
    const usagePercentEntity = hass.states[`sensor.${this.entityBase}_paper_usage_percent`];
    if (usagePercentEntity) {
      const percentage = parseFloat(usagePercentEntity.state) || 0;
      const usageFill = root.getElementById('usage-fill');
      const usageText = root.getElementById('usage-text');
      
      if (usageFill) usageFill.style.width = Math.min(percentage, 100) + '%';
      if (usageText) usageText.textContent = percentage.toFixed(1) + '%';
    }

    // Paper usage in mm
    const usageMmEntity = hass.states[`sensor.${this.entityBase}_paper_usage_mm`];
    if (usageMmEntity) {
      const usageMm = root.getElementById('usage-mm');
      if (usageMm) usageMm.textContent = parseFloat(usageMmEntity.state).toFixed(1);
    }

    // Lines printed
    const linesEntity = hass.states[`sensor.${this.entityBase}_lines_printed`];
    if (linesEntity) {
      const linesPrinted = root.getElementById('lines-printed');
      if (linesPrinted) linesPrinted.textContent = linesEntity.state;
    }

    // Characters printed
    const charsEntity = hass.states[`sensor.${this.entityBase}_characters_printed`];
    if (charsEntity) {
      const charsPrinted = root.getElementById('chars-printed');
      if (charsPrinted) charsPrinted.textContent = charsEntity.state;
    }
  }

  getCardSize() {
    return 8;
  }
}

// Register the custom element
customElements.define('thermal-printer-card', ThermalPrinterCard);

// Add to custom cards registry
if (!window.customCards) {
  window.customCards = [];
}

window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Enhanced Thermal Printer Card',
  description: 'Complete thermal printer control with queue management and enhanced features',
  preview: true,
  documentationURL: 'https://github.com/yourusername/thermal-printer-card'
});

console.log('Enhanced Thermal Printer Card with Queue Management loaded successfully!');
