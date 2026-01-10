const DEFAULT_DESCRIPTION: string = "There's no description for this plant yet...";

export interface Plant {
    apiName: string,
    name: string,
    image: string,
    family: string,
    damage: string,
    damageDetails: string,
    area: string,
    range: string,
    rangeDetails: string,
    duration: string,
    special: string,
    weakness: string,
    usage: string,
    cost: string,
    recharge: string,
    toughness: string,
    powerup: string,
    sunProduction: string,
    description: string
}

export let DEFAULT_PLANT: Plant = {
    apiName: "",
    name: "",
    image: "",
    family: "",
    damage: "",
    damageDetails: "",
    area: "",
    range: "",
    rangeDetails: "",
    duration: "",
    special: "",
    weakness: "",
    usage: "",
    cost: "",
    recharge: "",
    toughness: "",
    powerup: "",
    sunProduction: "",
    description: DEFAULT_DESCRIPTION
}
