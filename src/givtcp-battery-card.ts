/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HomeAssistant,
  LovelaceCardEditor,
  LovelaceCard,
  LovelaceCardConfig, fireEvent
} from 'custom-card-helpers';
import { LitElement, html, TemplateResult, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HassEntity } from 'home-assistant-js-websocket';

import {
  DISPLAY_ABS_POWER,
  DISPLAY_DP,
  DISPLAY_TYPE,
  DISPLAY_TYPE_OPTIONS, ICON_STATUS_CHARGING, ICON_STATUS_DISCHARGING, ICON_STATUS_IDLE,
  SOC_THRESH_HIGH,
  SOC_THRESH_HIGH_COLOUR,
  SOC_THRESH_LOW,
  SOC_THRESH_LOW_COLOUR,
  SOC_THRESH_MED,
  SOC_THRESH_MED_COLOUR,
  SOC_THRESH_V_HIGH,
  SOC_THRESH_V_HIGH_COLOUR,
  SOC_THRESH_V_LOW_COLOUR,
  DISPLAY_BATTERY_RATES,
  USE_CUSTOM_DOD,
  CUSTOM_DOD,
  CALCULATE_RESERVE_FROM_DOD,
  DISPLAY_CUSTOM_DOD_STATS,
} from "./constants";

import './components/countdown'
import './editor';
import { styleCss } from './style';

import { version } from '../package.json';
import {ConfigUtils} from "./config-utils";
import {GivTcpBatteryStats} from "./types";

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'givtcp-battery-card',
  name: 'GivTCP Battery Card',
  description: 'A card to display GivTCP battery info',
});

/* eslint no-console: 0 */
console.info(
  `%c GIVTCP-BATTERY-CARD %c ${version}`,
  'color: green; font-weight: bold; background: black',
  'color: green; font-weight: bold;',
);

