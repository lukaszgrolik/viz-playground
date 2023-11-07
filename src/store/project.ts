import { makeObservable, observable, computed, action } from "mobx";
import { Store } from "./store";
import { Chart } from "./chart";

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

    update(body: { name?: string; }) {
        if (body.name !== undefined) this.name = body.name;
    }

    get charts(): Chart[] {
        return this.store.charts.filter(chart => chart.projectId === this.id);
    }
}
