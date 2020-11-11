import * as React from "react";
import * as d3 from "d3";

import * as Viz from "../../lib/viz";

function drawChart(containerId: string, domain: [number, number], data: Viz.SimplexNoiseViz.Result['data'], i = 0) {
    // const data = generateData(dataset.domain, 50, dataset.fn);
    // const {domain, data} = getRandomWalkData(1000, 1);

    const containerWidth = 350;
    const containerHeight = 350;

    const svgID = `${containerId}_chart_${i}`;
    // console.log(svgID, domain, data);
    const datasetHtml = `<div>
    <p>simplex noise #${i + 1}</p>
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
    // const xScale = d3.scaleLinear().domain([domain[0] * xSizeMultiplier, domain[1] * xSizeMultiplier]).range([0, containerWidth]);
    const xScale = d3.scaleLinear().domain(getDomain(domain[0], domain[1], .25)).range([0, containerWidth]);
    // const yScale = d3.scaleLinear().domain([data.min - 10, data.max + 10]).range([containerHeight, 0]);
    const yScale = d3.scaleLinear().domain(getDomain(data.min, data.max, .25)).range([containerHeight, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    container
        .append('g')
        .attr('transform', `translate(0, ${yScale(0)})`)
        .call(xAxis);

    container
        .append('g')
        .attr('transform', `translate(${xScale(domain[0])}, 0)`)
        .call(yAxis);

    const xAttr = (d: Viz.SimplexNoiseViz.Value) => {
        return xScale(d[0]);
    };
    const yAttr = (d: Viz.SimplexNoiseViz.Value) => {
        return yScale(d[1]);
    };

    const bars = container
        .selectAll('.bar')
        .data<Viz.SimplexNoiseViz.Value>(data.values)
        .enter()
        .append('rect')
        .classed('bar', true)
        .attr('width', 1)
        .attr('height', d => containerHeight - yAttr(d))
        .attr('x', xAttr)
        .attr('y', yAttr)
        // .style('left', (x, i) => i * barWidth + 'px')
        .attr('fill', '#ddd')

    container.append("path")
        .datum(data.values)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(xAttr)
            .y(yAttr)
        );
}

const viz = new Viz.Viz('', {containerHeight: 0, containerWidth: 0});

function drawCharts(containerId: string) {
    (() => {
        const res = viz.genSimplexNoise({
            samples: 100,
            amp: 1,
            freq: .05,
        });

        drawChart(containerId, res.domain, res.data, 0);
    })();

    (() => {
        const res = viz.genSimplexNoise({
            samples: 100,
            amp: 1,
            freq: .05,
            modifyValue: (val, i) => {
                return val + i * .05;
            },
        });

        drawChart(containerId, res.domain, res.data, 1);
    })();

    (() => {
        const samples = 100;
        const res = viz.genSimplexNoise({
            samples,
            amp: 1,
            freq: .05,
            modifyValue: (val, i) => {
                return val + (i + Math.round(samples / 2) ** 2) * .0001;
            },
        });

        drawChart(containerId, res.domain, res.data, 2);
    })();

    (() => {
        const res = viz.genSimplexNoise({
            samples: 100,
            amp: 1,
            freq: .05,
            modifyValue: (val, i) => {
                return val + Math.sin(i) * .05;
            },
        });

        drawChart(containerId, res.domain, res.data, 3);
    })();

    (() => {
        const oct1 = viz.genSimplexNoise({
            samples: 100,
            amp: .1,
            freq: .333,
        });
        const res = viz.genSimplexNoise({
            samples: 100,
            amp: 1,
            freq: .05,
            modifyValue: (val, i) => {
                return val + oct1.data.values[i][1];
            },
        });

        drawChart(containerId, res.domain, res.data, 4);
    })();
}

export function SimplexNoiseBox() {
    const wrapperId = 'simplex-noise-box';

    React.useEffect(() => {
        drawCharts(wrapperId);
    }, []);

    return (
        <div id={wrapperId} className="grid-container">

        </div>
    )
}