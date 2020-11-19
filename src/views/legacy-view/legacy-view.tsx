import * as React from 'react';

import { DynamicChartBox } from './dynamic-chart';
import { ChartsBox } from './charts-box';
import { SumFunctionBox } from './sum-functions-box';
import { RandomWalkBox } from './random-walk-box';
import { CirclesBox } from './circles-box';
import { SimplexNoiseBox } from './simplex-noise-box';
import { ListTest } from './list-test';
import { DynamicLineTest } from './dynamic-line-test';

export function LegacyView() {
    return (
        <div>
            <DynamicLineTest />
            <ListTest />
            <DynamicChartBox />
            <SimplexNoiseBox />
            <CirclesBox />
            <SumFunctionBox />
            <RandomWalkBox />
            <ChartsBox />
        </div>
    );
}