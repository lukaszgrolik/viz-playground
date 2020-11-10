import * as React from 'react';

import { ChartsBox } from './charts-box';
import { SumFunctionBox } from './sum-functions-box';
import { RandomWalkBox } from './random-walk-box';
import { CirclesBox } from './circles-box';
import { SimplexNoiseBox } from './simplex-noise-box';

export function LegacyView() {
    return (
        <div>
            <SimplexNoiseBox />
            <CirclesBox />
            <SumFunctionBox />
            <RandomWalkBox />
            <ChartsBox />
        </div>
    );
}