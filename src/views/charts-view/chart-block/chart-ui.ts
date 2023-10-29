import { action, computed, makeObservable, observable, runInAction } from 'mobx';

import * as Store from '../../../store/store';

const themes = ['monokai', 'tomorrow', 'solarized_light'];

export class ChartUI {
    theme: string = themes[2];

    code: string = "";
    lastCodeChangeTime: number = 0;

    codeError: Error | null = null;

    savePending: boolean = false;
    lastSavedCode: string = "";

    private intervalId: NodeJS.Timeout;

    constructor(readonly chart: Store.Chart) {
        this.code = chart.code;
        this.lastSavedCode = this.code;

        makeObservable(this, {
            theme: observable,
            switchColorScheme: action,

            code: observable,
            setCode: action,

            lastCodeChangeTime: observable,

            codeError: observable,
            setCodeError: action,

            savePending: observable,
            lastSavedCode: observable,
            save: action,

            isDirty: computed
        });

        this.intervalId = setInterval(() => {
            // @hardcoded
            const minTimePassedFromLastChange = Date.now() - this.lastCodeChangeTime >= 1000;
            // console.log("lastCodeChangeTime", this.lastCodeChangeTime)
            // console.log("Date.now() - lastCodeChangeTime", Date.now() - this.lastCodeChangeTime)
            if (this.isDirty && minTimePassedFromLastChange) {
                this.save();
                // console.log('saving now...')
            }
            // @hardcoded
        }, 500);

    }

    clear() {
        clearInterval(this.intervalId);
    }

    get isDirty(): boolean {
        return this.code !== this.lastSavedCode;
    }

    switchColorScheme(): void {
        const currentThemeIndex = themes.indexOf(this.theme);
        let i = currentThemeIndex === themes.length - 1 ? 0 : currentThemeIndex + 1;

        this.theme = themes[i];
    }

    setCode(val: string): void {
        this.code = val;
        this.lastCodeChangeTime = Date.now();
    }

    setCodeError(val: Error | null): void {
        this.codeError = val;
    }

    async save() {
        this.savePending = true;

        await this.chart.store.api.updateChart(this.chart.id, {
            code: this.code,
        });

        runInAction(() => {
            this.lastSavedCode = this.code;
            this.savePending = false;
        });
    }
}
