class ThermalPrinterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.previewLines = [];
    this.previewWidth = 32; // Default character width
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
          animation: pulse 2s infinite;
        }
        .status-dot.error {
          background: var(--error-color);
        }
        .status-dot.warning {
          background: var(--warning-color);
        }
        .status-dot.offline {
          background: var(--disabled-text-color);
          animation: none;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
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
          position: relative;
        }
        .usage-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--success-color), var(--warning-color), var(--error-color));
          transition: width 0.3s ease;
          border-radius: 10px;
        }
        .usage-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--primary-text-color);
          font-size: 0.8em;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
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
          position: relative;
          overflow: hidden;
        }
        .control-button:hover {
          background: var(--primary-color);
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .control-button:active {
          transform: translateY(0);
        }
        .control-button:disabled {
          background: var(--disabled-text-color);
          cursor: not-allowed;
          transform: none;
        }
        .control-button.secondary {
          background: var(--accent-color);
        }
        .control-button.danger {
          background: var(--error-color);
        }
        .control-button.success {
          background: var(--success-color);
        }
        .control-button.loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .text-input-section {
          margin: 16px 0;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: var(--card-background-color);
        }
        .text-input {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          resize: vertical;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          margin: 8px 0;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          transition: border-color 0.2s ease;
        }
        .text-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
        }
        .format-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
          margin: 12px 0;
        }
        .format-select {
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }
        .format-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          background: var(--secondary-background-color);
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .format-checkbox:hover {
          background: var(--divider-color);
        }
        .format-checkbox input {
          margin: 0;
        }
        .two-column-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 12px 0;
        }
        .column-input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-family: 'Courier New', monospace;
        }
        .section-header {
          font-weight: bold;
          font-size: 16px;
          margin: 16px 0 8px 0;
          color: var(--primary-text-color);
          display: flex;
          align-items: center;
          gap: 8px;
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
          padding: 12px;
          background: var(--divider-color);
          border-radius: 8px;
          margin: 8px 0;
          transition: all 0.2s ease;
        }
        .collapsible:hover {
          background: var(--secondary-color);
        }
        .collapsible-content {
          display: none;
          margin-top: 8px;
          animation: slideDown 0.3s ease;
        }
        .collapsible.active + .collapsible-content {
          display: block;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Print Preview Styles */
        .preview-section {
          margin: 16px 0;
          padding: 12px;
          background: var(--card-background-color);
          border: 2px solid var(--primary-color);
          border-radius: 8px;
        }
        .preview-paper {
          background: white;
          color: black;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.2;
          padding: 16px;
          margin: 12px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
          white-space: pre-wrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .preview-controls {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 8px 0;
        }
        .preview-stats {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin: 8px 0;
          padding: 8px;
          background: var(--secondary-background-color);
          border-radius: 4px;
        }
        
        /* QR Code Section */
        .qr-section {
          margin: 12px 0;
          padding: 12px;
          background: var(--secondary-background-color);
          border-radius: 8px;
        }
        .qr-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 12px 0;
          padding: 12px;
          background: white;
          border-radius: 4px;
        }
        .qr-placeholder {
          width: 80px;
          height: 80px;
          background: #000;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          text-align: center;
          border-radius: 4px;
        }
        
        /* 90 Degree Rotation Preview */
        .rotation-preview {
          margin: 12px 0;
        }
        .rotated-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          background: white;
          color: black;
          padding: 16px 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          max-height: 300px;
          overflow: hidden;
        }
        
        /* Error Handling */
        .error-message {
          background: var(--error-color);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          margin: 8px 0;
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        /* Paper Usage Warning */
        .paper-warning {
          background: var(--warning-color);
          color: var(--text-primary-color);
          padding: 8px 12px;
          border-radius: 6px;
          margin: 8px 0;
          font-size: 14px;
        }
        .paper-critical {
          background: var(--error-color);
          color: white;
        }
      </style>

      <div class="printer-status">
        <div class="status-indicator">
          <div class="status-dot" id="status-dot"></div>
          <span id="status-text">Printer Ready</span>
        </div>
        <div>
          <button class="control-button secondary" id="refresh-status" style="padding: 6px 12px; min-width: auto;">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div class="usage-section">
        <div class="section-header">📄 Paper Usage</div>
        <div class="usage-bar">
          <div class="usage-fill" id="usage-fill" style="width: 0%"></div>
          <div class="usage-text" id="usage-text">0%</div>
        </div>
        <div class="usage-stats">
          <div>Used: <span id="usage-mm">0</span> mm</div>
          <div>Percentage: <span id="usage-percent">0</span>%</div>
          <div>Lines: <span id="lines-printed">0</span></div>
          <div>Characters: <span id="chars-printed">0</span></div>
        </div>
        <div id="paper-warning" class="paper-warning" style="display: none;">
          ⚠️ Paper usage is above 80%. Consider replacing soon.
        </div>
      </div>

      <div class="control-section">
        <div class="section-header">⚡ Quick Actions</div>
        <div class="control-row">
          <button class="control-button" id="test-print">🖨️ Test Print</button>
          <button class="control-button secondary" id="wake-printer">⚡ Wake</button>
          <button class="control-button secondary" id="sleep-printer">😴 Sleep</button>
        </div>
        <div class="control-row">
          <button class="control-button" id="feed-paper">📄 Feed Paper</button>
          <button class="control-button" id="print-separator">➖ Separator</button>
          <button class="control-button danger" id="reset-usage">🔄 Reset Usage</button>
        </div>
      </div>

      <!-- Print Preview Section -->
      <div class="preview-section">
        <div class="section-header">👁️ Print Preview</div>
        <div class="preview-paper" id="preview-paper">
          Preview will appear here when you enter text or configure printing options...
        </div>
        <div class="preview-stats" id="preview-stats">
          Estimated: 0 lines, 0 characters, 0.0mm paper
        </div>
        <div class="preview-controls">
          <button class="control-button secondary" id="clear-preview">Clear Preview</button>
          <button class="control-button success" id="print-preview">🖨️ Print Preview</button>
        </div>
      </div>

      <div class="text-input-section">
        <div class="collapsible" id="text-toggle">
          <span class="section-header">📝 Text Printing</span>
          <span>▼</span>
        </div>
        <div class="collapsible-content" id="text-content">
          <textarea class="text-input" id="text-input" placeholder="Enter text to print..."></textarea>
          <div class="format-controls">
            <select class="format-select" id="text-size">
              <option value="S">Small (32 chars)</option>
              <option value="M" selected>Medium (24 chars)</option>
              <option value="L">Large (16 chars)</option>
            </select>
            <select class="format-select" id="text-justify">
              <option value="L" selected>← Left</option>
              <option value="C">⚬ Center</option>
              <option value="R">→ Right</option>
            </select>
            <label class="format-checkbox"><input type="checkbox" id="text-bold"> <strong>Bold</strong></label>
            <label class="format-checkbox"><input type="checkbox" id="text-underline"> <u>Underline</u></label>
            <label class="format-checkbox"><input type="checkbox" id="text-inverse"> ⬛ Inverse</label>
            <label class="format-checkbox"><input type="checkbox" id="text-rotate"> 🔄 90° Rotate</label>
          </div>
          <button class="control-button" id="print-text">🖨️ Print Text</button>
          <div class="rotation-preview" id="rotation-preview" style="display: none;">
            <div class="section-header">90° Rotation Preview:</div>
            <div class="rotated-text" id="rotated-preview"></div>
          </div>
        </div>
      </div>

      <div class="text-input-section">
        <div class="collapsible" id="column-toggle">
          <span class="section-header">📊 Two-Column Printing</span>
          <span>▼</span>
        </div>
        <div class="collapsible-content" id="column-content">
          <div class="two-column-section">
            <input class="column-input" id="left-column" placeholder="Left column text">
            <input class="column-input" id="right-column" placeholder="Right column text">
          </div>
          <div class="format-controls">
            <select class="format-select" id="column-text-size">
              <option value="S">Small</option>
              <option value="M" selected>Medium</option>
              <option value="L">Large</option>
            </select>
            <label class="format-checkbox"><input type="checkbox" id="fill-dots" checked> ⋯ Fill with dots</label>
          </div>
          <button class="control-button" id="print-columns">🖨️ Print Two Columns</button>
        </div>
      </div>

      <div class="barcode-section">
        <div class="collapsible" id="barcode-toggle">
          <span class="section-header">📱 Barcode Printing</span>
          <span>▼</span>
        </div>
        <div class="collapsible-content" id="barcode-content">
          <select class="format-select" id="barcode-type" style="width: 100%; margin: 8px 0;">
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
          <input class="column-input" id="barcode-data" placeholder="Barcode data" style="width: 100%; margin: 8px 0;">
          <div id="barcode-error" class="error-message" style="display: none;"></div>
          <button class="control-button" id="print-barcode">🖨️ Print Barcode</button>
        </div>
      </div>

      <div class="qr-section">
        <div class="collapsible" id="qr-toggle">
          <span class="section-header">📱 QR Code Printing</span>
          <span>▼</span>
        </div>
        <div class="collapsible-content" id="qr-content">
          <input class="column-input" id="qr-data" placeholder="QR code data (URL, text, etc.)" style="width: 100%; margin: 8px 0;">
          <div class="format-controls">
            <select class="format-select" id="qr-size">
              <option value="1">Small</option>
              <option value="2">Medium</option>
              <option value="3" selected>Large</option>
              <option value="4">Extra Large</option>
            </select>
            <select class="format-select" id="qr-error-correction">
              <option value="0">Low (7%)</option>
              <option value="1" selected>Medium (15%)</option>
              <option value="2">Quartile (25%)</option>
              <option value="3">High (30%)</option>
            </select>
          </div>
          <input class="column-input" id="qr-label" placeholder="Optional label text" style="width: 100%; margin: 8px 0;">
          <div class="qr-preview" id="qr-preview" style="display: none;">
            <div class="qr-placeholder">QR<br>CODE</div>
            <div>
              <strong>Preview:</strong><br>
              <span id="qr-preview-text"></span>
            </div>
          </div>
          <button class="control-button" id="print-qr">🖨️ Print QR Code</button>
        </div>
      </div>
    `;

    card.appendChild(content);
    root.appendChild(card);

    this._config = cardConfig;
    this.setupEventListeners();
    this.setupCollapsibles();
    this.setupPreview();
  }

  setupEventListeners() {
    const shadowRoot = this.shadowRoot;

    // Quick action buttons
    shadowRoot.getElementById('test-print').onclick = () => this.callServiceWithLoading('test_print', 'test-print');
    shadowRoot.getElementById('wake-printer').onclick = () => this.callServiceWithLoading('wake_printer', 'wake-printer');
    shadowRoot.getElementById('sleep-printer').onclick = () => this.callServiceWithLoading('sleep_printer', 'sleep-printer');
    shadowRoot.getElementById('reset-usage').onclick = () => this.confirmAction(() => this.callService('reset_paper_usage'));
    shadowRoot.getElementById('feed-paper').onclick = () => this.callServiceWithLoading('feed_paper', 'feed-paper', { lines: 3 });
    shadowRoot.getElementById('print-separator').onclick = () => this.printSeparator();
    shadowRoot.getElementById('refresh-status').onclick = () => this.refreshStatus();

    // Text printing
    shadowRoot.getElementById('print-text').onclick = () => this.printText();
    shadowRoot.getElementById('text-input').oninput = () => this.updatePreview();
    shadowRoot.getElementById('text-size').onchange = () => this.updatePreview();
    shadowRoot.getElementById('text-justify').onchange = () => this.updatePreview();
    shadowRoot.getElementById('text-bold').onchange = () => this.updatePreview();
    shadowRoot.getElementById('text-underline').onchange = () => this.updatePreview();
    shadowRoot.getElementById('text-inverse').onchange = () => this.updatePreview();
    shadowRoot.getElementById('text-rotate').onchange = () => {
      this.toggleRotationPreview();
      // Also update the main preview
      this.updatePreview();
    };

    // Two-column printing
    shadowRoot.getElementById('print-columns').onclick = () => this.printTwoColumn();
    shadowRoot.getElementById('left-column').oninput = () => this.updateColumnPreview();
    shadowRoot.getElementById('right-column').oninput = () => this.updateColumnPreview();
    shadowRoot.getElementById('fill-dots').onchange = () => this.updateColumnPreview();
    shadowRoot.getElementById('column-text-size').onchange = () => this.updateColumnPreview();

    // Barcode printing
    shadowRoot.getElementById('print-barcode').onclick = () => this.printBarcode();
    shadowRoot.getElementById('barcode-data').oninput = () => this.validateBarcode();
    shadowRoot.getElementById('barcode-type').onchange = () => this.validateBarcode();

    // QR Code printing
    shadowRoot.getElementById('print-qr').onclick = () => this.printQRCode();
    shadowRoot.getElementById('qr-data').oninput = () => this.updateQRPreview();
    shadowRoot.getElementById('qr-label').oninput = () => this.updateQRPreview();

    // Preview controls
    shadowRoot.getElementById('clear-preview').onclick = () => this.clearPreview();
    shadowRoot.getElementById('print-preview').onclick = () => this.printPreviewContent();
  }

  setupCollapsibles() {
    const shadowRoot = this.shadowRoot;
    const collapsibles = ['text-toggle', 'column-toggle', 'barcode-toggle', 'qr-toggle'];

    collapsibles.forEach(id => {
      const toggle = shadowRoot.getElementById(id);
      toggle.onclick = () => {
        toggle.classList.toggle('active');
        const arrow = toggle.querySelector('span:last-child');
        arrow.textContent = toggle.classList.contains('active') ? '▲' : '▼';
      };
    });
  }

  setupPreview() {
    this.updatePreview();
  }

  updatePreview() {
    const shadowRoot = this.shadowRoot;
    const text = shadowRoot.getElementById('text-input').value;
    const size = shadowRoot.getElementById('text-size').value;
    const justify = shadowRoot.getElementById('text-justify').value;
    const bold = shadowRoot.getElementById('text-bold').checked;
    const underline = shadowRoot.getElementById('text-underline').checked;
    const inverse = shadowRoot.getElementById('text-inverse').checked;
    const rotate = shadowRoot.getElementById('text-rotate').checked;

    if (!text.trim()) {
      this.clearPreview();
      return;
    }

    // Calculate character width based on size
    const widths = { 'S': 32, 'M': 24, 'L': 16 };
    this.previewWidth = widths[size];

    let previewText;
    
    if (rotate) {
      // Show vertical preview for rotation
      previewText = this.formatVerticalPreview(text);
    } else {
      previewText = this.formatTextForPreview(text, justify, this.previewWidth);
    }

    const previewPaper = shadowRoot.getElementById('preview-paper');
    
    // Apply accurate font styling
    let fontSize = '12px';
    let fontWeight = 'normal';
    let textDecoration = 'none';
    let backgroundColor = 'white';
    let color = 'black';
    
    if (size === 'L') {
      fontSize = '18px';
      fontWeight = 'bold';
    } else if (size === 'M') {
      fontSize = '15px';
      fontWeight = '500';
    }
    
    if (bold) fontWeight = 'bold';
    if (underline) textDecoration = 'underline';
    if (inverse) {
      backgroundColor = 'black';
      color = 'white';
    }
    
    // Apply styles to preview
    previewPaper.style.fontSize = fontSize;
    previewPaper.style.fontWeight = fontWeight;
    previewPaper.style.textDecoration = textDecoration;
    previewPaper.style.backgroundColor = backgroundColor;
    previewPaper.style.color = color;
    previewPaper.style.padding = '12px';
    
    // Set text alignment
    if (justify === 'C') {
      previewPaper.style.textAlign = 'center';
    } else if (justify === 'R') {
      previewPaper.style.textAlign = 'right';
    } else {
      previewPaper.style.textAlign = 'left';
    }
    
    previewPaper.textContent = previewText;

    this.updatePreviewStats(previewText);
  }

  formatVerticalPreview(text) {
    // Create vertical text preview
    let verticalText = '';
    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ') {
        verticalText += '·\n'; // Visual space indicator
      } else if (text[i] === '\n') {
        verticalText += '\n\n'; // Extra line for paragraph breaks
      } else {
        verticalText += text[i] + '\n';
      }
    }
    return verticalText;
  }

  updateColumnPreview() {
    const shadowRoot = this.shadowRoot;
    const leftText = shadowRoot.getElementById('left-column').value;
    const rightText = shadowRoot.getElementById('right-column').value;
    const fillDots = shadowRoot.getElementById('fill-dots').checked;
    const size = shadowRoot.getElementById('column-text-size').value;

    if (!leftText.trim() && !rightText.trim()) {
      this.clearPreview();
      return;
    }

    const widths = { 'S': 32, 'M': 24, 'L': 16 };
    const lineWidth = widths[size];
    
    const previewText = this.formatTwoColumnPreview(leftText, rightText, lineWidth, fillDots);
    const previewPaper = shadowRoot.getElementById('preview-paper');
    const fontSize = size === 'L' ? '16px' : size === 'M' ? '14px' : '12px';
    previewPaper.style.fontSize = fontSize;
    previewPaper.textContent = previewText;

    this.updatePreviewStats(previewText);
  }

  toggleRotationPreview() {
    const shadowRoot = this.shadowRoot;
    const rotateEnabled = shadowRoot.getElementById('text-rotate').checked;
    const rotationPreview = shadowRoot.getElementById('rotation-preview');
    const rotatedPreview = shadowRoot.getElementById('rotated-preview');

    if (rotateEnabled) {
      const text = shadowRoot.getElementById('text-input').value;
      
      // Create vertical preview text
      let verticalText = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          verticalText += '·\n'; // Visual space indicator
        } else if (text[i] === '\n') {
          verticalText += '\n\n'; // Extra space for line breaks
        } else {
          verticalText += text[i] + '\n';
        }
      }
      
      rotatedPreview.textContent = verticalText;
      rotatedPreview.style.textAlign = 'center';
      rotatedPreview.style.lineHeight = '1.2';
      rotatedPreview.style.letterSpacing = '2px';
      rotationPreview.style.display = 'block';
      
      // Update the main preview too
      this.updatePreview();
    } else {
      rotationPreview.style.display = 'none';
      // Update preview without rotation
      this.updatePreview();
    }
  }

  updateQRPreview() {
    const shadowRoot = this.shadowRoot;
    const qrData = shadowRoot.getElementById('qr-data').value;
    const qrLabel = shadowRoot.getElementById('qr-label').value;
    const qrPreview = shadowRoot.getElementById('qr-preview');
    const qrPreviewText = shadowRoot.getElementById('qr-preview-text');

    if (qrData.trim()) {
      let previewText = qrData;
      if (qrLabel.trim()) previewText = qrLabel + '\n' + qrData;
      qrPreviewText.textContent = previewText;
      qrPreview.style.display = 'flex';
    } else {
      qrPreview.style.display = 'none';
    }
  }

  validateBarcode() {
    const shadowRoot = this.shadowRoot;
    const barcodeType = parseInt(shadowRoot.getElementById('barcode-type').value);
    const barcodeData = shadowRoot.getElementById('barcode-data').value;
    const errorDiv = shadowRoot.getElementById('barcode-error');

    let error = null;

    if (!barcodeData.trim()) {
      errorDiv.style.display = 'none';
      return;
    }

    // Validation rules for different barcode types
    switch (barcodeType) {
      case 0: // UPC-A
        if (!/^\d{11,12}$/.test(barcodeData)) error = 'UPC-A requires 11-12 digits';
        break;
      case 1: // UPC-E
        if (!/^\d{6,8}$/.test(barcodeData)) error = 'UPC-E requires 6-8 digits';
        break;
      case 2: // EAN13
        if (!/^\d{12,13}$/.test(barcodeData)) error = 'EAN13 requires 12-13 digits';
        break;
      case 3: // EAN8
        if (!/^\d{7,8}$/.test(barcodeData)) error = 'EAN8 requires 7-8 digits';
        break;
      case 4: // CODE39
        if (!/^[0-9A-Z\-\.\s\$\/\+\%]+$/.test(barcodeData)) error = 'CODE39: Invalid characters';
        break;
      case 5: // ITF
        if (!/^\d+$/.test(barcodeData) || barcodeData.length % 2 !== 0) error = 'ITF requires even number of digits';
        break;
      case 8: // CODE128
        if (barcodeData.length < 2 || barcodeData.length > 255) error = 'CODE128: 2-255 characters required';
        break;
    }

    if (error) {
      errorDiv.textContent = error;
      errorDiv.style.display = 'block';
    } else {
      errorDiv.style.display = 'none';
    }
  }

  formatTextForPreview(text, justify, width) {
    const lines = text.split('\n');
    let formattedLines = [];

    lines.forEach(line => {
      if (line.length <= width) {
        formattedLines.push(this.justifyLine(line, justify, width));
      } else {
        // Word wrap
        const words = line.split(' ');
        let currentLine = '';
        
        words.forEach(word => {
          if ((currentLine + word).length <= width) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) {
              formattedLines.push(this.justifyLine(currentLine, justify, width));
              currentLine = word;
            } else {
              // Word is longer than line width, truncate
              formattedLines.push(this.justifyLine(word.substring(0, width), justify, width));
            }
          }
        });
        
        if (currentLine) {
          formattedLines.push(this.justifyLine(currentLine, justify, width));
        }
      }
    });

    return formattedLines.join('\n');
  }

  justifyLine(line, justify, width) {
    if (justify === 'C') {
      const padding = Math.max(0, width - line.length);
      const leftPad = Math.floor(padding / 2);
      return ' '.repeat(leftPad) + line;
    } else if (justify === 'R') {
      const padding = Math.max(0, width - line.length);
      return ' '.repeat(padding) + line;
    }
    return line; // Left justify (default)
  }

  formatTwoColumnPreview(leftText, rightText, width, fillDots) {
    const maxLeftWidth = Math.floor(width * 0.6);
    const maxRightWidth = width - maxLeftWidth - 1;
    
    let leftTruncated = leftText.substring(0, maxLeftWidth);
    let rightTruncated = rightText.substring(0, maxRightWidth);
    
    const padding = width - leftTruncated.length - rightTruncated.length;
    const fillChar = fillDots ? '.' : ' ';
    
    return leftTruncated + fillChar.repeat(Math.max(1, padding)) + rightTruncated;
  }

  wrapText(text, startTag, endTag) {
    return startTag + text + endTag;
  }

  updatePreviewStats(text) {
    const shadowRoot = this.shadowRoot;
    const lines = text.split('\n').length;
    const characters = text.length;
    const estimatedMM = (lines * 4.0).toFixed(1); // 4mm per line estimate
    
    shadowRoot.getElementById('preview-stats').textContent = 
      `Estimated: ${lines} lines, ${characters} characters, ${estimatedMM}mm paper`;
  }

  clearPreview() {
    const shadowRoot = this.shadowRoot;
    shadowRoot.getElementById('preview-paper').textContent = 
      'Preview will appear here when you enter text or configure printing options...';
    shadowRoot.getElementById('preview-stats').textContent = 
      'Estimated: 0 lines, 0 characters, 0.0mm paper';
  }

  printPreviewContent() {
    const shadowRoot = this.shadowRoot;
    const previewContent = shadowRoot.getElementById('preview-paper').textContent;
    
    if (previewContent === 'Preview will appear here when you enter text or configure printing options...') {
      this.showError('No preview content to print');
      return;
    }

    // Determine which section has content and print accordingly
    const textInput = shadowRoot.getElementById('text-input').value;
    const leftColumn = shadowRoot.getElementById('left-column').value;
    const rightColumn = shadowRoot.getElementById('right-column').value;

    if (textInput.trim()) {
      this.printText();
    } else if (leftColumn.trim() || rightColumn.trim()) {
      this.printTwoColumn();
    }
  }

  printText() {
    const shadowRoot = this.shadowRoot;
    const text = shadowRoot.getElementById('text-input').value;
    if (!text.trim()) {
      this.showError('Please enter some text to print');
      return;
    }

    const data = {
      message: text,
      text_size: shadowRoot.getElementById('text-size').value,
      alignment: shadowRoot.getElementById('text-justify').value,
      bold: shadowRoot.getElementById('text-bold').checked,
      underline: shadowRoot.getElementById('text-underline').checked,
      inverse: shadowRoot.getElementById('text-inverse').checked
    };

    // Check if rotation is enabled
    const rotateEnabled = shadowRoot.getElementById('text-rotate').checked;
    if (rotateEnabled) {
      this.callServiceWithLoading('print_rotated_text', 'print-text', {
        message: text,
        rotation: 1 // 90 degrees
      });
    } else {
      this.callServiceWithLoading('print_text', 'print-text', data);
    }
  }

  printTwoColumn() {
    const shadowRoot = this.shadowRoot;
    const leftText = shadowRoot.getElementById('left-column').value;
    const rightText = shadowRoot.getElementById('right-column').value;

    if (!leftText.trim() && !rightText.trim()) {
      this.showError('Please enter text for at least one column');
      return;
    }

    const data = {
      left_text: leftText,
      right_text: rightText,
      fill_dots: shadowRoot.getElementById('fill-dots').checked,
      text_size: shadowRoot.getElementById('column-text-size').value
    };

    this.callServiceWithLoading('print_two_column', 'print-columns', data);
  }

  printBarcode() {
    const shadowRoot = this.shadowRoot;
    const barcodeData = shadowRoot.getElementById('barcode-data').value;
    if (!barcodeData.trim()) {
      this.showError('Please enter barcode data');
      return;
    }

    // Check if there are validation errors
    const errorDiv = shadowRoot.getElementById('barcode-error');
    if (errorDiv.style.display !== 'none') {
      this.showError('Please fix barcode validation errors');
      return;
    }

    const data = {
      barcode_type: parseInt(shadowRoot.getElementById('barcode-type').value),
      barcode_data: barcodeData
    };

    this.callServiceWithLoading('print_barcode', 'print-barcode', data);
  }

  printQRCode() {
    const shadowRoot = this.shadowRoot;
    const qrData = shadowRoot.getElementById('qr-data').value;
    if (!qrData.trim()) {
      this.showError('Please enter QR code data');
      return;
    }

    const data = {
      data: qrData,
      size: parseInt(shadowRoot.getElementById('qr-size').value),
      error_correction: parseInt(shadowRoot.getElementById('qr-error-correction').value),
      label: shadowRoot.getElementById('qr-label').value
    };

    this.callServiceWithLoading('print_qr_code', 'print-qr', data);
  }

  printSeparator() {
    const data = {
      message: '================================',
      text_size: 'S',
      alignment: 'C',
      bold: false,
      underline: false,
      inverse: false
    };
    this.callServiceWithLoading('print_text', 'print-separator', data);
  }

  confirmAction(action) {
    if (confirm('Are you sure you want to perform this action?')) {
      action();
    }
  }

  callServiceWithLoading(service, buttonId, data = {}) {
    const shadowRoot = this.shadowRoot;
    const button = shadowRoot.getElementById(buttonId);
    
    // Add loading state
    button.classList.add('loading');
    button.disabled = true;
    const originalText = button.textContent;
    
    // Call service
    this.callService(service, data);
    
    // Remove loading state after delay
    setTimeout(() => {
      button.classList.remove('loading');
      button.disabled = false;
    }, 1500);
  }

  callService(service, data = {}) {
    try {
      // Extract device name from entity (remove the switch and printer_wake parts)
      let deviceName = this._config.entity.split('.')[1];
      // Handle common entity naming patterns
      if (deviceName.endsWith('_printer_wake')) {
        deviceName = deviceName.replace('_printer_wake', '');
      } else if (deviceName.endsWith('_wake')) {
        deviceName = deviceName.replace('_wake', '');
      }
      
      const serviceName = `${deviceName}_${service}`;
      ESP_LOGD("thermal_printer_card", `Calling service: esphome.${serviceName}`);
      
      this._hass.callService('esphome', serviceName, data);
    } catch (error) {
      this.showError(`Failed to call service: ${error.message}`);
      console.error('Service call error:', error);
    }
  }

  showError(message) {
    // Create temporary error message
    const shadowRoot = this.shadowRoot;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert after printer status
    const statusDiv = shadowRoot.querySelector('.printer-status');
    statusDiv.parentNode.insertBefore(errorDiv, statusDiv.nextSibling);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 3000);
  }

  refreshStatus() {
    // Trigger a status refresh by calling a harmless service
    this.callService('wake_printer');
  }

  checkPaperUsage(percentage) {
    const shadowRoot = this.shadowRoot;
    const warningDiv = shadowRoot.getElementById('paper-warning');
    
    if (percentage >= 95) {
      warningDiv.textContent = '🔴 Critical: Paper usage above 95%. Replace immediately!';
      warningDiv.className = 'paper-warning paper-critical';
      warningDiv.style.display = 'block';
    } else if (percentage >= 80) {
      warningDiv.textContent = '⚠️ Warning: Paper usage above 80%. Consider replacing soon.';
      warningDiv.className = 'paper-warning';
      warningDiv.style.display = 'block';
    } else {
      warningDiv.style.display = 'none';
    }
  }

  set hass(hass) {
    this._hass = hass;
    
    const entity = hass.states[this._config.entity];
    if (!entity) return;

    this.updateStatus(hass);
  }

  updateStatus(hass) {
    const shadowRoot = this.shadowRoot;
    
    // Update printer status
    const mainEntity = hass.states[this._config.entity];
    const paperEntity = hass.states[this._config.paper_sensor || 'binary_sensor.thermal_printer_paper_loaded'];
    const statusDot = shadowRoot.getElementById('status-dot');
    const statusText = shadowRoot.getElementById('status-text');
    
    if (!mainEntity) {
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'Offline';
    } else if (paperEntity && paperEntity.state === 'off') {
      statusDot.className = 'status-dot error';
      statusText.textContent = 'Paper Out';
    } else {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Ready';
    }

    // Update paper usage
    const usageEntity = hass.states[this._config.usage_sensor || 'sensor.thermal_printer_paper_usage_percent'];
    const usageMmEntity = hass.states[this._config.usage_mm_sensor || 'sensor.thermal_printer_paper_usage_mm'];
    const linesEntity = hass.states[this._config.lines_sensor || 'sensor.thermal_printer_lines_printed'];
    const charsEntity = hass.states[this._config.chars_sensor || 'sensor.thermal_printer_characters_printed'];

    if (usageEntity) {
      const usageFill = shadowRoot.getElementById('usage-fill');
      const usagePercent = shadowRoot.getElementById('usage-percent');
      const usageText = shadowRoot.getElementById('usage-text');
      const percentage = parseFloat(usageEntity.state) || 0;
      
      usageFill.style.width = `${Math.min(percentage, 100)}%`;
      usagePercent.textContent = percentage.toFixed(1);
      usageText.textContent = `${percentage.toFixed(1)}%`;
      
      // Check for paper usage warnings
      this.checkPaperUsage(percentage);
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
    return 8;
  }
}

customElements.define('thermal-printer-card', ThermalPrinterCard);

// Register the card with the card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Thermal Printer Card',
  description: 'A comprehensive card for controlling thermal printers with advanced features'
});
