import * as React from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Store } from '../../store/store';
import { ProjectsBlock } from './projects-block';
import { ChartsBlock } from './charts-block';

interface Props {
    store: Store;
}

export const ChartsView: React.FunctionComponent<Props> = observer(({store}) => {
    // const path = useResolvedPath("").pathname;

    return (
        <div style={{display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', overflow: 'hidden' }}>
            <div style={{ overflow: 'auto', background: '#eee' }}>
                <ProjectsBlock store={store} />
            </div>

            <div style={{ overflow: 'auto', flex: '1' }}>
                <Routes>
                    {/* <Route path={`${path}/:projectId/charts`} element={<ChartsBlock store={store} />} /> */}
                    <Route path={`:projectId/charts`} element={<ChartsBlock store={store} />} />

                    {/* <Route path={path} element={<p>please select a project</p>} /> */}
                    <Route path={"/"} element={<p>please select a project</p>} />
                </Routes>
            </div>
        </div>
    );
});