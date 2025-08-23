# Thermal Printer Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/yourusername/thermal-printer-card)](https://github.com/yourusername/thermal-printer-card/releases)
[![GitHub](https://img.shields.io/github/license/yourusername/thermal-printer-card)](LICENSE)

A comprehensive custom Lovelace card for controlling ESPHome thermal printers in Home Assistant.

![Thermal Printer Card Screenshot](images/card-screenshot.png)

## Features

🖨️ **Complete Printer Control**
- Real-time paper status monitoring with visual indicators
- Wake/Sleep printer management
- Test printing and paper feeding
- Usage tracking with progress bar

📝 **Advanced Text Printing**
- Multiple text sizes (Small, Medium, Large)
- Text formatting (Bold, Underline, Inverse)
- Text alignment (Left, Center, Right)
- Rich text input with live preview

📊 **Two-Column Layout**
- Receipt-style printing with dot leaders
- Perfect for invoices and price lists
- Customizable spacing and alignment

📱 **Barcode Generation**
- 9 barcode types supported (UPC-A, UPC-E, EAN13, EAN8, CODE39, ITF, CODABAR, CODE93, CODE128)
- Real-time validation
- Easy barcode data entry

📈 **Usage Analytics**
- Paper usage visualization with color-coded progress bar
- Statistics tracking (lines, characters, millimeters)
- Usage reset functionality
- Percentage tracking based on roll length

🎨 **Modern UI Design**
- Home Assistant theme integration
- Responsive layout (mobile and desktop)
- Collapsible sections to save space
- Smooth animations and transitions

## Requirements

- **Home Assistant** 0.115.0 or newer
- **ESPHome Thermal Printer** integration (custom component required)
- **Compatible thermal printer** (58mm thermal printers)
- **ESP8266/ESP32** device running ESPHome

## Installation

### Method 1: HACS (Recommended)

1. **Install via HACS:**
   - Go to HACS → Frontend
   - Click "Explore & Download Repositories"
   - Search for "Thermal Printer Card"
   - Click "Download"
   - Restart Home Assistant

2. **Add to Lovelace:**
   - Go to your dashboard
   - Click "Edit Dashboard"
   - Click "Add Card"
   - Find "Custom: Thermal Printer Card"

### Method 2: Manual Installation

1. **Download the card:**
   - Download `thermal-printer-card.js` from the [latest release](https://github.com/yourusername/thermal-printer-card/releases)

2. **Install the card:**
   ```bash
   # Copy to www directory
   cp thermal-printer-card.js /config/www/
   ```

3. **Add resource:**
   - Go to Settings → Dashboards → Resources
   - Click "Add Resource"
   - URL: `/local/thermal-printer-card.js`
   - Resource type: JavaScript Module

## Configuration

### Basic Configuration

```yaml
type: custom:thermal-printer-card
entity: switch.thermal_printer_printer_wake
title: "Kitchen Printer"
```

### Advanced Configuration

```yaml
type: custom:thermal-printer-card
entity: switch.thermal_printer_printer_wake
title: "Thermal Printer Control"
paper_sensor: binary_sensor.thermal_printer_paper_loaded
paper_text_sensor: text_sensor.thermal_printer_paper_status  
usage_sensor: sensor.thermal_printer_paper_usage_percent
usage_mm_sensor: sensor.thermal_printer_paper_usage_mm
lines_sensor: sensor.thermal_printer_lines_printed
chars_sensor: sensor.thermal_printer_characters_printed
```

### Configuration Options

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `entity` | Yes | - | Main printer entity (usually switch) |
| `title` | No | "Thermal Printer" | Card header title |
| `paper_sensor` | No | Auto-detected | Binary sensor for paper status |
| `paper_text_sensor` | No | Auto-detected | Text sensor for paper status |
| `usage_sensor` | No | Auto-detected | Usage percentage sensor |
| `usage_mm_sensor` | No | Auto-detected | Usage in mm sensor |  
| `lines_sensor` | No | Auto-detected | Lines printed sensor |
| `chars_sensor` | No | Auto-detected | Characters printed sensor |

## ESPHome Integration Required

This card requires the **ESPHome Thermal Printer** custom component. See the [ESPHome Thermal Printer documentation](https://github.com/yourusername/esphome-thermal-printer) for setup instructions.

### Quick ESPHome Setup

```yaml
# In your ESPHome device YAML
external_components:
  - source:
      type: local
      path: my_components

uart:
  tx_pin: GPIO4  # D2 on D1 Mini
  rx_pin: GPIO0  # D3 on D1 Mini
  baud_rate: 9600

thermal_printer:
  id: my_thermal_printer
```

## Usage Examples

### Basic Receipt Printing

Use the card's text printing section to create receipts:

1. **Enter text** in the text area
2. **Select formatting** (size, alignment, bold, etc.)
3. **Click "Print Text"**

### Two-Column Layouts

Perfect for price lists and invoices:

1. **Open "Two-Column Printing" section**
2. **Enter left and right text**
3. **Enable "Fill with dots" for price lists**
4. **Click "Print Two Columns"**

Result: `Coffee..................$3.50`

### Barcode Printing

1. **Open "Barcode Printing" section**
2. **Select barcode type** (CODE128 recommended)
3. **Enter barcode data**
4. **Click "Print Barcode"**

### Usage Monitoring

The card automatically displays:
- **Paper usage progress bar** with color coding
- **Real-time statistics** (lines, characters, mm used)
- **Paper status indicator** (Present/Out)

## Troubleshooting

### Card Not Loading
- **Check HACS installation** - Ensure the card is properly installed
- **Clear browser cache** - Hard refresh (Ctrl+F5)
- **Check browser console** for JavaScript errors

### Services Not Working
- **Verify ESPHome device** is online and responding
- **Check entity names** match your ESPHome configuration
- **Ensure thermal printer** is connected and powered

### Printer Not Responding
- **Check power supply** - Thermal printers need 5V 2A minimum
- **Verify wiring** - Ensure TX/RX pins are correct
- **Test communication** - Use ESPHome logs to debug

## Screenshots

### Main Interface
![Main Interface](images/main-interface.png)

### Text Printing
![Text Printing](images/text-printing.png)

### Usage Analytics  
![Usage Analytics](images/usage-analytics.png)

### Barcode Printing
![Barcode Printing](images/barcode-printing.png)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/yourusername/thermal-printer-card.git
cd thermal-printer-card
# Edit thermal-printer-card.js
# Test in Home Assistant
```

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/thermal-printer-card/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/thermal-printer-card/discussions)
- **Home Assistant Community:** [Community Forum Thread](https://community.home-assistant.io/t/thermal-printer-card)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0 (2025-08-23)
- Initial release
- Full thermal printer control interface
- Paper usage tracking
- Two-column text formatting
- Barcode printing support
- Modern responsive UI

## Related Projects

- [ESPHome Thermal Printer Component](https://github.com/yourusername/esphome-thermal-printer) - Required backend integration
- [Home Assistant](https://github.com/home-assistant/core) - Home automation platform
- [ESPHome](https://github.com/esphome/esphome) - ESP8266/ESP32 firmware

---

**Made with ❤️ for the Home Assistant community**
