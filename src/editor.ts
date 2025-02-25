import {fireEvent, HomeAssistant, LovelaceCardConfig, LovelaceCardEditor, LovelaceConfig} from "custom-card-helpers";
import {customElement, property, state} from "lit/decorators.js";
import {css, CSSResultGroup, html, LitElement, TemplateResult} from "lit";
import {ConfigUtils} from "./config-utils";
import {
    CUSTOM_SENSOR_SCHEMA,
    DISPLAY_SCHEMA,
    DOD_SCHEMA,
    GENERAL_SCHEMA,
    SOC_SCHEMA,
    TRICKLE_CHARGE_SCHEMA
} from "./schemas";

@customElement('givtcp-battery-card-editor')
export class GivTCPBatteryCardEditor extends LitElement implements LovelaceCardEditor {
    @property() hass!: HomeAssistant;
    lovelace?: LovelaceConfig | undefined;
    @state() private _config!: LovelaceCardConfig;
    @state() private _currentTab?: number;

    public setConfig(config: LovelaceCardConfig): void {
        this._config = ConfigUtils.migrateConfig(config, true);
    }

    private get _getInvertorList(): string[] {
        return this.hass ? Object.keys(this.hass.states).filter((eid) => eid.includes('invertor_serial_number')) : [];
    }

    private get _schema(): object[] {
        const defaults = ConfigUtils.getDefaultConfig();

        switch (this._currentTab) {
            case 0:
            default:
                return GENERAL_SCHEMA(this._getInvertorList, defaults);
            case 1:
                return SOC_SCHEMA(defaults, this._config);
            case 2:
                return DISPLAY_SCHEMA(defaults);
            case 3:
                return DOD_SCHEMA(defaults, this._config);
            case 4:
                return TRICKLE_CHARGE_SCHEMA(defaults, this._config);
            case 5:
                return CUSTOM_SENSOR_SCHEMA(defaults, this._config);
        }
    }

    private _handleTabChanged(ev: CustomEvent): void {
        ev.preventDefault();
        const tab = ev.detail.selected as number;
        this._currentTab = tab;
    }

    constructor() {
        super();
        this._currentTab = 0;
    }

    protected render(): TemplateResult | void {
        if (!this.hass|| !this._config) {
            return html``;
        }

        const conf = {
            ...ConfigUtils.getDefaultConfig(),
            ...this._config,
        }

        return html`
        <ha-tabs scrollable .selected=${this._currentTab} @iron-activate=${this._handleTabChanged}>
          <paper-tab>General</paper-tab>
          <paper-tab>SOC</paper-tab>
          <paper-tab>Display</paper-tab>
          <paper-tab>DOD</paper-tab>
          <paper-tab>Filters</paper-tab>
          <paper-tab>Custom</paper-tab> 
        </ha-tabs>
        <ha-form
          .hass=${this.hass}
          .data=${conf}
          .schema=${this._schema}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        const config = ev.detail.value;
        fireEvent(this, 'config-changed', { config });
    }

    private _computeLabelCallback = (schema: { name: string; label?: string }) => {
        if (schema.label) return schema.label;
        return schema.name;
    };

    static styles: CSSResultGroup = css``;
}
declare global {
    interface HTMLElementTagNameMap {
        'givtcp-battery-card-editor': GivTCPBatteryCardEditor;
    }
}
