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

    // Printer Status Section (same as before)
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

    // Paper Usage Section (same as before)
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
    const resetBtn = this.createButton('🔄 Reset Usage', function() {
      if (confirm('Reset paper usage counters?')) {
        this.callService('reset_paper_usage');
      }
    }.bind(this));

    actionsRow2.appendChild(feedBtn);
    actionsRow2.appendChild(resetBtn);

    // NEW: Todo List Quick Actions
    const todoActionsTitle = document.createElement('div');
    todoActionsTitle.innerHTML = '✅ Todo Lists';
    todoActionsTitle.style.fontWeight = 'bold';
    todoActionsTitle.style.margin = '16px 0 8px 0';

    const todoActionsRow = document.createElement('div');
    todoActionsRow.style.display = 'flex';
    todoActionsRow.style.gap = '8px';
    todoActionsRow.style.margin = '8px 0';
    todoActionsRow.style.flexWrap = 'wrap';

    // Shopping List Button
    const shoppingBtn = this.createButton('🛒 Shopping List', function() {
      this.callScript('print_shopping_list', {
        entity_id: 'todo.shopping_list',
        store_name: 'Grocery Store',
        budget: '$100'
      });
    }.bind(this));
    shoppingBtn.style.background = 'var(--success-color)';

    // Daily Todo Button  
    const dailyTodoBtn = this.createButton('📝 Daily Todo', function() {
      this.callScript('print_todo_list', {
        entity_id: 'todo.daily_tasks',
        list_title: "Today's Tasks",
        compact_format: false
      });
    }.bind(this));
    dailyTodoBtn.style.background = 'var(--info-color)';

    // Weekly Planner Button
    const weeklyBtn = this.createButton('📅 Weekly Plan', function() {
      this.callScript('print_weekly_planner', {
        week_title: 'This Week'
      });
    }.bind(this));
    weeklyBtn.style.background = 'var(--warning-color)';

    todoActionsRow.appendChild(shoppingBtn);
    todoActionsRow.appendChild(dailyTodoBtn);
    todoActionsRow.appendChild(weeklyBtn);

    // Text Printing Section (collapsible)
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

    formatControls.appendChild(sizeSelect);
    formatControls.appendChild(alignSelect);
    formatControls.appendChild(boldCheck);
    formatControls.appendChild(underlineCheck);
    formatControls.appendChild(inverseCheck);

    const printTextBtn = document.createElement('button');
    printTextBtn.innerHTML = '🖨️ Print Text';
    this.styleButton(printTextBtn);

    const self = this;
    printTextBtn.addEventListener('click', function() {
      const text = textInput.value;
      if (!text.trim()) {
        alert('Please enter some text to print');
        return;
      }

      self.callService('print_text', {
        message: text,
        text_size: sizeSelect.value,
        alignment: alignSelect.value,
        bold: boldCheck.checked,
        underline: underlineCheck.checked,
        inverse: inverseCheck.checked
      });
    });

    textContent.appendChild(textInput);
    textContent.appendChild(formatControls);
    textContent.appendChild(printTextBtn);

    // Todo List Creation Section
    const todoSection = this.createCollapsibleSection('✅ Create Quick Todo');
    const todoContent = todoSection.content;

    const todoTitleInput = document.createElement('input');
    todoTitleInput.type = 'text';
    todoTitleInput.placeholder = 'Todo list title (e.g., "Today\'s Tasks")';
    todoTitleInput.style.width = '100%';
    todoTitleInput.style.padding = '10px';
    todoTitleInput.style.border = '1px solid var(--divider-color)';
    todoTitleInput.style.borderRadius = '6px';
    todoTitleInput.style.margin = '8px 0';
    todoTitleInput.style.boxSizing = 'border-box';
    todoTitleInput.value = "Today's Tasks";

    const todoItemsContainer = document.createElement('div');
    todoItemsContainer.style.margin = '12px 0';

    // Create 6 todo item inputs
    const todoInputs = [];
    for (let i = 1; i <= 6; i++) {
      const itemInput = document.createElement('input');
      itemInput.type = 'text';
      itemInput.placeholder = `Todo item ${i}`;
      itemInput.style.width = '100%';
      itemInput.style.padding = '8px';
      itemInput.style.border = '1px solid var(--divider-color)';
      itemInput.style.borderRadius = '6px';
      itemInput.style.margin = '4px 0';
      itemInput.style.boxSizing = 'border-box';
      todoItemsContainer.appendChild(itemInput);
      todoInputs.push(itemInput);
    }

    const printQuickTodoBtn = document.createElement('button');
    printQuickTodoBtn.innerHTML = '✅ Print Quick Todo';
    printQuickTodoBtn.style.background = 'var(--success-color)';
    this.styleButton(printQuickTodoBtn);

    printQuickTodoBtn.addEventListener('click', function() {
      const title = todoTitleInput.value || "Quick Todo";
      const items = todoInputs.map(input => input.value).filter(value => value.trim());
      
      if (items.length === 0) {
        alert('Please enter at least one todo item');
        return;
      }

      const data = {
        title: title,
        item1: items[0] || '',
        item2: items[1] || '',
        item3: items[2] || '',
        item4: items[3] || '',
        item5: items[4] || '',
        item6: items[5] || ''
      };

      self.callService('print_quick_todo', data);
    });

    todoContent.appendChild(todoTitleInput);
    todoContent.appendChild(todoItemsContainer);
    todoContent.appendChild(printQuickTodoBtn);

    // Shopping List Creator Section
    const shoppingSection = this.createCollapsibleSection('🛒 Create Shopping List');
    const shoppingContent = shoppingSection.content;

    const storeInput = document.createElement('input');
    storeInput.type = 'text';
    storeInput.placeholder = 'Store name (e.g., "Walmart")';
    storeInput.style.width = '100%';
    storeInput.style.padding = '10px';
    storeInput.style.border = '1px solid var(--divider-color)';
    storeInput.style.borderRadius = '6px';
    storeInput.style.margin = '8px 0';
    storeInput.style.boxSizing = 'border-box';

    const budgetInput = document.createElement('input');
    budgetInput.type = 'text';
    budgetInput.placeholder = 'Budget (e.g., "$150")';
    budgetInput.style.width = '100%';
    budgetInput.style.padding = '10px';
    budgetInput.style.border = '1px solid var(--divider-color)';
    budgetInput.style.borderRadius = '6px';
    budgetInput.style.margin = '8px 0';
    budgetInput.style.boxSizing = 'border-box';

    const shoppingItemsArea = document.createElement('textarea');
    shoppingItemsArea.placeholder = 'Shopping items (one per line):\nMilk\nBread\nEggs\nApples';
    shoppingItemsArea.style.width = '100%';
    shoppingItemsArea.style.minHeight = '100px';
    shoppingItemsArea.style.padding = '10px';
    shoppingItemsArea.style.border = '1px solid var(--divider-color)';
    shoppingItemsArea.style.borderRadius = '6px';
    shoppingItemsArea.style.resize = 'vertical';
    shoppingItemsArea.style.margin = '8px 0';
    shoppingItemsArea.style.boxSizing = 'border-box';

    const printShoppingBtn = document.createElement('button');
    printShoppingBtn.innerHTML = '🛒 Print Shopping List';
    printShoppingBtn.style.background = 'var(--success-color)';
    this.styleButton(printShoppingBtn);

    printShoppingBtn.addEventListener('click', function() {
      const items = shoppingItemsArea.value.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .join('|');
      
      if (!items) {
        alert('Please enter at least one shopping item');
        return;
      }

      self.callService('print_shopping_list', {
        store_name: storeInput.value,
        items: items,
        budget: budgetInput.value,
        categories: ''
      });
    });

    shoppingContent.appendChild(storeInput);
    shoppingContent.appendChild(budgetInput);
    shoppingContent.appendChild(shoppingItemsArea);
    shoppingContent.appendChild(printShoppingBtn);

    // Barcode Printing Section (simplified)
    const barcodeSection = this.createCollapsibleSection('📱 Barcode Printing');
    const barcodeContent = barcodeSection.content;

    const barcodeInput = document.createElement('input');
    barcodeInput.type = 'text';
    barcodeInput.placeholder = 'Barcode data (e.g., "123456789")';
    barcodeInput.style.width = '100%';
    barcodeInput.style.padding = '10px';
    barcodeInput.style.margin = '8px 0';
    barcodeInput.style.border = '1px solid var(--divider-color)';
    barcodeInput.style.borderRadius = '6px';
    barcodeInput.style.boxSizing = 'border-box';

    const barcodeTypeSelect = document.createElement('select');
    barcodeTypeSelect.style.width = '100%';
    barcodeTypeSelect.style.margin = '8px 0';
    barcodeTypeSelect.style.padding = '8px';
    barcodeTypeSelect.style.border = '1px solid var(--divider-color)';
    barcodeTypeSelect.style.borderRadius = '6px';
    this.addOptions(barcodeTypeSelect, [
      { value: '8', text: 'CODE128 (recommended)', selected: true },
      { value: '4', text: 'CODE39' },
      { value: '2', text: 'EAN13' },
      { value: '0', text: 'UPC-A' }
    ]);

    const printBarcodeBtn = document.createElement('button');
    printBarcodeBtn.innerHTML = '📱 Print Barcode';
    this.styleButton(printBarcodeBtn);

    printBarcodeBtn.addEventListener('click', function() {
      const data = barcodeInput.value;
      if (!data.trim()) {
        alert('Please enter barcode data');
        return;
      }
      
      self.callService('print_barcode', {
        barcode_type: parseInt(barcodeTypeSelect.value),
        barcode_data: data
      });
    });

    barcodeContent.appendChild(barcodeInput);
    barcodeContent.appendChild(barcodeTypeSelect);
    barcodeContent.appendChild(printBarcodeBtn);

    // Assembly
    content.appendChild(statusDiv);
    content.appendChild(usageSection);
    content.appendChild(actionsTitle);
    content.appendChild(actionsRow1);
    content.appendChild(actionsRow2);
    content.appendChild(todoActionsTitle);
    content.appendChild(todoActionsRow);
    content.appendChild(textSection.section);
    content.appendChild(todoSection.section);
    content.appendChild(shoppingSection.section);
    content.appendChild(barcodeSection.section);

    card.appendChild(content);
    root.appendChild(card);

    this._config = config;

    // Event listeners for collapsible sections
    const sections = [textSection, todoSection, shoppingSection, barcodeSection];
    sections.forEach(sectionObj => {
      sectionObj.toggle.addEventListener('click', () => {
        this.toggleSection(sectionObj);
      });
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

  callScript(script, data) {
    if (!data) data = {};
    
    try {
      console.log('Calling script: script.' + script, data);
      this._hass.callService('script', script, data);
      
    } catch (error) {
      console.error('Script call failed:', error);
      alert('Script call failed: ' + error.message);
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
    return 10;
  }
}

customElements.define('thermal-printer-card', ThermalPrinterCard);

if (!window.customCards) {
  window.customCards = [];
}

window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Thermal Printer Card with Todo Lists',
  description: 'Complete thermal printer control with integrated todo list printing'
});

console.log('Enhanced Thermal Printer Card with Todo Lists loaded successfully!');
