import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
// import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';
import {BrowserRouter, Link, NavLink, Route, Routes} from 'react-router-dom';
import styled from '@emotion/styled';

import * as Store from './src/store/store';
import { GlobalUtils } from './src/lib/global-utils';
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

const TopPanel = styled.div`
    /* position: sticky;
    top: 0;
    z-index: 1000; */
`;
const MainMenu = styled.ul`
    background-color: hsl(240deg, 75%, 90%);
    display: flex;

    a {
        display: block;
        padding: 1em;

        &:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
    }
`;

const menu = [
    {to: "/", label: 'Home'},
    {to: "/projects", label: 'Projects'},
    {to: "/legacy", label: 'Legacy'},
];

const app = (
    <BrowserRouter>
        <div style={{height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
            <TopPanel>
                <MainMenu>
                    {
                        menu.map(item => {
                            return (
                                <li key={item.label}>
                                    <NavLink style={props => props.isActive ? { fontWeight: 'bold' } : {}} to={item.to}>{item.label}</NavLink>
                                </li>
                            )
                        })
                    }
                </MainMenu>
            </TopPanel>

            <Routes>
                <Route path="/" element={<p>home</p>} />
                <Route path="/projects/*" element={<MainView store={store} />} />
                <Route path="/legacy/*" element={<LegacyView />} />
            </Routes>
        </div>
    </BrowserRouter>
);

const root = ReactDOM.createRoot(document.getElementById('react-root') as HTMLElement);
root.render(app);

declare var window: {
    __globalUtils: GlobalUtils
};

window.__globalUtils = new GlobalUtils(store);