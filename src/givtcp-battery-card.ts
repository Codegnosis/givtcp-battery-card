/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HomeAssistant,
  LovelaceCardEditor,
  LovelaceCard,
  LovelaceCardConfig
} from 'custom-card-helpers';
import { LitElement, html, TemplateResult, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HassEntity } from 'home-assistant-js-websocket';

import './components/countdown'
import './editor';
import { styleCss } from './style';

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'givtcp-battery-card',
  name: 'GivTCP Battery Card',
  description: 'A card to display GivTCP battery info',
});

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
      name: 'Battery',
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

  secondsToDuration(d: number) {
    const leftPad = (num: number) => (num < 10 ? `0${num}` : num);

    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);

    if (h > 0) {
      return `${h}:${leftPad(m)}:${leftPad(s)}`;
    }
    if (m > 0) {
      return `${m}:${leftPad(s)}`;
    }
    if (s > 0) {
      return '' + s;
    }
    return null;
  }

  renderStatus(): TemplateResult {
    const status = this._getBatteryStatus.toUpperCase();

    return html`
      <div class="status">
        <span class="status-text"> ${status} </span>
      </div>
    `;
  }

  renderStats(): TemplateResult[] {
    const statsList: TemplateResult[] = [];

    const power = parseInt(this._getBatteryPowerEntity.state, 10);

    let action = 'Not active';
    let estimatedTime = 0;
    let powerColourClass = '';
    let powerSubtitle = html`<ha-icon icon="mdi:pause-box-outline"></ha-icon>Not active`;

    if (power > 0) {
      powerColourClass = 'battery-power-out';
      action = 'Time to discharge';
      estimatedTime = this._getEstimatedTimeLeft;
      powerSubtitle = html`<ha-icon icon="mdi:export"></ha-icon>Power Out`;
    }
    if (power < 0) {
      powerColourClass = 'battery-power-in';
      action = 'Time to charge'
      estimatedTime = this._getEstimatedChargeTime;
      powerSubtitle = html`<ha-icon icon="mdi:import"></ha-icon>Power In`;
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
        <div class="stats-subtitle">${action}</div>
      </div>
    `;

    statsList.push(timeLeft);

    const powerUse = html`
      <div class="stats-block">
        <span class="stats-value ${powerColourClass}">
          ${Math.abs(power)} 
        </span>
        Wh
        <div class="stats-subtitle">${powerSubtitle}</div>
      </div>
    `;

    statsList.push(powerUse);

    return statsList;
  }

  renderName(): TemplateResult {
    const c = parseFloat(this._getBatteryCapacityKwhEntity.state);

    return html` <div class="battery-name">${this.config.name || 'Battery'}: ${c} kWh</div> `;
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

    if (socInt >= 80) {
      return '004517';
    } else if (socInt >= 50) {
      return '43a047';
    } else if (socInt >= 30) {
      return 'ffa600';
    } else if (socInt >= 10) {
      return 'db4437';
    } else {
      return '5e0000';
    }
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
          <div class="metadata">${this.renderName()} ${this.renderStatus()}</div>

          <div class="stats-wrapper">
            <div class="stats">
              <div class="stats-block">
                <ha-icon icon="${batteryIcon}" style="color:#${batteryIconColour};--mdc-icon-size: 120px;"></ha-icon>
                <span class="icon-info">
                  <span class="icon-title"> ${soc}% </span>
                  <span class="icon-subtitle"> ${socWh} Wh </span>
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
    const socWatts = parseFloat(this._getSocKwhEntity.state) * 1000;
    const dischargePower = parseFloat(this._getDischargePowerEntity.state);

    if (socWatts > 0 && dischargePower > 0) {
      const diffP = socWatts / dischargePower;
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
