import * as React from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';

import { DynamicChartBox } from './dynamic-chart';
import { ChartsBox } from './charts-box';
import { SumFunctionBox } from './sum-functions-box';
import { RandomWalkBox } from './random-walk-box';
import { CirclesBox } from './circles-box';
import { SimplexNoiseBox } from './simplex-noise-box';
import { ListTest } from './list-test';
import { DynamicLineTest } from './dynamic-line-test';
import { VoronoiGrid } from './voronoi-grid/voronoi-grid';
import { biomesWeatherView } from './biomes-weather-view/biomes-weather-view';

const pages: {path: string; Component: React.FC}[] = [
    {path: 'voronoi-grid', Component: VoronoiGrid},
    {path: 'biomes-weather', Component: biomesWeatherView},
    {path: 'dynamic-line', Component: DynamicLineTest},
    {path: 'list-test', Component: ListTest},
    {path: 'dynamic-chart', Component: DynamicChartBox},
    {path: 'simplex-noise', Component: SimplexNoiseBox},
    {path: 'circles', Component: CirclesBox},
    {path: 'sum-functions', Component: SumFunctionBox},
    {path: 'random-walk', Component: RandomWalkBox},
    {path: 'charts', Component: ChartsBox},
];

const Wrapper = styled.div`
    display: flex;

    > * + * {
        margin-left: 1em;
    }
`;

export function LegacyView() {
    // const routeMatch = useRouteMatch();

    return (
        <Wrapper>
            <div>
                <ul>
                    {
                        pages.map(page => {
                            // const link = `${routeMatch.path}${page.path}`;
                            const link = `${page.path}`;

                            return (
                                <li key={page.path}>
                                    <NavLink style={isActive => isActive ? { fontWeight: 'bold' } : {}} to={link}>{page.path}</NavLink>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>

            <div>
                <Routes>
                    {
                        pages.map(page => {
                            return (
                                // <Route key={page.path} path={routeMatch.path + page.path} element={page.Component} />
                                <Route key={page.path} path={page.path} element={<page.Component />} />
                            );
                        })
                    }
                </Routes>
            </div>
        </Wrapper>
    );
}