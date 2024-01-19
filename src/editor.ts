import {fireEvent, HomeAssistant, LovelaceCardConfig, LovelaceCardEditor, LovelaceConfig} from "custom-card-helpers";
import {customElement, property, state} from "lit/decorators.js";
import {css, CSSResultGroup, html, LitElement, TemplateResult} from "lit";
import {ConfigUtils} from "./config-utils";

@customElement('givtcp-battery-card-editor')
export class GivTCPBatteryCardEditor extends LitElement implements LovelaceCardEditor {
    @property() hass!: HomeAssistant;
    lovelace?: LovelaceConfig | undefined;
    @state() private _config!: LovelaceCardConfig;

    public setConfig(config: LovelaceCardConfig): void {
        this._config = ConfigUtils.migrateConfig(config, true);
    }

    get _getInvertorList(): string[] {
        return this.hass ? Object.keys(this.hass.states).filter((eid) => eid.includes('invertor_serial_number')) : [];
    }

    get _schema(): object[] {
        const defaults = ConfigUtils.getDefaultConfig();

        return [
            {
                name: 'name',
                label: 'Name',
                default: defaults.name,
                selector: {
                    text: {}
                }
            },
            {
                name: 'entity',
                label: 'Invertor',
                selector: {
                    entity: {
                        multiple: false,
                        include_entities: this._getInvertorList
                    }
                },
            },
            {
                name: 'soc_threshold_very_high',
                label: 'SOC Threshold Very High',
                default: defaults.soc_threshold_very_high,
                selector: {
                    number: {
                        min: 0,
                        max: 100,
                        unit_of_measurement: "%",
                    }
                }
            },
            {
                name: 'soc_threshold_very_high_colour',
                label: 'SOC Very High Colour',
                default: defaults.soc_threshold_very_high_colour,
                selector: {
                    color_rgb: {}
                }
            },
            {
                name: 'soc_threshold_high',
                label: 'SOC Threshold High',
                default: defaults.soc_threshold_high,
                selector: {
                    number: {
                        min: 0,
                        max: 100,
                        unit_of_measurement: "%",
                    }
                }
            },
            {
                name: 'soc_threshold_high_colour',
                label: 'SOC High Colour',
                default: defaults.soc_threshold_high_colour,
                selector: {
                    color_rgb: {}
                }
            },
            {
                name: 'soc_threshold_medium',
                label: 'SOC Threshold Medium',
                default: defaults.soc_threshold_medium,
                selector: {
                    number: {
                        min: 0,
                        max: 100,
                        unit_of_measurement: "%",
                    }
                }
            },
            {
                name: 'soc_threshold_medium_colour',
                label: 'SOC Medium Colour',
                default: defaults.soc_threshold_medium_colour,
                selector: {
                    color_rgb: {}
                }
            },
            {
                name: 'soc_threshold_low',
                label: 'SOC Threshold Low',
                default: defaults.soc_threshold_low,
                selector: {
                    number: {
                        min: 0,
                        max: 100,
                        unit_of_measurement: "%",
                    }
                }
            },
            {
                name: 'soc_threshold_low_colour',
                label: 'SOC Loc Colour',
                default: defaults.soc_threshold_low_colour,
                selector: {
                    color_rgb: {}
                }
            },
            {
                name: 'soc_threshold_very_low_colour',
                label: 'SOC Very Low Colour',
                default: defaults.soc_threshold_very_low_colour,
                selector: {
                    color_rgb: {}
                }
            },
            {
                name: 'display_abs_power',
                label: 'Display power usage as absolute value',
                default: defaults.display_abs_power,
                selector: {
                    boolean: {}
                }
            },
            {
                name: 'display_type',
                label: 'Display type (0: Wh | 1: kWh | 2: Dynamic)',
                default: defaults.display_type,
                selector: {
                    number: {
                        min: 0,
                        max: 2
                    }
                }
            },
            {
                name: 'display_dp',
                label: 'Display number decimal places',
                default: defaults.display_dp,
                selector: {
                    number: {
                        min: 1,
                        max: 3
                    }
                }
            },
            {
                name: 'icon_status_charging',
                label: 'Status Icon: Charging',
                default: defaults.icon_status_charging,
                selector: {
                    icon:{},
                }
            },
            {
                name: 'icon_status_discharging',
                label: 'Status Icon: Discharging',
                default: defaults.icon_status_discharging,
                selector: {
                    icon:{},
                }
            },
            {
                name: 'icon_status_idle',
                label: 'Status Icon: Idle',
                default: defaults.icon_status_idle,
                selector: {
                    icon:{},
                }
            },
            {
                name: 'display_battery_rates',
                label: 'Display data about battery charge/discharge rates',
                default: defaults.display_battery_rates,
                selector: {
                    boolean: {}
                }
            },
            {
                name: 'use_custom_dod',
                label: 'EXPERIMENTAL! Use custom DoD to override GivTCP battery capacity value.',
                default: defaults.use_custom_dod,
                selector: {
                    boolean: {}
                }
            },
            {
                name: 'display_custom_dod_stats',
                label: 'EXPERIMENTAL! Display the custom DOD stats',
                default: defaults.display_custom_dod_stats,
                selector: {
                    boolean: {}
                }
            },
            {
                name: 'custom_dod',
                label: 'EXPERIMENTAL! Custom DoD as percentage to override GivTCP battery capacity value.',
                default: defaults.custom_dod,
                selector: {
                    number: {
                        min: 0,
                        max: 100,
                        step: "any",
                        unit_of_measurement: "%",
                    }
                }
            },
            {
                name: 'calculate_reserve_from_dod',
                label: 'EXPERIMENTAL! Use custom DoD to calculate the battery reserve value',
                default: defaults.calculate_reserve_from_dod,
                selector: {
                    boolean: {}
                }
            },
        ];
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
