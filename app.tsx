import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';
import {BrowserRouter, Link, NavLink, Route, Switch} from 'react-router-dom';

import * as Store from './src/store/store';
import { LegacyView } from './src/views/legacy-view/legacy-view';
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

// const store = new Store();
// store.localStorage.initData();
// store.localStorage.loadData();

const app = (
    <BrowserRouter>
        <ul>
            <NavLink activeStyle={{ fontWeight: 'bold' }} exact to="/">Home</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/projects">Projects</NavLink>
            <NavLink activeStyle={{ fontWeight: 'bold' }} to="/legacy">Legacy</NavLink>
        </ul>

        <Switch>
            <Route path="/" exact={true}>
                <p>home</p>
            </Route>

            <Route path="/projects">
                <MainView store={store} />
            </Route>

            <Route path="/legacy">
                <LegacyView />
            </Route>
        </Switch>
    </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('react-root'));