import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Store } from '../../store/store';
import { ProjectsBlock } from './projects-block';
import { ChartsBlock } from './charts-block';

interface Props {
    store: Store;
}

export const ChartsView: React.FunctionComponent<Props> = observer(({store}) => {
    const match = useRouteMatch();

    return (
        <div style={{display: 'flex'}}>
            <div>
                <ProjectsBlock store={store} />
            </div>

            <div>
                <Switch>
                    <Route path={`${match.path}/:projectId/charts`}>
                        <ChartsBlock store={store} />
                    </Route>

                    <Route path={match.path}>
                        <p>please select a project</p>
                    </Route>
                </Switch>
            </div>
        </div>
    );
});