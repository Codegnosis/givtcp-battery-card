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
  DISPLAY_TYPE_OPTIONS,
  ICON_STATUS_CHARGING,
  ICON_STATUS_DISCHARGING,
  ICON_STATUS_IDLE,
  SOC_THRESH_HIGH,
  SOC_THRESH_HIGH_COLOUR,
  SOC_THRESH_LOW,
  SOC_THRESH_LOW_COLOUR,
  SOC_THRESH_MED,
  SOC_THRESH_MED_COLOUR,
  SOC_THRESH_V_HIGH,
  SOC_THRESH_V_HIGH_COLOUR,
  SOC_THRESH_V_LOW_COLOUR,
  SOC_COLOUR_INPUT,
  DISPLAY_BATTERY_RATES,
  USE_CUSTOM_DOD,
  CUSTOM_DOD,
  CALCULATE_RESERVE_FROM_DOD,
  DISPLAY_CUSTOM_DOD_STATS,
  DISPLAY_UNITS, DISPLAY_ENERGY_TODAY, SOC_COLOUR_INPUT_TYPES, SENSORS_USED,
} from "./constants";

import './components/countdown'
import './editor';
import { styleCss } from './style';

import { version } from '../package.json';
import {ConfigUtils} from "./config-utils";
import {GivSensorPrefixSuffix, GivTcpBatteryStats, GivTcpCheckEntityResult, GivTcpStats} from "./types";

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'givtcp-battery-card',
  name: 'GivTCP Battery Card',
  description: 'A card to display GivTCP battery info',
});

