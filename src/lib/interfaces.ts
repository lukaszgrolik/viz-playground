export namespace ApiData {
    export interface Project {
        id: string;
        name: string;
    }

    export interface Chart {
        id: string;
        projectId: string;
        label: string;
        code: string;
    }

    export interface Response {
        projects?: Project[];
        charts?: Chart[];
    }
}