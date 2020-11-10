import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { Store } from '../../store/store';
import { ChartBlock } from './chart-block';

interface Props {
    store: Store;
}

export const ChartsBlock: React.FunctionComponent<Props> = observer(({ store }) => {
    return (
        <div>
            {
                store.charts.map(chart => {
                    return (
                        <ChartBlock key={chart.id} chart={chart} />
                    );
                })
            }
        </div>
    );
});