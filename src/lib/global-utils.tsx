import * as Store from '../store/store';

type SearchResult = {
    project: string;
    results: {
        line: number;
        code: string;
    }[];
};

export class GlobalUtils {
    store: Store.Store;

    constructor(store: Store.Store) {
        this.store = store;
    }

    search(phrase: string): SearchResult[] {
        return this.store.projects.flatMap(project => {
            return project.charts.flatMap(chart => {
                const lines = chart.code.toLowerCase().split('\n').flatMap((line, lineIndex) => {
                    const index = line.indexOf(phrase.toLowerCase());

                    return index > -1 ? [{ line: lineIndex + 1, code: line }] : [];
                });

                return lines.length ? [{ project: project.name, results: lines }] : [];
            });
        });
    }
}
