[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/Codegnosis/givtcp-battery-card?style=flat-square)

[![Github All Releases](https://img.shields.io/github/downloads/Codegnosis/givtcp-battery-card/total.svg)]()
![Build](https://github.com/Codegnosis/givtcp-battery-card/actions/workflows/build.yml/badge.svg)

# GivTCP Battery Card by [@Codegnosis](https://www.github.com/Codegnosis)

[home-assistant](home-assistant.io) battery card for [GivTCP](https://github.com/britkat1980/giv_tcp) users. Displays
some basic stats in a single card:

- SOC %
- SOC wH
- Status (Charge/Discharge/Idle)
- Time left to Charge/Discharge

![Preview](./preview.png)

## Requirements

You need to have [GivTCP](https://github.com/britkat1980/giv_tcp) integrated into your [home-assistant](home-assistant.io) (either as an addon or a standalone docker container).

## HACS-Installation

1. [install HACS](https://hacs.xyz/docs/installation/installation) you need to install this first.
2. inside home-assistant go to HACS -> Frontend then click the 3 dots in the upper right hand corner.
3. select Custom repositories from the menu and enter https://github.com/Codegnosis/givtcp-battery-card in the Repository box and select Lovelace for the Category.
4. install the `givtcp-battery-card` using the UI

## Usage

Edit your chosen dashboard and use the "Add Card" button to select the "GivTCP Battery Card" from the list.

## Options

| Name                           | Type    | Requirement  | Description                                                                       | Default         |
|--------------------------------|---------|--------------|-----------------------------------------------------------------------------------|-----------------|
| type                           | string  | **Required** | `custom:givtcp-battery-card`                                                      |                 |
| entity                         | string  | **Required** | Home Assistant entity ID.                                                         | `none`          |
| name                           | string  | Optional     | Card name                                                                         | `Battery`       |
| soc_threshold_very_high        | number  | Optional     | When SOC is >= this, `soc_threshold_very_high_colour` is used for the icon colour | `80`            |
| soc_threshold_high             | number  | Optional     | When SOC is >= this, `soc_threshold_high_colour` is used for the icon colour      | `60`            |
| soc_threshold_medium           | number  | Optional     | When SOC is >= this, `soc_threshold_medium_colour` is used for the icon colour    | `40`            |
| soc_threshold_low              | number  | Optional     | When SOC is >= this, `soc_threshold_low_colour` is used for the icon colour       | `20`            |
| soc_threshold_very_high_colour | array   | Optional     | RGB value for icon colour when SOC >= `soc_threshold_very_high`                   | `[0, 69, 23]`   |
| soc_threshold_high_colour      | array   | Optional     | RGB value for icon colour when SOC >= `soc_threshold_high`                        | `[67, 160, 71]` |
| soc_threshold_medium_colour    | array   | Optional     | RGB value for icon colour when SOC >= `soc_threshold_medium`                      | `[255, 166, 0]` |
| soc_threshold_low_colour       | array   | Optional     | RGB value for icon colour when SOC >= `soc_threshold_low`                         | `[219, 68, 55]` |
| soc_threshold_very_low_colour  | array   | Optional     | RGB value for icon colour when SOC < `soc_threshold_low`                          | `[94, 0, 0]`    |
| display_abs_power              | boolean | Optional     | Display the battery power usage as an absolute (unsigned integer) value           | `false`         |

## Raw YAML example

```yaml
type: custom:givtcp-battery-card
name: Battery
soc_threshold_very_high: 80
soc_threshold_high: 60
soc_threshold_medium: 40
soc_threshold_low: 20
soc_threshold_very_high_colour:
  - 0
  - 69
  - 23
soc_threshold_high_colour:
  - 67
  - 160
  - 71
soc_threshold_medium_colour:
  - 255
  - 166
  - 0
soc_threshold_low_colour:
  - 219
  - 68
  - 55
soc_threshold_very_low_colour:
  - 94
  - 0
  - 0
display_abs_power: false
entity: sensor.givetcp_abc123_invertor_serial_number
```

## Multiple Invertors and Batteries

Multiple invertors and batteries are currently not supported in a single card instance. A separate card for each
invertor is required.
