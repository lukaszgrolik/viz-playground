import * as React from 'react';
import {observer} from 'mobx-react-lite';

import { Store } from '../store/store';
import { ChartsView } from './charts-view/charts-view';
import { LegacyView } from './legacy-view/legacy-view';

export const MainView: React.FunctionComponent<{store: Store}> = observer(({store}) => {
    return (
        <div>
            <ChartsView store={store} />

            <LegacyView />
        </div>
    );
});