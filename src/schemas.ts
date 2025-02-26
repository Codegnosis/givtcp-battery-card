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
        HEADING_SCHEMA('Power/Capacity display options'),
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
        HEADING_SCHEMA('Custom DoD to override values read from GivTCP sensors. This is for display purposes ' +
            'only and does not affect or modify the battery itself in any way.'),
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
        HEADING_SCHEMA('Filter out small battery charge/discharge values. If the battery charge/discharge is ' +
            'less than filter threshold, display as zero. This is for display purposes only and does not affect or ' +
            'modify the battery itself in any way.'),
        {
            name: 'trickle_charge_filter',
            label: 'Use Low Value Filter',
            default: defaults.trickle_charge_filter,
            selector: {
                boolean: {}
            }
        },
    ];

    if (config.trickle_charge_filter) {
        settings = [
            ...settings,
            {
                name: 'trickle_charge_filter_threshold',
                label: 'Filter Threshold',
                default: defaults.trickle_charge_filter_threshold,
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

export const CUSTOM_SENSOR_SCHEMA = (defaults: LovelaceCardConfig, config: LovelaceCardConfig) => {
    let settings: object[] = [
        HEADING_SCHEMA('Advanced configuration. Override automatically detected sensor/entity IDs with ' +
            'custom values. The card will use these custom entity IDs to query data from GivTCP.'),
        {
            name: 'use_custom_sensors',
            label: 'Use Custom Entity IDs',
            default: defaults.use_custom_sensors,
            selector: {
                boolean: {}
            }
        },
    ];

    if (config.use_custom_sensors) {
        settings = [
            ...settings,
            {
                name: 'custom_soc',
                label: 'SOC (e.g. sensor.givtcp_SERIAL_soc)',
                default: defaults.custom_soc,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_battery_power',
                label: 'Battery Power (e.g. sensor.givtcp_SERIAL_battery_power)',
                default: defaults.custom_battery_power,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_soc_kwh',
                label: 'SOC kWh (e.g. sensor.givtcp_SERIAL_soc_kwh)',
                default: defaults.custom_soc_kwh,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_discharge_power',
                label: 'Discharge Power (e.g. sensor.givtcp_SERIAL_discharge_power)',
                default: defaults.custom_discharge_power,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_charge_power',
                label: 'Charge Power (e.g. sensor.givtcp_SERIAL_charge_power)',
                default: defaults.custom_charge_power,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_battery_capacity_kwh',
                label: 'Capacity kWh (e.g. sensor.givtcp_SERIAL_battery_capacity_kwh)',
                default: defaults.custom_battery_capacity_kwh,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_battery_charge_energy_today_kwh',
                label: 'Charge Energy Today (e.g. sensor.givtcp_SERIAL_battery_charge_energy_today_kwh)',
                default: defaults.custom_battery_charge_energy_today_kwh,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_battery_discharge_energy_today_kwh',
                label: 'Discharge Energy Today (e.g. sensor.givtcp_SERIAL_battery_discharge_energy_today_kwh)',
                default: defaults.custom_battery_discharge_energy_today_kwh,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_battery_power_reserve',
                label: 'Battery Power Reserve (e.g. number.givtcp_SERIAL_battery_power_reserve)',
                default: defaults.custom_battery_power_reserve,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_battery_charge_rate',
                label: 'Charge Rate (e.g. number.givtcp_SERIAL_battery_charge_rate)',
                default: defaults.custom_battery_charge_rate,
                selector: {
                    text: {}
                }
            },
            {
                name: 'custom_battery_discharge_rate',
                label: 'Discharge Rate (e.g. number.givtcp_SERIAL_battery_discharge_rate)',
                default: defaults.custom_battery_discharge_rate,
                selector: {
                    text: {}
                }
            },
        ];
    }

    return settings;
}
