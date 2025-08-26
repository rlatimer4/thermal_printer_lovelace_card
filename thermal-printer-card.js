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

    const feedBtn = this.createButton('📄 Feed Paper', () => { 
      this.callService('feed_paper', { lines: 3 });
    });
    const separatorBtn = this.createButton('➖ Separator', () => {
      this.callService('print_text', {
        message: '================================',
        text_size: 'S',
        alignment: 'C',
        bold: false,
        underline: false,
        inverse: false,
        rotation: 0
      });
    });
    const resetBtn = this.createButton('🔄 Reset Usage', () => {
      if (confirm('Reset paper usage counters?')) {
        this.callService('reset_paper_usage');
      }
    });

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

    printTextBtn.addEventListener('click', () => {
      const text = textInput.value;
      if (!text.trim()) {
        alert('Please enter some text to print');
        return;
      }

      if (rotateCheck.checked) {
        this.callService('print_rotated_text', {
          message: text,
          rotation: 1,
          size: sizeSelect.value
        });
      } else {
        this.callService('print_text', {
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

    // Two-Column Printing Section
    const twoColSection = this.createCollapsibleSection('📊 Two-Column Printing');
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
    twoColControls.style.gridTemplateColumns = '1fr 1fr';
    twoColControls.style.gap = '8px';
    twoColControls.style.margin = '8px 0';

    const twoColSizeSelect = document.createElement('select');
    twoColSizeSelect.style.padding = '8px';
    twoColSizeSelect.style.border = '1px solid var(--divider-color)';
    twoColSizeSelect.style.borderRadius = '6px';
    this.addOptions(twoColSizeSelect, [
      { value: 'S', text: 'Small (32 chars)', selected: true },
      { value: 'M', text: 'Medium (24 chars)' },
      { value: 'L', text: 'Large (16 chars)' }
    ]);

    const fillDotsCheck = this.createCheckbox('Fill with dots');
    fillDotsCheck.checked = true;

    twoColControls.appendChild(twoColSizeSelect);
    twoColControls.appendChild(fillDotsCheck);

    const printTwoColBtn = document.createElement('button');
    printTwoColBtn.innerHTML = '📊 Print Two Columns';
    this.styleButton(printTwoColBtn);

    printTwoColBtn.addEventListener('click', () => {
      const leftText = leftColInput.value;
      const rightText = rightColInput.value;
      
      if (!leftText.trim() && !rightText.trim()) {
        alert('Please enter text for at least one column');
        return;
      }
      
      this.callService('print_two_column', {
        left_text: leftText,
        right_text: rightText,
        fill_dots: fillDotsCheck.checked,
        text_size: twoColSizeSelect.value
      });
    });

    const twoColExample = document.createElement('div');
    twoColExample.innerHTML = '💡 Perfect for receipts: "Coffee..................$3.50"';
    twoColExample.style.fontSize = '12px';
    twoColExample.style.color = 'var(--secondary-text-color)';
    twoColExample.style.margin = '8px 0';
    twoColExample.style.padding = '8px';
    twoColExample.style.background = 'var(--secondary-background-color)';
    twoColExample.style.borderRadius = '4px';
    twoColExample.style.fontFamily = 'monospace';

    twoColContent.appendChild(twoColContainer);
    twoColContent.appendChild(twoColControls);
    twoColContent.appendChild(printTwoColBtn);
    twoColContent.appendChild(twoColExample);

    // Three-Column Table Section
    const threeColSection = this.createCollapsibleSection('📋 Three-Column Table');
    const threeColContent = threeColSection.content;

    const threeColContainer = document.createElement('div');
    threeColContainer.style.display = 'grid';
    threeColContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
    threeColContainer.style.gap = '8px';
    threeColContainer.style.margin = '12px 0';

    const col1Input = document.createElement('input');
    col1Input.type = 'text';
    col1Input.placeholder = 'Column 1';
    col1Input.style.width = '100%';
    col1Input.style.padding = '8px';
    col1Input.style.border = '1px solid var(--divider-color)';
    col1Input.style.borderRadius = '6px';
    col1Input.style.fontFamily = 'Courier New, monospace';
    col1Input.style.fontSize = '12px';
    col1Input.style.boxSizing = 'border-box';

    const col2Input = document.createElement('input');
    col2Input.type = 'text';
    col2Input.placeholder = 'Column 2';
    col2Input.style.width = '100%';
    col2Input.style.padding = '8px';
    col2Input.style.border = '1px solid var(--divider-color)';
    col2Input.style.borderRadius = '6px';
    col2Input.style.fontFamily = 'Courier New, monospace';
    col2Input.style.fontSize = '12px';
    col2Input.style.boxSizing = 'border-box';

    const col3Input = document.createElement('input');
    col3Input.type = 'text';
    col3Input.placeholder = 'Column 3';
    col3Input.style.width = '100%';
    col3Input.style.padding = '8px';
    col3Input.style.border = '1px solid var(--divider-color)';
    col3Input.style.borderRadius = '6px';
    col3Input.style.fontFamily = 'Courier New, monospace';
    col3Input.style.fontSize = '12px';
    col3Input.style.boxSizing = 'border-box';

    threeColContainer.appendChild(col1Input);
    threeColContainer.appendChild(col2Input);
    threeColContainer.appendChild(col3Input);

    const headerCheck = this.createCheckbox('Format as header row');
    headerCheck.style.margin = '8px 0';

    const printThreeColBtn = document.createElement('button');
    printThreeColBtn.innerHTML = '📋 Print Table Row';
    this.styleButton(printThreeColBtn);

    printThreeColBtn.addEventListener('click', () => {
      const col1 = col1Input.value;
      const col2 = col2Input.value;
      const col3 = col3Input.value;
      
      if (!col1.trim() && !col2.trim() && !col3.trim()) {
        alert('Please enter text for at least one column');
        return;
      }
      
      this.callService('print_table_row', {
        col1: col1,
        col2: col2,
        col3: col3,
        header: headerCheck.checked
      });
    });

    const threeColExample = document.createElement('div');
    threeColExample.innerHTML = '💡 Perfect for tables: "Item      Qty       Price"';
    threeColExample.style.fontSize = '12px';
    threeColExample.style.color = 'var(--secondary-text-color)';
    threeColExample.style.margin = '8px 0';
    threeColExample.style.padding = '8px';
    threeColExample.style.background = 'var(--secondary-background-color)';
    threeColExample.style.borderRadius = '4px';
    threeColExample.style.fontFamily = 'monospace';

    threeColContent.appendChild(threeColContainer);
    threeColContent.appendChild(headerCheck);
    threeColContent.appendChild(printThreeColBtn);
    threeColContent.appendChild(threeColExample);

    // Label Printing Section
    const labelSection = this.createCollapsibleSection('🏷️ Label Printing');
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
      { value: 'L', text: 'Large Label' }
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

    printLabelBtn.addEventListener('click', () => {
      const text = labelInput.value;
      if (!text.trim()) {
        alert('Please enter label text');
        return;
      }
      
      this.callService('print_rotated_text', {
        message: text,
        rotation: 1,
        size: labelSizeSelect.value
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

    printQrBtn.addEventListener('click', () => {
      const data = qrInput.value;
      if (!data.trim()) {
        alert('Please enter QR code data');
        return;
      }
      
      this.callService('print_qr_code', {
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

    // Barcode Printing Section
    const barcodeSection = this.createCollapsibleSection('📱 Barcode Printing');
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

    const printBarcodeBtn = document.createElement('button');
    printBarcodeBtn.innerHTML = '📱 Print Barcode';
    this.styleButton(printBarcodeBtn);

    printBarcodeBtn.addEventListener('click', () => {
      const data = barcodeInput.value;
      if (!data.trim()) {
        alert('Please enter barcode data');
        return;
      }
      
      this.callService('print_barcode', {
        barcode_type: parseInt(barcodeTypeSelect.value),
        barcode_data: data
      });
    });

    barcodeContent.appendChild(barcodeTypeSelect);
    barcodeContent.appendChild(barcodeInput);
    barcodeContent.appendChild(printBarcodeBtn);

    // Assembly
    content.appendChild(statusDiv);
    content.appendChild(usageSection);
    content.appendChild(actionsTitle);
    content.appendChild(actionsRow1);
    content.appendChild(actionsRow2);
    content.appendChild(textSection.section);
    content.appendChild(twoColSection.section);
    content.appendChild(threeColSection.section);
    content.appendChild(labelSection.section);
    content.appendChild(qrSection.section);
    content.appendChild(barcodeSection.section);

    card.appendChild(content);
    root.appendChild(card);

    this._config = config;

    // Event listeners for all collapsible sections
    textSection.toggle.addEventListener('click', () => {
      this.toggleSection(textSection);
    });
    twoColSection.toggle.addEventListener('click', () => {
      this.toggleSection(twoColSection);
    });
    threeColSection.toggle.addEventListener('click', () => {
      this.toggleSection(threeColSection);
    });
    labelSection.toggle.addEventListener('click', () => {
      this.toggleSection(labelSection);
    });
    qrSection.toggle.addEventListener('click', () => {
      this.toggleSection(qrSection);
    });
    barcodeSection.toggle.addEventListener('click', () => {
      this.toggleSection(barcodeSection);
    });

    refreshBtn.addEventListener('click', () => {
      this.callService('wake_printer');
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

    // Make the container behave like a checkbox
    Object.defineProperty(container, 'checked', {
      get: () => checkbox.checked,
      set: (value) => { checkbox.checked = value; }
    });

    container.addEventListener('change', () => {
      // Forward the change event to the checkbox
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
    const statusDot = this.shadowRoot.getElementById('status-dot');
    const entity = hass.states[this._config.entity];
    
    if (statusText && entity) {
      const isOnline = entity.state === 'on';
      statusText.innerHTML = isOnline ? 'Printer Ready' : 'Printer Offline';
      
      if (statusDot) {
        statusDot.style.background = isOnline ? 'var(--success-color)' : 'var(--error-color)';
      }
    }

    // Update paper usage if sensors exist
    const usageSensor = hass.states[this._config.usage_sensor] || 
                       hass.states['sensor.thermal_printer_paper_usage_percent'];
    if (usageSensor) {
      const usageFill = this.shadowRoot.getElementById('usage-fill');
      const usageText = this.shadowRoot.getElementById('usage-text');
      const percentage = parseFloat(usageSensor.state) || 0;
      
      if (usageFill) {
        usageFill.style.width = Math.min(percentage, 100) + '%';
      }
      if (usageText) {
        usageText.innerHTML = percentage.toFixed(1) + '%';
      }
    }

    // Update usage in mm
    const usageMmSensor = hass.states[this._config.usage_mm_sensor] || 
                         hass.states['sensor.thermal_printer_paper_usage_mm'];
    if (usageMmSensor) {
      const usageMm = this.shadowRoot.getElementById('usage-mm');
      if (usageMm) {
        usageMm.innerHTML = parseFloat(usageMmSensor.state).toFixed(1);
      }
    }

    // Update lines printed
    const linesSensor = hass.states[this._config.lines_sensor] || 
                       hass.states['sensor.thermal_printer_lines_printed'];
    if (linesSensor) {
      const linesPrinted = this.shadowRoot.getElementById('lines-printed');
      if (linesPrinted) {
        linesPrinted.innerHTML = linesSensor.state;
      }
    }
  }

  getCardSize() {
    return 8;
  }
}

// Register the custom element
customElements.define('thermal-printer-card', ThermalPrinterCard);

// Register with custom cards list
if (!window.customCards) {
  window.customCards = [];
}

window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Thermal Printer Card',
  description: 'Complete thermal printer control with text, barcode, and QR code printing'
});

console.log('Thermal Printer Card loaded successfully!');