/* eslint no-console: 0 */
console.info(
  `%c GIVTCP-BATTERY-CARD %c v${version} `,
  'color: green; font-weight: bold; background: black',
  'color: black; font-weight: bold; background: green',
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

    if (element.config?.entity) {
      const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
      if (oldHass) {
        let hasChanges = false;
        for (const e of SENSORS_USED) {
          const eName = `${e.type}.${this._getSensorPrefix?.prefix}${e.name}${this._getSensorPrefix?.suffix}`
          if (
            oldHass.states[eName] !== element.hass?.states[eName]
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

  getDp(): number {
    let dp = parseInt((this.config.display_dp !== undefined) ? this.config.display_dp : DISPLAY_DP, 10);
    if(dp > 3) {
      dp = 3;
    }

    if(dp < 1) {
      dp = 1;
    }
    return dp;
  }

  getPercentageStats(entity: HassEntity): GivTcpStats {
    const s = entity.state
    const uom = entity.attributes?.unit_of_measurement;
    return {
      source: entity.entity_id,
      rawState: s,
      uom: uom,
      value: parseInt(s, 10),
      kValue: 0,
      display: parseInt(s, 10),
      displayStr: `${parseInt(s, 10)}%`,
      displayUnit: "%",
    }
  }

  getStandardisedUom(uom: string | undefined): string {

    if(!uom) {
      return "";
    }

    switch(uom.toLowerCase()) {
      case "w":
        return DISPLAY_UNITS.W;
      case "wh":
        return DISPLAY_UNITS.WH;
      case "kw":
        return DISPLAY_UNITS.KW;
      case "kwh":
        return DISPLAY_UNITS.KWH;
      default:
        return uom;
    }
  }

  isWorWh(uom: string): boolean {
    return (uom === DISPLAY_UNITS.W || uom === DISPLAY_UNITS.WH);
  }

  isPowerUom(uom: string): boolean {
    return (uom === DISPLAY_UNITS.W || uom === DISPLAY_UNITS.KW);
  }

  getGivTcpStats(entityOrValue: HassEntity | string, uomRaw: string | undefined): GivTcpStats {

    let state = ""
    let source = ""
    if(typeof entityOrValue === "string") {
      state = entityOrValue
      source = "calculated"
    } else {
      state = entityOrValue.state
      source = entityOrValue.entity_id
    }

    const displayType = (this.config.display_type !== undefined) ? this.config.display_type : DISPLAY_TYPE;
    const displayAbsPower = (this.config.display_abs_power !== undefined) ? this.config.display_abs_power : DISPLAY_ABS_POWER;
    const dp = this.getDp();

    const uom = this.getStandardisedUom(uomRaw);

    const rawAsNum = this.isWorWh(uom) ? parseInt(state, 10) : parseFloat(state);
    const value = this.isWorWh(uom) ? rawAsNum : rawAsNum * 1000;
    const kValue = this.isWorWh(uom) ? this.convertToKillo(rawAsNum, 3) : rawAsNum;
    const displayK = this.convertToKillo(value, dp);

    const displayUom = this.isPowerUom(uom) ? DISPLAY_UNITS.W : DISPLAY_UNITS.WH;
    const displayKUom = this.isPowerUom(uom) ? DISPLAY_UNITS.KW : DISPLAY_UNITS.KWH;

    let display = 0;
    let displayStr = "";
    let displayUnit = "";

    switch(displayType) {
      case DISPLAY_TYPE_OPTIONS.WH:
      default:
        display = (displayAbsPower) ? Math.abs(value) : value;
        displayStr = `${(displayAbsPower) ? Math.abs(value) : value} ${displayUom}`;
        displayUnit = displayUom;
        break;
      case DISPLAY_TYPE_OPTIONS.KWH:
        display = (displayAbsPower) ? Math.abs(displayK) : displayK;
        displayStr = `${(displayAbsPower) ? Math.abs(displayK) : displayK} ${displayKUom}`;
        displayUnit = displayKUom;
        break;
      case DISPLAY_TYPE_OPTIONS.DYNAMIC:
        display = (Math.abs(value) >= 1000) ? ((displayAbsPower) ? Math.abs(displayK) : displayK) : ((displayAbsPower) ? Math.abs(value) : value);
        displayStr = (Math.abs(value) >= 1000) ? `${(displayAbsPower) ? Math.abs(displayK) : displayK} ${displayKUom}` : `${(displayAbsPower) ? Math.abs(value) : value} ${displayUom}`;
        displayUnit = (Math.abs(value) >= 1000) ? displayKUom : displayUom;
        break;
    }

    return {
      source: source,
      rawState: state,
      uom: uom,
      value: value,
      kValue: kValue,
      display: display,
      displayStr: displayStr,
      displayUnit: displayUnit,
    }
  }

  calculateStats(): void {
    const useCustomDod = (this.config.use_custom_dod !== undefined) ? this.config.use_custom_dod : USE_CUSTOM_DOD;
    const customDod = (this.config.custom_dod !== undefined) ? this.config.custom_dod : CUSTOM_DOD;
    const reserveFromDod = (this.config.calculate_reserve_from_dod !== undefined) ? this.config.calculate_reserve_from_dod : CALCULATE_RESERVE_FROM_DOD;

    const states = <GivTcpBatteryStats>{};

    states.socPercent = this.getPercentageStats(this._getSocEntity);
    states.batteryPowerReservePercent = this.getPercentageStats(this._getBatteryPowerReserve);
    states.batteryPower = this.getGivTcpStats(this._getBatteryPowerEntity, this._getBatteryPowerEntity.attributes?.unit_of_measurement);
    states.dischargePower = this.getGivTcpStats(this._getDischargePowerEntity, this._getDischargePowerEntity.attributes?.unit_of_measurement);
    states.chargePower = this.getGivTcpStats(this._getChargePowerEntity, this._getChargePowerEntity.attributes?.unit_of_measurement);
    states.chargeRate = this.getGivTcpStats(this._getBatteryChargeRate, this._getBatteryChargeRate.attributes?.unit_of_measurement);
    states.dischargeRate = this.getGivTcpStats(this._getBatteryDischargeRate, this._getBatteryDischargeRate.attributes?.unit_of_measurement);

    states.batteryCapacity = this.getGivTcpStats(this._getBatteryCapacityKwhEntity, DISPLAY_UNITS.KWH);

    states.socEnergy = this.getGivTcpStats(this._getSocKwhEntity, this._getSocKwhEntity.attributes?.unit_of_measurement);

    states.chargeEnergyToday = this.getGivTcpStats(this._getChargeEnergyTodayEntity, this._getChargeEnergyTodayEntity.attributes?.unit_of_measurement);
    states.dischargeEnergyToday = this.getGivTcpStats(this._getDischargeEnergyTodayEntity, this._getDischargeEnergyTodayEntity.attributes?.unit_of_measurement);

    // post process DOD
    let dod = (useCustomDod) ? Math.abs(parseFloat(customDod)) / 100.0 : 1.0;
    if(dod > 1) {
      dod = 1.0
    }

    const soc = states.socPercent.value / 100.0;
    const usableWh = Math.round(states.batteryCapacity.value * dod);

    states.usableBatteryCapacity = this.getGivTcpStats(usableWh.toString(), DISPLAY_UNITS.WH);
    const socWh = Math.round(usableWh * soc);
    states.calculatedSocEnergy = this.getGivTcpStats(socWh.toString(), DISPLAY_UNITS.WH);

    let batteryPowerReserveEnergyWh = Math.round(states.batteryCapacity.value * (states.batteryPowerReservePercent.value / 100))

    if(reserveFromDod) {
      batteryPowerReserveEnergyWh = Math.round(usableWh * (states.batteryPowerReservePercent.value / 100))
    }

    states.batteryPowerReserveEnergy = this.getGivTcpStats(batteryPowerReserveEnergyWh.toString(), DISPLAY_UNITS.WH);

    // Usage charge/discharge as % of rates
    let perc = 0;
    let dispPerc = 0;
    let p = 0;
    let r = 0;

    if (states.batteryPower.value > 0) {
      p = states.dischargePower.value
      r = states.dischargeRate.value
    }

    if (states.batteryPower.value < 0) {
      p = states.chargePower.value
      r = states.chargeRate.value
    }

    if(p > 0 && r > 0) {
      perc = (p / r) * 100;
    }

    dispPerc = this.roundPercentage(perc, ((perc < 0.1) ? 2 : 1));

    states.batteryUsageRatePercent = {
      source: "calculated",
      rawState: perc.toString(),
      uom: "%",
      value: perc,
      kValue: perc,
      display: (dispPerc > 100) ? 100 : dispPerc,
      displayStr: `${(dispPerc > 100) ? 100 : dispPerc}%`,
      displayUnit: "%",
    }

    this.calculatedStates = states;
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

    const pbColour = (this.calculatedStates.batteryPower.value > 0) ? "error" : "success";

    return html`
      <div>
        <div class="status">
          <span class="status-text status-text-small">${this._getBatteryStatus} @ ${this.calculatedStates.batteryUsageRatePercent.displayStr} max. rate</span>
        </div>
        <div class="status">
          <div class="rate-wrapper">
            <div class="progress-bar">
              <span class="progress-bar-fill" style="background-color: var(--${pbColour}-color); width: ${this.calculatedStates.batteryUsageRatePercent.displayStr};"></span>
            </div>
          </div>
        </div>
        ${rates}
      </div>
    `;
  }

  renderEnergyToday(): TemplateResult {

    const displayEnergyToday = (this.config.display_energy_today !== undefined) ? this.config.display_energy_today : DISPLAY_ENERGY_TODAY;

    if(!displayEnergyToday) {
      return html``;
    }

    return html`
      <div>
        <div class="status">
          <span class="status-text status-text-small">Charge Today: ${this.calculatedStates.chargeEnergyToday.displayStr} | Discharge Today: ${this.calculatedStates.dischargeEnergyToday.displayStr}</span>
        </div>
      </div>
      `
  }

  renderPowerUsage(): TemplateResult {

    let powerColourClass = '';
    let powerSubtitle = html``;

    if (this.calculatedStates.batteryPower.value > 0) {
      powerColourClass = 'battery-power-out';
      powerSubtitle = html`<ha-icon icon="mdi:export"></ha-icon>`;
    }

    if (this.calculatedStates.batteryPower.value < 0) {
      powerColourClass = 'battery-power-in';
      powerSubtitle = html`<ha-icon icon="mdi:import"></ha-icon>`;
    }

    return html`
      <div 
          class="icon-subtitle-small"
          id="gtpc-battery-detail-battery-power"
          data-entity-id="${`sensor.${this._getSensorPrefix?.prefix}_battery_power${this._getSensorPrefix?.suffix}`}"
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

    const power = this.calculatedStates.batteryPower.value;

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

    const socInputType = (this.config?.soc_colour_input) ? this.config.soc_colour_input : SOC_COLOUR_INPUT;

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
      return (socInputType === SOC_COLOUR_INPUT_TYPES.THEME_VAR) ? socVHCol : `${socVHCol[0]}, ${socVHCol[1]}, ${socVHCol[2]}`;
    } else if (socInt >= socH) {
      return (socInputType === SOC_COLOUR_INPUT_TYPES.THEME_VAR) ? socHCol : `${socHCol[0]}, ${socHCol[1]}, ${socHCol[2]}`;
    } else if (socInt >= socM) {
      return (socInputType === SOC_COLOUR_INPUT_TYPES.THEME_VAR) ? socMCol : `${socMCol[0]}, ${socMCol[1]}, ${socMCol[2]}`;
    } else if (socInt >= socL) {
      return (socInputType === SOC_COLOUR_INPUT_TYPES.THEME_VAR) ? socLCol : `${socLCol[0]}, ${socLCol[1]}, ${socLCol[2]}`;
    } else {
      return (socInputType === SOC_COLOUR_INPUT_TYPES.THEME_VAR) ? socVLCol : `${socVLCol[0]}, ${socVLCol[1]}, ${socVLCol[2]}`;
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

  renderSensorsNotFound(sensorsNotFound: string[]): TemplateResult[] {
    const notFoundList: TemplateResult[] = [];
    for(let i = 0; i < sensorsNotFound.length; i += 1) {
      notFoundList.push(
          html`<p style="text-align: left; padding-left: 10px;">${sensorsNotFound[i]}</p>`
      )
    }
    return notFoundList;
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    if (!this.config?.entity) {
      return html``;
    }

    // First check status of each required sensor. If any annot be found/return undefined, then
    // display the error to the user
    const checkEntityStatuses = this._checkSensorsAvailable()
    const sensorsNotFound: string[] = []
    for(let i = 0; i < checkEntityStatuses.length; i++) {
      if(!checkEntityStatuses[i].found) {
        sensorsNotFound.push(checkEntityStatuses[i].sensor)
      }
    }

    if(sensorsNotFound.length > 0) {
      return html`
        <ha-card>
          <div class="preview">
            <p>GivTCP Battery Card Could not find the following required entities. 
              Please check your HASS entity configurations and ensure they are enabled.</p>

              ${this.renderSensorsNotFound(sensorsNotFound)}
          </div>
        </ha-card>`;
    }

    let batteryRateData = html``;
    const displayBatteryRates = (this.config.display_battery_rates !== undefined) ? this.config.display_battery_rates : DISPLAY_BATTERY_RATES;

    this.calculateStats()

    const socInputType = (this.config?.soc_colour_input) ? this.config.soc_colour_input : SOC_COLOUR_INPUT;
    const batteryIcon = this.getBatteryIcon();
    const batteryStatusIcon = this.getBatteryStatusIcon();
    const batteryIconColour = this.getBatteryColour();
    const batteryIconStyle = (socInputType === SOC_COLOUR_INPUT_TYPES.THEME_VAR) ? `var(${batteryIconColour})` : `rgb(${batteryIconColour})`


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
            ${this.renderEnergyToday()}
          </div>

          <div class="stats-wrapper">
            <div
                data-entity-id="${`sensor.${this._getSensorPrefix?.prefix}_soc${this._getSensorPrefix?.suffix}`}"
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
                      style="color:${batteryIconStyle};--mdc-icon-size: 100px;"
                  ></ha-icon>
                </div>
              </div>
              
            </div>
            
            <div class="stats-col">
              <span class="icon-info">
                <span 
                    class="icon-title"
                    data-entity-id="${`sensor.${this._getSensorPrefix?.prefix}_soc${this._getSensorPrefix?.suffix}`}"
                    id="gtpc-battery-detail-soc-text"
                > 
                  ${this.calculatedStates.socPercent.displayStr} 
                </span>
                <span 
                    class="icon-subtitle"
                    data-entity-id="${`sensor.${this._getSensorPrefix?.prefix}_soc_kwh${this._getSensorPrefix?.suffix}`}"
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

  private get _getSensorPrefix(): GivSensorPrefixSuffix | undefined {
    const name = { prefix: '', suffix: '' };
    const prefixMatch = /sensor\.([\w]+)_invertor_serial_number/g.exec(this.config.entity);
    if (prefixMatch) {
      name.prefix = prefixMatch[1];
    }

    const suffixMatch = /sensor\.[\w]+_invertor_serial_number_(\d+)/g.exec(this.config.entity);
    if (suffixMatch) {
      name.suffix = '_' + suffixMatch[1];
    }

    return name.suffix === '' && name.prefix === '' ? undefined : name;
  }

  private _getGivTcpEntity(entType: string, entName: string): HassEntity {
    const s = `${entType}.${this._getSensorPrefix?.prefix}${entName}${this._getSensorPrefix?.suffix}`
    return this.hass.states[s];
  }

  private get _getSocEntity(): HassEntity {
    return this._getGivTcpEntity('sensor', '_soc')
  }

  private get _getBatteryPowerEntity(): HassEntity {
    // can be W or kW
    return this._getGivTcpEntity('sensor', '_battery_power')
  }

  private get _getSocKwhEntity(): HassEntity {
    // can be Wh or kWh
    return this._getGivTcpEntity('sensor', '_soc_kwh')
  }

  private get _getDischargePowerEntity(): HassEntity {
    // can be W or kW
    return this._getGivTcpEntity('sensor', '_discharge_power')
  }

  private get _getChargePowerEntity(): HassEntity {
    // can be W or kW
    return this._getGivTcpEntity('sensor', '_charge_power')
  }

  private get _getBatteryCapacityKwhEntity(): HassEntity {
    return this._getGivTcpEntity('sensor', '_battery_capacity_kwh')
  }

  private get _getBatteryPowerReserve(): HassEntity {
    return this._getGivTcpEntity('number', '_battery_power_reserve')
  }

  private get _getBatteryChargeRate(): HassEntity {
    return this._getGivTcpEntity('number', '_battery_charge_rate')
  }

  private get _getBatteryDischargeRate(): HassEntity {
    return this._getGivTcpEntity('number', '_battery_discharge_rate')
  }

  private get _getChargeEnergyTodayEntity(): HassEntity {
    return this._getGivTcpEntity('sensor', '_battery_charge_energy_today_kwh')
  }

  private get _getDischargeEnergyTodayEntity(): HassEntity {
    return this._getGivTcpEntity('sensor', '_battery_discharge_energy_today_kwh')
  }

  private _checkSensorAlive(entType: string, entName: string): GivTcpCheckEntityResult {
    const r: GivTcpCheckEntityResult = {
      sensor: `${entType}.${this._getSensorPrefix?.prefix}${entName}${this._getSensorPrefix?.suffix}`,
      found: false
    }
    try {
      const s = this._getGivTcpEntity(entType, entName)
      r.found = s !== undefined;
    } catch(e) {
      r.found = false
    }

    return r
  }

  private _checkSensorsAvailable(): GivTcpCheckEntityResult[] {
    const results: GivTcpCheckEntityResult[] = []

    for(let i = 0; i < SENSORS_USED.length; i += 1) {
      const s = SENSORS_USED[i]
      const r = this._checkSensorAlive(s.type, s.name)
      results.push(r)
    }

    return results
  }

  private get _getBatteryStatus(): string {

    const power = this.calculatedStates.batteryPower.value;

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
    const socWatts = this.calculatedStates.calculatedSocEnergy.value;
    const capacity = this.calculatedStates.usableBatteryCapacity.value;
    const reserve = this.calculatedStates.batteryPowerReservePercent.value / 100;
    const dischargePower = this.calculatedStates.dischargePower.value;

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
    const chargePower = this.calculatedStates.chargePower.value;
    const socWatts = this.calculatedStates.calculatedSocEnergy.value;
    const capacityWatts = this.calculatedStates.usableBatteryCapacity.value;

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
