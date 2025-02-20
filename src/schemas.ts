import {LovelaceCardConfig} from "custom-card-helpers";
import {DISPLAY_TYPE_OPTIONS, SOC_COLOUR_INPUT_TYPES} from "./constants";

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

const COLOUR_INPUT_TYPE_SCHEMA = (defaults: LovelaceCardConfig) => {
    return {
        name: 'soc_colour_input',
        label: 'Colour Input Type',
        default: defaults.soc_colour_input,
        selector: {
            select: {
                options: [
                    { value: SOC_COLOUR_INPUT_TYPES.RGB_PICKER, label: 'RGB Colour Picker' },
                    { value: SOC_COLOUR_INPUT_TYPES.THEME_VAR, label: 'Theme Variable (e.g. "--success-color")' },
                ],
            },
        }
    };
}

const SOC_RGB_PICKER_SCHEMA = (name: string, defaultColour: number[]) => {
    return {
        name: `soc_threshold_${name}_colour`,
        label: 'Colour',
        default: defaultColour,
        selector: {
            color_rgb: {}
        }
    }
}

const SOC_THEME_VAR_SCHEMA = (name: string) => {
    return {
        name: `soc_threshold_${name}_colour`,
        label: 'Colour',
        default: '--success-color',
        selector: {
            text: {}
        }
    }
}

const THRESHOLD_SCHEMA = (name: string, defaultThreshold: number, defaultColour: number[], currentSocColourInput: string) => {

    const colourSchema = (currentSocColourInput === SOC_COLOUR_INPUT_TYPES.THEME_VAR) ? SOC_THEME_VAR_SCHEMA(name) : SOC_RGB_PICKER_SCHEMA(name, defaultColour)

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
            colourSchema,
        ],
    }
}

export const SOC_SCHEMA = (defaults: LovelaceCardConfig, config: LovelaceCardConfig) => {

    const colourSchema = (config.soc_colour_input === SOC_COLOUR_INPUT_TYPES.THEME_VAR) ? SOC_THEME_VAR_SCHEMA('very_low') : SOC_RGB_PICKER_SCHEMA('very_low', defaults.soc_threshold_very_low_colour)

    return [
        HEADING_SCHEMA('SOC Thresholds & Colours for Battery Icon'),
        COLOUR_INPUT_TYPE_SCHEMA(defaults),
        HEADING_SCHEMA('Very High'),
        THRESHOLD_SCHEMA('very_high', defaults.soc_threshold_very_high, defaults.soc_threshold_very_high_colour, config.soc_colour_input || defaults.soc_colour_input),
        HEADING_SCHEMA('High'),
        THRESHOLD_SCHEMA('high', defaults.soc_threshold_high, defaults.soc_threshold_high_colour, config.soc_colour_input || defaults.soc_colour_input),
        HEADING_SCHEMA('Medium'),
        THRESHOLD_SCHEMA('medium', defaults.soc_threshold_medium, defaults.soc_threshold_medium_colour, config.soc_colour_input || defaults.soc_colour_input),
        HEADING_SCHEMA('Low'),
        THRESHOLD_SCHEMA('low', defaults.soc_threshold_low, defaults.soc_threshold_low_colour, config.soc_colour_input || defaults.soc_colour_input),
        HEADING_SCHEMA(`Very Low (< ${config.soc_threshold_low || defaults.soc_threshold_low}%)`),
        colourSchema,
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

export const TRICKLE_CHARGE_SCHEMA = (defaults: LovelaceCardConfig, config: LovelaceCardConfig) => {
    let settings: object[] = [
        HEADING_SCHEMA('Throttle Trickle Charge (if battery charge/discharge power < throttle it will be displayed as zero)'),
        {
            name: 'trickle_charge_throttle',
            label: 'Use Throttle',
            default: defaults.trickle_charge_throttle,
            selector: {
                boolean: {}
            }
        },
    ];

    if (config.trickle_charge_throttle) {
        settings = [
            ...settings,
            {
                name: 'trickle_charge_throttle_threshold',
                label: 'Throttle Threshold',
                default: defaults.trickle_charge_throttle_threshold,
                selector: {
                    number: {
                        min: 0,
                        max: 50,
                        step: 1,
                        unit_of_measurement: "W",
                    }
                }
            },
        ];
    }

    return settings;
}
