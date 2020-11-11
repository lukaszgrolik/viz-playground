import { makeObservable, observable, computed, action } from "mobx"

import { Api } from "../lib/api";

export class Store {
    readonly api = new Api(this);

    projects: Project[] = [];
    charts: Chart[] = [];

    constructor() {
        makeObservable(this, {
            projects: observable,
            charts: observable,
        });
    }
}

export class Project {
    name: string;

    constructor(readonly store: Store, readonly id: string, name: string) {
        this.id = id;
        this.name = name;

        makeObservable(this, {
            name: observable,
            update: action,
            charts: computed,
        });
    }

    update(body: {name?: string}) {
        if (body.name !== undefined) this.name = body.name;
    }

    get charts(): Chart[] {
        return this.store.charts.filter(chart => chart.projectId === this.id);
    }
}

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

    update(body: {projectId?: string; label?: string; code?: string}) {
        if (body.projectId !== undefined) this.projectId = body.projectId;
        if (body.label !== undefined) this.label = body.label;
        if (body.code !== undefined) this.code = body.code;
    }

    get project(): Project | undefined {
        return this.store.projects.find(p => p.id === this.projectId);
    }

    // setCode(code: string) {
    //     this.code = code;
    // }
}