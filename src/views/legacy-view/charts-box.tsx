import * as React from 'react';
import * as d3 from "d3";

interface Dataset {
    label: string;
    domain: [number, number];
    fn: (x: number) => number;
}

const datasets: Dataset[] = [
    {
        label: 'x',
        domain: [-2, 2],
        fn: x => x,
    },
    {
        label: 'x',
        domain: [-2, 8],
        fn: x => x,
    },
    {
        label: 'x^2',
        domain: [-5, 5],
        fn: x => x ** 2,
    },
    {
        label: 'x^3',
        domain: [-3, 3],
        fn: x => x ** 3,
    },
    {
        label: '2^x',
        domain: [0, 4],
        fn: x => 2 ** x,
    },
    {
        label: 'sqrt(x)',
        domain: [0, 100],
        fn: x => Math.sqrt(x),
    },
    {
        label: 'log(x)',
        domain: [0.01, 10],
        fn: x => Math.log(x),
    },
    {
        label: 'sin(x)',
        domain: [-Math.PI * 2, Math.PI * 2],
        fn: x => Math.sin(x),
    },
    {
        label: 'cos(x)',
        domain: [-Math.PI * 2, Math.PI * 2],
        fn: x => Math.cos(x),
    },
    {
        label: 'tan(x)',
        domain: [-Math.PI * .49, Math.PI * .49],
        fn: x => Math.tan(x),
    },
    {
        label: 'ctg(x)',
        domain: [-Math.PI * .49, Math.PI * .49],
        fn: x => 1 / Math.tan(x),
    },
    {
        label: 'normal distribution',
        domain: [-4, 4],
        fn: x => {
            const normalDist = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);

            return normalDist(x);
        },
    },
    {
        label: 'exponential distribution',
        domain: [0, 10],
        fn: x => {
            const expDist = (x: number, r: number) => {
                return r * Math.exp(-r * x);
            };

            const r = 1;
            return expDist(x, r) * 100;
        },
    },
    {
        label: 'sin(x)',
        domain: [-Math.PI * 10, Math.PI * 10],
        fn: x => Math.sin(x) * Math.abs(x >= 0 ? (x ** 1.5) : x) / Math.PI,
    },
];

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

function formatFunctionCode(str: string): string {
    const lines = str.split('\n');
    const match = lines[lines.length - 1].match(/^( *)/);
    if (!match) return str;

    const [_, spaces] = match;

    return lines.map(l => {
        const regex = new RegExp(`^${spaces}`);
        return l.replace(regex, '');
    }).join('\n');
}

function drawChart(containerId: string, chartId: string, dataset: Dataset): void {
    const data = generateData(dataset.domain, 50, dataset.fn);

    const containerWidth = 350;
    const containerHeight = 350;

    const svgID = chartId;
    // console.log(svgID, dataset.label, data);
    const datasetHtml = `<div>
    <p>${dataset.label}</p>
    <pre><textarea rows="10" cols="80">${formatFunctionCode(dataset.fn.toString())}</textarea></pre>
    <svg id="${svgID}" width="${containerWidth}" height="${containerHeight}" class="chart"></svg>
</div>`;

    const containerEl = document.getElementById(containerId);
    if (!containerEl) throw new Error(`element with id ${containerId} does not exist`);

    containerEl.innerHTML += datasetHtml;

    const container = d3.select(`#${svgID}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight);

    const getDomain = (min: number, max: number, val: number) => {
        const size = max - min;
        const margin = size * val;
        return [min - margin, max + margin];
    };
    const xScale = d3.scaleLinear().domain(getDomain(dataset.domain[0], dataset.domain[1], .25)).range([0, containerWidth]);
    const yScale = d3.scaleLinear().domain(getDomain(data.min, data.max, .25)).range([containerHeight, 0]);

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

    // const barWidth = 25;
    // const bars = container
    //     .selectAll('.bar')
    //     .data(data.values)
    //     .enter()
    //     .append('rect')
    //     .classed('bar', true)
    //     .attr('width', xScale.bandwidth())
    //     .attr('height', d => yScale(d))
    //     .attr('x', d => xScale(d))
    //     .attr('y', d => containerHeight - yScale(d))
    //     // .style('left', (x, i) => i * barWidth + 'px')
    //     .attr('fill', (x, i) => i % 2 ? 'silver' : 'grey')
    //     // .text(x => x)

    const xAttr = (d: {x: number; y: number}) => {
        return xScale(d.x);
    };
    const yAttr = (d: {x: number; y: number}) => {
        return yScale(d.y);
    };

    const bars = container
        .selectAll('.bar')
        .data(data.values)
        .enter()
        .append('rect')
        .classed('bar', true)
        .attr('width', 1)
        .attr('height', d => containerHeight - yScale(d.y))
        .attr('x', xAttr)
        .attr('y', yAttr)
        // .style('left', (x, i) => i * barWidth + 'px')
        .attr('fill', '#ddd')
    // .text(x => x)

    // const dots = container
    //     .selectAll('.dot')
    //     .data(data.values)
    //     .enter()
    //     .append('circle')
    //     .classed('dot', true)
    //     .attr('r', 3)
    //     .attr('cx', xAttr)
    //     .attr('cy', yAttr)
    //     // .style('left', (x, i) => i * barWidth + 'px')
    //     .attr('fill', (x, i) => i % 2 ? 'silver' : 'grey')
    //     // .text(x => x)

    container.append("path")
        .datum(data.values)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<{x: number; y: number}>()
            .x(xAttr)
            .y(yAttr)
        );
}

// const yScale = d3.scaleLinear().domain([-100, 100]).range([0, 1000]);
// console.log(yScale(50))

// @todo replace points with line (option?)
// @todo grid
// @todo crosshair with [x,y] values shown
// @todo option - proportional x,y axes
let chartCounter = 0;

// function addChart(label: string, domain: [number, number], fnStr: string) {
//     chartCounter += 1;
//     drawChart(`chart_${chartCounter}`, {
//         label,
//         domain,
//         fn: new Function('x', fnStr),
//     });
// }

// window.addChart = addChart;

export const ChartsBox = () => {
    const wrapperId = 'charts-container';

    React.useEffect(() => {
        datasets.forEach((dataset, i) => {
            chartCounter += 1;
            drawChart(wrapperId, `chart_${chartCounter}`, dataset);
        });
    }, []);

    return (
        <div id={wrapperId} className="grid-container">

        </div>
    );
}