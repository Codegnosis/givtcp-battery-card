[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=flat-square)](https://github.com/custom-components/hacs)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/Codegnosis/givtcp-battery-card?style=flat-square)
[![Github All Releases](https://img.shields.io/github/downloads/Codegnosis/givtcp-battery-card/total.svg)]()
![Build](https://github.com/Codegnosis/givtcp-battery-card/actions/workflows/build.yml/badge.svg)

# GivTCP Battery Card by [@Codegnosis](https://www.github.com/Codegnosis)

[home-assistant](home-assistant.io) battery card for [GivTCP](https://github.com/britkat1980/giv_tcp) users. Displays
some basic stats in a single card:

- SOC %
- SOC Wh/kWh
- Status (Charge/Discharge/Idle)
- Current usage (in/out)
- Status context countdown/Time left until full charge or discharge (to reserve)
- Status context estimated date/time of full charge or discharge (to reserve)

![Preview](./preview.png)

## Requirements

You need to have [GivTCP](https://github.com/britkat1980/giv_tcp) integrated into your [home-assistant](home-assistant.io) (either as an addon or a standalone docker container).

## HACS-Installation

**`givtcp-battery-card` is now included in the HACS Default repository**

### HACS Default Installation (Recommended)

1. [install HACS](https://hacs.xyz/docs/installation/installation) you need to install this first.
2. inside home-assistant go to HACS -> Frontend and click "Explore & Download Repositories"
3. Search for "givtcp-battery-card" & install using the UI

### Manual Installation

Alternatively, manually install by adding it as a custom repository.

1. [install HACS](https://hacs.xyz/docs/installation/installation) you need to install this first.
2. inside home-assistant go to HACS -> Frontend then click the 3 dots in the upper right hand corner.
3. select Custom repositories from the menu and enter https://github.com/Codegnosis/givtcp-battery-card in the Repository box and select Lovelace for the Category.
4. install the `givtcp-battery-card` using the UI

## Usage

Edit your chosen dashboard and use the "Add Card" button to select the "GivTCP Battery Card" from the list.

## Options

| Name                           | Type      | Requirement  | Description                                                                                                 | Default              |
|--------------------------------|-----------|--------------|-------------------------------------------------------------------------------------------------------------|----------------------|
| type                           | string    | **Required** | `custom:givtcp-battery-card`                                                                                |                      |
| entity                         | string    | **Required** | Home Assistant entity ID.                                                                                   | `none`               |
| name                           | string    | Optional     | Card name                                                                                                   | `Battery`            |
| soc_threshold_very_high        | number    | Optional     | When SOC is >= this, `soc_threshold_very_high_colour` is used for the icon colour                           | `80`                 |
| soc_threshold_high             | number    | Optional     | When SOC is >= this, `soc_threshold_high_colour` is used for the icon colour                                | `60`                 |
| soc_threshold_medium           | number    | Optional     | When SOC is >= this, `soc_threshold_medium_colour` is used for the icon colour                              | `40`                 |
| soc_threshold_low              | number    | Optional     | When SOC is >= this, `soc_threshold_low_colour` is used for the icon colour                                 | `20`                 |
| soc_threshold_very_high_colour | array     | Optional     | RGB value for icon colour when SOC >= `soc_threshold_very_high`                                             | `[0, 69, 23]`        |
| soc_threshold_high_colour      | array     | Optional     | RGB value for icon colour when SOC >= `soc_threshold_high`                                                  | `[67, 160, 71]`      |
| soc_threshold_medium_colour    | array     | Optional     | RGB value for icon colour when SOC >= `soc_threshold_medium`                                                | `[255, 166, 0]`      |
| soc_threshold_low_colour       | array     | Optional     | RGB value for icon colour when SOC >= `soc_threshold_low`                                                   | `[219, 68, 55]`      |
| soc_threshold_very_low_colour  | array     | Optional     | RGB value for icon colour when SOC < `soc_threshold_low`                                                    | `[94, 0, 0]`         |
| display_abs_power              | boolean   | Optional     | Display the battery power usage as an absolute (unsigned integer) value                                     | `false`              |
| display_type                   | number    | Optional     | Display type. 0: Wh, 1: kWh, 2: Dynamic                                                                     | `3`                  |
| display_dp                     | number    | Optional     | Round to decimal places for `display_type` kWh or Dynamic. 1 - 3                                            | `3`                  |
| icon_status_idle               | string    | Optional     | Icon for Idle battery status                                                                                | `mdi:sleep`          |
| icon_status_charging           | string    | Optional     | Icon for Charging battery status                                                                            | `mdi:lightning-bolt` |
| icon_status_discharging        | string    | Optional     | Icon for Discharging battery status                                                                         | `mdi:home-battery`   |
| display_battery_rates          | boolean   | Optional     | Display charge/dischare rate as % and graphical bar                                                         | `true`               |
| use_custom_dod                 | boolean   | Optional     | Use custom DoD % to override GivTCP capacity & SoC values                                                   | `false`              |
| custom_dod                     | number    | Optional     | Custom DoD value as a percentage. Used when `use_custom_dod` is `true`                                      | `100`                |
| calculate_reserve_from_dod     | boolean   | Optional     | Use custom DoD value to also calculate the battery reserve value. Note - using this also affects the timers | `false `             |
| display_custom_dod_stats       | boolean   | Optional     | Display the derived custom DoD (capacity and reserve) stats                                                 | `true`               |
| display_energy_today           | boolean   | Optional     | Display statistics for daily charge/discharge                                                               | `true`               |

## Raw YAML example

```yaml
type: custom:givtcp-battery-card
entity: sensor.givtcp_abc123_invertor_serial_number
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
display_type: 3
display_dp: 3
icon_status_idle: mdi:sleep
icon_status_charging: mdi:lightning-bolt
icon_status_discharging: mdi:home-battery
display_battery_rates: true
use_custom_dod: true
custom_dod: 95
calculate_reserve_from_dod: true
display_custom_dod_stats: true
display_energy_today: true
```

## Multiple Invertors and Batteries

Multiple invertors and batteries are currently not supported in a single card instance. A separate card for each
invertor is required.
