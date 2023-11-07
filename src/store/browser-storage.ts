import { Store } from "./store";

type Project = {
    readonly id: string;
    readonly scrollLeft?: number;
    readonly scrollTop?: number;
}
type Chart = {
    readonly id: string;
    readonly scrollLeft?: number;
    readonly scrollTop?: number;
}
type Data = {
    readonly projects: Project[];
    readonly charts: Chart[];
}

const LOCAL_STORAGE_KEY = 'viz-playground';

export class BrowserStorage {
    private readonly projects: Project[] = [];
    private readonly charts: Chart[] = [];

    constructor(readonly store: Store) {

    }

    private toJSON(str: string): Data {
        return JSON.parse(str);
    }

    private toString(): string {
        return JSON.stringify({
            projects: this.projects,
            charts: this.charts,
        });
    }

    private save() {
        localStorage.setItem(LOCAL_STORAGE_KEY, this.toString());
    }

    private load(): Data | null {
        const str = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (str) return this.toJSON(str);

        return null;
    }

    initialize() {
        const obj = this.load();

        if (obj) {
            console.log('obj', obj)
            this.projects.push(...obj.projects);
            this.charts.push(...obj.charts);
        }
    }

    getProject(id: string): Project | null {
        return this.projects.find(p => p.id === id) || null;
    }

    getChart(id: string): Chart | null {
        return this.charts.find(chart => chart.id === id) || null;
    }

    updateProject(projectId: string, body: Omit<Project, 'id'>) {
        let project = this.getProject(projectId);
        if (!project) {
            project = {id: projectId};
            this.projects.push(project);
        }

        Object.assign(project, body);

        this.save();
    }

    updateChart(chartId: string, body: Omit<Chart, 'id'>) {
        let chart = this.getChart(chartId);
        if (!chart) {
            chart = { id: chartId };
            this.charts.push(chart);
        }

        Object.assign(chart, body);

        this.save();
    }
}