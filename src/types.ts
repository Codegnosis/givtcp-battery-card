export interface GivTcpStats {
    source: string,
    rawState: string, // store raw value from GivTCP
    uom: string | undefined, // unit_of_measurement from GivTCP
    value: number,
    kValue: number,
    display: number,
    displayStr: string,
    displayUnit: string | undefined,
}

export interface GivTcpBatteryStats {
    socPercent: GivTcpStats,
    batteryPower: GivTcpStats,
    socEnergy: GivTcpStats,
    dischargePower: GivTcpStats,
    chargePower: GivTcpStats,
    batteryCapacity: GivTcpStats,
    batteryPowerReservePercent: GivTcpStats,
    batteryPowerReserveEnergy: GivTcpStats,
    chargeRate: GivTcpStats,
    dischargeRate: GivTcpStats,
    usableBatteryCapacity: GivTcpStats,
    calculatedSocEnergy: GivTcpStats,
    batteryUsageRatePercent: GivTcpStats,
    chargeEnergyToday: GivTcpStats,
    dischargeEnergyToday: GivTcpStats,
}

export interface GivTcpCheckEntityResult {
    found: boolean
    sensor: string
}

export interface GivSensorPrefixSuffix {
    prefix: string
    suffix: string
}

export interface GivTcpEntityMeta {
    name: string
    type: string
}

export interface GivTcpExpectedSensors {
    soc: GivTcpEntityMeta
    battery_power: GivTcpEntityMeta
    soc_kwh: GivTcpEntityMeta
    discharge_power: GivTcpEntityMeta
    charge_power: GivTcpEntityMeta
    battery_capacity_kwh: GivTcpEntityMeta
    battery_charge_energy_today_kwh: GivTcpEntityMeta
    battery_discharge_energy_today_kwh: GivTcpEntityMeta
    battery_power_reserve: GivTcpEntityMeta
    battery_charge_rate: GivTcpEntityMeta
    battery_discharge_rate: GivTcpEntityMeta
}
