import * as React from 'react';
import * as d3 from 'd3';

interface Dataset {
    label: string;
    domain: [number, number];
    fn: (x: number) => number;
}

const datasets: Dataset[] = [
    {
        label: 'x^2 + x',
        domain: [-10, 10],
        fn: x => x ** 2 + 5 * x,
    },
    {
        label: 'sin + x^2',
        domain: [-10, 10],
        fn: x => Math.sin(x) + .025 * x ** 2,
    },
    {
        label: 'x^3',
        domain: [-10, 10],
        fn: x => x ** 3 - 50 * x,
    },
];

namespace GeneratedData {
    export interface Value {
        x: number;
        y: number;
    }

    export interface Result {
        values: Value[];
        min: number;
        max: number;
    }
}

function generateData([from, to]: [number, number], n: number, fn: (x: number) => number): GeneratedData.Result {
    const values = [];
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < n; ++i) {
        const x = from + (to - from) / (n - 1) * i;
        const y = fn(x);
        values.push({ x, y })

        if (y < min) min = y;
        else if (y > max) max = y;
    }

    return {
        values,
        min,
        max,
    };
}

function drawChart(containerId: string, chartId: string, dataset: Dataset): void {
    const data = generateData(dataset.domain, 50, dataset.fn);

    const containerWidth = 350;
    const containerHeight = 350;

    const svgID = chartId;
    // console.log(svgID, dataset.label, data);
    const datasetHtml = `<div>
        <p>${dataset.label}</p>
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

    const xAttr = (d: GeneratedData.Value) => {
        return xScale(d.x);
    };
    const yAttr = (d: GeneratedData.Value) => {
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
    //     .attr('r', 2)
    //     .attr('cx', xAttr)
    //     .attr('cy', yAttr)
    //     // .style('left', (x, i) => i * barWidth + 'px')
    //     // .attr('fill', (x, i) => i % 2 ? 'silver' : 'grey')
    //     .attr('fill', (x, i) => 'tomato')
    // // .text(x => x)

    container.append("path")
        .datum(data.values)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<GeneratedData.Value>()
            .x(xAttr)
            .y(yAttr)
        );
}

// const yScale = d3.scaleLinear().domain([-100, 100]).range([0, 1000]);
// console.log(yScale(50))


export function SumFunctionBox() {
    const wrapperId = 'sum-functions-container';

    React.useEffect(() => {
        // @todo replace points with line (option?)
        // @todo grid
        // @todo crosshair with [x,y] values shown
        // @todo option - proportional x,y axes
        datasets.forEach((dataset, i) => {
            drawChart(wrapperId, `${wrapperId}_chart_${i}`, dataset);
        });
    }, []);

    return (
        <div id={wrapperId} className="grid-container">

        </div>
    );
}