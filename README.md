[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/Codegnosis/givtcp-battery-card?style=flat-square)

[![Github All Releases](https://img.shields.io/github/downloads/Codegnosis/givtcp-battery-card/total.svg)]()
![Build](https://github.com/Codegnosis/givtcp-battery-card/actions/workflows/build.yml/badge.svg)

# GivTCP Battery Card by [@Codegnosis](https://www.github.com/Codegnosis)

[home-assistant](home-assistant.io) battery card for [GivTCP](https://github.com/britkat1980/giv_tcp) users.

## Requirements

You need to have [GivTCP](https://github.com/britkat1980/giv_tcp) integrated into your [home-assistant](home-assistant.io) (either as an addon or a standalone docker container).
You must have both the `HA_AUTO_D` (Home Assistant Auto Discovery) and `MQTT_OUTPUT` options enabled.

## HACS-Installation

1. [install HACS](https://hacs.xyz/docs/installation/installation) you need to install this first.
2. inside home-assistant go to HACS -> Frontend then click the 3 dots in the upper right hand corner.
3. select Custom repositories from the menu and enter https://github.com/Codegnosis/givtcp-battery-card in the Repository box and select Lovelace for the Category.
4. install the `givtcp-battery-card` using the UI

## Options

| Name   | Type   | Requirement  | Description                  | Default   |
| ------ | ------ | ------------ | ---------------------------- | --------- |
| type   | string | **Required** | `custom:givtcp-battery-card` |
| entity | string | **Required** | Home Assistant entity ID.    | `none`    |
| name   | string | **Optional** | Card name                    | `Battery` |

## Multiple Invertors and Batteries

Multiple invertors and batteries are currently not supported in a single card instance. A separate card for each
invertor is required.
