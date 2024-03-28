export const SOC_THRESH_V_HIGH = 80;
export const SOC_THRESH_V_HIGH_COLOUR = [0, 69, 23]; //#004517
export const SOC_THRESH_HIGH = 60;
export const SOC_THRESH_HIGH_COLOUR = [67, 160, 71]; //#43a047
export const SOC_THRESH_MED = 40;
export const SOC_THRESH_MED_COLOUR = [255, 166, 0]; //#ffa600
export const SOC_THRESH_LOW = 20;
export const SOC_THRESH_LOW_COLOUR = [219, 68, 55]; //#db4437
export const SOC_THRESH_V_LOW_COLOUR = [94, 0, 0]; //#5e0000

export const DISPLAY_ABS_POWER = false;

export enum DISPLAY_TYPE_OPTIONS {
    WH,
    KWH,
    DYNAMIC,
}

export const DISPLAY_TYPE = DISPLAY_TYPE_OPTIONS.DYNAMIC;
export const DISPLAY_DP = 3;

export const ICON_STATUS_IDLE = 'mdi:sleep';
export const ICON_STATUS_CHARGING = 'mdi:lightning-bolt';
export const ICON_STATUS_DISCHARGING = 'mdi:home-battery';

export const DISPLAY_BATTERY_RATES = true;

export const USE_CUSTOM_DOD = false;

export const CUSTOM_DOD = 100.0;

export const CALCULATE_RESERVE_FROM_DOD = false;

export const DISPLAY_CUSTOM_DOD_STATS = true;

export const DISPLAY_UNITS = {
    W: "W",
    KW: "kW",
    WH: "Wh",
    KWH: "kWh",
}

export const DISPLAY_ENERGY_TODAY = true;
