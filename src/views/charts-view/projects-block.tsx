import * as React from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';

import { Store } from '../../store/store';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
`;
const ProjectsList = styled.div`
    display: flex;
    flex-direction: column;

    a {
        display: block;
        padding: .5em;

        &:hover {
            background-color: rgba(0, 0, 0, .1);
        }
    }
`;

export const ProjectsBlock: React.FunctionComponent<{ store: Store }> = observer(({ store }) => {
    // const match = useRouteMatch();
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
        <Wrapper>
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
                        <ProjectsList>
                            {
                                store.projects.map(project => {
                                    // const link = `${match.url}/${project.id}/charts`;
                                    const link = `${project.id}/charts`;

                                    return (
                                        <li key={project.id}>
                                            <NavLink style={props => props.isActive ? { fontWeight: 'bold' } : {}} to={link} end>{project.name}</NavLink>
                                        </li>
                                    );
                                })
                            }
                        </ProjectsList>
                }
            </div>
        </Wrapper>
    );
});