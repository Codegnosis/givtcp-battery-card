import {LovelaceCardConfig} from "custom-card-helpers";
import {DISPLAY_TYPE_OPTIONS} from "./constants";

export const GENERAL_SCHEMA = (invertorList: string[], defaults: LovelaceCardConfig) => {

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
                    include_entities: invertorList
                }
            },
        },
    ];
}

const HEADING_SCHEMA = (label: string) => {
    return {
        selector: {
            constant: {
                label: label,
            },
        },
    }
}

const THRESHOLD_SCHEMA = (name: string, defaultThreshold: number, defaultColour: number[]) => {
    return {
        type: 'grid',
        schema: [
            {
                name: `soc_threshold_${name}`,
                label: 'Threshold',
                default: defaultThreshold,
                selector: {
                    number: {
                        mode: 'box',
                        min: 0,
                        max: 100,
                        unit_of_measurement: "%",
                    }
                }
            },
            {
                name: `soc_threshold_${name}_colour`,
                label: 'Colour',
                default: defaultColour,
                selector: {
                    color_rgb: {}
                }
            },
        ],
    }
}

export const SOC_SCHEMA = (defaults: LovelaceCardConfig, config: LovelaceCardConfig) => {

    return [
        HEADING_SCHEMA('SOC Thresholds & Colours for Battery Icon'),
        HEADING_SCHEMA('Very High'),
        THRESHOLD_SCHEMA('very_high', defaults.soc_threshold_very_high, defaults.soc_threshold_very_high_colour),
        HEADING_SCHEMA('High'),
        THRESHOLD_SCHEMA('high', defaults.soc_threshold_high, defaults.soc_threshold_high_colour),
        HEADING_SCHEMA('Medium'),
        THRESHOLD_SCHEMA('medium', defaults.soc_threshold_medium, defaults.soc_threshold_medium_colour),
        HEADING_SCHEMA('Low'),
        THRESHOLD_SCHEMA('low', defaults.soc_threshold_low, defaults.soc_threshold_low_colour),
        HEADING_SCHEMA(`Very Low (< ${config.soc_threshold_low || defaults.soc_threshold_low}%)`),
        {
            name: 'soc_threshold_very_low_colour',
            label: 'Colour',
            default: defaults.soc_threshold_very_low_colour,
            selector: {
                color_rgb: {}
            }
        },
    ];
}

export const DISPLAY_SCHEMA = (defaults: LovelaceCardConfig) => {

    return [
        HEADING_SCHEMA('Power/Capacity'),
        {
            type: 'grid',
            schema: [
                {
                    name: 'display_type',
                    label: 'Display type',
                    default: defaults.display_type,
                    selector: {
                        select: {
                            options: [
                                { value: DISPLAY_TYPE_OPTIONS.WH, label: 'Wh/W' },
                                { value: DISPLAY_TYPE_OPTIONS.KWH, label: 'kWh/kW' },
                                { value: DISPLAY_TYPE_OPTIONS.DYNAMIC, label: 'Dynamic' },
                            ],
                        },
                    }
                },
                {
                    name: 'display_dp',
                    label: 'Decimal places',
                    default: defaults.display_dp,
                    selector: {
                        number: {
                            mode: 'box',
                            min: 1,
                            max: 3
                        }
                    }
                },
            ],
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
            name: 'display_battery_rates',
            label: 'Display data about battery charge/discharge rates',
            default: defaults.display_battery_rates,
            selector: {
                boolean: {}
            }
        },
        {
            name: 'display_energy_today',
            label: 'Display daily charge/discharge energy data',
            default: defaults.display_energy_today,
            selector: {
                boolean: {}
            }
        },
        HEADING_SCHEMA('Icons'),
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
    ];
}

export const DOD_SCHEMA = (defaults: LovelaceCardConfig, config: LovelaceCardConfig) => {

    let settings: object[] = [
        HEADING_SCHEMA('Custom DoD to override GivTCP values'),
        {
            name: 'use_custom_dod',
            label: 'Use custom DoD',
            default: defaults.use_custom_dod,
            selector: {
                boolean: {}
            }
        },
    ];
    if (config.use_custom_dod) {
        settings = [
            ...settings,
            {
                name: 'custom_dod',
                label: 'DoD Percent',
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
                name: 'display_custom_dod_stats',
                label: 'Display DOD stats',
                default: defaults.display_custom_dod_stats,
                selector: {
                    boolean: {}
                }
            },
            {
                name: 'calculate_reserve_from_dod',
                label: 'Use custom DoD to calculate battery reserve',
                default: defaults.calculate_reserve_from_dod,
                selector: {
                    boolean: {}
                }
            },
        ];
    }
    return settings;
}
