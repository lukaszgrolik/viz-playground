import * as React from 'react';
import styled from '@emotion/styled';
import * as d3 from "d3";
import { observable, runInAction, observe, reaction, remove, comparer } from 'mobx';
import { observer } from 'mobx-react-lite';
import { CellData, CellularSim } from './cellular-sim';

export const settings = observable({
    width: 1000,
    // width: 100,
    height: 1000,
    // height: 100,
    cellSize: 20,
    get rows() {
        return Math.ceil(this.height / this.cellSize);
    },
    get columns() {
        return Math.ceil(this.width / this.cellSize);
    },
    colors: 24,
});

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const invLerp = (a: number, b: number, v: number) => (v - a) / (b - a);
const remap = (fromMin: number, fromMax: number, toMin: number, toMax: number, v: number) => lerp(toMin, toMax, invLerp(fromMin, fromMax, v));


function renderSvg(elem: SVGSVGElement, data: CellData[]) {
    // console.log('renderSvg')
    const container = d3.select(elem)

    // container
    //     .select('g#noise')
    //     .selectChildren('rect')
    //     .remove();

    const rect = container
        .select('g#noise')
        .selectChildren('rect')
        .data(data);

    // const rectMargin = 2;
    const rectMargin = 0;

    // d3.Selection<SVGElement, CellData, d3.BaseType, unknown>

    rect.join(
        enter => {
            return enter.append('rect')
            .attr('x', d => settings.cellSize * d.x + rectMargin)
            .attr('y', d => settings.cellSize * d.y + rectMargin)
            .attr('width', d => settings.cellSize - rectMargin * 2)
            .attr('height', d => settings.cellSize - rectMargin * 2)
            // .append('circle')
            // .attr('cx', d => settings.cellSize * d.x)
            // .attr('cy', d => settings.cellSize * d.y)
            // .attr('r', d => settings.cellSize * .45)
            .attr('fill', d => d.value ? 'red' : 'white')
        },
        update => {
            const getAgeColor = (age: number) => {
                const maxAge = 250;
                const ageProgress = Math.min(age / maxAge, 1);
                const colorMin = 120;
                const colorMax = 0;
                const hueOrig = Math.floor(ageProgress * settings.colors) * (360 / settings.colors);
                const hueRemap = remap(0, 360, colorMin, colorMax, hueOrig);
                // const color = `hsl(${Math.floor(Math.random() * settings.colors) * (360 / settings.colors)}, 50%, 50%)`;
                const color = `hsl(${hueRemap}, 50%, 50%)`;

                return color;
            }

            return update
                .attr('fill', d => d.value ? getAgeColor(d.age) : 'white')
        },
        exit => {
            return exit.remove();
        }
    )

}

declare var window: {
    __helpers: {
        cellularSim?: CellularSim
    }
}

window.__helpers = {};

const Wrapper = styled.div`
    display: flex;
    gap: 2em;
`;

let timeoutId: number;
export const CellularAutomataView = observer(() => {
    const svg1 = React.useRef<SVGSVGElement>(null);
    const [isRunning, setIsRunning] = React.useState(true);
    const [cellularSim] = React.useState(new CellularSim());

    function startLoop() {
        let i = 0;
        // let stopped = false;

        let time: number;
        let lastUpdate: number = -Infinity;

        function loop() {
            if (!isRunning) return;

            time = performance.now() / 1000;
            // console.log('lastUpdate', lastUpdate)

            if (time >= lastUpdate + 1/60) {

                cellularSim.tick();
                // console.log('after tick')

                if (svg1.current) renderSvg(svg1.current, cellularSim.data);

                i += 1;

                // if (i == 10) {
                //     stopped = true;
                //     clearTimeout(timeoutId);
                //     return;
                // }

                lastUpdate = performance.now() / 1000;
            }

            timeoutId = requestAnimationFrame(loop);
        }

        loop();
    }

    React.useEffect(() => {
        window.__helpers.cellularSim = cellularSim;

        if (svg1.current) renderSvg(svg1.current, cellularSim.data);

        // startLoop();

        return () => {
            cancelAnimationFrame(timeoutId);
        }
    }, []);

    React.useEffect(() => {
        // console.log('isRunning', isRunning)
        if (isRunning) {
            startLoop();
        }
        else {
            // console.log('timeoutId', timeoutId)
            cancelAnimationFrame(timeoutId);
        }
    }, [isRunning]);

    return (
        <Wrapper>
            <div>
                <svg id="svg" ref={svg1} width={settings.width} height={settings.height}>
                    <g id="noise"></g>
                </svg>
            </div>

            <div>
                <button onClick={() => setIsRunning(!isRunning)}>{isRunning ? 'stop' : 'start'}</button>

                <button onClick={() => {
                    cellularSim.setCellsAlive({ x: 5, y: 5 }, { x: 20, y: 15 });
                }}>insert</button>

            </div>
        </Wrapper>
    );
});