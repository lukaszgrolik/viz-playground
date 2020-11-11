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

    React.useEffect(() => {
        setProject(store.projects.find(p => p.id === params.projectId) || null);
    }, [params.projectId]);

    return (
        <div>
            {
                !project
                ?
                'no project found'
                :
                    project.charts.length === 0
                        ?
                        'project has no charts'
                        :
                        project.charts.map(chart => {
                            return (
                                <ChartBlock key={chart.id} chart={chart} />
                            );
                        })
            }
        </div>
    );
});