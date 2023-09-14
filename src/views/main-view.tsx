import * as React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react-lite';

import * as Store from '../store/store';
import { ChartsView } from './charts-view/charts-view';

export const MainView: React.FunctionComponent<{store: Store.Store}> = observer(({store}) => {
    const [started, setStarted] = React.useState(false);
    const [pending, setPending] = React.useState(false);

    React.useEffect(() => {
        setStarted(true);
        setPending(true);

        (async () => {
            await store.api.fetchData();

            setPending(false);
        })();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {
                started && !pending
                &&
                <ChartsView store={store} />
            }
        </div>
    );
});