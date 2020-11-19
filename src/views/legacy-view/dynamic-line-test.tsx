import * as React from 'react';
import * as d3 from "d3";
import { observer } from 'mobx-react-lite';
import { action, observable } from 'mobx';

const randomInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const randomFloat = (a: number, b: number) => a + Math.random() * (b - a + 1);
const randomSample: <T>(arr: T[]) => T = arr => arr[Math.floor(Math.random() * arr.length)];

function renderDynamicLine(elem: SVGSVGElement) {
    let idCounter = 0;
    let data = new Array(200 / 5 + 1).fill(undefined).map((_, i) => i);
    const container = d3.select(elem)

    function update(data: number[]) {
        const bar = container
            .selectChildren('path')
            .data(data)
            .attr('d', (d, i) => `M${i * 5},100 V${100 - d}`)
            .attr("stroke", "#eee")
            .attr("stroke-width", 1)

        bar.enter()
            .append('path')
            .attr('d', (d, i) => `M${i * 5},100 V${100 - d}`)
            .attr("stroke", "#eee")
            .attr("stroke-width", 1)

        bar.exit()
            .remove();

        container
            .append('path')
            .datum(data)
            .attr('d', d3.line<number>()
                .x((d, i) => i * 5)
                .y(d => 100 - d)
            )
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1)
            .attr('fill', 'none')
    }

    update(data);

    const interval = 100;
    setInterval(() => {
        if (!controls.isActive) return;

        // data[randomInt(0, data.length - 1)] = randomInt(0, 100);

        // if (Math.random() < .5) data.shift();
        data.shift();
        // if (Math.random() < .5) data.push(randomInt(0, 50));
        data.push(randomInt(0, 50));

        // const sin = Math.sin(((Date.now() / 10) % 360) * Math.PI / 180);
        // data.push((sin + 1) / 2 * 100);

        update(data);
    }, interval);
}

const controls = observable({
    isActive: true,
    width: 400,
    height: 200,
    historyLength: 50
});

function renderRandomWalk(elem: SVGSVGElement) {
    let idCounter = 0;
    const series = 10;
    const defaultValue = 50;
    let datasets = new Array(series).fill(undefined).map(() => [defaultValue]);

    const container = d3.select(elem)

    let containerWidth: number;
    let containerHeight: number;
    let space: number;

    let minY = defaultValue;
    let maxY = defaultValue;

    let xAxis = d3.axisBottom(d3.scaleLinear());
    let yAxis = d3.axisLeft(d3.scaleLinear());

    container
        .append('g')
        .classed('axis-x', true)

    container
        .append('g')
        .classed('axis-y', true)

    for (let i = 0; i < series; i++) {
        container
            .append('path')
            .classed(`path-${i}`, true)
            .attr("stroke-width", 1)
            .attr('fill', 'none')
    }

    // test perf when series=100 & interval=10
    function update(data: number[]) {
        // containerWidth = parseInt(elem.getAttribute('width') || '0');
        containerWidth = controls.width;
        containerHeight = controls.height;
        space = containerWidth / controls.historyLength;

        const xScale = d3.scaleLinear().domain([0, containerWidth / space]).rangeRound([0, containerWidth]);
        const yScale = d3.scaleLinear().domain([minY, maxY]).rangeRound([containerHeight, 0]);

        xAxis = d3.axisBottom(xScale);
        yAxis = d3.axisLeft(yScale);

        container
            .selectChild('g.axis-x')
            .attr('transform', `translate(0, ${yScale(50)})`)
            .call(xAxis);

        container
            .selectChild('g.axis-y')
            .attr('transform', `translate(${xScale(20)}, 0)`)
            .call(yAxis);

        const bar = container
            .selectChildren('path.bar')
            .data(data)
            .attr('d', (d, i) => `M${xScale(i)},${yScale(minY)} V${yScale(maxY)}`)
            .attr("stroke", "#eee")
            .attr("stroke-width", 1)

        bar.enter()
            .append('path')
            .classed('bar', true)
            .attr('d', (d, i) => `M${xScale(i)},${yScale(minY)} V${yScale(maxY)}`)
            .attr("stroke", "#eee")
            .attr("stroke-width", 1)

        bar.exit()
            .remove();

        for (let i = 0; i < series; i++) {
            container
                .selectChild(`path.path-${i}`)
                .datum(datasets[i])
                // .transition()
                // .duration(500)
                .attr('d', d3.line<number>()
                    .x((d, i) => xScale(i))
                    .y(d => yScale(d))
                )
                .attr("stroke", `hsl(${360 / series * i}, 50%, 50%)`)
                // .attr("stroke-width", 1)
                // .attr('fill', 'none')
        }
    }

    for (let i = 0; i < datasets.length; i++) {
        update(datasets[i]);
    }

    const interval = 10;
    setInterval(() => {
        if (!controls.isActive) return;

        for (let i = 0; i < datasets.length; i++) {
            const data = datasets[i];
            // data[randomInt(0, data.length - 1)] = randomInt(0, 100);

            // if (Math.random() < .5) data.shift();
            if (data.length > containerWidth / space) data.shift();
            // if (Math.random() < .5) data.push(randomInt(0, 50));
            const val = data[data.length - 1] + (Math.random() < .5 ? 1 : -1);
            data.push(val);

            if (val < minY) minY = val;
            if (val > maxY) maxY = val;

            // const sin = Math.sin(((Date.now() / 10) % 360) * Math.PI / 180);
            // data.push((sin + 1) / 2 * 100);

            update(datasets[i]);
        }
    }, interval);
}

export const DynamicLineTest: React.FC = observer(() => {
    const svg1 = React.useRef<SVGSVGElement>(null);
    const svg2 = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (svg1.current) renderDynamicLine(svg1.current);
        if (svg2.current) renderRandomWalk(svg2.current);
    }, [])

    return (
        <div id="dynamic-line-test-container">
            <div>
                <button onClick={action(() => controls.isActive = !controls.isActive)}>{controls.isActive ? 'pause' : 'resume'}</button>
                <input
                    type="number"
                    value={controls.width}
                    onChange={e => action(() => controls.width = e.currentTarget.valueAsNumber || 0)()}
                    style={{width: 50}}
                />
                <input
                    type="number"
                    value={controls.height}
                    onChange={e => action(() => controls.height = e.currentTarget.valueAsNumber || 0)()}
                    style={{width: 50}}
                />
                <input
                    type="number"
                    value={controls.historyLength}
                    onChange={e => action(() => controls.historyLength = e.currentTarget.valueAsNumber || 0)()}
                    style={{width: 50}}
                />
            </div>

            <svg ref={svg1} width={controls.width} height={controls.height} style={{border: '1px solid grey'}}></svg>
            <svg ref={svg2} width={controls.width} height={controls.height} style={{border: '1px solid grey'}}></svg>
        </div>
    );
});