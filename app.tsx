import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';

import * as Store from './src/store/store';
import { MainView } from './src/views/main-view';
// import { Store } from './src/store/store';

const data = {
    projects: [
        {
            id: 1,
            name: 'project 1',
        },
        {
            id: 2,
            name: 'project 2',
        },
    ],
    charts: [
        {
            id: 1,
            projectId: 1,
            label: 'chart 1',
            code: `viz.draw([-10, 10], 50, x => x);
// viz.draw([-10, 10], 50, x => Math.floor(x));`,
        },
        {
            id: 2,
            projectId: 1,
            label: 'chart 2',
            code: `const res = viz.genSimplexNoise({
    samples: 50,
    amp: 1,
    freq: .075,
    modifyValue: (val, i) => {
       const res = val + (i % 2) * .05;
       return viz.round(res, 10);
    },
});
viz.draw([-0, 49], 50, x => res.data.values[x][1]);`,
        },
        {
            id: 3,
            projectId: 2,
            label: 'chart 3',
            code: `const { domain, data } = viz.getRandomWalk({
    samples: 1000,
    iterations: 100,
    initialValue: 0,
    step: 1,
    generator: step => Math.floor(Math.random() * 3) - 1,
});
// console.log('data', data)

viz.draw([0, data.values.length - 1], data.values.length, x => {
    // console.log('x', x);
    return data.values[x][1];
});`,
        },
    ],
};

const store = new Store.Store();
store.charts.length = 0;
store.charts.push(...data.charts.map(chart => new Store.Chart(store, chart.id, chart.projectId, chart.label, chart.code)));
store.projects.length = 0;
store.projects.push(...data.projects.map(project => new Store.Project(store, project.id, project.name)));

// const store = new Store();
// store.localStorage.initData();
// store.localStorage.loadData();

const app = (
    // <Router>
        // <MainView store={store} />
        <MainView store={store} />
    // </Router>
);

ReactDOM.render(app, document.getElementById('react-root'));