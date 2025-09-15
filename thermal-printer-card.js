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
    card.setAttribute('header', config.title || 'Thermal Printer with Queue');
    
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

    // ===== NEW: QUEUE STATUS SECTION =====
    const queueSection = document.createElement('div');
    queueSection.style.margin = '16px 0';
    queueSection.style.padding = '12px';
    queueSection.style.background = 'var(--card-background-color)';
    queueSection.style.border = '1px solid var(--divider-color)';
    queueSection.style.borderRadius = '8px';

    const queueTitle = document.createElement('div');
    queueTitle.innerHTML = '📋 Print Queue Status';
    queueTitle.style.fontWeight = 'bold';
    queueTitle.style.marginBottom = '8px';

    const queueInfo = document.createElement('div');
    queueInfo.style.display = 'grid';
    queueInfo.style.gridTemplateColumns = '1fr 1fr 1fr';
    queueInfo.style.gap = '8px';
    queueInfo.style.fontSize = '14px';
    queueInfo.style.marginBottom = '8px';

    const queueLength = document.createElement('div');
    queueLength.innerHTML = 'Queue: <span id="queue-length" style="font-weight: bold;">0</span>';
    queueLength.style.color = 'var(--secondary-text-color)';

    const busyIndicator = document.createElement('div');
    busyIndicator.innerHTML = '🔴 <span id="busy-status">Ready</span>';
    busyIndicator.style.color = 'var(--secondary-text-color)';

    const jobsProcessed = document.createElement('div');
    jobsProcessed.innerHTML = 'Jobs: <span id="jobs-processed">0</span>';
    jobsProcessed.style.color = 'var(--secondary-text-color)';

    queueInfo.appendChild(queueLength);
    queueInfo.appendChild(busyIndicator);
    queueInfo.appendChild(jobsProcessed);

    // Queue control buttons
    const queueControls = document.createElement('div');
    queueControls.style.display = 'flex';
    queueControls.style.gap = '8px';
    queueControls.style.margin = '8px 0';

    const clearQueueBtn = this.createButton('🗑️ Clear Queue', function() {
      if (confirm('Clear all queued print jobs?')) {
        this.callService('clear_print_queue');
      }
    }.bind(this));

    const queueStatsBtn = this.createButton('📊 Queue Stats', function() {
      this.callService('queue_status_button');
    }.bind(this));

    queueControls.appendChild(clearQueueBtn);
    queueControls.appendChild(queueStatsBtn);

    queueSection.appendChild(queueTitle);
    queueSection.appendChild(queueInfo);
    queueSection.appendChild(queueControls);

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

    const feedBtn = this.createButton('📄 Queue Feed', function() { 
      this.callService('queue_feed_paper', { lines: 3, priority: 0 });
      this.showQueueNotification('Paper feed queued');
    }.bind(this));
    
    const separatorBtn = this.createButton('➖ Queue Separator', function() {
      this.callService('queue_separator', { priority: 0 });
      this.showQueueNotification('Separator queued');
    }.bind(this));
    
    const emergencyBtn = this.createButton('🚨 Emergency', function() {
      const message = prompt('Emergency message:');
      if (message && message.trim()) {
        this.callService('print_text_immediate', {
          message: message,
          text_size: 'L',
          alignment: 'C',
          bold: true
        });
        this.showQueueNotification('Emergency print sent!', 'error');
      }
    }.bind(this));
    emergencyBtn.style.background = 'var(--error-color)';

    actionsRow2.appendChild(feedBtn);
    actionsRow2.appendChild(separatorBtn);
    actionsRow2.appendChild(emergencyBtn);

    // Text Printing Section (Modified for Queue)
    const textSection = this.createCollapsibleSection('📝 Queue Text Printing');
    const textContent = textSection.content;

    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Enter text to queue for printing...';
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
    const priorityCheck = this.createCheckbox('High Priority');

    formatControls.appendChild(sizeSelect);
    formatControls.appendChild(alignSelect);
    formatControls.appendChild(boldCheck);
    formatControls.appendChild(underlineCheck);
    formatControls.appendChild(inverseCheck);
    formatControls.appendChild(priorityCheck);

    const printTextBtn = document.createElement('button');
    printTextBtn.innerHTML = '📋 Queue Text';
    printTextBtn.className = 'control-button';
    this.styleButton(printTextBtn);

    const printImmediateBtn = document.createElement('button');
    printImmediateBtn.innerHTML = '⚡ Print Now';
    printImmediateBtn.style.background = 'var(--warning-color)';
    printImmediateBtn.style.margin = '4px 0';
    this.styleButton(printImmediateBtn);

    const self = this;
    printTextBtn.addEventListener('click', function() {
      const text = textInput.value;
      if (!text.trim()) {
        alert('Please enter some text to print');
        return;
      }

      // Use queue service
      self.callService('queue_print_text', {
        message: text,
        text_size: sizeSelect.value,
        alignment: alignSelect.value,
        bold: boldCheck.checked,
        underline: underlineCheck.checked,
        inverse: inverseCheck.checked,
        priority: priorityCheck.checked ? 1 : 0
      });
      
      // Clear the input after queuing
      textInput.value = '';
      
      // Show confirmation
      self.showQueueNotification('Text queued for printing');
    });

    printImmediateBtn.addEventListener('click', function() {
      const text = textInput.value;
      if (!text.trim()) {
        alert('Please enter some text to print');
        return;
      }

      // Use immediate service
      self.callService('print_text_immediate', {
        message: text,
        text_size: sizeSelect.value,
        alignment: alignSelect.value,
        bold: boldCheck.checked
      });
      
      textInput.value = '';
      self.showQueueNotification('Text printed immediately!', 'warning');
    });

    textContent.appendChild(textInput);
    textContent.appendChild(formatControls);
    textContent.appendChild(printTextBtn);
    textContent.appendChild(printImmediateBtn);

    // Two-Column Section (Modified for Queue)
    const twoColSection = this.createCollapsibleSection('📊 Queue Two-Column');
    const twoColContent = twoColSection.content;

    const twoColContainer = document.createElement('div');
    twoColContainer.style.display = 'grid';
    twoColContainer.style.gridTemplateColumns = '1fr 1fr';
    twoColContainer.style.gap = '12px';
    twoColContainer.style.margin = '12px 0';

    const leftColInput = document.createElement('input');
    leftColInput.type = 'text';
    leftColInput.placeholder = 'Left column text';
    leftColInput.style.width = '100%';
    leftColInput.style.padding = '10px';
    leftColInput.style.border = '1px solid var(--divider-color)';
    leftColInput.style.borderRadius = '6px';
    leftColInput.style.fontFamily = 'Courier New, monospace';
    leftColInput.style.boxSizing = 'border-box';

    const rightColInput = document.createElement('input');
    rightColInput.type = 'text';
    rightColInput.placeholder = 'Right column text';
    rightColInput.style.width = '100%';
    rightColInput.style.padding = '10px';
    rightColInput.style.border = '1px solid var(--divider-color)';
    rightColInput.style.borderRadius = '6px';
    rightColInput.style.fontFamily = 'Courier New, monospace';
    rightColInput.style.boxSizing = 'border-box';

    twoColContainer.appendChild(leftColInput);
    twoColContainer.appendChild(rightColInput);

    const twoColControls = document.createElement('div');
    twoColControls.style.display = 'grid';
    twoColControls.style.gridTemplateColumns = '1fr 1fr 1fr';
    twoColControls.style.gap = '8px';
    twoColControls.style.margin = '8px 0';

    const twoColSizeSelect = document.createElement('select');
    twoColSizeSelect.style.padding = '8px';
    twoColSizeSelect.style.border = '1px solid var(--divider-color)';
    twoColSizeSelect.style.borderRadius = '6px';
    this.addOptions(twoColSizeSelect, [
      { value: 'S', text: 'Small', selected: true },
      { value: 'M', text: 'Medium' },
      { value: 'L', text: 'Large' }
    ]);

    const fillDotsCheck = this.createCheckbox('Fill dots');
    fillDotsCheck.checked = true;

    const twoColPriorityCheck = this.createCheckbox('Priority');

    twoColControls.appendChild(twoColSizeSelect);
    twoColControls.appendChild(fillDotsCheck);
    twoColControls.appendChild(twoColPriorityCheck);

    const printTwoColBtn = document.createElement('button');
    printTwoColBtn.innerHTML = '📊 Queue Two Columns';
    this.styleButton(printTwoColBtn);

    printTwoColBtn.addEventListener('click', function() {
      const leftText = leftColInput.value;
      const rightText = rightColInput.value;
      
      if (!leftText.trim() && !rightText.trim()) {
        alert('Please enter text for at least one column');
        return;
      }
      
      self.callService('queue_two_column', {
        left_text: leftText,
        right_text: rightText,
        fill_dots: fillDotsCheck.checked,
        text_size: twoColSizeSelect.value,
        priority: twoColPriorityCheck.checked ? 1 : 0
      });

      leftColInput.value = '';
      rightColInput.value = '';
      self.showQueueNotification('Two-column layout queued');
    });

    twoColContent.appendChild(twoColContainer);
    twoColContent.appendChild(twoColControls);
    twoColContent.appendChild(printTwoColBtn);

    // Barcode Section (Modified for Queue)
    const barcodeSection = this.createCollapsibleSection('📱 Queue Barcode');
    const barcodeContent = barcodeSection.content;

    const barcodeTypeSelect = document.createElement('select');
    barcodeTypeSelect.style.width = '100%';
    barcodeTypeSelect.style.margin = '8px 0';
    barcodeTypeSelect.style.padding = '8px';
    barcodeTypeSelect.style.border = '1px solid var(--divider-color)';
    barcodeTypeSelect.style.borderRadius = '6px';
    this.addOptions(barcodeTypeSelect, [
      { value: '0', text: 'UPC-A (12 digits)' },
      { value: '1', text: 'UPC-E (6-8 digits)' },
      { value: '2', text: 'EAN13 (12-13 digits)' },
      { value: '3', text: 'EAN8 (7-8 digits)' },
      { value: '4', text: 'CODE39 (alphanumeric)' },
      { value: '5', text: 'ITF (even digits)' },
      { value: '6', text: 'CODABAR (numeric + special)' },
      { value: '7', text: 'CODE93 (alphanumeric)' },
      { value: '8', text: 'CODE128 (full ASCII)', selected: true }
    ]);

    const barcodeInput = document.createElement('input');
    barcodeInput.type = 'text';
    barcodeInput.placeholder = 'Barcode data';
    barcodeInput.style.width = '100%';
    barcodeInput.style.padding = '10px';
    barcodeInput.style.margin = '8px 0';
    barcodeInput.style.border = '1px solid var(--divider-color)';
    barcodeInput.style.borderRadius = '6px';
    barcodeInput.style.fontFamily = 'monospace';
    barcodeInput.style.boxSizing = 'border-box';

    const barcodePriorityCheck = this.createCheckbox('High Priority');
    barcodePriorityCheck.style.margin = '8px 0';

    const printBarcodeBtn = document.createElement('button');
    printBarcodeBtn.innerHTML = '📱 Queue Barcode';
    this.styleButton(printBarcodeBtn);

    printBarcodeBtn.addEventListener('click', function() {
      const data = barcodeInput.value;
      if (!data.trim()) {
        alert('Please enter barcode data');
        return;
      }
      
      self.callService('queue_barcode', {
        barcode_type: parseInt(barcodeTypeSelect.value),
        barcode_data: data,
        priority: barcodePriorityCheck.checked ? 1 : 0
      });
      
      barcodeInput.value = '';
      self.showQueueNotification('Barcode queued');
    });

    barcodeContent.appendChild(barcodeTypeSelect);
    barcodeContent.appendChild(barcodeInput);
    barcodeContent.appendChild(barcodePriorityCheck);
    barcodeContent.appendChild(printBarcodeBtn);

    // QR Code Section (Modified for Queue)
    const qrSection = this.createCollapsibleSection('📱 Queue QR Code');
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

    const qrControls = document.createElement('div');
    qrControls.style.display = 'grid';
    qrControls.style.gridTemplateColumns = '1fr 1fr 1fr';
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
      { value: '4', text: 'X-Large' }
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

    const qrPriorityCheck = this.createCheckbox('Priority');

    qrControls.appendChild(qrSizeSelect);
    qrControls.appendChild(qrErrorSelect);
    qrControls.appendChild(qrPriorityCheck);

    const printQrBtn = document.createElement('button');
    printQrBtn.innerHTML = '📱 Queue QR Code';
    this.styleButton(printQrBtn);

    printQrBtn.addEventListener('click', function() {
      const data = qrInput.value;
      if (!data.trim()) {
        alert('Please enter QR code data');
        return;
      }
      
      self.callService('queue_qr_code', {
        data: data,
        size: parseInt(qrSizeSelect.value),
        error_correction: parseInt(qrErrorSelect.value),
        priority: qrPriorityCheck.checked ? 1 : 0
      });
      
      qrInput.value = '';
      self.showQueueNotification('QR code queued');
    });

    qrContent.appendChild(qrInput);
    qrContent.appendChild(qrControls);
    qrContent.appendChild(printQrBtn);

    // Batch Processing Section
    const batchSection = this.createCollapsibleSection('📋 Batch Queue Processing');
    const batchContent = batchSection.content;

    const batchInput = document.createElement('textarea');
    batchInput.placeholder = 'Enter multiple lines to print (one per line)...';
    batchInput.style.width = '100%';
    batchInput.style.minHeight = '80px';
    batchInput.style.padding = '12px';
    batchInput.style.border = '1px solid var(--divider-color)';
    batchInput.style.borderRadius = '8px';
    batchInput.style.fontFamily = 'Courier New, monospace';
    batchInput.style.margin = '8px 0';
    batchInput.style.boxSizing = 'border-box';

    const batchControls = document.createElement('div');
    batchControls.style.display = 'grid';
    batchControls.style.gridTemplateColumns = '1fr 1fr';
    batchControls.style.gap = '8px';
    batchControls.style.margin = '8px 0';

    const batchSizeSelect = document.createElement('select');
    batchSizeSelect.style.padding = '8px';
    batchSizeSelect.style.border = '1px solid var(--divider-color)';
    batchSizeSelect.style.borderRadius = '6px';
    this.addOptions(batchSizeSelect, [
      { value: 'S', text: 'Small Text' },
      { value: 'M', text: 'Medium Text', selected: true },
      { value: 'L', text: 'Large Text' }
    ]);

    const batchPriorityCheck = this.createCheckbox('High Priority');

    batchControls.appendChild(batchSizeSelect);
    batchControls.appendChild(batchPriorityCheck);

    const batchBtn = document.createElement('button');
    batchBtn.innerHTML = '📋 Queue Batch Items';
    this.styleButton(batchBtn);

    batchBtn.addEventListener('click', function() {
      const text = batchInput.value;
      if (!text.trim()) {
        alert('Please enter items to batch print');
        return;
      }

      // Convert newlines to pipe separator for the service
      const items = text.split('\n').filter(line => line.trim()).join('|');
      
      self.callService('batch_print_text', {
        items: items,
        text_size: batchSizeSelect.value,
        priority: batchPriorityCheck.checked ? 1 : 0
      });
      
      batchInput.value = '';
      const itemCount = items.split('|').length;
      self.showQueueNotification(`${itemCount} items queued for batch printing`);
    });

    batchContent.appendChild(batchInput);
    batchContent.appendChild(batchControls);
    batchContent.appendChild(batchBtn);

    // Assembly
    content.appendChild(statusDiv);
    content.appendChild(queueSection);
    content.appendChild(usageSection);
    content.appendChild(actionsTitle);
    content.appendChild(actionsRow1);
    content.appendChild(actionsRow2);
    content.appendChild(textSection.section);
    content.appendChild(twoColSection.section);
    content.appendChild(barcodeSection.section);
    content.appendChild(qrSection.section);
    content.appendChild(batchSection.section);

    card.appendChild(content);
    root.appendChild(card);

    this._config = config;

    // Event listeners for all collapsible sections
    textSection.toggle.addEventListener('click', function() {
      self.toggleSection(textSection);
    });
    twoColSection.toggle.addEventListener('click', function() {
      self.toggleSection(twoColSection);
    });
    barcodeSection.toggle.addEventListener('click', function() {
      self.toggleSection(barcodeSection);
    });
    qrSection.toggle.addEventListener('click', function() {
      self.toggleSection(qrSection);
    });
    batchSection.toggle.addEventListener('click', function() {
      self.toggleSection(batchSection);
    });

    refreshBtn.addEventListener('click', function() {
      self.callService('wake_printer');
    });
  }

  showQueueNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.innerHTML = `✅ ${message}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = type === 'error' ? 'var(--error-color)' : 
                                   type === 'warning' ? 'var(--warning-color)' : 'var(--success-color)';
    notification.style.color = 'white';
    notification.style.padding = '12px 16px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '9999';
    notification.style.fontSize = '14px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
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
      
      // Clean up device name
      deviceName = deviceName.replace(/_printer_wake$/, '');
      deviceName = deviceName.replace(/_wake$/, '');
      
      const serviceName = deviceName + '_' + service;
      
      console.log('Calling queue service: esphome.' + serviceName, data);
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

    // Update queue status
    const queueLengthSpan = this.shadowRoot.getElementById('queue-length');
    const queueLengthSensor = hass.states['sensor.thermal_printer_queue_print_queue_length'];
    if (queueLengthSpan && queueLengthSensor) {
      const length = parseInt(queueLengthSensor.state) || 0;
      queueLengthSpan.innerHTML = length.toString();
      
      // Color code based on queue length
      if (length === 0) {
        queueLengthSpan.style.color = 'var(--success-color)';
      } else if (length < 5) {
        queueLengthSpan.style.color = 'var(--warning-color)';
      } else {
        queueLengthSpan.style.color = 'var(--error-color)';
      }
    }

    // Update busy status
    const busyStatusSpan = this.shadowRoot.getElementById('busy-status');
    const busySensor = hass.states['binary_sensor.thermal_printer_queue_printer_busy'];
    if (busyStatusSpan && busySensor) {
      const isBusy = busySensor.state === 'on';
      busyStatusSpan.innerHTML = isBusy ? 'Printing...' : 'Ready';
      busyStatusSpan.parentElement.innerHTML = 
        (isBusy ? '🔴' : '🟢') + ' <span id="busy-status">' + 
        (isBusy ? 'Printing...' : 'Ready') + '</span>';
    }

    // Update jobs processed
    const jobsProcessedSpan = this.shadowRoot.getElementById('jobs-processed');
    const jobsSensor = hass.states['sensor.thermal_printer_queue_total_jobs_processed'];
    if (jobsProcessedSpan && jobsSensor) {
      jobsProcessedSpan.innerHTML = jobsSensor.state || '0';
    }

    // Update usage sensors
    const usageSensor = hass.states['sensor.thermal_printer_queue_paper_usage_percent'];
    if (usageSensor) {
      const usageFill = this.shadowRoot.getElementById('usage-fill');
      const usageText = this.shadowRoot.getElementById('usage-text');
      const percentage = parseFloat(usageSensor.state) || 0;
      
      if (usageFill) usageFill.style.width = Math.min(percentage, 100) + '%';
      if (usageText) usageText.innerHTML = percentage.toFixed(1) + '%';
    }

    const usageMmSensor = hass.states['sensor.thermal_printer_queue_paper_usage_mm'];
    if (usageMmSensor) {
      const usageMm = this.shadowRoot.getElementById('usage-mm');
      if (usageMm) usageMm.innerHTML = parseFloat(usageMmSensor.state).toFixed(1);
    }

    const linesSensor = hass.states['sensor.thermal_printer_queue_lines_printed'];
    if (linesSensor) {
      const linesPrinted = this.shadowRoot.getElementById('lines-printed');
      if (linesPrinted) linesPrinted.innerHTML = linesSensor.state;
    }
  }

  getCardSize() {
    return 10;
  }
}

customElements.define('thermal-printer-card', ThermalPrinterCard);

if (!window.customCards) {
  window.customCards = [];
}

window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Queue-Aware Thermal Printer Card',
  description: 'Complete thermal printer control with intelligent queue system'
});

console.log('Queue-Aware Thermal Printer Card loaded successfully!');
