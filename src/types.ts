
export interface GivTcpBatteryStats {
    socPercent: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        value: number,
        display: number,
        displayStr: string,
    },
    batteryPower: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        w: number,
        kW: number,
        display: number,
        displayStr: string,
        displayUnit: string,
    },
    socEnergy: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        Wh: number,
        kWh: number,
        display: number,
        displayStr: string,
    },
    dischargePower: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        w: number,
        kW: number,
        display: number,
        displayStr: string,
    },
    chargePower: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        w: number,
        kW: number,
        display: number,
        displayStr: string,
    },
    batteryCapacity: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        Wh: number,
        kWh: number,
        display: number,
        displayStr: string,
    },
    batteryPowerReservePercent: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        value: number,
        display: number,
        displayStr: string,
    },
    batteryPowerReserveEnergy: {
        Wh: number,
        kWh: number,
        display: number,
        displayStr: string,
    },
    chargeRate: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        w: number,
        kW: number,
        display: number,
        displayStr: string,
    },
    dischargeRate: {
        rawState: string, // store raw value from GivTCP
        uom: string | undefined, // unit_of_measurement form GivTCP
        w: number,
        kW: number,
        display: number,
        displayStr: string,
    },
}
