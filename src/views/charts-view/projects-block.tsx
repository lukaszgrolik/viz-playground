import * as React from 'react';
import { Link, NavLink, useParams, useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Store } from '../../store/store';

export const ProjectsBlock: React.FunctionComponent<{ store: Store }> = observer(({ store }) => {
    const match = useRouteMatch();
    const [newProjectName, setNewProjectName] = React.useState('');
    const [newProjectPending, setNewProjectPending] = React.useState(false);

    async function onNewProjectSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setNewProjectPending(true);

        await store.api.createProject({name: newProjectName});

        setNewProjectPending(false);

        setNewProjectName('');
    }

    return (
        <div>
            <div>
                <form onSubmit={onNewProjectSubmit}>
                    <input
                        type="text"
                        placeholder="New project name..."
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.currentTarget.value)}
                    />

                    <button type="submit" disabled={!newProjectName || newProjectPending}>add</button>
                </form>
            </div>

            <div>
                {
                    store.projects.length === 0
                        ?
                        <p>no projects</p>
                        :
                        <ul>
                            {

                                store.projects.map(project => {
                                    const link = `${match.url}/${project.id}/charts`;

                                    return (
                                        <li key={project.id}>
                                            <NavLink activeStyle={{ fontWeight: 'bold' }} to={link}>{project.name}</NavLink>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                }
            </div>
        </div>
    );
});