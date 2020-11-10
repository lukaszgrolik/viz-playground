import { makeObservable, observable, computed, action } from "mobx"

export class Store {
    readonly projects: Project[] = [];
    readonly charts: Chart[] = [];

    constructor() {
        makeObservable(this, {
            charts: observable,
        });
    }
}

export class Project {
    name: string;

    constructor(readonly store: Store, readonly id: number, name: string) {
        this.name = name;

        makeObservable(this, {
            name: observable,
            charts: computed,
        });
    }

    get charts(): Chart[] {
        return this.store.charts.filter(chart => chart.projectId === this.id);
    }
}

export class Chart {
    projectId: number;
    label: string;
    code: string;

    constructor(readonly store: Store, readonly id: number, projectId: number, label: string, code: string) {
        this.projectId = projectId;
        this.label = label;
        this.code = code;

        makeObservable(this, {
            projectId: observable,
            label: observable,
            code: observable,
            setCode: action,
            project: computed,
        });
    }

    get project(): Project | undefined {
        return this.store.projects.find(p => p.id === this.projectId);
    }

    setCode(code: string) {
        this.code = code;
    }
}