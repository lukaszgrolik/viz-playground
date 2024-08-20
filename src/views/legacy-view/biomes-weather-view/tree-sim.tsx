import * as BiomeEngine from "./biome-engine";

interface IGreenItem {
    update(): void;
}

export class TreeSim {
    greenItems: IGreenItem[] = [];

    constructor(private readonly world: BiomeEngine.World) {
    }

    update() {
        for (let i = 0; i < this.greenItems.length; i++) this.greenItems[i].update();

        // ! spawn tree/bush/grass in proximity of current trees | randomly select trees | random properties - growthRate, maxSize, maxAge
    }
}

export class Tree implements IGreenItem {
    currentSize = 0;
    seasonProgress = 0;

    update() {
        // grow tree - continue growth when temp > X; stop growth when temp < X
        // leaves appear when temp > X, fall when temp < X; leaves based on seasonProgress
        // growth rate dependent on temperature < X & > Y
    }
}

export class Bush implements IGreenItem {
    update() {
    }
}

export class Grass implements IGreenItem {
    update() {
    }
}
