import { LukRandom } from "../../../luk-utils/luk-random";
import { settings } from "./cellular-automata-view";

export type CellData = { x: number; y: number; value: number; age: number }

const random = new LukRandom();

// @todo display generation
// @todo display population
export class CellularSim {
    data: CellData[] = [];
    previousData: CellData[] = [];
    nextCells: { x: number; y: number; }[] = [];

    constructor() {
        this.init();
    }

    init() {
        const noiseData = new Array(settings.columns).fill(undefined).map((_, x) => {
            return new Array(settings.rows).fill(undefined).map((_, y) => {
                const value = Math.random() > .5 ? 1 : 0;

                // return {x, y, value};
                return value;
            });
        });

        for (let x = 0; x < settings.columns; x++) {
            for (let y = 0; y < settings.rows; y++) {
                const noiseVal = noiseData[x][y];
                const hue = Math.floor(noiseVal * settings.colors) * (360 / settings.colors);
                // const color = `hsl(${Math.floor(Math.random() * settings.colors) * (360 / settings.colors)}, 50%, 50%)`;
                const color = `hsl(${hue}, 50%, 50%)`;

                this.data.push({
                    x,
                    y,
                    value: noiseVal,
                    age: noiseVal ? 1 : 0
                });
            }
        }

        this.previousData = this.data.map(cell => {
            return { ...cell };
        });
    }

    getDataCell(pos: { x: number; y: number; }) {
        if (pos.x < 0 || pos.y < 0 || pos.x > settings.columns - 1 || pos.y > settings.rows - 1) return null;

        return this.data[pos.x * settings.rows + pos.y];
    }

    getPreviousDataCell(pos: { x: number; y: number; }) {
        if (pos.x < 0 || pos.y < 0 || pos.x > settings.columns - 1 || pos.y > settings.rows - 1) return null;

        return this.previousData[pos.x * settings.rows + pos.y];
        // return this.previousData.find(c => c.x == pos.x && c.y == pos.y);
    }

    static readonly NEIGHBOUR_CELL_POSITIONS = [
        [0, 1], [1, 0], [0, -1], [-1, 0],
        [-1, 1], [1, 1], [-1, -1], [1, -1]
    ] as const;

    getPreviousNeighbours(cell: { x: number; y: number; }): CellData[] {
        const res: CellData[] = [];
        const neighbourCellPositions = CellularSim.NEIGHBOUR_CELL_POSITIONS;

        for (let i = 0; i < neighbourCellPositions.length; i++) {
            const pos = neighbourCellPositions[i];

            const found = this.getPreviousDataCell({ x: cell.x + pos[0], y: cell.y + pos[1] });
            if (!found) continue;

            res.push(found);
        }

        return res;
    }

    tick() {
        // this.data.length = 0;
        for (let i = 0; i < this.data.length; i++) {
            let cell = this.data[i];

            const neighbours = this.getPreviousNeighbours(cell);
            const aliveNeighbours = neighbours.filter(n => n.value);

            if (cell.value) {
                if (aliveNeighbours.length < 2 || aliveNeighbours.length > 3) {
                    cell.value = 0;
                    cell.age = 0;
                }
                else {
                    cell.age += 1;
                }
            }
            else {
                if (aliveNeighbours.length == 3) {
                    cell.value = 1;
                }
            }
        }

        // if (Math.random() < .01) {
        //     for (let i = 0; i < random.rangeInt(5, 10); i++) {
        //         const cell = random.sample(this.data);
        //         if (cell && cell.value == 0) cell.value = 1;

        //     }
        // }

        if (this.nextCells.length) {
            const cells = this.nextCells.map(c => this.getDataCell(c));
            cells.forEach(cell => {
                if (cell) {
                    // console.log('nextCell', cell);
                    cell.value = 1;
                }
            });

            this.nextCells.length = 0;
        }

        this.previousData = this.data.map(cell => {
            return { ...cell };
        });
    }

    // setCellAlive(pos: { x: number; y: number }) {
    //     const cell = this.getDataCell(pos);
    //     if (!cell) return;
    //     if (cell.value) return;
    //     cell.value = 1;
    //     cell.age = 1;
    // }
    // setCellDead(pos: { x: number; y: number }) {
    //     const cell = this.getDataCell(pos);
    //     if (!cell) return;
    //     if (!cell.value) return;
    //     cell.value = 0;
    //     cell.age = 0;
    // }
    setCellsAlive(pos: { x: number; y: number; }, size: { x: number; y: number; }) {
        const cells = this.data.filter(cell => {
            return cell.x >= pos.x && cell.y >= pos.y && cell.x <= pos.x + size.x && cell.y <= pos.y + size.y;
        });

        cells.forEach(cell => {
            // this.setCellAlive(cell);
            this.nextCells.push(cell);
        });
    }
}
