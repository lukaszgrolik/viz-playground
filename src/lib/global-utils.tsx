import * as Store from '../store/store';

type SearchResult = {
    project: string;
    chart: string | number;
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
            return project.charts.flatMap((chart, chartIndex) => {
                const lines = chart.code.toLowerCase().split('\n').flatMap((line, lineIndex) => {
                    // const index = line.indexOf(phrase.toLowerCase());
                    const match = new RegExp(phrase).exec(line);

                    return match ? [{ line: lineIndex + 1, code: line }] : [];
                });

                return lines.length ? [{ project: project.name, chart: chart.label || chartIndex + 1, results: lines }] : [];
            });
        });
    }

    lukinfoSearch(): string {
        // defined here not to trigger vscode-lukinfo log
        const sign = '!{1,3}';

        return this.search(`// *${sign}`).map(chart => {
            const results = chart.results.map(r => {
                const m = r.code.match(/^\s*\/\/ *(?<sign>!{1,3}) +(?<msg>.+)$/)
                if (!m) return '';

                const sign = m.groups?.sign;
                const message = m.groups?.msg;

                return `  ${r.line}: ${sign} ${message}`;
            }).join('\n');

            return `${chart.project}/${chart.chart}\n${results}`;
        }).join('\n');
    }
}
