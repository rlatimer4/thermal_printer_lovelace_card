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

    const statusDiv = document.createElement('div');
    statusDiv.innerHTML = '<strong>Status:</strong> <span id="status">Ready</span>';
    statusDiv.style.marginBottom = '16px';
    statusDiv.style.padding = '8px';
    statusDiv.style.backgroundColor = 'var(--secondary-background-color)';
    statusDiv.style.borderRadius = '4px';

    const testBtn = document.createElement('button');
    testBtn.innerHTML = 'Test Print';
    testBtn.style.margin = '4px';
    testBtn.style.padding = '8px 16px';
    testBtn.style.border = 'none';
    testBtn.style.borderRadius = '4px';
    testBtn.style.backgroundColor = 'var(--primary-color)';
    testBtn.style.color = 'var(--text-primary-color)';
    testBtn.style.cursor = 'pointer';

    const wakeBtn = document.createElement('button');
    wakeBtn.innerHTML = 'Wake';
    wakeBtn.style.margin = '4px';
    wakeBtn.style.padding = '8px 16px';
    wakeBtn.style.border = 'none';
    wakeBtn.style.borderRadius = '4px';
    wakeBtn.style.backgroundColor = 'var(--primary-color)';
    wakeBtn.style.color = 'var(--text-primary-color)';
    wakeBtn.style.cursor = 'pointer';

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Enter text to print';
    textInput.style.width = '100%';
    textInput.style.padding = '8px';
    textInput.style.margin = '8px 0';
    textInput.style.border = '1px solid var(--divider-color)';
    textInput.style.borderRadius = '4px';
    textInput.style.boxSizing = 'border-box';

    const printBtn = document.createElement('button');
    printBtn.innerHTML = 'Print Text';
    printBtn.style.margin = '4px';
    printBtn.style.padding = '8px 16px';
    printBtn.style.border = 'none';
    printBtn.style.borderRadius = '4px';
    printBtn.style.backgroundColor = 'var(--primary-color)';
    printBtn.style.color = 'var(--text-primary-color)';
    printBtn.style.cursor = 'pointer';

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'Enter label text';
    labelInput.style.width = '100%';
    labelInput.style.padding = '8px';
    labelInput.style.margin = '16px 0 8px 0';
    labelInput.style.border = '1px solid var(--divider-color)';
    labelInput.style.borderRadius = '4px';
    labelInput.style.boxSizing = 'border-box';

    const sizeSelect = document.createElement('select');
    sizeSelect.style.margin = '4px';
    sizeSelect.style.padding = '6px';
    const sizes = ['S', 'M', 'L', 'XL'];
    const sizeLabels = ['Small', 'Medium', 'Large', 'Extra Large'];
    for (let i = 0; i < sizes.length; i++) {
      const option = document.createElement('option');
      option.value = sizes[i];
      option.innerHTML = sizeLabels[i];
      if (sizes[i] === 'M') option.selected = true;
      sizeSelect.appendChild(option);
    }

    const labelBtn = document.createElement('button');
    labelBtn.innerHTML = '🏷️ Print Label';
    labelBtn.style.margin = '4px';
    labelBtn.style.padding = '8px 16px';
    labelBtn.style.border = 'none';
    labelBtn.style.borderRadius = '4px';
    labelBtn.style.backgroundColor = 'var(--primary-color)';
    labelBtn.style.color = 'var(--text-primary-color)';
    labelBtn.style.cursor = 'pointer';

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = '💡 Label printing combines rotation + vertical layout!';
    infoDiv.style.marginTop = '16px';
    infoDiv.style.padding = '8px';
    infoDiv.style.backgroundColor = 'var(--secondary-background-color)';
    infoDiv.style.borderRadius = '4px';
    infoDiv.style.fontSize = '14px';

    content.appendChild(statusDiv);
    content.appendChild(document.createElement('br'));
    content.appendChild(testBtn);
    content.appendChild(wakeBtn);
    content.appendChild(document.createElement('br'));
    content.appendChild(document.createElement('br'));
    content.appendChild(textInput);
    content.appendChild(printBtn);
    content.appendChild(document.createElement('br'));
    content.appendChild(labelInput);
    content.appendChild(sizeSelect);
    content.appendChild(labelBtn);
    content.appendChild(infoDiv);

    card.appendChild(content);
    root.appendChild(card);

    this._config = config;

    const self = this;

    testBtn.addEventListener('click', function() {
      self.callService('test_print');
    });

    wakeBtn.addEventListener('click', function() {
      self.callService('wake_printer');
    });

    printBtn.addEventListener('click', function() {
      const text = textInput.value;
      if (text.trim()) {
        self.callService('print_text', {
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
    });

    labelBtn.addEventListener('click', function() {
      const text = labelInput.value;
      const size = sizeSelect.value;
      if (text.trim()) {
        self.callService('print_label_text', {
          message: text,
          size: size,
          spacing: 1
        });
      } else {
        alert('Please enter label text');
      }
    });
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
    }
  }

  set hass(hass) {
    this._hass = hass;
    
    const statusSpan = this.shadowRoot.getElementById('status');
    if (statusSpan && this._config && this._config.entity) {
      const entity = hass.states[this._config.entity];
      if (entity) {
        statusSpan.innerHTML = entity.state === 'on' ? 'Online' : 'Offline';
      }
    }
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('thermal-printer-card', ThermalPrinterCard);

if (!window.customCards) {
  window.customCards = [];
}

window.customCards.push({
  type: 'thermal-printer-card',
  name: 'Thermal Printer Card',
  description: 'Basic thermal printer control'
});

console.log('Thermal Printer Card loaded successfully!');
