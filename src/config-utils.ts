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
    DISPLAY_KWH,
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
            display_kwh: DISPLAY_KWH,
        };
    }
}