@customElement('givtcp-battery-card')
export class GivTCPBatteryCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('givtcp-battery-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // Properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property() hass!: HomeAssistant;

  @state() private config!: LovelaceCardConfig;

  private calculatedStates!: GivTcpBatteryStats;

  firstUpdated() {
    if(this?.shadowRoot) {
      const battPower = this.shadowRoot.getElementById('gtpc-battery-detail-battery-power');
      this._attacheEventListener(battPower)

      const socIcon = this.shadowRoot.getElementById('gtpc-battery-detail-soc-icon');
      this._attacheEventListener(socIcon)

      const socText = this.shadowRoot.getElementById('gtpc-battery-detail-soc-text');
      this._attacheEventListener(socText)

      const socKwhText = this.shadowRoot.getElementById('gtpc-battery-detail-soc-kwh-text');
      this._attacheEventListener(socKwhText)
    }
  }

  private _attacheEventListener(elem: HTMLElement | null): void {
    if (elem && (elem instanceof HTMLElement)) {
      elem.addEventListener('click', (e: MouseEvent) => {
        const type = elem.getAttribute('data-entity-id');
        if (type) {
          e.stopPropagation();
          fireEvent(this, 'hass-more-info', { entityId: type });
        }
      });
    }
  }

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(config: LovelaceCardConfig): void {
    // Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error("Invalid configuration");
    }
    if (!config.entity ) {
      throw new Error('You need to define an invertor entity');
    }

    this.config = {
      ...ConfigUtils.getDefaultConfig(),
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return this.customHasConfigOrEntityChanged(this, changedProps);
  }

  private customHasConfigOrEntityChanged(element: any, changedProps: PropertyValues): boolean {
    if (changedProps.has('config')) {
      return true;
    }

    const entitiesToCheck = [
      'soc',
      'battery_power',
      'soc_kwh',
      'discharge_power',
      'charge_power',
      'battery_charge_rate',
      'battery_discharge_rate',
    ];

    if (element.config?.entity) {
      const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
      if (oldHass) {
        let hasChanges = false;
        for (const e of entitiesToCheck) {
          if (
            oldHass.states[`sensor.${this._getSensorPrefix}${e}`] !==
            element.hass?.states[`sensor.${this._getSensorPrefix}${e}`]
          ) {
            hasChanges = true;
          }
        }
        return hasChanges;
      }
      return true;
    } else {
      return false;
    }
  }

  getCardSize(): number {
    return this.clientHeight > 0 ? Math.ceil(this.clientHeight / 50) : 3;
  }

  setRawValues(): GivTcpBatteryStats {
    const rawSocPercentEntity = this._getSocEntity
    const rawBatteryPowerEntity = this._getBatteryPowerEntity
    const rawSocEnergyEntity = this._getSocKwhEntity
    const rawDischargePowerEntity = this._getDischargePowerEntity
    const rawChargePowerEntity = this._getChargePowerEntity
    const rawBatteryCapacityEntity = this._getBatteryCapacityKwhEntity
    const rawBatteryPowerReserveEntity = this._getBatteryPowerReserve
    const rawBatteryChargeRate = this._getBatteryChargeRate
    const rawBatteryDischargeRate = this._getBatteryDischargeRate

    const socPercent = {
      rawState: rawSocPercentEntity.state,
      uom: rawSocPercentEntity.attributes?.unit_of_measurement,
      value: 0,
      display: 0,
      displayStr: '',
    }

    const batteryPower = {
      rawState: rawBatteryPowerEntity.state,
      uom: rawBatteryPowerEntity.attributes?.unit_of_measurement,
      w: 0,
      kW: 0.0,
      display: 0,
      displayStr: '',
      displayUnit: '',
    }

    const socEnergy = {
      rawState: rawSocEnergyEntity.state,
      uom: rawSocEnergyEntity.attributes?.unit_of_measurement,
      Wh: 0,
      kWh: 0.0,
      display: 0,
      displayStr: '',
    }

    const dischargePower = {
      rawState: rawDischargePowerEntity.state,
      uom: rawDischargePowerEntity.attributes?.unit_of_measurement,
      w: 0,
      kW: 0.0,
      display: 0,
      displayStr: '',
    }

    const chargePower = {
      rawState: rawChargePowerEntity.state,
      uom: rawChargePowerEntity.attributes?.unit_of_measurement,
      w: 0,
      kW: 0.0,
      display: 0,
      displayStr: '',
    }

    const batteryCapacity = {
      rawState: rawBatteryCapacityEntity.state,
      uom: rawBatteryCapacityEntity.attributes?.unit_of_measurement,
      Wh: 0,
      kWh: 0.0,
      display: 0,
      displayStr: '',
    }

    const batteryPowerReservePercent = {
      rawState: rawBatteryPowerReserveEntity.state,
      uom: rawBatteryPowerReserveEntity.attributes?.unit_of_measurement,
      value: 0,
      display: 0,
      displayStr: '',
    }

    const batteryPowerReserveEnergy = {
      Wh: 0,
      kWh: 0.0,
      display: 0,
      displayStr: '',
    }

    const chargeRate  = {
      rawState: rawBatteryChargeRate.state,
      uom: rawBatteryChargeRate.attributes?.unit_of_measurement,
      w: 0,
      kW: 0.0,
      display: 0,
      displayStr: '',
    }

    const dischargeRate  = {
      rawState: rawBatteryDischargeRate.state,
      uom: rawBatteryDischargeRate.attributes?.unit_of_measurement,
      w: 0,
      kW: 0.0,
      display: 0,
      displayStr: '',
    }

    const usableBatteryCapacity= {
      rawState: rawBatteryCapacityEntity.state,
      uom: rawBatteryCapacityEntity.attributes?.unit_of_measurement,
      Wh: 0,
      kWh: 0.0,
      dod: 100.0,
      display: 0,
      displayStr: '',
    }

    return {
      socPercent,
      batteryPower,
      socEnergy,
      dischargePower,
      chargePower,
      batteryCapacity,
      batteryPowerReservePercent,
      batteryPowerReserveEnergy,
      chargeRate,
      dischargeRate,
      usableBatteryCapacity,
      calculatedSocEnergy: socEnergy,
    }
  }

  calculateStats(): void {

    const states = this.setRawValues();
    const displayType = (this.config.display_type !== undefined) ? this.config.display_type : DISPLAY_TYPE;
    const displayAbsPower = (this.config.display_abs_power !== undefined) ? this.config.display_abs_power : DISPLAY_ABS_POWER;
    let dp = parseInt((this.config.display_dp !== undefined) ? this.config.display_dp : DISPLAY_DP, 10);

    const useCustomDod = (this.config.use_custom_dod !== undefined) ? this.config.use_custom_dod : USE_CUSTOM_DOD;
    const customDod = (this.config.custom_dod !== undefined) ? this.config.custom_dod : CUSTOM_DOD;
    const reserveFromDod = (this.config.calculate_reserve_from_dod !== undefined) ? this.config.calculate_reserve_from_dod : CALCULATE_RESERVE_FROM_DOD;

    if(dp > 3) {
      dp = 3;
    }

    if(dp < 1) {
      dp = 1;
    }

    states.socPercent.value = parseInt(states.socPercent.rawState, 10);
    states.socPercent.display = parseInt(states.socPercent.rawState, 10);
    states.socPercent.displayStr = `${parseInt(states.socPercent.rawState, 10)}%`;

    const batteryPowerReservePercent = parseInt(states.batteryPowerReservePercent.rawState, 10);
    states.batteryPowerReservePercent.value = batteryPowerReservePercent;
    states.batteryPowerReservePercent.display = batteryPowerReservePercent;
    states.batteryPowerReservePercent.displayStr = `${batteryPowerReservePercent}%`;

    const batteryCapacityKwh = parseFloat(states.batteryCapacity.rawState);
    const batteryCapacityWh = batteryCapacityKwh * 1000;
    states.batteryCapacity.kWh = batteryCapacityKwh;
    states.batteryCapacity.Wh = batteryCapacityWh;

    const batteryPowerReserveEnergyWh = Math.round(batteryCapacityWh * (batteryPowerReservePercent / 100))
    const batteryPowerReserveEnergyKWh = this.convertToKillo(batteryPowerReserveEnergyWh, 3);
    states.batteryPowerReserveEnergy.Wh = batteryPowerReserveEnergyWh;
    states.batteryPowerReserveEnergy.kWh = batteryPowerReserveEnergyKWh;

    const batteryPowerRaw = (states.batteryPower.uom === "W") ? parseInt(states.batteryPower.rawState, 10) : parseFloat(states.batteryPower.rawState);
    const batteryPowerW = (states.batteryPower.uom === "W") ? batteryPowerRaw : batteryPowerRaw * 1000;
    const batteryPowerKW = (states.batteryPower.uom === "W") ? this.convertToKillo(batteryPowerRaw, 3) : batteryPowerRaw;
    states.batteryPower.w = batteryPowerW;
    states.batteryPower.kW = batteryPowerKW;

    const chargePowerRaw = (states.chargePower.uom === "W") ? parseInt(states.chargePower.rawState, 10) : parseFloat(states.chargePower.rawState);
    const chargePowerW = (states.chargePower.uom === "W") ? chargePowerRaw : chargePowerRaw * 1000;
    const chargePowerKW = (states.chargePower.uom === "W") ? this.convertToKillo(chargePowerRaw, 3) : chargePowerRaw;
    states.chargePower.w = chargePowerW;
    states.chargePower.kW = chargePowerKW;

    const dischargePowerRaw = (states.dischargePower.uom === "W") ? parseInt(states.dischargePower.rawState, 10) : parseFloat(states.dischargePower.rawState);
    const dischargePowerW = (states.dischargePower.uom === "W") ? dischargePowerRaw : dischargePowerRaw * 1000;
    const dischargePowerKW = (states.dischargePower.uom === "W") ? this.convertToKillo(dischargePowerRaw, 3) : dischargePowerRaw;
    states.dischargePower.w = dischargePowerW;
    states.dischargePower.kW = dischargePowerKW;

    const socEnergyRaw = (states.socEnergy.uom === "Wh") ? parseInt(states.socEnergy.rawState, 10) : parseFloat(states.socEnergy.rawState);
    const socEnergyWh = (states.socEnergy.uom === "Wh") ? socEnergyRaw : socEnergyRaw * 1000;
    const socEnergyKWh = (states.socEnergy.uom === "Wh") ? this.convertToKillo(socEnergyRaw, 3) : socEnergyRaw;
    states.socEnergy.Wh = socEnergyWh;
    states.socEnergy.kWh = socEnergyKWh;

    const chargeRateRaw = (states.chargeRate.uom === "W") ? parseInt(states.chargeRate.rawState, 10) : parseFloat(states.chargeRate.rawState);
    const chargeRateW = (states.chargeRate.uom === "W") ? chargeRateRaw : chargeRateRaw * 1000;
    const chargeRateKW = (states.chargeRate.uom === "W") ? this.convertToKillo(chargeRateRaw, 3) : chargeRateRaw;
    states.chargeRate.w = chargeRateW;
    states.chargeRate.kW = chargeRateKW;

    const dischargeRateRaw = (states.dischargeRate.uom === "W") ? parseInt(states.dischargeRate.rawState, 10) : parseFloat(states.dischargeRate.rawState);
    const dischargeRateW = (states.dischargeRate.uom === "W") ? dischargeRateRaw : dischargeRateRaw * 1000;
    const dischargeRateKW = (states.dischargeRate.uom === "W") ? this.convertToKillo(dischargeRateRaw, 3) : dischargeRateRaw;
    states.dischargeRate.w = dischargeRateW;
    states.dischargeRate.kW = dischargeRateKW;

    // format displays
    switch(displayType) {
      case DISPLAY_TYPE_OPTIONS.WH:
      default:
        states.batteryCapacity.display = batteryCapacityWh;
        states.batteryCapacity.displayStr = `${batteryCapacityWh} Wh`;
        states.batteryPower.display = (displayAbsPower) ? Math.abs(batteryPowerW) : batteryPowerW;
        states.batteryPower.displayStr = `${(displayAbsPower) ? Math.abs(batteryPowerW) : batteryPowerW} W`;
        states.chargePower.display = chargePowerW;
        states.chargePower.displayStr = `${chargePowerW} W`;
        states.dischargePower.display = dischargePowerW;
        states.dischargePower.displayStr = `${dischargePowerW} W`;
        states.socEnergy.display = socEnergyWh;
        states.socEnergy.displayStr = `${socEnergyWh} Wh`;
        states.batteryPowerReserveEnergy.display = batteryPowerReserveEnergyWh;
        states.batteryPowerReserveEnergy.displayStr = `${batteryPowerReserveEnergyWh} Wh`;
        states.batteryPower.displayUnit = 'W';
        states.chargeRate.display = chargeRateW;
        states.chargeRate.displayStr = `${chargeRateW} W`;
        states.dischargeRate.display = dischargeRateW;
        states.dischargeRate.displayStr = `${dischargeRateW} W`;
        break;
      case DISPLAY_TYPE_OPTIONS.KWH:
        states.batteryCapacity.display = this.convertToKillo(batteryCapacityWh, dp);
        states.batteryCapacity.displayStr = `${this.convertToKillo(batteryCapacityWh, dp)} kWh`;
        states.batteryPower.display = (displayAbsPower) ? this.convertToKillo(Math.abs(batteryPowerW), dp) : this.convertToKillo(batteryPowerW, dp);
        states.batteryPower.displayStr = `${(displayAbsPower) ? this.convertToKillo(Math.abs(batteryPowerW), dp) : this.convertToKillo(batteryPowerW, dp)} kW`;
        states.chargePower.display = this.convertToKillo(chargePowerW, dp);
        states.chargePower.displayStr = `${this.convertToKillo(chargePowerW, dp)} kW`;
        states.dischargePower.display = this.convertToKillo(dischargePowerW, dp);
        states.dischargePower.displayStr = `${this.convertToKillo(dischargePowerW, dp)} kW`;
        states.socEnergy.display = this.convertToKillo(socEnergyWh, dp);
        states.socEnergy.displayStr = `${this.convertToKillo(socEnergyWh, dp)} kWh`;
        states.batteryPowerReserveEnergy.display = this.convertToKillo(batteryPowerReserveEnergyWh, dp);
        states.batteryPowerReserveEnergy.displayStr = `${this.convertToKillo(batteryPowerReserveEnergyWh, dp)} kWh`;
        states.batteryPower.displayUnit = 'kW';
        states.chargeRate.display = this.convertToKillo(chargeRateW, dp);
        states.chargeRate.displayStr = `${this.convertToKillo(chargeRateW, dp)} kW`;
        states.dischargeRate.display = this.convertToKillo(dischargeRateW, dp);
        states.dischargeRate.displayStr = `${this.convertToKillo(dischargeRateW, dp)} kW`;
        break;
      case DISPLAY_TYPE_OPTIONS.DYNAMIC:
        states.batteryCapacity.display = (Math.abs(batteryCapacityWh) >= 1000) ? this.convertToKillo(batteryCapacityWh, dp)  : batteryCapacityWh;
        states.batteryCapacity.displayStr = (Math.abs(batteryCapacityWh) >= 1000) ? `${this.convertToKillo(batteryCapacityWh, dp) } kWh` : `${batteryCapacityWh} Wh`;

        states.batteryPower.display = (Math.abs(batteryPowerW) >= 1000) ? ((displayAbsPower) ? this.convertToKillo(Math.abs(batteryPowerW), dp) : this.convertToKillo(batteryPowerW, dp)) : ((displayAbsPower) ? Math.abs(batteryPowerW) : batteryPowerW);
        states.batteryPower.displayStr = (Math.abs(batteryPowerW) >= 1000) ? `${(displayAbsPower) ? this.convertToKillo(Math.abs(batteryPowerW), dp) : this.convertToKillo(batteryPowerW, dp)} kW` : `${(displayAbsPower) ? Math.abs(batteryPowerW) : batteryPowerW} W`;
        states.chargePower.display = (Math.abs(chargePowerW) >= 1000) ? this.convertToKillo(chargePowerW, dp) : chargePowerW;
        states.chargePower.displayStr = (Math.abs(chargePowerW) >= 1000) ? `${this.convertToKillo(chargePowerW, dp)} kW` : `${chargePowerW} W`;
        states.dischargePower.display = (Math.abs(dischargePowerW) >= 1000) ? this.convertToKillo(dischargePowerW, dp) : dischargePowerW;
        states.dischargePower.displayStr = (Math.abs(dischargePowerW) >= 1000) ? `${this.convertToKillo(dischargePowerW, dp)} kW` : `${dischargePowerW} W`;
        states.batteryPower.displayUnit = (Math.abs(batteryPowerW) >= 1000) ? 'kW' : 'W';

        states.batteryPowerReserveEnergy.display = (Math.abs(batteryPowerReserveEnergyWh) >= 1000) ? this.convertToKillo(batteryPowerReserveEnergyWh, dp) : batteryPowerReserveEnergyWh;
        states.batteryPowerReserveEnergy.displayStr = (Math.abs(batteryPowerReserveEnergyWh) >= 1000) ? `${this.convertToKillo(batteryPowerReserveEnergyWh, dp)} kWh` : `${batteryPowerReserveEnergyWh} Wh`;

        states.socEnergy.display = (Math.abs(socEnergyWh) >= 1000) ? this.convertToKillo(socEnergyWh, dp) : socEnergyWh;
        states.socEnergy.displayStr = (Math.abs(socEnergyWh) >= 1000) ? `${this.convertToKillo(socEnergyWh, dp)} kWh` : `${socEnergyWh} Wh`;

        states.chargeRate.display = (Math.abs(chargeRateW) >= 1000) ? this.convertToKillo(chargeRateW, dp) : chargeRateW;
        states.chargeRate.displayStr = (Math.abs(chargeRateW) >= 1000) ? `${this.convertToKillo(chargeRateW, dp)} kW` : `${chargeRateW} W`;
        states.dischargeRate.display = (Math.abs(dischargeRateW) >= 1000) ? this.convertToKillo(dischargeRateW, dp) : dischargeRateW;
        states.dischargeRate.displayStr = (Math.abs(dischargeRateW) >= 1000) ? `${this.convertToKillo(dischargeRateW, dp)} kW` : `${dischargeRateW} W`;
        break;
    }

    states.usableBatteryCapacity.Wh = states.batteryCapacity.Wh;
    states.usableBatteryCapacity.kWh = states.batteryCapacity.kWh;
    states.usableBatteryCapacity.display = states.batteryCapacity.display;
    states.usableBatteryCapacity.displayStr = states.batteryCapacity.displayStr;
    states.calculatedSocEnergy = states.socEnergy;

    if(useCustomDod) {
      // custom DoD calculations
      const dod = parseFloat(customDod) / 100.0;
      const soc = states.socPercent.value / 100.0;
      const usableWh = Math.round(states.usableBatteryCapacity.Wh * dod);
      const usableKwh = this.convertToKillo(usableWh, dp);
      states.usableBatteryCapacity.dod = parseFloat(customDod);
      states.usableBatteryCapacity.Wh = usableWh;
      states.usableBatteryCapacity.kWh = usableKwh;

      const socWh = Math.round(usableWh * soc);
      const socKwh = this.convertToKillo(socWh, 3);
      states.calculatedSocEnergy.Wh = socWh;
      states.calculatedSocEnergy.kWh = socKwh;

      let usableBatteryPowerReserveEnergyWh = 0;
      let usableBatteryPowerReserveEnergyKWh = 0;

      if(reserveFromDod) {
        usableBatteryPowerReserveEnergyWh = Math.round(usableWh * (batteryPowerReservePercent / 100))
        usableBatteryPowerReserveEnergyKWh = this.convertToKillo(usableBatteryPowerReserveEnergyWh, 3);
        states.batteryPowerReserveEnergy.Wh = usableBatteryPowerReserveEnergyWh;
        states.batteryPowerReserveEnergy.kWh = usableBatteryPowerReserveEnergyKWh;
      }

      switch(displayType) {
        case DISPLAY_TYPE_OPTIONS.WH:
        default:
          states.usableBatteryCapacity.display = usableWh;
          states.usableBatteryCapacity.displayStr = `${usableWh} Wh`;
          states.calculatedSocEnergy.display = socWh;
          states.calculatedSocEnergy.displayStr = `${socWh} Wh`;
          if(reserveFromDod) {
            states.batteryPowerReserveEnergy.display = usableBatteryPowerReserveEnergyWh;
            states.batteryPowerReserveEnergy.displayStr = `${usableBatteryPowerReserveEnergyKWh} Wh`;
          }
          break;
        case DISPLAY_TYPE_OPTIONS.KWH:
          states.usableBatteryCapacity.display = usableKwh;
          states.usableBatteryCapacity.displayStr = `${usableKwh} kWh`;
          states.calculatedSocEnergy.display = this.convertToKillo(socWh, dp);
          states.calculatedSocEnergy.displayStr = `${this.convertToKillo(socWh, dp)} kWh`;
          if(reserveFromDod) {
            states.batteryPowerReserveEnergy.display = this.convertToKillo(usableBatteryPowerReserveEnergyWh, dp);
            states.batteryPowerReserveEnergy.displayStr = `${this.convertToKillo(usableBatteryPowerReserveEnergyWh, dp)} kWh`;
          }
          break;
        case DISPLAY_TYPE_OPTIONS.DYNAMIC:
          states.usableBatteryCapacity.display = (Math.abs(usableWh) >= 1000) ? usableKwh : usableWh;
          states.usableBatteryCapacity.displayStr = (Math.abs(usableWh) >= 1000) ? `${usableKwh} kWh` : `${usableWh} Wh`;

          states.calculatedSocEnergy.display = (Math.abs(socWh) >= 1000) ? this.convertToKillo(socWh, dp) : socWh;
          states.calculatedSocEnergy.displayStr = (Math.abs(socWh) >= 1000) ? `${this.convertToKillo(socWh, dp)} kWh` : `${socWh} Wh`;

          if(reserveFromDod) {
            states.batteryPowerReserveEnergy.display = (Math.abs(usableBatteryPowerReserveEnergyWh) >= 1000) ? this.convertToKillo(usableBatteryPowerReserveEnergyWh, dp) : usableBatteryPowerReserveEnergyWh;
            states.batteryPowerReserveEnergy.displayStr = (Math.abs(usableBatteryPowerReserveEnergyWh) >= 1000) ? `${this.convertToKillo(usableBatteryPowerReserveEnergyWh, dp)} kWh` : `${usableBatteryPowerReserveEnergyWh} Wh`;
          }
          break;
      }
    }

    this.calculatedStates = states

  }

  renderReserveAndCapacity(): TemplateResult {

    const useCustomDod = (this.config.use_custom_dod !== undefined) ? this.config.use_custom_dod : USE_CUSTOM_DOD;
    const customDod = (this.config.custom_dod !== undefined) ? this.config.custom_dod : CUSTOM_DOD;
    const displayCustomDod = (this.config.display_custom_dod_stats !== undefined) ? this.config.display_custom_dod_stats : DISPLAY_CUSTOM_DOD_STATS;

    let dod = html``;
    let capacityPrefix = "";
    if(useCustomDod && displayCustomDod) {
      capacityPrefix = "Usable"
      dod = html`
        <div class="status">
          <span class="status-text-small"> DoD: ${customDod}% | Actual Capacity: ${this.calculatedStates.batteryCapacity.displayStr}</span>
        </div>`
    }

    return html`
      <div>
        <div class="status">
          <span class="status-text"> ${capacityPrefix} Capacity: ${this.calculatedStates.usableBatteryCapacity.displayStr} | Reserve: ${this.calculatedStates.batteryPowerReserveEnergy.displayStr} (${this.calculatedStates.batteryPowerReservePercent.displayStr})</span>
        </div>
        ${dod}
      </div>
    `;
  }

  renderRates(): TemplateResult {

    const rates = html`
        <div class="status">
          <span class="status-text status-text-small">Max. Charge Rate: ${this.calculatedStates.chargeRate.displayStr} | Max. Discharge Rate: ${this.calculatedStates.dischargeRate.displayStr}</span>
        </div>
      `;

    let pbColour = "";
    let cl = "progress-bar-fill-n0";
    let perc = 0;
    let dispPerc = 0;
    let p = 0;
    let r = 0;

    if (this.calculatedStates.batteryPower.w > 0) {
      pbColour = "r";
      p = this.calculatedStates.dischargePower.w
      r = this.calculatedStates.dischargeRate.w
    }

    if (this.calculatedStates.batteryPower.w < 0) {
      pbColour = "g";
      p = this.calculatedStates.chargePower.w
      r = this.calculatedStates.chargeRate.w
    }

    if(p > 0 && r > 0) {
      perc = (p / r) * 100;
      const pDp = (perc < 0.1) ? 2 : 1;
      dispPerc = this.roundPercentage(perc, pDp);
      cl = `progress-bar-fill-${pbColour}${Math.floor(dispPerc / 10) * 10}`;
    }

    return html`
      <div>
        <div class="status">
          <span class="status-text status-text-small">${this._getBatteryStatus} @ ${dispPerc}% max. rate</span>
        </div>
        <div class="status">
          <div class="rate-wrapper">
            <div class="progress-bar">
              <span class="progress-bar-fill ${cl}" style="width: ${dispPerc}%;"></span>
            </div>
          </div>
        </div>
        ${rates}
      </div>
    `;
  }

  renderPowerUsage(): TemplateResult {

    let powerColourClass = '';
    let powerSubtitle = html``;

    if (this.calculatedStates.batteryPower.w > 0) {
      powerColourClass = 'battery-power-out';
      powerSubtitle = html`<ha-icon icon="mdi:export"></ha-icon>`;
    }

    if (this.calculatedStates.batteryPower.w < 0) {
      powerColourClass = 'battery-power-in';
      powerSubtitle = html`<ha-icon icon="mdi:import"></ha-icon>`;
    }

    return html`
      <div 
          class="icon-subtitle-small"
          id="gtpc-battery-detail-battery-power"
          data-entity-id="${`sensor.${this._getSensorPrefix}battery_power`}"
      >
        ${powerSubtitle}
        <span class="${powerColourClass}">
          ${this.calculatedStates.batteryPower.display} 
        </span>
        ${this.calculatedStates.batteryPower.displayUnit}
      </div>
    `;
  }

  renderStats(): TemplateResult[] {
    const statsList: TemplateResult[] = [];

    const power = this.calculatedStates.batteryPower.w;

    const estIcon = html`<ha-icon icon="mdi:timer-sand" style="--mdc-icon-size: 17px;"></ha-icon>`
    const timeIcon = html`<ha-icon icon="mdi:clock-outline" style="--mdc-icon-size: 17px;"></ha-icon>`

    let estimatedTimeAction = html`${estIcon} No load`;
    let estimatedTime = 0;

    let timeUntilAction = html`${timeIcon} No Load`;
    let timeUntil = Math.round(Date.now() / 1000);

    if (power > 0) {
      estimatedTimeAction = html`${estIcon} until ${this.calculatedStates.batteryPowerReservePercent.displayStr}`;
      estimatedTime = this._getEstimatedTimeLeft;
      timeUntilAction = html`${timeIcon} at ${this.calculatedStates.batteryPowerReservePercent.displayStr}`;
      timeUntil = this._getEstimatedTimeAtReserve;
    }
    if (power < 0) {
      estimatedTimeAction = html`${estIcon} until 100%`
      estimatedTime = this._getEstimatedChargeTime;
      timeUntilAction = html`${timeIcon} at 100%`;
      timeUntil = this._getEstimatedTimeAtFull;
    }

    let t0 = html`--:--:--`;

    if(power !== 0) {
      t0 = html`
        <givtcp-battery-card-countdown 
            secs=${estimatedTime}
        ></givtcp-battery-card-countdown>
      `;
    }

    const timeLeft = html`
      <div class="stats-block">
        <span class="stats-value"> ${t0} </span>
        <div class="stats-subtitle">${estimatedTimeAction}</div>
      </div>
    `;

    statsList.push(timeLeft);

    let formattedUntil = '--:--'

    if(power !== 0) {
      const timeUntilDate = new Date(timeUntil * 1000);

      const timeUntilTime = timeUntilDate.toLocaleString(
          'en-GB',
          {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false }
      );

      formattedUntil = `${timeUntilTime}`;

      if(estimatedTime > 86400) {
        const dateUntil = timeUntilDate.toLocaleString(
            'en-GB',
            {
              day: 'numeric',
              month: 'numeric'}
        );

        formattedUntil = `${dateUntil} ${timeUntilTime}`;
      }
    }

    const timeUntilBlock = html`
      <div class="stats-block">
        <span class="stats-value">${formattedUntil}</span>
        <div class="stats-subtitle">${timeUntilAction}</div>
      </div>
    `;

    statsList.push(timeUntilBlock);

    return statsList;
  }

  renderNameAndStatus(): TemplateResult {

    const status = this._getBatteryStatus.toUpperCase();

    return html` <div class="battery-name">${this.config.name || 'Battery'} | ${status}</div> `;
  }

  getBatteryIcon(): string {
    const socInt = this.calculatedStates.socPercent.value;
    const prefix = '';

    if (socInt === 100) {
      return 'mdi:battery';
    }

    if(socInt < 10) {
      return `mdi:battery${prefix}-outline`;
    }

    const suffix = Math.floor(socInt / 10) * 10

    return `mdi:battery${prefix}-${suffix}`;
  }

  getBatteryStatusIcon(): string {

    const iconCharging = (this.config?.icon_status_charging) ? this.config.icon_status_charging : ICON_STATUS_CHARGING;
    const iconDisharging = (this.config?.icon_status_discharging) ? this.config.icon_status_discharging : ICON_STATUS_DISCHARGING;
    const iconIdle = (this.config?.icon_status_idle) ? this.config.icon_status_idle : ICON_STATUS_IDLE;

    switch (this._getBatteryStatus) {
      default:
        return '';
      case 'charging':
        return iconCharging;
      case 'discharging':
        return iconDisharging;
      case 'idle':
        return iconIdle;
    }
  }

  getBatteryColour(): string {
    const socInt = this.calculatedStates.socPercent.value;

    const socVH = (this.config?.soc_threshold_very_high) ? this.config.soc_threshold_very_high : SOC_THRESH_V_HIGH;
    const socH = (this.config?.soc_threshold_high) ? this.config.soc_threshold_high : SOC_THRESH_HIGH;
    const socM = (this.config?.soc_threshold_medium) ? this.config.soc_threshold_medium : SOC_THRESH_MED;
    const socL = (this.config?.soc_threshold_low) ? this.config.soc_threshold_low : SOC_THRESH_LOW;

    const socVHCol = (this.config?.soc_threshold_very_high_colour) ? this.config.soc_threshold_very_high_colour : SOC_THRESH_V_HIGH_COLOUR;
    const socHCol = (this.config?.soc_threshold_high_colour) ? this.config.soc_threshold_high_colour : SOC_THRESH_HIGH_COLOUR;
    const socMCol = (this.config?.soc_threshold_medium_colour) ? this.config.soc_threshold_medium_colour : SOC_THRESH_MED_COLOUR;
    const socLCol = (this.config?.soc_threshold_low_colour) ? this.config.soc_threshold_low_colour : SOC_THRESH_LOW_COLOUR;
    const socVLCol = (this.config?.soc_threshold_very_low_colour) ? this.config.soc_threshold_very_low_colour : SOC_THRESH_V_LOW_COLOUR;

    if (socInt >= socVH) {
      return `${socVHCol[0]}, ${socVHCol[1]}, ${socVHCol[2]}`;
    } else if (socInt >= socH) {
      return `${socHCol[0]}, ${socHCol[1]}, ${socHCol[2]}`;
    } else if (socInt >= socM) {
      return `${socMCol[0]}, ${socMCol[1]}, ${socMCol[2]}`;
    } else if (socInt >= socL) {
      return `${socLCol[0]}, ${socLCol[1]}, ${socLCol[2]}`;
    } else {
      return `${socVLCol[0]}, ${socVLCol[1]}, ${socVLCol[2]}`;
    }
  }

  convertToKillo(num: number, dp: number): number {
    const mult = 10 ** dp;

    if(num !== 0) {
      const numK = num / 1000;
      return Math.round((numK + Number.EPSILON) * mult) / mult;
    }

    return 0;
  }

  roundPercentage(num: number, dp: number): number {
    const mult = 10 ** dp;

    if(num !== 0) {
      return Math.round((num + Number.EPSILON) * mult) / mult;
    }

    return 0;
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    if (!this.config?.entity) {
      return html``;
    }

    let batteryRateData = html``;
    const displayBatteryRates = (this.config.display_battery_rates !== undefined) ? this.config.display_battery_rates : DISPLAY_BATTERY_RATES;

    this.calculateStats()

    const batteryIcon = this.getBatteryIcon();
    const batteryStatusIcon = this.getBatteryStatusIcon();
    const batteryIconColour = this.getBatteryColour();

    if(displayBatteryRates) {
      batteryRateData = html`
        <div class="metadata">
          ${this.renderRates()}
        </div>
      `
    }

    return html`
      <ha-card>
        <div class="preview">
          <div class="metadata">
            ${this.renderNameAndStatus()}
            ${this.renderReserveAndCapacity()}
          </div>

          <div class="stats-wrapper">
            <div
                data-entity-id="${`sensor.${this._getSensorPrefix}soc`}"
                id="gtpc-battery-detail-soc-icon"
                class="stats-col"
            >
              <div class="battery-icon-wrapper">
                <div style="margin: auto; width: 15px;">
                </div>
                <div style="margin: auto;">
                  <ha-icon
                      icon="${batteryStatusIcon}"
                      style="--mdc-icon-size: 45px;"
                  ></ha-icon>
                </div>
                <div style="margin: auto;">
                  <ha-icon
                      icon="${batteryIcon}"
                      style="color:rgb(${batteryIconColour});--mdc-icon-size: 100px;"
                  ></ha-icon>
                </div>
              </div>
              
            </div>
            
            <div class="stats-col">
              <span class="icon-info">
                <span 
                    class="icon-title"
                    data-entity-id="${`sensor.${this._getSensorPrefix}soc`}"
                    id="gtpc-battery-detail-soc-text"
                > 
                  ${this.calculatedStates.socPercent.displayStr} 
                </span>
                <span 
                    class="icon-subtitle"
                    data-entity-id="${`sensor.${this._getSensorPrefix}soc_kwh`}"
                    id="gtpc-battery-detail-soc-kwh-text"
                > 
                  ${this.calculatedStates.calculatedSocEnergy.displayStr} 
                </span>
                  ${this.renderPowerUsage()}
              </span>
            </div>

            <div class="stats-col">
              <div class="stats">
                ${this.renderStats()}
              </div>
            </div>
          </div>

          ${batteryRateData}
          
        </div>
      </ha-card>
    `;
  }

  private get _getSensorPrefix(): string {
    let prefix = '';
    let suffix = '';
    const prefixMatch = /sensor\.([\w]+)_invertor_serial_number/g.exec(this.config.entity);
    if (prefixMatch) {
      prefix = prefixMatch[1];
    }

    const suffixMatch = /sensor\.[\w]+_invertor_serial_number_(\d+)/g.exec(this.config.entity);
    if (suffixMatch) {
      suffix = '_' + suffixMatch[1];
    }

    return `${prefix}_${suffix}`;
  }

  private get _getSocEntity(): HassEntity {
    return this.hass.states[`sensor.${this._getSensorPrefix}soc`];
  }

  private get _getBatteryPowerEntity(): HassEntity {
    // can be W or kW
    return this.hass.states[`sensor.${this._getSensorPrefix}battery_power`];
  }

  private get _getSocKwhEntity(): HassEntity {
    // can be Wh or kWh
    return this.hass.states[`sensor.${this._getSensorPrefix}soc_kwh`];
  }

  private get _getDischargePowerEntity(): HassEntity {
    // can be W or kW
    return this.hass.states[`sensor.${this._getSensorPrefix}discharge_power`];
  }

  private get _getChargePowerEntity(): HassEntity {
    // can be W or kW
    return this.hass.states[`sensor.${this._getSensorPrefix}charge_power`];
  }

  private get _getBatteryCapacityKwhEntity(): HassEntity {
    return this.hass.states[`sensor.${this._getSensorPrefix}battery_capacity_kwh`];
  }

  private get _getBatteryPowerReserve(): HassEntity {
    return this.hass.states[`number.${this._getSensorPrefix}battery_power_reserve`];
  }

  private get _getBatteryChargeRate(): HassEntity {
    return this.hass.states[`number.${this._getSensorPrefix}battery_charge_rate`];
  }

  private get _getBatteryDischargeRate(): HassEntity {
    return this.hass.states[`number.${this._getSensorPrefix}battery_discharge_rate`];
  }

  private get _getBatteryStatus(): string {
    const power = parseInt(this._getBatteryPowerEntity.state, 10);

    let status = '';
    if (power > 0) {
      status = 'discharging';
    } else if (power < 0) {
      status = 'charging';
    } else {
      status = 'idle';
    }

    return status;
  }

  private get _getEstimatedTimeLeft(): number {
    let timeSecs = 0;
    const socWatts = this.calculatedStates.calculatedSocEnergy.Wh;
    const capacity = this.calculatedStates.usableBatteryCapacity.Wh;
    const reserve = this.calculatedStates.batteryPowerReservePercent.value / 100;
    const dischargePower = this.calculatedStates.dischargePower.w;

    const reserveWatts = capacity * reserve;
    const socWattsLessReserve = socWatts - reserveWatts;

    if (socWattsLessReserve > 0 && dischargePower > 0) {
      const diffP = socWattsLessReserve / dischargePower;
      timeSecs = Math.floor(diffP * 3600);
    }

    return timeSecs;
  }

  private get _getEstimatedChargeTime(): number {
    let timeSecs = 0;
    const chargePower = this.calculatedStates.chargePower.w;
    const socWatts = this.calculatedStates.calculatedSocEnergy.Wh;
    const capacityWatts = this.calculatedStates.usableBatteryCapacity.Wh;

    if (chargePower > 0) {
      const socDiff = capacityWatts - socWatts;
      const diffP = socDiff / chargePower;
      timeSecs = Math.floor(diffP * 3600);
    }

    return timeSecs;
  }

  private get _getEstimatedTimeAtReserve(): number {
    const timeNow = Math.round(Date.now() / 1000);
    return timeNow + this._getEstimatedTimeLeft
  }

  private get _getEstimatedTimeAtFull(): number {
    const timeNow = Math.round(Date.now() / 1000);
    return timeNow + this._getEstimatedChargeTime
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return styleCss;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'givtcp-battery-card': GivTCPBatteryCard;
  }
}
