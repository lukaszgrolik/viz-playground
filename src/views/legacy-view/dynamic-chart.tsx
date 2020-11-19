import * as React from "react";
import * as d3 from "d3";

import * as Viz from "../../lib/viz";

import * as DynamicDomainChart from './lib/dynamic-domain-chart';
import * as StaticDomainChart from './lib/static-domain-chart';

// function drawChart(containerEL: HTMLElement, domain: [number, number], data: Viz.SimplexNoiseViz.Result['data'], i = 0) {


// const viz = new Viz.Viz('', { containerHeight: 0, containerWidth: 0 });

function drawCharts(container: HTMLDivElement) {
    (() => {
        // const res = viz.genSimplexNoise({
        //     samples: 100,
        //     amp: 1,
        //     freq: .05,
        // });

        // drawChart(container, res.domain, res.data, 0);
        StaticDomainChart.drawChart(container, 0);
    })();

    // (() => {
    //     const res = viz.genSimplexNoise({
    //         samples: 100,
    //         amp: 1,
    //         freq: .05,
    //         modifyValue: (val, i) => {
    //             return val + i * .05;
    //         },
    //     });

    //     drawChart(containerId, res.domain, res.data, 1);
    // })();

    // (() => {
    //     const samples = 100;
    //     const res = viz.genSimplexNoise({
    //         samples,
    //         amp: 1,
    //         freq: .05,
    //         modifyValue: (val, i) => {
    //             return val + (i + Math.round(samples / 2) ** 2) * .0001;
    //         },
    //     });

    //     drawChart(containerId, res.domain, res.data, 2);
    // })();

    // (() => {
    //     const res = viz.genSimplexNoise({
    //         samples: 100,
    //         amp: 1,
    //         freq: .05,
    //         modifyValue: (val, i) => {
    //             return val + Math.sin(i) * .05;
    //         },
    //     });

    //     drawChart(containerId, res.domain, res.data, 3);
    // })();

    // (() => {
    //     const oct1 = viz.genSimplexNoise({
    //         samples: 100,
    //         amp: .1,
    //         freq: .333,
    //     });
    //     const res = viz.genSimplexNoise({
    //         samples: 100,
    //         amp: 1,
    //         freq: .05,
    //         modifyValue: (val, i) => {
    //             return val + oct1.data.values[i][1];
    //         },
    //     });

    //     drawChart(containerId, res.domain, res.data, 4);
    // })();
}

export function DynamicChartBox() {
    const wrapper = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (wrapper.current) drawCharts(wrapper.current);
    }, []);

    return (
        <div ref={wrapper} id="dynamic-chart-box" className="grid-container">

        </div>
    )
}