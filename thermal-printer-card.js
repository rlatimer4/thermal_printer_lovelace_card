class JuraCoffeeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = {};
  }

  setConfig(config) {
    if (!config.entities || !config.entities.power) {
      throw new Error('You need to define entities.power');
    }
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  render() {
    const style = `
      <style>
        :host {
          display: block;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-radius: 16px;
          padding: 20px;
          color: white;
          font-family: var(--paper-font-body1_-_font-family);
          box-shadow: var(--ha-card-box-shadow, 0 8px 32px rgba(0, 0, 0, 0.3));
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .machine-icon {
          font-size: 2em;
          color: #e67e22;
          animation: steam 2s ease-in-out infinite alternate;
        }

        @keyframes steam {
          0% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(-3px); opacity: 0.8; }
        }

        .machine-title {
          font-size: 1.4em;
          font-weight: 600;
          margin: 0;
          margin-left: 10px;
        }

        .power-switch {
          background: #27ae60;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          color: white;
          font-size: 1.2em;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .power-switch:hover {
          background: #2ecc71;
          transform: scale(1.1);
        }

        .power-switch.off {
          background: #e74c3c;
        }

        .power-switch.off:hover {
          background: #c0392b;
        }

        .screen-display {
          background: #1a252f;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
          border: 2px solid #34495e;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .screen-title {
          font-size: 1.2em;
          color: #3498db;
          margin-bottom: 5px;
          text-align: center;
        }

        .brewing-status {
          font-size: 0.9em;
          color: #e67e22;
          text-align: center;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
          min-height: 200px;
        }

        .coffee-button {
          background: linear-gradient(145deg, #3498db, #2980b9);
          border: none;
          border-radius: 12px;
          color: white;
          padding: 15px 8px;
          font-size: 0.85em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }

        .coffee-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
        }

        .coffee-button:active {
          transform: translateY(0px);
        }

        .coffee-button.brewing {
          background: linear-gradient(145deg, #e67e22, #d35400);
          animation: pulse 1s ease-in-out infinite;
        }

        .coffee-button.menu {
          background: linear-gradient(145deg, #9b59b6, #8e44ad);
        }

        .coffee-button.disabled {
          background: #7f8c8d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .coffee-button .button-icon {
          font-size: 1.5em;
          margin-bottom: 5px;
        }

        .stats-section {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 15px;
          margin-top: 15px;
        }

        .stats-title {
          font-size: 1em;
          font-weight: 600;
          margin-bottom: 10px;
          color: #ecf0f1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .stat-item {
          text-align: center;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .stat-label {
          font-size: 0.8em;
          color: #bdc3c7;
          margin-bottom: 2px;
        }

        .stat-value {
          font-size: 1.1em;
          font-weight: 600;
          color: #ecf0f1;
        }

        .connection-status {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 15px;
          font-size: 0.9em;
          color: #95a5a6;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #27ae60;
          margin-right: 8px;
          animation: blink 2s linear infinite;
        }

        .status-indicator.offline {
          background: #e74c3c;
          animation: none;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      </style>
    `;

    const html = `
      <div class="card-content">
        <!-- Header -->
        <div class="card-header">
          <div style="display: flex; align-items: center;">
            <div class="machine-icon">☕</div>
            <h3 class="machine-title">${this._config.name || 'Jura Coffee'}</h3>
          </div>
          <button class="power-switch" id="powerButton">
            <span id="powerIcon">⚡</span>
          </button>
        </div>

        <!-- Screen Display -->
        <div class="screen-display">
          <div class="screen-title" id="screenTitle">Coffee Screen 1</div>
          <div class="brewing-status" id="brewingStatus" style="display: none;">
            ⏱️ Brewing... <span id="brewTimer">0s</span>
          </div>
        </div>

        <!-- Button Grid -->
        <div class="button-grid">
          <!-- Top Row -->
          <button class="coffee-button" id="topLeft">
            <div class="button-icon" id="topLeftIcon">☕</div>
            <span id="topLeftLabel">Espresso</span>
          </button>
          <button class="coffee-button" id="topRight">
            <div class="button-icon" id="topRightIcon">☕</div>
            <span id="topRightLabel">Coffee</span>
          </button>
          
          <!-- Middle Row -->
          <button class="coffee-button" id="middleLeft">
            <div class="button-icon" id="middleLeftIcon">☕</div>
            <span id="middleLeftLabel">Ristretto</span>
          </button>
          <button class="coffee-button" id="middleRight">
            <div class="button-icon" id="middleRightIcon">💧</div>
            <span id="middleRightLabel">Hot Water</span>
          </button>
          
          <!-- Bottom Row -->
          <button class="coffee-button menu" id="bottomLeft">
            <div class="button-icon" id="bottomLeftIcon">📋</div>
            <span id="bottomLeftLabel">Menu</span>
          </button>
          <button class="coffee-button menu" id="bottomRight">
            <div class="button-icon" id="bottomRightIcon">➡️</div>
            <span id="bottomRightLabel">Next</span>
          </button>
        </div>

        <!-- Statistics Section -->
        <div class="stats-section" id="statsSection">
          <div class="stats-title">📊 Coffee Statistics</div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Single Espresso</div>
              <div class="stat-value" id="singleEspressoCount">-</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Double Espresso</div>
              <div class="stat-value" id="doubleEspressoCount">-</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Coffee</div>
              <div class="stat-value" id="coffeeCount">-</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Double Coffee</div>
              <div class="stat-value" id="doubleCoffeeCount">-</div>
            </div>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="connection-status" id="connectionStatus">
          <div class="status-indicator" id="statusIndicator"></div>
          <span id="connectionText">Connected</span>
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = style + html;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Power button
    const powerButton = this.shadowRoot.getElementById('powerButton');
    powerButton.addEventListener('click', () => this.togglePower());

    // Coffee buttons
    const buttons = ['topLeft', 'topRight', 'middleLeft', 'middleRight', 'bottomLeft', 'bottomRight'];
    buttons.forEach(buttonId => {
      const button = this.shadowRoot.getElementById(buttonId);
      button.addEventListener('click', () => this.pressButton(buttonId));
    });
  }

  updateCard() {
    if (!this._hass || !this._config.entities) return;

    // Update power status
    this.updatePowerStatus();
    
    // Update screen display
    this.updateScreenDisplay();
    
    // Update button labels
    this.updateButtonLabels();
    
    // Update statistics
    this.updateStatistics();
    
    // Update connection status
    this.updateConnectionStatus();
  }

  updatePowerStatus() {
    const powerEntity = this._hass.states[this._config.entities.power];
    const powerButton = this.shadowRoot.getElementById('powerButton');
    const powerIcon = this.shadowRoot.getElementById('powerIcon');

    if (powerEntity && powerEntity.state === 'on') {
      powerButton.classList.remove('off');
      powerIcon.textContent = '⚡';
    } else {
      powerButton.classList.add('off');
      powerIcon.textContent = '⭕';
    }
  }

  updateScreenDisplay() {
    const screenEntity = this._hass.states[this._config.entities.current_screen];
    const brewingEntity = this._hass.states[this._config.entities.is_brewing];
    const timerEntity = this._hass.states[this._config.entities.brew_timer];

    const screenTitle = this.shadowRoot.getElementById('screenTitle');
    const brewingStatus = this.shadowRoot.getElementById('brewingStatus');
    const brewTimer = this.shadowRoot.getElementById('brewTimer');

    // Update screen title
    if (screenEntity) {
      screenTitle.textContent = screenEntity.state;
    }

    // Update brewing status
    if (brewingEntity && brewingEntity.state === 'on') {
      brewingStatus.style.display = 'block';
      if (timerEntity) {
        brewTimer.textContent = Math.round(parseFloat(timerEntity.state)) + 's';
      }
    } else {
      brewingStatus.style.display = 'none';
    }
  }

  updateButtonLabels() {
    const buttons = [
      { id: 'topLeft', entity: this._config.entities.top_left_function },
      { id: 'topRight', entity: this._config.entities.top_right_function },
      { id: 'middleLeft', entity: this._config.entities.middle_left_function },
      { id: 'middleRight', entity: this._config.entities.middle_right_function },
      { id: 'bottomLeft', entity: this._config.entities.bottom_left_function },
      { id: 'bottomRight', entity: this._config.entities.bottom_right_function }
    ];

    const brewingEntity = this._hass.states[this._config.entities.is_brewing];
    const isBrewing = brewingEntity && brewingEntity.state === 'on';

    buttons.forEach(button => {
      const buttonElement = this.shadowRoot.getElementById(button.id);
      const labelElement = this.shadowRoot.getElementById(button.id + 'Label');
      const iconElement = this.shadowRoot.getElementById(button.id + 'Icon');
      
      if (button.entity && this._hass.states[button.entity]) {
        const functionText = this._hass.states[button.entity].state;
        labelElement.textContent = functionText;

        // Update icons based on function
        const icon = this.getIconForFunction(functionText);
        iconElement.textContent = icon;

        // Handle button states
        if (functionText === 'N/A' || functionText === '') {
          buttonElement.classList.add('disabled');
        } else {
          buttonElement.classList.remove('disabled');
        }

        // Add brewing animation for relevant buttons
        if (isBrewing && (button.id === 'middleLeft' || button.id === 'middleRight')) {
          buttonElement.classList.add('brewing');
        } else {
          buttonElement.classList.remove('brewing');
        }
      }
    });
  }

  updateStatistics() {
    const stats = [
      { id: 'singleEspressoCount', entity: this._config.entities.stats?.single_espresso },
      { id: 'doubleEspressoCount', entity: this._config.entities.stats?.double_espresso },
      { id: 'coffeeCount', entity: this._config.entities.stats?.coffee },
      { id: 'doubleCoffeeCount', entity: this._config.entities.stats?.double_coffee }
    ];

    stats.forEach(stat => {
      if (stat.entity && this._hass.states[stat.entity]) {
        const element = this.shadowRoot.getElementById(stat.id);
        element.textContent = Math.round(parseFloat(this._hass.states[stat.entity].state));
      }
    });
  }

  updateConnectionStatus() {
    const indicator = this.shadowRoot.getElementById('statusIndicator');
    const text = this.shadowRoot.getElementById('connectionText');
    
    // Check if main entities are available
    const powerEntity = this._hass.states[this._config.entities.power];
    const isConnected = powerEntity && powerEntity.last_updated;

    if (isConnected) {
      indicator.classList.remove('offline');
      text.textContent = 'Connected';
    } else {
      indicator.classList.add('offline');
      text.textContent = 'Offline';
    }
  }

  getIconForFunction(functionText) {
    const iconMap = {
      'Espresso': '☕',
      'Coffee': '☕',
      'Ristretto': '☕',
      'Hot Water': '💧',
      'Cappuccino': '☕',
      'Flat White': '☕',
      'Latte Macchiato': '☕',
      '1 Portion Milk': '🥛',
      'Clean': '🧽',
      'Clean Milk': '🧽',
      'Descale': '🔧',
      'Filter Status': '🔍',
      'Rinse Milk': '🧽',
      'Rinse Coffee': '🧽',
      'Information': 'ℹ️',
      'Filter': '🔧',
      'Expert Mode': '⚙️',
      'Language': '🌐',
      'Switch Off After': '⏰',
      'Units': '📏',
      'Water Hardness': '💧',
      'Menu': '📋',
      'Return': '↩️',
      'Next': '➡️',
      'Cancel': '❌',
      'Strength +': '💪',
      'Strength -': '👇',
      'Volume +': '🔊',
      'Volume -': '🔉'
    };
    
    return iconMap[functionText] || '❓';
  }

  togglePower() {
    const powerEntity = this._config.entities.power;
    const currentState = this._hass.states[powerEntity].state;
    const service = currentState === 'on' ? 'turn_off' : 'turn_on';
    
    this._hass.callService('switch', service, {
      entity_id: powerEntity
    });
  }

  pressButton(buttonId) {
    const buttonMap = {
      'topLeft': this._config.entities.buttons?.top_left,
      'topRight': this._config.entities.buttons?.top_right,
      'middleLeft': this._config.entities.buttons?.middle_left,
      'middleRight': this._config.entities.buttons?.middle_right,
      'bottomLeft': this._config.entities.buttons?.bottom_left,
      'bottomRight': this._config.entities.buttons?.bottom_right
    };

    const entityId = buttonMap[buttonId];
    if (entityId) {
      this._hass.callService('button', 'press', {
        entity_id: entityId
      });
    }
  }

  getCardSize() {
    return 6; // Height in grid rows
  }

  static get properties() {
    return {
      hass: Object,
      config: Object
    };
  }
}

// Register the custom card
customElements.define('jura-coffee-card', JuraCoffeeCard);

// Add card to Home Assistant card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'jura-coffee-card',
  name: 'Jura Coffee Machine Card',
  description: 'A custom card for controlling Jura coffee machines via ESPHome',
  preview: false, // Optional: set to true if you provide a preview image
  documentationURL: 'https://github.com/rlatimer4/esphome-components/tree/master/components/jura'
});

console.info(
  `%c  JURA-COFFEE-CARD %c  Version 1.0.0  `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
