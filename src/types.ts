export interface GivTcpStats {
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
