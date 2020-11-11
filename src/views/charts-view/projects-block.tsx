import * as React from 'react';
import { Link, NavLink, useParams, useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Store } from '../../store/store';

export const ProjectsBlock: React.FunctionComponent<{ store: Store }> = observer(({ store }) => {
    const match = useRouteMatch();

    return (
        <div>
            {
                store.projects.length === 0
                    ?
                    'no projects'
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
    );
});