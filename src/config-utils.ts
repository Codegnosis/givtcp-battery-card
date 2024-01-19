import {LovelaceCardConfig} from "custom-card-helpers";
import {
    SOC_THRESH_HIGH,
    SOC_THRESH_HIGH_COLOUR,
    SOC_THRESH_LOW,
    SOC_THRESH_LOW_COLOUR,
    SOC_THRESH_MED,
    SOC_THRESH_MED_COLOUR,
    SOC_THRESH_V_HIGH,
    SOC_THRESH_V_HIGH_COLOUR,
    SOC_THRESH_V_LOW_COLOUR,
    DISPLAY_ABS_POWER,
    DISPLAY_TYPE,
    DISPLAY_DP,
    DISPLAY_TYPE_OPTIONS,
    ICON_STATUS_IDLE,
    ICON_STATUS_CHARGING,
    ICON_STATUS_DISCHARGING,
    DISPLAY_BATTERY_RATES,
    USE_CUSTOM_DOD,
    CUSTOM_DOD,
    CALCULATE_RESERVE_FROM_DOD, DISPLAY_CUSTOM_DOD_STATS,
} from "./constants";

export class ConfigUtils {
    public static getDefaultConfig(): LovelaceCardConfig {
        return {
            type: 'custom:givtcp-battery-card',
            name: 'Battery',
            soc_threshold_very_high: SOC_THRESH_V_HIGH,
            soc_threshold_high: SOC_THRESH_HIGH,
            soc_threshold_medium: SOC_THRESH_MED,
            soc_threshold_low: SOC_THRESH_LOW,
            soc_threshold_very_high_colour: SOC_THRESH_V_HIGH_COLOUR,
            soc_threshold_high_colour: SOC_THRESH_HIGH_COLOUR,
            soc_threshold_medium_colour: SOC_THRESH_MED_COLOUR,
            soc_threshold_low_colour: SOC_THRESH_LOW_COLOUR,
            soc_threshold_very_low_colour: SOC_THRESH_V_LOW_COLOUR,
            display_abs_power: DISPLAY_ABS_POWER,
            display_type: DISPLAY_TYPE,
            display_dp: DISPLAY_DP,
            icon_status_idle: ICON_STATUS_IDLE,
            icon_status_charging: ICON_STATUS_CHARGING,
            icon_status_discharging: ICON_STATUS_DISCHARGING,
            display_battery_rates: DISPLAY_BATTERY_RATES,
            use_custom_dod: USE_CUSTOM_DOD,
            custom_dod: CUSTOM_DOD,
            calculate_reserve_from_dod: CALCULATE_RESERVE_FROM_DOD,
            display_custom_dod_stats: DISPLAY_CUSTOM_DOD_STATS,
        };
    }

    static migrateConfig(config: LovelaceCardConfig, makeCopy: boolean): LovelaceCardConfig {
        const newConfig = makeCopy ? { ...config } : config;
        const mappings = {
            display_kwh: {
                newKey: 'display_type',
                newVal: DISPLAY_TYPE_OPTIONS.DYNAMIC,
            },
        };

        for (const [oldKey, newConf] of Object.entries(mappings)) {
            if (newConfig[oldKey]) {
                newConfig[newConf.newKey] = newConfig[oldKey];

                if(newConf.newKey !== undefined) {
                    newConfig[newConf.newKey] = newConf.newVal;
                }
                delete newConfig[oldKey];
            }
        }
        return newConfig;
    }
}
