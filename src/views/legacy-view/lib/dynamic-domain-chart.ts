import * as d3 from "d3";

export function drawChart(containerEL: HTMLElement, i = 0) {
    // const data = generateData(dataset.domain, 50, dataset.fn);
    // const {domain, data} = getRandomWalkData(1000, 1);

    interface DataValue {
        x: number;
        y: number;
    }

    interface Data {
        currentX: number;
        values: DataValue[];
        min: () => number;
        max: () => number;
        domain: () => [number, number];
        generateValue: () => DataValue;
        addValue: () => void;
    }

    const data: Data = {
        currentX: 0,
        values: [],
        min() {
            return Math.min(...this.values.map(v => v.y));
        },
        max() {
            return Math.max(...this.values.map(v => v.y));
        },
        domain() {
            return [this.currentX - this.values.length, this.currentX - 1]
        },
        generateValue() {
            const y = Math.floor(Math.random() * 10);

            return { x: this.currentX++, y };
        },
        addValue() {
            // this.values.shift();
            this.values.push(this.generateValue());

            this.values = this.values.slice();
        },
    };
    data.values = new Array(20).fill(undefined).map((_, i) => {
        return data.generateValue();
    });

    const containerWidth = 350;
    const containerHeight = 350;

    const svgID = `${containerEL.id}_chart_${i}`;
    // console.log(svgID, domain, data);
    const datasetHtml = `<div>
    <p>simplex noise #${i + 1}</p>
    <svg id="${svgID}" width="${containerWidth}" height="${containerHeight}" class="chart"></svg>
</div>`;

    // const containerEl = document.getElementById(containerId);
    // if (!containerEl) throw new Error(`element with id ${containerId} does not exist`);

    containerEL.innerHTML += datasetHtml;

    const container = d3.select(`#${svgID}`)
        .attr('width', containerWidth)
        .attr('height', containerHeight);

    const getDomain = (min: number, max: number, val: number) => {
        const size = max - min;
        const margin = size * val;
        return [min - margin, max + margin];
    };
    const domain = data.domain();
    const xScale = d3.scaleLinear().domain(getDomain(domain[0], domain[1], .25)).range([0, containerWidth]);
    const yScale = d3.scaleLinear().domain(getDomain(data.min(), data.max(), .25)).range([containerHeight, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    container
        .append('g')
        .attr('transform', `translate(0, ${yScale(0)})`)
        .attr("class", "myXaxis")
    // .call(xAxis);

    container
        .append('g')
        // .attr('transform', `translate(${xScale(domain[0])}, 0)`)
        .attr('transform', `translate(${xScale(domain[0])}, 0)`)
        .attr("class", "myYaxis")
    // .call(yAxis);

    // const xAttr = (d: DataValue) => {
    //     return xScale(d.x);
    // };
    // const yAttr = (d: DataValue) => {
    //     return yScale(d.y);
    // };

    // const bar = container
    //     .selectAll('.bar')
    //     .data<DataValue>(data.values)
    //     // .enter()
    //     // .append('rect')
    //     // .classed('bar', true)
    //     // .attr('width', 1)
    //     // .attr('height', d => containerHeight - yAttr(d))
    //     // .attr('x', xAttr)
    //     // .attr('y', yAttr)
    //     // // .style('left', (x, i) => i * barWidth + 'px')
    //     // .attr('fill', '#ddd')

    // bar.enter()
    //     .append('rect')
    //     .classed('bar', true)
    //     .attr('width', 1)
    //     .attr('height', d => containerHeight - yAttr(d))
    //     .attr('x', xAttr)
    //     .attr('y', yAttr)
    //     // .style('left', (x, i) => i * barWidth + 'px')
    //     .attr('fill', '#ddd')

    // bar.exit().remove();

    // container.append("path")
    //     .datum(data.values)
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 1.5)
    //     .attr("d", d3.line<DataValue>()
    //         .x(xAttr)
    //         .y(yAttr)
    //     );

    function update(data: Data) {
        const domain = data.domain();
        xScale.domain(getDomain(domain[0], domain[1], .25));
        yScale.domain(getDomain(data.min(), data.max(), .25));

        container.selectAll(".myXaxis")
            .call(xAxis);

        container.selectAll(".myYaxis")
            .call(yAxis);

        const xAttr = (d: DataValue) => {
            return xScale(d.x);
        };
        const yAttr = (d: DataValue) => {
            return yScale(d.y);
        };

        const bar = container
            .selectAll('.bar')
            .data<DataValue>(data.values);

        bar.enter()
            .append('rect')
            .classed('bar', true)
            .attr('width', 1)
            .attr('height', d => containerHeight - yAttr(d))
            .attr('x', xAttr)
            .attr('y', yAttr)
            // .style('left', (x, i) => i * barWidth + 'px')
            .attr('fill', '#ddd');

        bar.exit().remove();

        // const u = container.append("path")
        //     .datum(data.values)

        // u
        //     .attr("fill", "none")
        //     .attr("stroke", "steelblue")
        //     .attr("stroke-width", 1.5)
        //     .attr("d", d3.line<DataValue>()
        //         .x(xAttr)
        //         .y(yAttr)
        //     );
    }

    update(data);

    setInterval(() => {
        data.addValue();
        console.log('data.values', data.values)

        update(data);
    }, 1000);
}