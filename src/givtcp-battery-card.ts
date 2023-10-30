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
  DISPLAY_KWH,
  SOC_THRESH_HIGH,
  SOC_THRESH_HIGH_COLOUR,
  SOC_THRESH_LOW,
  SOC_THRESH_LOW_COLOUR,
  SOC_THRESH_MED,
  SOC_THRESH_MED_COLOUR,
  SOC_THRESH_V_HIGH,
  SOC_THRESH_V_HIGH_COLOUR,
  SOC_THRESH_V_LOW_COLOUR
} from "./constants";

import './components/countdown'
import './editor';
import { styleCss } from './style';

import { version } from '../package.json';
import {ConfigUtils} from "./config-utils";

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

  firstUpdated() {
    if(this?.shadowRoot) {
      const battPower = this.shadowRoot.getElementById('gtpc-battery-detail-battery-power');
      this._attacheEventListener(battPower)

      const soc = this.shadowRoot.getElementById('gtpc-battery-detail-soc');
      this._attacheEventListener(soc)
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
      `soc`,
      `battery_power`,
      `soc_kwh`,
      `discharge_power`,
      `charge_power`,
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

  renderReserveAndCapacity(): TemplateResult {
    const reserve = this._getBatteryPowerReserve.state;
    const reserveWatts = Math.round(this._getReserveWatts);
    const capacity = parseFloat(this._getBatteryCapacityKwhEntity.state) * 1000;

    return html`
      <div class="status">
        <span class="status-text"> Capacity: ${this.convertDisplayUnit(capacity)} ${this.getDisplayUnit()} | Reserve: ${this.convertDisplayUnit(reserveWatts)} ${this.getDisplayUnit()} (${reserve}%) </span>
      </div>
    `;
  }

  renderPowerUsage(): TemplateResult {

    const power = parseInt(this._getBatteryPowerEntity.state, 10);
    let powerColourClass = '';
    let powerSubtitle = html`<ha-icon icon="mdi:pause-box-outline"></ha-icon>`;

    const displayAbsPower = (this.config.display_abs_power !== undefined) ? this.config.display_abs_power : DISPLAY_ABS_POWER;

    const p = (displayAbsPower) ? Math.abs(power) : power;

    if (power > 0) {
      powerColourClass = 'battery-power-out';
      powerSubtitle = html`<ha-icon icon="mdi:export"></ha-icon>`;
    }

    if (power < 0) {
      powerColourClass = 'battery-power-in';
      powerSubtitle = html`<ha-icon icon="mdi:import"></ha-icon>`;
    }

    return html`
      <div class="icon-subtitle-small">
        ${powerSubtitle}
        <span class="${powerColourClass}">
          ${this.convertDisplayUnit(p)} 
        </span>
        ${this.getDisplayUnit()}
      </div>
    `;
  }

  renderStats(): TemplateResult[] {
    const statsList: TemplateResult[] = [];

    const power = parseInt(this._getBatteryPowerEntity.state, 10);

    let estimatedTimeAction = 'No load';
    let estimatedTime = 0;

    let timeUntilAction = 'No Load';
    let timeUntil = Math.round(Date.now() / 1000);

    if (power > 0) {
      estimatedTimeAction = `Time left`;
      estimatedTime = this._getEstimatedTimeLeft;
      timeUntilAction = `Time @ ${this._getBatteryPowerReserve.state}%`;
      timeUntil = this._getEstimatedTimeAtReserve;
    }
    if (power < 0) {
      estimatedTimeAction = 'Time left'
      estimatedTime = this._getEstimatedChargeTime;
      timeUntilAction = `Time @ 100%`;
      timeUntil = this._getEstimatedTimeAtFull;
    }

    let t0 = html`0`;

    if(estimatedTime > 0) {
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

    const timeUntilDate = new Date(timeUntil * 1000);

    const timeUntilTime = timeUntilDate.toLocaleString(
        'en-GB',
        {
          hour: 'numeric',
          minute: 'numeric',
          hour12: false }
    );

    let formattedUntil = timeUntilTime;

    if(estimatedTime > 86400) {
      const dateUntil = timeUntilDate.toLocaleString(
          'en-GB',
          {
            day: 'numeric',
            month: 'numeric'}
      );

      formattedUntil = `${dateUntil} ${timeUntilTime}`;
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
    const socInt = parseInt(this._getSocEntity.state, 10);
    const prefix = this._getBatteryStatus === 'charging' ? '-charging' : '';

    if (socInt === 100) {
      return 'mdi:battery';
    }

    if(socInt < 10) {
      return `mdi:battery${prefix}-outline`;
    }

    const suffix = Math.floor(socInt / 10) * 10

    return `mdi:battery${prefix}-${suffix}`;
  }

  getBatteryColour(): string {
    const socInt = parseInt(this._getSocEntity.state, 10);

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

  getDisplayUnit(): string {
    const displayKWh = (this.config.display_kwh !== undefined) ? this.config.display_kwh : DISPLAY_KWH;
    if(displayKWh) {
      return "kWh";
    }
    return "Wh";
  }

  convertDisplayUnit(num: number): number {
    const displayKWh = (this.config.display_kwh !== undefined) ? this.config.display_kwh : DISPLAY_KWH;

    if(num === 0 || !displayKWh) {
      return num;
    }

    return num / 1000;
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    if (!this.config?.entity) {
      return html``;
    }

    const batteryIcon = this.getBatteryIcon();
    const batteryIconColour = this.getBatteryColour();

    const soc = parseInt(this._getSocEntity.state, 10);
    const socWh = Math.round(parseFloat(this._getSocKwhEntity.state) * 1000);

    return html`
      <ha-card>
        <div class="preview">
          <div class="metadata">
            ${this.renderNameAndStatus()}
            ${this.renderReserveAndCapacity()}
          </div>

          <div class="stats-wrapper">
            <div class="stats">
              <div 
                  class="stats-block" 
                  data-entity-id="${`sensor.${this._getSensorPrefix}soc`}"
                  id="gtpc-battery-detail-soc"
              >
                <ha-icon icon="${batteryIcon}" style="color:rgb(${batteryIconColour});--mdc-icon-size: 110px;"></ha-icon>
                <span class="icon-info">
                  <span class="icon-title"> ${soc}% </span>
                  <span class="icon-subtitle"> ${this.convertDisplayUnit(socWh)} ${this.getDisplayUnit()} </span>
                  ${this.renderPowerUsage()}
                </span>
              </div>
            </div>

            <div class="stats">${this.renderStats()}</div>
          </div>
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
    return this.hass.states[`sensor.${this._getSensorPrefix}battery_power`];
  }

  private get _getSocKwhEntity(): HassEntity {
    return this.hass.states[`sensor.${this._getSensorPrefix}soc_kwh`];
  }

  private get _getDischargePowerEntity(): HassEntity {
    return this.hass.states[`sensor.${this._getSensorPrefix}discharge_power`];
  }

  private get _getChargePowerEntity(): HassEntity {
    return this.hass.states[`sensor.${this._getSensorPrefix}charge_power`];
  }

  private get _getBatteryCapacityKwhEntity(): HassEntity {
    return this.hass.states[`sensor.${this._getSensorPrefix}battery_capacity_kwh`];
  }

  private get _getBatteryPowerReserve(): HassEntity {
    return this.hass.states[`number.${this._getSensorPrefix}battery_power_reserve`];
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

  private get _getReserveWatts(): number {
    const capacity = parseFloat(this._getBatteryCapacityKwhEntity.state) * 1000;
    const reserve = parseFloat(this._getBatteryPowerReserve.state) / 100;
    return capacity * reserve;
  }

  private get _getEstimatedTimeLeft(): number {
    let timeSecs = 0;
    const socWatts = parseFloat(this._getSocKwhEntity.state) * 1000;
    const capacity = parseFloat(this._getBatteryCapacityKwhEntity.state) * 1000;
    const reserve = parseFloat(this._getBatteryPowerReserve.state) / 100;
    const dischargePower = parseFloat(this._getDischargePowerEntity.state);

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
    const chargePower = parseFloat(this._getChargePowerEntity.state);
    const socWatts = parseFloat(this._getSocKwhEntity.state) * 1000;
    const capacityWatts = parseFloat(this._getBatteryCapacityKwhEntity.state) * 1000;

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
