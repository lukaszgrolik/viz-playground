import * as d3 from 'd3';
import { makeNoise2D } from 'open-simplex-noise';

function generateData([from, to]: [number, number], n: number, fn: (x: number) => number) {
    const values = [];
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < n; ++i) {
        const x = from + (to - from) / (n - 1) * i;
        const y = fn(x);
        values.push({ x, y })

        if (y < min) min = y;
        if (y > max) max = y;
    }

    return {
        values,
        min,
        max,
    };
}

export namespace RandomWalk {
    export interface Config {
        samples: number;
        iterations: number;
        initialValue: number;
        step: number;
        generator?: (step: number) => number;
    }

    export type Value = [number, number];

    export interface Result {
        domain: [number, number],
        data: {
            values: Value[],
            min: number,
            max: number,
        },
    }
}

// @todo random walk 2d
function getRandomWalkData({ samples, iterations, initialValue, step, generator }: RandomWalk.Config): RandomWalk.Result {
    const arr = new Array(samples).fill(undefined).map(() => initialValue);
    let min = Infinity;
    let max = -Infinity;

    const dist: { [key: number]: number } = {};
    let distMin = Infinity;
    let distMax = -Infinity;

    const defaultGen = () => {
        return Math.floor(Math.random() * 2) ? step : -step;
    };
    const gen = generator || defaultGen;

    for (let i = 0; i < samples; ++i) {
        for (let j = 0; j < iterations; ++j) {
            arr[i] += gen(step);
        }

        const val = arr[i];
        if (val > max) max = val;
        if (val < min) min = val;

        if (!dist[val]) dist[val] = 0;
        dist[val] += 1;

        if (dist[val] > distMax) distMax = dist[val];
        if (dist[val] < distMin) distMin = dist[val];
    }
    // console.log('dist', dist)

    // const mean = arr.reduce((s, a) => s + a, 0) / arr.length;
    const distSorted = Object.entries(dist)
        .reduce((memo: [number, number][], [key, val]) => {
            memo.push([parseInt(key), val]);
            return memo;
        }, [])
        .sort((a, b) => a[0] - b[0]);

    // console.log(mean, min, max, distSorted)

    return {
        domain: [min, max],
        data: {
            values: distSorted,
            min: distMin,
            max: distMax,
        },
    };
}

export namespace SimplexNoiseViz {
    export interface Config {
        samples: number;
        freq: number;
        amp: number;
        modifyValue?: (x: number, i: number) => number;
    }

    export type Value = [number, number];

    export interface Result {
        domain: [number, number],
        data: {
            values: Value[],
            min: number,
            max: number,
        },
    }
}

function genSimplexNoise(opts: SimplexNoiseViz.Config): SimplexNoiseViz.Result {
    const domain: [number, number] = [0, opts.samples];
    const noise2d = makeNoise2D(0);
    const data: SimplexNoiseViz.Result['data'] = {
        values: [],
        min: Infinity,
        max: -Infinity,
    };

    const defaultModifyValue = (x: number) => x;
    const modifyValue = opts.modifyValue || defaultModifyValue;

    for (let i = 0; i < opts.samples; i++) {
        const val = modifyValue(noise2d(i * opts.freq, 0) * opts.amp, i);
        data.values.push([i, val])

        if (val > data.max) data.max = val;
        if (val < data.min) data.min = val;
    }

    return { domain, data };
}

interface VizOpts {
    containerWidth: number;
    containerHeight: number;
}

export class Viz {
    constructor(private readonly chartId: string, private readonly opts: VizOpts) {

    }

    getRandomWalk(opts: RandomWalk.Config) {
        return getRandomWalkData(opts);
    }

    genSimplexNoise(opts: SimplexNoiseViz.Config) {
        return genSimplexNoise(opts);
    }

    round(val: number, n: number) {
        return Math.round(val * n) / n;
    }

