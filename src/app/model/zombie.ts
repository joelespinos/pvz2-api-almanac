const DEFAULT_DESCRIPTION: string = "There's no description for this zombie yet...";

export interface Zombie {
    apiName: string;
    name: string;
    toughness: string;
    speed: string;
    stamina: string;
    description: string;
    image: string;
}

export let DEFAULT_ZOMBIE: Zombie = {
    apiName: "",
    name: "",
    toughness: "",
    speed: "",
    stamina: "",
    description: DEFAULT_DESCRIPTION,
    image: ""
}
