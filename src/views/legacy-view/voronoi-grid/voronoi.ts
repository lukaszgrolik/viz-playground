import { observable, observe, runInAction } from "mobx";
import * as d3 from "d3";
import * as Simplex from 'open-simplex-noise';
import PoissonDiskSampling from 'poisson-disk-sampling';

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function inverseLerp(a: number, b: number, v: number) {
    return (v - a) / (b - a);
}

// const data: {x: number; y: number, color: string, value: number}[] = [];

export type NoiseData = {
    values: number[][];
    valuesNormalized: number[][];
    min: number;
    max: number;
}

export function generateNoise(opts: {size: {x: number; y: number}; freq: number}): NoiseData {
    const noise2d = Simplex.makeNoise2D(0);
    const values: number[][] = [];

    let min = Infinity;
    let max = -Infinity;

    for (let x = 0; x < opts.size.x; x++) {
        values.push([]);

        for (let y = 0; y < opts.size.y; y++) {

            const noiseVal = (noise2d(x * opts.freq, y * opts.freq) + 1) / 2;
            // console.log('noiseVal', noiseVal)

            values[x].push(noiseVal);

            if (noiseVal < min) min = noiseVal;
            if (noiseVal > max) max = noiseVal;
        }
    }

    const valuesNormalized: number[][] = [];

    for (let x = 0; x < opts.size.x; x++) {
        valuesNormalized.push([]);

        for (let y = 0; y < opts.size.y; y++) {
            const val = inverseLerp(min, max, values[x][y]);

            valuesNormalized[x].push(val);
        }
    }

    return {
        values,
        valuesNormalized,
        min,
        max,
    };
}

// function initData() {
//     const noiseData = generateNoise();
//     console.log('noiseData', noiseData);

//     for (let x = 0; x < settings.columns; x++) {
//         for (let y = 0; y < settings.rows; y++) {
//             const noiseVal = noiseData.valuesNormalized[x][y];
//             const hue = Math.floor(noiseVal * settings.colors) * (360 / settings.colors);
//             // const color = `hsl(${Math.floor(Math.random() * settings.colors) * (360 / settings.colors)}, 50%, 50%)`;
//             const color = `hsl(${hue}, 50%, 50%)`;

//             data.push({x, y, color, value: noiseVal});
//         }
//     }
// }

// initData();

// import Delaunator from 'delaunator';
// const Delaunator = require('delaunator').default;
// console.log('Delaunator', Delaunator)

type Point = [number, number];
type Triangle = [Point, Point, Point]
type Polygon = Point[];
type VoronoiCell = Polygon & { index: number };

export type DelaunayData = {
    origCoords: Point[];
    triangleCoords: Triangle[];
    circumcenters: Point[];
    cellPolygons: VoronoiCell[];
    cellColors: string[];
}

export const delaunayData = observable<DelaunayData>({
    origCoords: [],
    triangleCoords: [],
    circumcenters: [],
    cellPolygons: [],
    cellColors: [],
});

export let voronoi: d3.Voronoi<d3.Delaunay.Point>;

export function generateVoronoi(opts: {size: {x: number; y: number}; poisson: {min: number; max: number}}) {
    // const coordsOrig = [
    //     [100, 100],
    //     [200, 100],
    //     [200, 200],
    //     [100, 200],
    //     [170, 150],
    //     [250, 250],
    // ];
    const poisson = new PoissonDiskSampling({
        shape: [opts.size.x, opts.size.y],
        minDistance: opts.poisson.min,
        maxDistance: opts.poisson.max,
        tries: 10
    });
    const coordsOrig = poisson.fill() as Point[];

    // const coords = coordsOrig.flatMap(x => x);

    // const delaunay = new Delaunator(coords);
    // // console.log(delaunay.triangles);
    const delaunay = d3.Delaunay.from(coordsOrig);

    const coordinates: Triangle[] = [];

    for (let i = 0; i < delaunay.triangles.length; i += 3) {
        coordinates.push([
            coordsOrig[delaunay.triangles[i]],
            coordsOrig[delaunay.triangles[i + 1]],
            coordsOrig[delaunay.triangles[i + 2]]
        ] as Triangle);
    }

    voronoi = delaunay.voronoi([0, 0, opts.size.x, opts.size.y]);

    const circumcenters: Point[] = [];
    for (let i = 0; i < voronoi.circumcenters.length; i += 2) {
        circumcenters.push([
            voronoi.circumcenters[i],
            voronoi.circumcenters[i + 1],
        ] as Point);
    }

    const cellPolygons = Array.from(voronoi.cellPolygons()).map((poly, i) => {
        // console.log('poly', i, poly);

        return poly as unknown as VoronoiCell;
    });

    runInAction(() => {
        delaunayData.origCoords = coordsOrig;
        delaunayData.triangleCoords = coordinates;
        delaunayData.circumcenters = circumcenters;
        delaunayData.cellPolygons = cellPolygons;
    });

    console.log('delaunayData.cellPolygons', delaunayData.cellPolygons)

    return voronoi;
}

export function updateVoronoiLook(voronoi: d3.Voronoi<d3.Delaunay.Point>, noiseData: NoiseData, opts: {cellSize: number; colorsCount: number}) {
    const cellColors: string[] = [];

    function getColor_random() {
        const hue = Math.floor(Math.random() * 360);
        // const color = `hsl(${Math.floor(Math.random() * settings.colors) * (360 / settings.colors)}, 50%, 50%)`;
        const color = `hsl(${hue}, 50%, 50%)`;
    }
    function getColor_noise(cellIndex: number) {
        // const noiseCells = data.filter(d => {
        //     const x = d.x * opts.cellSize;
        //     const y = d.y * opts.cellSize;
        //     // const polyIndex = poly.index; @todo doesn't work - mobx removes "index" property?
        //     const polyIndex = cellIndex;
        //     return voronoi.contains(polyIndex, x, y);
        // });
        const noiseCells = [] as number[];
        const cols = noiseData.values.length;
        const rows = noiseData.values[0].length;
        // console.log('cols', cols, 'rows', rows)

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const val = noiseData.valuesNormalized[x][y];
                const px = x * opts.cellSize;
                const py = y * opts.cellSize;

                if (voronoi.contains(cellIndex, px, py)) {
                    noiseCells.push(val);
                }
            }
        }

        // ! min
        // ! max
        let value_avg = 0;
        for (const cellValue of noiseCells) {
            value_avg += cellValue / noiseCells.length;
        }
        // console.log(poly.index, 'value_avg', value_avg)
        const hue = Math.floor(value_avg * opts.colorsCount) * (360 / opts.colorsCount);
        const color = `hsl(${hue}, 50%, 50%)`;
        return color;
    }

    var t1 = performance.now();
    for (let i = 0; i < delaunayData.cellPolygons.length; i++) {
        const color = getColor_noise(i);

        cellColors.push(color);
    }
    var t2 = performance.now();
    console.log('perf', t2 - t1)

    runInAction(() => {
        delaunayData.cellColors = cellColors;
    });
}