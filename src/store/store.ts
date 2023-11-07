import { makeObservable, observable } from "mobx"

import { Api } from "../lib/api";
import { BrowserStorage } from "./browser-storage";
import { Project } from "./project";
import { Chart } from "./chart";

export * from './project';
export * from './chart';

export class Store {
    readonly api = new Api(this);
    readonly browserStorage = new BrowserStorage(this);

    projects: Project[] = [];
    charts: Chart[] = [];

    constructor() {
        makeObservable(this, {
            projects: observable,
            charts: observable,
        });
    }
}