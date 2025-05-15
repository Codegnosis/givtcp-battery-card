import {fireEvent, HomeAssistant, LovelaceCardConfig, LovelaceCardEditor, LovelaceConfig} from "custom-card-helpers";
import {customElement, property, state} from "lit/decorators.js";
import {css, CSSResultGroup, html, LitElement, TemplateResult} from "lit";
import {ConfigUtils} from "./config-utils";
import {
    TAB_NAMES,
    CUSTOM_SENSOR_SCHEMA,
    DISPLAY_SCHEMA,
    DOD_SCHEMA,
    GENERAL_SCHEMA,
    SOC_SCHEMA,
    TRICKLE_CHARGE_SCHEMA
} from "./schemas";

import semver from 'semver'

const tabs = [TAB_NAMES.GENERAL, TAB_NAMES.SOC, TAB_NAMES.DISPLAY, TAB_NAMES.DOD, TAB_NAMES.FILTERS, TAB_NAMES.ADVANCED] as const;

@customElement('givtcp-battery-card-editor')
export class GivTCPBatteryCardEditor extends LitElement implements LovelaceCardEditor {
    @property() hass!: HomeAssistant;
    lovelace?: LovelaceConfig | undefined;
    @state() private _config!: LovelaceCardConfig;
    @state() private _currentTab: (typeof tabs)[number] = tabs[0];

    constructor() {
        super();
    }

    public setConfig(config: LovelaceCardConfig): void {
        this._config = ConfigUtils.migrateConfig(config, true);
    }

    private get _getInvertorList(): string[] {
        return this.hass ? Object.keys(this.hass.states).filter((eid) => eid.includes('invertor_serial_number')) : [];
    }

    private get _schema(): object[] {
        const defaults = ConfigUtils.getDefaultConfig();

        switch (this._currentTab) {
            case TAB_NAMES.GENERAL:
            default:
                return GENERAL_SCHEMA(this._getInvertorList, defaults);
            case TAB_NAMES.SOC:
                return SOC_SCHEMA(defaults, this._config);
            case TAB_NAMES.DISPLAY:
                return DISPLAY_SCHEMA(defaults);
            case TAB_NAMES.DOD:
                return DOD_SCHEMA(defaults, this._config);
            case TAB_NAMES.FILTERS:
                return TRICKLE_CHARGE_SCHEMA(defaults, this._config);
            case TAB_NAMES.ADVANCED:
                return CUSTOM_SENSOR_SCHEMA(defaults, this._config);
        }
    }

    private _handleTabChanged(ev: CustomEvent): void {
        const newTab = ev.detail.name;
        if (newTab === this._currentTab) {
            return;
        }
        this._currentTab = newTab;
    }

    // ToDo - will be removed in the next release
    private _handleLegacyTabChange(ev: CustomEvent): void {
        ev.preventDefault();
        const tab = ev.detail.selected as number;
        this._currentTab = tabs[tab];
    }

    // ToDo - will be removed in the next release
    private _legacyLayout(): TemplateResult {
        const conf = {
            ...ConfigUtils.getDefaultConfig(),
            ...this._config,
        }

        return html`
        <ha-tabs scrollable .selected=${this._currentTab} @iron-activate=${this._handleLegacyTabChange}>
            <paper-tab>General</paper-tab>
            <paper-tab>SOC</paper-tab>
            <paper-tab>Display</paper-tab>
            <paper-tab>DOD</paper-tab>
            <paper-tab>Filters</paper-tab>
            <paper-tab>Advanced</paper-tab>
        </ha-tabs>
        <ha-form
          .hass=${this.hass}
          .data=${conf}
          .schema=${this._schema}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>
        `
    }

    protected render(): TemplateResult | void {
        if (!this.hass|| !this._config) {
            return html``;
        }

        // ToDo - will be removed in the next release
        let useLegacy = false
        if(semver.lt(this.hass.config.version, "2025.5.0")) {
            useLegacy = true
        }

        const conf = {
            ...ConfigUtils.getDefaultConfig(),
            ...this._config,
        }

        if(useLegacy) {
            return this._legacyLayout()
        }

        return html`

        <sl-tab-group @sl-tab-show=${this._handleTabChanged}>
                ${tabs.map(
                        (tab) => html`
            <sl-tab slot="nav" .active=${this._currentTab === tab} panel=${tab}>
              ${tab}
            </sl-tab>
          `
                )}
        </sl-tab-group>
        
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
