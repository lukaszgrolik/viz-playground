import { action } from "mobx";

import * as Store from "../store/store";
import {Chart} from "../store/chart";
import {Project} from "../store/project";
import { ApiData } from "./interfaces";
import { Req } from "./request";
import { upsert } from "./upsert";

export class Api {
    readonly req = new Req({baseUrl: 'http://localhost:3011/api'});

    constructor(readonly store: Store.Store) {

    }

    private injectData(data: ApiData.Response) {
        action(() => {
            // this.store.projects.length = 0;
            upsert(this.store.projects, data.projects, {
                find: (source, body) => source.id === body.id,
                mapInsert: body => new Project(this.store, body.id, body.name),
                onUpdate: (found, body) => found.update(body),
            });

            // this.store.charts.length = 0;
            upsert(this.store.charts, data.charts, {
                find: (source, body) => source.id === body.id,
                mapInsert: body => new Chart(this.store, body.id, body.projectId, body.label, body.code),
                onUpdate: (found, body) => found.update(body),
            });
        })();
    }

    async fetchData() {
        const data = await this.req.get<ApiData.Response>(`/data`)
        this.injectData(data);
    }

    async createProject(body: {name: string}) {
        const data = await this.req.post<ApiData.Response>(`/projects`, body);
        this.injectData(data);
    }

    async createChart(body: {projectId: string; code: string}) {
        const data = await this.req.post<ApiData.Response>(`/charts`, body);
        this.injectData(data);
    }

    async updateChart(chartId: string, body: {projectId?: string; code?: string}) {
        const data = await this.req.put<ApiData.Response>(`/charts/${chartId}`, body);
        this.injectData(data);
    }
}