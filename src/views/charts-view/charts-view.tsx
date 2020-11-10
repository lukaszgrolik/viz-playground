import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { Store } from '../../store/store';
import { ProjectsBlock } from './projects-block';
import { ChartsBlock } from './charts-block';

interface Props {
    store: Store;
}

export const ChartsView: React.FunctionComponent<Props> = observer(({store}) => {
    return (
        <div style={{display: 'flex'}}>
            <div>
                <ProjectsBlock store={store} />
            </div>

            <div>
                <ChartsBlock store={store} />
            </div>
        </div>
    );
});