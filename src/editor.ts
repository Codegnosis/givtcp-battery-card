import {fireEvent, HomeAssistant, LovelaceCardConfig, LovelaceCardEditor, LovelaceConfig} from "custom-card-helpers";
import {customElement, property, state} from "lit/decorators.js";
import {css, CSSResultGroup, html, LitElement, TemplateResult} from "lit";

@customElement('givtcp-battery-card-editor')
export class GivTCPBatteryCardEditor extends LitElement implements LovelaceCardEditor {
    @property() hass!: HomeAssistant;
    lovelace?: LovelaceConfig | undefined;
    @state() private _config!: LovelaceCardConfig;

    public setConfig(config: LovelaceCardConfig): void {
        this._config = config;
    }

    get _getInvertorList(): string[] {
        return this.hass ? Object.keys(this.hass.states).filter((eid) => eid.includes('invertor_serial_number')) : [];
    }

    get _schema() {
        return [
            {name: 'name', label: 'Name', selector: {text: {}}},
            {
                label: 'Invertor (Required)',
                name: 'entity',
                selector: {entity: {multiple: false, include_entities: this._getInvertorList}},
            },
        ];
    }

    protected render(): TemplateResult | void {
        if (!this.hass|| !this._config) {
            return html``;
        }

        return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
    }

    private _valueChanged(ev: CustomEvent): void {
        const config = ev.detail.value;
        fireEvent(this, 'config-changed', { config });
    }

    static styles: CSSResultGroup = css``;
}
declare global {
    interface HTMLElementTagNameMap {
        'givtcp-battery-card-editor': GivTCPBatteryCardEditor;
    }
}
