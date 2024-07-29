import * as React from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';

import * as Store from '../../store/store';
import { ChartBlock } from './chart-block/chart-block';

const Wrapper = styled.div`
    padding: 2em;
`;
const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
`;
const ChartsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
`;

const DATASETS = {
    gtaBroughyTestingList: 'GTA V_Online Vehicle Info, Lap Times, and Top Speeds - Lap Times, Top Speeds & Race Tiers.tsv'
} as const;
const datasetLibrary = {
    getDataset(name: keyof typeof DATASETS): string {
        return DATASETS[name];
    }
};

interface Props {
    store: Store.Store;
    onScrollInitialized: (project: Store.Project | null, opts: {left: number; top: number}) => void;
}

export const ChartsBlock: React.FunctionComponent<Props> = observer(({ store, onScrollInitialized }) => {
    const params = useParams<{projectId: string}>();
    const [project, setProject] = React.useState<Store.Project | null>(null);
    // const [newChartName, setNewChartName] = React.useState('');
    const [newChartPending, setNewChartPending] = React.useState(false);
    // const [datasets, setDatasets] = React.useState([]);

    React.useEffect(() => {
        const proj = store.projects.find(p => p.id === params.projectId) || null;

        setProject(proj || null);

        callProjectScrollInitialized();
        function callProjectScrollInitialized() {
            if (proj) {
                const bsProject = store.browserStorage.getProject(proj.id);

                onScrollInitialized(proj, { left: bsProject?.scrollLeft || 0, top: bsProject?.scrollTop || 0});
            }
        }

        (async () => {
            await fetchDatasets();
            async function fetchDatasets() {
                const promises = Object.keys(DATASETS).map(async (ds: keyof typeof DATASETS) => {
                    const filePath = DATASETS[ds];
                    const getExt = (text: string) => {
                        const dot = text.lastIndexOf('.');

                        return text.slice(dot + 1);
                    };
                    const res = await fetch(`/data/${filePath}`);
                    const ext = getExt(filePath);

                    if (ext === 'json') {
                        return {
                            type: 'json',
                            data: await res.json()
                        };
                    }
                    else if (ext === 'tsv') {
                        const parseTsv = (text: string) => {
                            const lines = text.trim().split('\n').map(l => l.trim()).map(l => l.split('\t'));

                            const header = lines[0];
                            const rows = lines.slice(1);

                            return {
                                header,
                                rows
                            };
                        };

                        const text = await res.text();

                        return {
                            type: 'tsv',
                            data: parseTsv(text)
                        };
                    }
                    else {
                        throw new Error(`unsupported file extension: ${ext}`);
                    }
                });

                const datasets = await Promise.all(promises);
                console.log('datasets[0]', datasets[0]);

                // setDatasets(datasets as any);
            }
        })();
    }, [params.projectId]);

    async function onNewChartSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!params.projectId) return;

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
        <Wrapper>
            {
                !project
                    ?
                    <p>no project found</p>
                    :
                    <ContentWrapper>
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

                        <ChartsList>
                            {
                                project.charts.length === 0
                                    ?
                                    <p>project has no charts</p>
                                    :
                                    project.charts.map(chart => {
                                        return (
                                            <ChartBlock key={chart.id} store={store} chart={chart} />
                                        );
                                    })
                            }
                        </ChartsList>
                    </ContentWrapper>
            }
        </Wrapper>
    );
});