import { makeObservable, observable, computed, action } from "mobx";
import { Project } from "./project";
import { Store } from "./store";


export class Chart {
    projectId: string;
    label: string;
    code: string;

    constructor(readonly store: Store, readonly id: string, projectId: string, label: string, code: string) {
        this.projectId = projectId;
        this.label = label;
        this.code = code;

        makeObservable(this, {
            projectId: observable,
            label: observable,
            code: observable,
            update: action,
            // setCode: action,
            project: computed,
        });
    }

    update(body: { projectId?: string; label?: string; code?: string; }) {
        if (body.projectId !== undefined) this.projectId = body.projectId;
        if (body.label !== undefined) this.label = body.label;
        if (body.code !== undefined) this.code = body.code;
    }

    get project(): Project | undefined {
        return this.store.projects.find(p => p.id === this.projectId);
    }

}
