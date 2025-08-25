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
    root.innerHTML = '';

    const card = document.createElement('ha-card');
    card.setAttribute('header', config.title || 'Thermal Printer');
    
    const content = document.createElement('div');
    content.style.padding = '16px';

    // Printer Status Section
    const statusDiv = document.createElement('div');
    statusDiv.style.display = 'flex';
    statusDiv.style.justifyContent = 'space-between';
    statusDiv.style.alignItems = 'center';
    statusDiv.style.marginBottom = '16px';
    statusDiv.style.padding = '12px';
    statusDiv.style.background = 'var(--primary-color)';
    statusDiv.style.color = 'var(--text-primary-color)';
    statusDiv.style.borderRadius = '8px';

    const statusIndicator = document.createElement('div');
    statusIndicator.style.display = 'flex';
    statusIndicator.style.alignItems = 'center';
    statusIndicator.style.gap = '8px';

    const statusDot = document.createElement('div');
    statusDot.id = 'status-dot';
    statusDot.style.width = '12px';
    statusDot.style.height = '12px';
    statusDot.style.borderRadius = '50%';
    statusDot.style.background = 'var(--success-color)';

    const statusText = document.createElement('span');
    statusText.id = 'status-text';
    statusText.innerHTML = 'Printer Ready';

    statusIndicator.appendChild(statusDot);
    statusIndicator.appendChild(statusText);

    const refreshBtn = document.createElement('button');
    refreshBtn.innerHTML = '🔄 Refresh';
    refreshBtn.style.padding = '6px 12px';
    refreshBtn.style.border = 'none';
    refreshBtn.style.borderRadius = '4px';
    refreshBtn.style.background = 'var(--accent-color)';
    refreshBtn.style.color = 'var(--text-primary-color)';
    refreshBtn.style.cursor = 'pointer';

    statusDiv.appendChild(statusIndicator);
    statusDiv.appendChild(refreshBtn);

    // Paper Usage Section
    const usageSection = document.createElement('div');
    usageSection.style.margin = '16px 0';
    usageSection.style.padding = '12px';
    usageSection.style.background = 'var(--card-background-color)';
    usageSection.style.border = '1px solid var(--divider-color)';
    usageSection.style.borderRadius = '8px';

    const usageTitle = document.createElement('div');
    usageTitle.innerHTML = '📄 Paper Usage';
    usageTitle.style.fontWeight = 'bold';
    usageTitle.style.marginBottom = '8px';

    const usageBar = document.createElement('div');
    usageBar.style.width = '100%';
    usageBar.style.height = '20px';
    usageBar.style.background = 'var(--disabled-text-color)';
    usageBar.style.borderRadius = '10px';
    usageBar.style.overflow = 'hidden';
    usageBar.style.margin = '8px 0';
    usageBar.style.position = 'relative';

    const usageFill = document.createElement('div');
    usageFill.id = 'usage-fill';
    usageFill.style.height = '100%';
    usageFill.style.background = 'linear-gradient(90deg, var(--success-color), var(--warning-color), var(--error-color))';
    usageFill.style.transition = 'width 0.3s ease';
    usageFill.style.width = '0%';

    const usageText = document.createElement('div');
    usageText.id = 'usage-text';
    usageText.style.position = 'absolute';
    usageText.style.top = '50%';
    usageText.style.left = '50%';
    usageText.style.transform = 'translate(-50%, -50%)';
    usageText.style.color = 'var(--primary-text-color)';
    usageText.style.fontSize = '12px';
    usageText.style.fontWeight = 'bold';
    usageText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
    usageText.innerHTML = '0%';

    usageBar.appendChild(usageFill);
    usageBar.appendChild(usageText);

    const usageStats = document.createElement('div');
    usageStats.style.display = 'grid';
    usageStats.style.gridTemplateColumns = '1fr 1fr';
    usageStats.style.gap = '8px';
    usageStats.style.fontSize = '14px';
    usageStats.style.color = 'var(--secondary-text-color)';
    usageStats.innerHTML = '<div>Used: <span id="usage-mm">0</span> mm</div><div>Lines: <span id="lines-printed">0</span></div>';

    usageSection.appendChild(usageTitle);
    usageSection.appendChild(usageBar);
    usageSection.appendChild(usageStats);

    // Quick Actions Section
    const actionsTitle = document.createElement('div');
    actionsTitle.innerHTML = '⚡ Quick Actions';
    actionsTitle.style.fontWeight = 'bold';
    actionsTitle.style.margin = '16px 0 8px 0';

    const actionsRow1 = document.createElement('div');
    actionsRow1.style.display = 'flex';
    actionsRow1.style.gap = '8px';
    actionsRow1.style.margin = '8px 0';
    actionsRow1.style.flexWrap = 'wrap';

    const testBtn = this.createButton('🖨️ Test Print', 'test_print');
    const wakeBtn = this.createButton('⚡ Wake', 'wake_printer');
    const sleepBtn = this.createButton('😴 Sleep', 'sleep_printer');

    actionsRow1.appendChild(testBtn);
    actionsRow1.appendChild(wakeBtn);
    actionsRow1.appendChild(sleepBtn);

    const actionsRow2 = document.createElement('div');
    actionsRow2.style.display = 'flex';
    actionsRow2.style.gap = '8px';
    actionsRow2.style.margin = '8px 0';
    actionsRow2.style.flexWrap = 'wrap';

    const feedBtn = this.createButton('📄 Feed Paper', function() { 
      this.callService('feed_paper', { lines: 3 });
    }.bind(this));
    const separatorBtn = this.createButton('➖ Separator', function() {
      this.callService('print_text', {
        message: '================================',
        text_size: 'S',
        alignment: 'C',
        bold: false,
        underline: false,
        inverse: false,
        rotation: 0
      });
    }.bind(this));
    const resetBtn = this.createButton('🔄 Reset Usage', function() {
      if (confirm('Reset paper usage counters?')) {
        this.callService('reset_paper_usage');
      }
    }.bind(this));

    actionsRow2.appendChild(feedBtn);
    actionsRow2.appendChild(separatorBtn);
    actionsRow2.appendChild(resetBtn);

    // Text Printing Section
    const textSection = this.createCollapsibleSection('📝 Text Printing');
    const textContent = textSection.content;

    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Enter text to print...';
    textInput.style.width = '100%';
    textInput.style.minHeight = '80px';
    textInput.style.padding = '12px';
    textInput.style.border = '1px solid var(--divider-color)';
    textInput.style.borderRadius = '8px';
    textInput.style.resize = 'vertical';
    textInput.style.fontFamily = 'Courier New, monospace';
    textInput.style.fontSize = '14px';
    textInput.style.margin = '8px 0';
    textInput.style.boxSizing = 'border-box';

    const formatControls = document.createElement('div');
    formatControls.style.display = 'grid';
    formatControls.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
    formatControls.style.gap = '8px';
    formatControls.style.margin = '12px 0';

    const sizeSelect = document.createElement('select');
    sizeSelect.style.padding = '8px';
    sizeSelect.style.border = '1px solid var(--divider-color)';
    sizeSelect.style.borderRadius = '6px';
    sizeSelect.style.background = 'var(--card-background-color)';
    this.addOptions(sizeSelect, [
      { value: 'S', text: 'Small' },
      { value: 'M', text: 'Medium', selected: true },
      { value: 'L', text: 'Large' }
    ]);

    const alignSelect = document.createElement('select');
    alignSelect.style.padding = '8px';
    alignSelect.style.border = '1px solid var(--divider-color)';
    alignSelect.style.borderRadius = '6px';
    alignSelect.style.background = 'var(--card-background-color)';
    this.addOptions(alignSelect, [
      { value: 'L', text: '← Left', selected: true },
      { value: 'C', text: '⚬ Center' },
      { value: 'R', text: '→ Right' }
    ]);

    const boldCheck = this.createCheckbox('Bold');
    const underlineCheck = this.createCheckbox('Underline');
    const inverseCheck = this.createCheckbox('Inverse');
    const rotateCheck = this.createCheckbox('90° Rotate');

    formatControls.appendChild(sizeSelect);
    formatControls.appendChild(alignSelect);
    formatControls.appendChild(boldCheck);
    formatControls.appendChild(underlineCheck);
    formatControls.appendChild(inverseCheck);
    formatControls.appendChild(rotateCheck);

    const printTextBtn = document.createElement('button');
    printTextBtn.innerHTML = '🖨️ Print Text';
    printTextBtn.className = 'control-button';
    this.styleButton(printTextBtn);

    const self = this;
    printTextBtn.addEventListener('click', function() {
      const text = textInput.value;
      if (!text.trim()) {
        alert('Please enter some text to print');
        return;
      }

      if (rotateCheck.checked) {
        self.callService('print_rotated_text', {
          message: text,
          rotation: 1,
          size: sizeSelect.value
        });
      } else {
        self.callService('print_text', {
          message: text,
          text_size: sizeSelect.value,
          alignment: alignSelect.value,
          bold: boldCheck.checked,
          underline: underlineCheck.checked,
          inverse: inverseCheck.checked,
          rotation: 0
        });
      }
    });

    textContent.appendChild(textInput);
    textContent.appendChild(formatControls);
    textContent.appendChild(printTextBtn);

    // Label Printing Section
    const labelSection = this.createCollapsibleSection('🏷️ Label Printing (Rotated + Vertical)');
    const labelContent = labelSection.content;

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'Enter label text...';
    labelInput.style.width = '100%';
    labelInput.style.padding = '10px';
    labelInput.style.border = '1px solid var(--divider-color)';
    labelInput.style.borderRadius = '6px';
    labelInput.style.background = 'var(--card-background-color)';
    labelInput.style.fontFamily = 'Courier New, monospace';
    labelInput.style.margin = '8px 0';
    labelInput.style.boxSizing = 'border-box';

    const labelControls = document.createElement('div');
    labelControls.style.display = 'grid';
    labelControls.style.gridTemplateColumns = '1fr 1fr';
    labelControls.style.gap = '8px';
    labelControls.style.margin = '8px 0';

    const labelSizeSelect = document.createElement('select');
    labelSizeSelect.style.padding = '8px';
    labelSizeSelect.style.border = '1px solid var(--divider-color)';
    labelSizeSelect.style.borderRadius = '6px';
    labelSizeSelect.style.background = 'var(--card-background-color)';
    this.addOptions(labelSizeSelect, [
      { value: 'S', text: 'Small Label' },
      { value: 'M', text: 'Medium Label', selected: true },
      { value: 'L', text: 'Large Label' },
      { value: 'XL', text: 'Extra Large' }
    ]);

    const spacingSelect = document.createElement('select');
    spacingSelect.style.padding = '8px';
    spacingSelect.style.border = '1px solid var(--divider-color)';
    spacingSelect.style.borderRadius = '6px';
    spacingSelect.style.background = 'var(--card-background-color)';
    this.addOptions(spacingSelect, [
      { value: '1', text: 'Normal Spacing', selected: true },
      { value: '2', text: 'Loose Spacing' },
      { value: '3', text: 'Extra Loose' }
    ]);

    labelControls.appendChild(labelSizeSelect);
    labelControls.appendChild(spacingSelect);

    const printLabelBtn = document.createElement('button');
    printLabelBtn.innerHTML = '🏷️ Print Label';
    printLabelBtn.style.background = 'var(--success-color)';
    this.styleButton(printLabelBtn);

    printLabelBtn.addEventListener('click', function() {
      const text = labelInput.value;
      if (!text.trim()) {
        alert('Please enter label text');
        return;
      }
      
      self.callService('print_label_text', {
        message: text,
        size: labelSizeSelect.value,
        spacing: parseInt(spacingSelect.value)
      });
    });

    const labelInfo = document.createElement('div');
    labelInfo.innerHTML = '💡 Prints rotated characters vertically down the roll - perfect for labels!';
    labelInfo.style.fontSize = '12px';
    labelInfo.style.color = 'var(--secondary-text-color)';
    labelInfo.style.margin = '8px 0';
    labelInfo.style.padding = '8px';
    labelInfo.style.background = 'var(--secondary-background-color)';
    labelInfo.style.borderRadius = '4px';

    labelContent.appendChild(labelInput);
    labelContent.appendChild(labelControls);
    labelContent.appendChild(printLabelBtn);
    labelContent.appendChild(labelInfo);

    // QR Code Section
    const qrSection = this.createCollapsibleSection('📱 QR Code Printing');
    const qrContent = qrSection.content;

    const qrInput = document.createElement('input');
    qrInput.type = 'text';
    qrInput.placeholder = 'QR code data (URL, text, etc.)';
    qrInput.style.width = '100%';
    qrInput.style.padding = '8px';
    qrInput.style.margin = '8px 0';
    qrInput.style.border = '1px solid var(--divider-color)';
    qrInput.style.borderRadius = '6px';
    qrInput.style.boxSizing = 'border-box';

    const qrLabelInput = document.createElement('input');
    qrLabelInput.type = 'text';
    qrLabelInput.placeholder = 'Optional label text';
    qrLabelInput.style.width = '100%';
    qrLabelInput.style.padding = '8px';
    qrLabelInput.style.margin = '8px 0';
    qrLabelInput.style.border = '1px solid var(--divider-color)';
    qrLabelInput.style.borderRadius = '6px';
    qrLabelInput.style.boxSizing = 'border-box';

    const qrControls = document.createElement('div');
    qrControls.style.display = 'grid';
    qrControls.style.gridTemplateColumns = '1fr 1fr';
    qrControls.style.gap = '8px';
    qrControls.style.margin = '8px 0';

    const qrSizeSelect = document.createElement('select');
    qrSizeSelect.style.padding = '6px';
    qrSizeSelect.style.border = '1px solid var(--divider-color)';
    qrSizeSelect.style.borderRadius = '6px';
    this.addOptions(qrSizeSelect, [
      { value: '1', text: 'Small' },
      { value: '2', text: 'Medium' },
      { value: '3', text: 'Large', selected: true },
      { value: '4', text: 'Extra Large' }
    ]);

    const qrErrorSelect = document.createElement('select');
    qrErrorSelect.style.padding = '6px';
    qrErrorSelect.style.border = '1px solid var(--divider-color)';
    qrErrorSelect.style.borderRadius = '6px';
    this.addOptions(qrErrorSelect, [
      { value: '0', text: 'Low (7%)' },
      { value: '1', text: 'Medium (15%)', selected: true },
      { value: '2', text: 'High (25%)' },
      { value: '3', text: 'Max (30%)' }
    ]);

    qrControls.appendChild(qrSizeSelect);
    qrControls.appendChild(qrErrorSelect);

    const printQrBtn = document.createElement('button');
    printQrBtn.innerHTML = '📱 Print QR Code';
    this.styleButton(printQrBtn);

    printQrBtn.addEventListener('click', function() {
      const data = qrInput.value;
      if (!data.trim()) {
        alert('Please enter QR code data');
        return;
      }
      
      self.callService('print_qr_code', {
        data: data,
        size: parseInt(qrSizeSelect.value),
        error_correction: parseInt(qrErrorSelect.value),
        label: qrLabelInput.value
      });
    });

    qrContent.appendChild(qrInput);
    qrContent.appendChild(qrLabelInput);
    qrContent.appendChild(qrControls);
    qrContent.appendChild(printQrBtn);

    // Assembly
    content.appendChild(statusDiv);
    content.appendChild(usageSection);
    content.appendChild(actionsTitle);
    content.appendChild(actionsRow1);
    content.appendChild(actionsRow2);
    content.appendChild(textSection.section);
    content.appendChild(labelSection.section);
    content.appendChild(qrSection.section);

    card.appendChild(content);
    root.appendChild(card);

    this._config = config;

    // Event listeners for collapsible sections
    textSection.toggle.addEventListener('click', function() {
      self.toggleSection(textSection);
    });
    labelSection.toggle.addEventListener('click', function() {
      self.toggleSection(labelSection);
    });
    qrSection.toggle.addEventListener('click', function() {
      self.toggleSection(qrSection);
    });

    refreshBtn.addEventListener('click', function() {
      self.callService('wake_printer');
    });
  }

  createButton(text, action) {
    const btn = document.createElement('button');
    btn.innerHTML = text;
    this.styleButton(btn);
    
    if (typeof action === 'string') {
      btn.addEventListener('click', () => this.callService(action));
    } else if (typeof action === 'function') {
      btn.addEventListener('click', action);
    }
    
    return btn;
  }

  styleButton(btn) {
    btn.style.flex = '1';
    btn.style.minWidth = '100px';
    btn.style.padding = '10px';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.background = 'var(--primary-color)';
    btn.style.color = 'var(--text-primary-color)';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '14px';
    btn.style.transition = 'all 0.2s ease';
    
    btn.addEventListener('mouseenter', function() {
      this.style.filter = 'brightness(1.1)';
      this.style.transform = 'translateY(-1px)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.filter = 'none';
      this.style.transform = 'translateY(0)';
    });
  }

  createCollapsibleSection(title) {
    const section = document.createElement('div');
    section.style.margin = '16px 0';

    const toggle = document.createElement('div');
    toggle.style.cursor = 'pointer';
    toggle.style.display = 'flex';
    toggle.style.justifyContent = 'space-between';
    toggle.style.alignItems = 'center';
    toggle.style.padding = '12px';
    toggle.style.background = 'var(--divider-color)';
    toggle.style.borderRadius = '8px';
    toggle.style.margin = '8px 0';
    toggle.style.transition = 'all 0.2s ease';

    const titleSpan = document.createElement('span');
    titleSpan.innerHTML = title;
    titleSpan.style.fontWeight = 'bold';

    const arrow = document.createElement('span');
    arrow.innerHTML = '▼';

    toggle.appendChild(titleSpan);
    toggle.appendChild(arrow);

    const content = document.createElement('div');
    content.style.display = 'none';
    content.style.marginTop = '8px';
    content.style.padding = '12px';
    content.style.border = '1px solid var(--divider-color)';
    content.style.borderRadius = '8px';

    section.appendChild(toggle);
    section.appendChild(content);

    return { section, toggle, content, arrow, open: false };
  }

  toggleSection(sectionObj) {
    sectionObj.open = !sectionObj.open;
    sectionObj.content.style.display = sectionObj.open ? 'block' : 'none';
    sectionObj.arrow.innerHTML = sectionObj.open ? '▲' : '▼';
  }

  addOptions(select, options) {
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.innerHTML = opt.text;
      if (opt.selected) option.selected = true;
      select.appendChild(option);
    });
  }

  createCheckbox(label) {
    const container = document.createElement('label');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '6px';
    container.style.padding = '6px';
    container.style.background = 'var(--secondary-background-color)';
    container.style.borderRadius = '6px';
    container.style.cursor = 'pointer';
    container.style.fontSize = '14px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.margin = '0';

    const labelText = document.createElement('span');
    labelText.innerHTML = label;

    container.appendChild(checkbox);
    container.appendChild(labelText);

    container.checked = checkbox.checked;
    Object.defineProperty(container, 'checked', {
      get: () => checkbox.checked,
      set: (value) => { checkbox.checked = value; }
    });

    return container;
  }

  callService(service, data) {
    if (!data) data = {};
    
    try {
      const entityParts = this._config.entity.split('.');
      let deviceName = entityParts[1];
      
      deviceName = deviceName.replace(/_printer_wake$/, '');
      deviceName = deviceName.replace(/_wake$/, '');
      
      const serviceName = deviceName + '_' + service;
      
      console.log('Calling service: esphome.' + serviceName, data);
      this._hass.callService('esphome', serviceName, data);
      
    } catch (error) {
      console.error('Service call failed:', error);
      alert('Service call failed: ' + error.message);
    }
  }

  set hass(hass) {
    this._hass = hass;
    
    if (!this._config || !this._config.entity) return;

    // Update status
    const statusText = this.shadowRoot.getElementById('status-text');
    const entity = hass.states[this._config.entity];
    if (statusText && entity) {
      statusText.innerHTML = entity.state === 'on' ? 'Ready' : 'Offline';
    }

    // Update usage if sensors exist
    const usageSensor = hass.states[this._config.usage_sensor] || hass.states['sensor.thermal_printer_paper_usage_percent'];
    if (usageSensor) {
      const usageFill = this.shadowRoot.getElementById('usage-fill');
      const usageText = this.shadowRoot.getElementById('usage-text');
      const percentage = parseFloat(usageSensor.state) || 0;
      
      if (usageFill) usageFill.style.width = Math.min(percentage, 100) + '%';
      if (usageText) usageText.innerHTML = percentage.toFixed(1) + '%';
    }

    const usageMmSensor = hass.states[this._config.usage_mm_sensor] || hass.states['sensor.thermal_printer_paper_usage_mm'];
    if (usageMmSensor) {
      const usageMm = this.shadowRoot.getElementById('usage-mm');
      if (usageMm) usageMm.innerHTML = parseFloat(usageMmSensor.state).toFixed(1);
    }

    const linesSensor = hass.states[this._config.lines_sensor] || hass.states['sensor.thermal_printer_lines_printed'];
    if (linesSensor) {
      const linesPrinted = this.shadowRoot.getElementById('lines-printed');
      if (linesPrinted) linesPrinted.innerHTML = linesSensor.state;
    }
  }

  getCardSize() {
    return 8;
  }
}

customElements.define('thermal-printer-card', ThermalPrinterCard);

if (!window.customCards) {
  window.customCards = [];
}

window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Enhanced Thermal Printer Card',
  description: 'Complete thermal printer control with label printing'
});

console.log('Enhanced Thermal Printer Card loaded successfully!');
