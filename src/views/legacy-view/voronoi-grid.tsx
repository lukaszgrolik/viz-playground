import * as React from 'react';
import styled from '@emotion/styled';
import * as d3 from "d3";
import { observable } from 'mobx';
import * as Simplex from 'open-simplex-noise';

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

export function VoronoiGrid() {
    const svg1 = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (svg1.current) renderSvg(svg1.current);
    }, []);

    return (
        <Wrapper>
            <svg ref={svg1} width={settings.width} height={settings.height}></svg>
        </Wrapper>
    );
}