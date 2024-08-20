
type WorldOpts = {
    size: { x: number; y: number; };
    yearDuration: number;
    yearTemperature: { min: number; max: number; };
    currentTime: number;
};

export class World {
    grid: { temperature: number; }[][] = [];

    seasons = [
        { temperature: 0, label: 'winter' },
        { temperature: 0, label: 'winter' },
        { temperature: .25, label: 'spring' },
        { temperature: .5, label: 'spring' },
        { temperature: .75, label: 'spring' },
        { temperature: 1, label: 'summer' },
        { temperature: 1, label: 'summer' },
        { temperature: 1, label: 'summer' },
        { temperature: .75, label: 'fall' },
        { temperature: .5, label: 'fall' },
        { temperature: .25, label: 'fall' },
        { temperature: 0, label: 'winter' },
    ];

    currentTime: number;

    constructor(private readonly opts: WorldOpts) {
        for (let x = 0; x < opts.size.x; x++) {
            this.grid[x] = [];

            for (let y = 0; y < opts.size.y; y++) {
                this.grid[x][y] = { temperature: 0 };
            }
        }

        this.currentTime = opts.currentTime;
    }

    get yearProgress() {
        return this.currentTime % this.opts.yearDuration;
    }

    update() {
        this.yearProgress;

        // ! update temperature every X seconds
        // temperature = y * 1.25 - 20 + (yearProgress * seasons * yearTemperature)
    }
}

class Biome {
}

class WorldObject {
}

export class Climate {
    update() {
    }
}