    times<T>(n: number, cb: (n: number) => T): T[] {
        return new Array(n).fill(null).map((_, i) => cb(i));
    }

    // rename to drawLineChart
    draw(
        domain: [number, number],
        samples: number,
        callback: (x: number) => number,
        getLabel: (x: number) => string = x => x.toString()
    ) {
        const data = generateData(domain, samples, callback);

        // const containerEl = document.getElementById(this.chartId);
        // if (!containerEl) throw new Error(`element with id ${this.chartId} does not exist`);

        // containerEl.innerHTML += datasetHtml;

        const container = d3.select(`#${this.chartId}`)
            .attr('width', this.opts.containerWidth)
            .attr('height', this.opts.containerHeight);

        const getDomain = (min: number, max: number, val: number) => {
            const size = max - min;
            const margin = size * val;
            return [min - margin, max + margin];
        };
        const xScale = d3.scaleLinear().domain(getDomain(domain[0], domain[1], .25)).range([0, this.opts.containerWidth]);
        const yScale = d3.scaleLinear().domain(getDomain(data.min, data.max, .25)).range([this.opts.containerHeight, 0]);

        const xAxis = d3.axisBottom(xScale).tickFormat(getLabel);
        const yAxis = d3.axisLeft(yScale);

        container
            .append('g')
            .attr('transform', `translate(0, ${yScale(0)})`)
            .call(xAxis);

        container
            .append('g')
            .attr('transform', `translate(${xScale(0)}, 0)`)
            .call(yAxis);

        const xAttr = (d: { x: number; y: number }) => {
            return xScale(d.x);
        };
        const yAttr = (d: { x: number; y: number }) => {
            return yScale(d.y);
        };

        const bars = container
            .selectAll('.bar')
            .data(data.values)
            .enter()
            .append('rect')
            .classed('bar', true)
            .attr('width', 1)
            .attr('height', d => this.opts.containerHeight - yScale(d.y))
            .attr('x', xAttr)
            .attr('y', yAttr)
            .attr('fill', '#ddd')

        container.append("path")
            .datum(data.values)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line<{ x: number; y: number }>()
                .x(xAttr)
                .y(yAttr)
            );
    }

    drawGrid(domain: [number, number], samples: number, callback: (x: number) => number) {
        const data = generateData(domain, samples, callback);

        // const containerEl = document.getElementById(this.chartId);
        // if (!containerEl) throw new Error(`element with id ${this.chartId} does not exist`);

        // containerEl.innerHTML += datasetHtml;

        const container = d3.select(`#${this.chartId}`)
            .attr('width', this.opts.containerWidth)
            .attr('height', this.opts.containerHeight);

        const getDomain = (min: number, max: number, val: number) => {
            const size = max - min;
            const margin = size * val;
            return [min - margin, max + margin];
        };
        const xScale = d3.scaleLinear().domain(getDomain(domain[0], domain[1], .25)).range([0, this.opts.containerWidth]);
        const yScale = d3.scaleLinear().domain(getDomain(data.min, data.max, .25)).range([this.opts.containerHeight, 0]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        container
            .append('g')
            .attr('transform', `translate(0, ${yScale(0)})`)
            .call(xAxis);

        container
            .append('g')
            .attr('transform', `translate(${xScale(0)}, 0)`)
            .call(yAxis);

        const xAttr = (d: { x: number; y: number }) => {
            return xScale(d.x);
        };
        const yAttr = (d: { x: number; y: number }) => {
            return yScale(d.y);
        };

        const bars = container
            .selectAll('.bar')
            .data(data.values)
            .enter()
            .append('rect')
            .classed('bar', true)
            .attr('width', 1)
            .attr('height', d => this.opts.containerHeight - yScale(d.y))
            .attr('x', xAttr)
            .attr('y', yAttr)
            .attr('fill', '#ddd')

        container.append("path")
            .datum(data.values)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line<{ x: number; y: number }>()
                .x(xAttr)
                .y(yAttr)
            );
    }
}