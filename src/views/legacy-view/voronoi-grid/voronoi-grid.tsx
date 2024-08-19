import * as React from 'react';
import styled from '@emotion/styled';
import * as d3 from "d3";
import { observable, runInAction, observe, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { delaunayData, generateNoise, generateVoronoi, NoiseData, updateVoronoiLook, voronoi } from './voronoi';

// @todo animate "colors" setting change

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

// rerender on data change
function renderSvg(elem: SVGSVGElement, data: { x: number; y: number, color: string, value: number }[]) {
    console.log('renderSvg')
    const container = d3.select(elem)

    container
        .select('g#noise')
        .selectChildren('rect')
        .remove();

    const rect = container
        .select('g#noise')
        .selectChildren('rect')
        .data(data);

    // const rectMargin = 2;
    const rectMargin = 0;

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
    display: flex;
    gap: 2em;
`;

const mainForm = observable({
    freq: .2,
    poissonMin: 100,
    poissonMax: 150,
    voronoiOpacity: .5,
    setFreq(val: number) {
        this.freq = val;
    },
    setPoissonMin(val: number) {
        this.poissonMin = val;
    },
    setPoissonMax(val: number) {
        this.poissonMax = val;
    },
    setVoronoiOpacity(val: number) {
        this.voronoiOpacity = val;
    },
});


// console.log('poisson points', points)

// ! form to separate comp

const voronoiData = observable({
    noiseGenerated: 0
});

let noiseData: NoiseData;

export const VoronoiGrid = observer(() => {
    const svg1 = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        function updateNoise() {
            noiseData = generateNoise({
                size: {x: settings.columns, y: settings.rows},
                freq: mainForm.freq,
            });
        }
        function drawNoiseChart() {
            // console.log('svg1.current', svg1.current)
            if (svg1.current) {
                const data: { x: number; y: number, color: string, value: number }[] = [];

                for (let x = 0; x < settings.columns; x++) {
                    for (let y = 0; y < settings.rows; y++) {
                        const noiseVal = noiseData.valuesNormalized[x][y];
                        const hue = Math.floor(noiseVal * settings.colors) * (360 / settings.colors);
                        // const color = `hsl(${Math.floor(Math.random() * settings.colors) * (360 / settings.colors)}, 50%, 50%)`;
                        const color = `hsl(${hue}, 50%, 50%)`;

                        data.push({ x, y, color, value: noiseVal });
                    }
                }

                renderSvg(svg1.current, data);
            }
        }
        function updateVoronoi() {
            generateVoronoi({
                size: { x: settings.width, y: settings.height },
                poisson: { min: mainForm.poissonMin, max: mainForm.poissonMax }
            });
        }

        // on noise change generate voronoi
        reaction(() => voronoiData.noiseGenerated, () => {
            console.log('on noise data change');
            drawNoiseChart();
            // generateVoronoi({
            //     size: {x: settings.width, y: settings.height},
            //     poisson: {min: mainForm.poissonMin, max: mainForm.poissonMax}
            // });
            updateVoronoiLook(voronoi, noiseData, {cellSize: settings.cellSize, colorsCount: settings.colors});
        });

        reaction(() => delaunayData.cellPolygons, () => {
            console.log('on delaunay data change')
            updateVoronoiLook(voronoi, noiseData, {cellSize: settings.cellSize, colorsCount: settings.colors});
        });

        // on freq change generate noise
        reaction(() => mainForm.freq, () => {
            updateNoise();

            voronoiData.noiseGenerated += 1;
        });

        reaction(() => mainForm.poissonMin + '-' + mainForm.poissonMax, () => {
            updateVoronoi();
        });

        updateNoise();
        drawNoiseChart();
        updateVoronoi();

        // observe(() => {
        //     return JSON.stringify({
        //         freq: mainForm.freq,
        //         poissonMin: mainForm.poissonMin,
        //         poissonMax: mainForm.poissonMax,
        //     })
        // }, () => {

        //     generateVoronoi();

        // }, true);

        // observe(mainForm.freq, (val) => {
        //     // settings.op
        // }, true);
    }, []);

    return (
        <Wrapper>
            <div>
                <svg ref={svg1} width={settings.width} height={settings.height}>
                    <g id="noise"></g>

                    <g opacity={mainForm.voronoiOpacity}>
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
                            delaunayData.cellPolygons.map((poly, i) => {
                                // console.log('poly', poly);
                                // return poly.map((p, i) => {
                                //     const nextPoint = i < (poly.length - 1) ? poly[i + 1] : poly[0];
                                //     return (
                                //         <g key={i}>
                                //             <line x1={p[0]} y1={p[1]} x2={nextPoint[0]} y2={nextPoint[1]} stroke="orange"></line>
                                //         </g>
                                //     )
                                // })
                                const points = poly.map(p => {
                                    return `${p[0]},${p[1]}`
                                }).join(' ');
                                const color = delaunayData.cellColors[i];

                                return (
                                    <polygon key={i} points={points} fill={color} />
                                )
                            })
                        }
                    </g>
                </svg>
            </div>

            <div>
                <div><label><input type="number" min="0.001" max="2" step=".01" value={mainForm.freq} onChange={e => mainForm.setFreq(e.currentTarget.valueAsNumber)} /><input type="range" min="0.001" max="2" step=".01" value={mainForm.freq} onChange={e => mainForm.setFreq(e.currentTarget.valueAsNumber)}  style={{width: 400}} /> freq</label></div>
                <div><label><input type="number" value={mainForm.poissonMin} onChange={e => mainForm.setPoissonMin(e.currentTarget.valueAsNumber)} /> poisson min</label></div>
                <div><label><input type="number" value={mainForm.poissonMax} onChange={e => mainForm.setPoissonMax(e.currentTarget.valueAsNumber)} /> poisson max</label></div>
                <div><label><input type="range" min="0" max="1" step=".1" value={mainForm.voronoiOpacity} onChange={e => mainForm.setVoronoiOpacity(e.currentTarget.valueAsNumber)} /> voronoi opacity</label></div>
            </div>
        </Wrapper>
    );
});