import * as React from 'react';
import styled from '@emotion/styled';
import * as d3 from "d3";
import { observable, runInAction } from 'mobx';
import * as Simplex from 'open-simplex-noise';
import { observer } from 'mobx-react-lite';

// @todo animate "colors" setting change

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function inverseLerp(a: number, b: number, v: number) {
    return (v - a) / (b - a);
}

const settings = observable({
    width: 1000,
    height: 750,
    cellSize: 25,
    get rows() {
        return Math.ceil(this.height / this.cellSize);
    },
    get columns() {
        return Math.ceil(this.width / this.cellSize);
    },
    colors: 12,
});

const data: {x: number; y: number, color: string}[] = [];

function generateNoise(): { values: number[][]; valuesNormalized: number[][]; min: number; max: number} {
    const noise2d = Simplex.makeNoise2D(0);
    const values: number[][] = [];

    let min = Infinity;
    let max = -Infinity;

    for (let x = 0; x < settings.columns; x++) {
        values.push([]);

        for (let y = 0; y < settings.rows; y++) {

            const freq = .2;
            const noiseVal = (noise2d(x * freq, y * freq) + 1) / 2;
            // console.log('noiseVal', noiseVal)

            values[x].push(noiseVal);

            if (noiseVal < min) min = noiseVal;
            if (noiseVal > max) max = noiseVal;
        }
    }

    const valuesNormalized: number[][] = [];

    for (let x = 0; x < settings.columns; x++) {
        valuesNormalized.push([]);

        for (let y = 0; y < settings.rows; y++) {
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

function initData() {
    const noiseData = generateNoise();
    console.log('noiseData', noiseData);

    for (let x = 0; x < settings.columns; x++) {
        for (let y = 0; y < settings.rows; y++) {
            const noiseVal = noiseData.valuesNormalized[x][y];
            const hue = Math.floor(noiseVal * settings.colors) * (360 / settings.colors);
            // const color = `hsl(${Math.floor(Math.random() * settings.colors) * (360 / settings.colors)}, 50%, 50%)`;
            const color = `hsl(${hue}, 50%, 50%)`;

            data.push({x, y, color});
        }
    }
}

initData();

function renderSvg(elem: SVGSVGElement) {
    const container = d3.select(elem)

    const rect = container
        .selectChildren('rect')
        .data(data);

    const rectMargin = 2;

    rect
        .enter()
        .append('rect')
        .attr('x', d => settings.cellSize * d.x + rectMargin)
        .attr('y', d => settings.cellSize * d.y + rectMargin)
        .attr('width', d => settings.cellSize - rectMargin * 2)
        .attr('height', d => settings.cellSize - rectMargin * 2)
        // .append('circle')
        // .attr('cx', d => settings.cellSize * d.x)
        // .attr('cy', d => settings.cellSize * d.y)
        // .attr('r', d => settings.cellSize * .45)
        .attr('fill', d => d.color)
}

const Wrapper = styled.div`

`;

// import Delaunator from 'delaunator';
// const Delaunator = require('delaunator').default;
// console.log('Delaunator', Delaunator)

type Point = [number, number];
type Triangle = [Point, Point, Point]
type Polygon = Point[];

const delaunayData = observable<{
    origCoords: Point[];
    triangleCoords: Triangle[];
    circumcenters: Point[];
    cellPolygons: Polygon[];
}>({
    origCoords: [],
    triangleCoords: [],
    circumcenters: [],
    cellPolygons: [],
})

import PoissonDiskSampling from 'poisson-disk-sampling';

// console.log('poisson points', points)

export const VoronoiGrid = observer(() => {
    const svg1 = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        // const coordsOrig = [
        //     [100, 100],
        //     [200, 100],
        //     [200, 200],
        //     [100, 200],
        //     [170, 150],
        //     [250, 250],
        // ];
        const poisson = new PoissonDiskSampling({
            shape: [settings.width, settings.height],
            minDistance: 100,
            maxDistance: 150,
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

        const voronoi = delaunay.voronoi([0, 0, settings.width, settings.height]);

        const circumcenters: Point[] = [];
        for (let i = 0; i < voronoi.circumcenters.length; i += 2) {
            circumcenters.push([
                voronoi.circumcenters[i],
                voronoi.circumcenters[i + 1],
            ] as Point);
        }

        const cellPolygons = Array.from(voronoi.cellPolygons()).map((poly, i) => {
            // console.log('poly', i, poly);

            return poly as unknown as Polygon;
        });

        runInAction(() => {
            delaunayData.origCoords = coordsOrig;
            delaunayData.triangleCoords = coordinates;
            delaunayData.circumcenters = circumcenters;
            delaunayData.cellPolygons = cellPolygons;
        });

        // if (svg1.current) renderSvg(svg1.current);
    }, []);

    return (
        <Wrapper>
            <svg ref={svg1} width={settings.width} height={settings.height}>
                {
                    delaunayData.origCoords.map((c, i) => {
                        return (
                            <circle key={i} cx={c[0]} cy={c[1]} r={3} fill='red'></circle>
                        )
                    })
                }

                {
                    delaunayData.triangleCoords.map((t, i) => {
                        // console.log('t[0]', t[0])
                        const p1 = t[0];
                        const p2 = t[1];
                        const p3 = t[2];
                        // const y1 = t[0];
                        // const p2 = t[1];

                        return (
                            <g key={i}>
                              <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="grey"></line>
                              <line x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} stroke="grey"></line>
                              <line x1={p3[0]} y1={p3[1]} x2={p1[0]} y2={p1[1]} stroke="grey"></line>
                            </g>
                        )
                    })
                }

                {
                    delaunayData.circumcenters.map((p, i) => {
                        return (
                            <circle key={i} cx={p[0]} cy={p[1]} r={5} fill='black'></circle>
                        )
                    })
                }

                {
                    delaunayData.cellPolygons.map((poly) => {
                        return poly.map((p, i) => {
                            const nextPoint = i < (poly.length - 1) ? poly[i + 1] : poly[0];

                            return (
                                <g key={i}>
                                    <line x1={p[0]} y1={p[1]} x2={nextPoint[0]} y2={nextPoint[1]} stroke="orange"></line>
                                </g>
                            )
                        })
                    })
                }
            </svg>
        </Wrapper>
    );
});