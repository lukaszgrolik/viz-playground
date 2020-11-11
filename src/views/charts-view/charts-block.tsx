import * as React from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import * as Store from '../../store/store';
import { ChartBlock } from './chart-block';

interface Props {
    store: Store.Store;
}

export const ChartsBlock: React.FunctionComponent<Props> = observer(({ store }) => {
    const params = useParams<{projectId: string}>();
    const [project, setProject] = React.useState<Store.Project | null>(null);
    // const [newChartName, setNewChartName] = React.useState('');
    const [newChartPending, setNewChartPending] = React.useState(false);

    React.useEffect(() => {
        setProject(store.projects.find(p => p.id === params.projectId) || null);
    }, [params.projectId]);

    async function onNewChartSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setNewChartPending(true);

        // await store.api.createChart({ projectId: params.projectId, code: newChartName });
        await store.api.createChart({
            projectId: params.projectId,
            code: '// console.log("new chart!")',
        });

        setNewChartPending(false);

        // setNewChartName('');
    }

    return (
        <div>
            {
                !project
                    ?
                    <p>no project found</p>
                    :
                    <div>
                        <div>
                            <form onSubmit={onNewChartSubmit}>
                                {/* <input
                                    type="text"
                                    placeholder="New chart name..."
                                    value={newChartName}
                                    onChange={e => setNewChartName(e.currentTarget.value)}
                                /> */}

                                <button type="submit" disabled={newChartPending}>add chart</button>
                            </form>
                        </div>

                        <div>
                            {
                                project.charts.length === 0
                                    ?
                                    <p>project has no charts</p>
                                    :
                                    project.charts.map(chart => {
                                        return (
                                            <ChartBlock key={chart.id} chart={chart} />
                                        );
                                    })
                            }
                        </div>
                    </div>
            }
        </div>
    );
});