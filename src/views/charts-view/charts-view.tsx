import * as React from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import * as Store from '../../store/store';
import { ProjectsBlock } from './projects-block';
import { ChartsBlock } from './charts-block';

interface Props {
    store: Store.Store;
}

export const ChartsView: React.FunctionComponent<Props> = observer(({store}) => {
    // const path = useResolvedPath("").pathname;
    const projectBlockRef = React.useRef<HTMLDivElement>(null);
    const activeProject = React.useRef<Store.Project | null>(null);

    return (
        <div style={{display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', overflow: 'hidden' }}>
            <div style={{ overflow: 'auto', background: '#eee' }}>
                <ProjectsBlock store={store} />
            </div>

            <div
                ref={projectBlockRef}
                style={{ overflow: 'auto', flex: '1' }}
                onScroll={e => {
                    saveProjectScroll();
                    function saveProjectScroll() {
                        if (activeProject.current) {
                            const div = e.target as HTMLDivElement;

                            store.browserStorage.updateProject(activeProject.current.id, { scrollLeft: div.scrollLeft, scrollTop: div.scrollTop })
                        }
                    }
                }}
            >
                <Routes>
                    {/* <Route path={`${path}/:projectId/charts`} element={<ChartsBlock store={store} />} /> */}
                    <Route
                        path={`:projectId/charts`}
                        element={
                            <ChartsBlock
                                store={store}
                                onScrollInitialized={(project, pos) => {
                                    activeProject.current = project;

                                    restoreProjectScroll();
                                    function restoreProjectScroll() {
                                        // @todo why _sometimes_ doesn't it work without setTimeout?
                                        setTimeout(() => {
                                            projectBlockRef.current?.scroll({left: pos.left, top: pos.top});
                                        });
                                    }
                                }}
                            />
                        }
                    />

                    {/* <Route path={path} element={<p>please select a project</p>} /> */}
                    <Route path={"/"} element={<p>please select a project</p>} />
                </Routes>
            </div>
        </div>
    );
});