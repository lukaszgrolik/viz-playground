import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { Store } from '../../store/store';

export const ProjectsBlock: React.FunctionComponent<{ store: Store }> = observer(({ store }) => {
    return (
        <div>
            <ul>
                {
                    store.projects.map(project => {
                        return (
                            <li key={project.id}>
                                {project.name}
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
});