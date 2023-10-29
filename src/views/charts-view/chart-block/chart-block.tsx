import * as React from 'react';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
// import {config} from "ace-builds";
// import ace from 'ace-builds/src-noconflict/ace';
import AceEditor from "react-ace";
import styled from '@emotion/styled';
import * as d3 from 'd3';

import * as Store from '../../../store/store';
import * as Viz from '../../../lib/viz';

// // import "ace-builds/webpack-resolver";
// import jsWorkerUrl from "file-loader!ace-builds/src-noconflict/worker-javascript";
// // const jsWorkerUrl = require("file-loader!ace-builds/src-noconflict/worker-javascript");
// ace.config.setModuleUrl("ace/mode/javascript_worker", jsWorkerUrl);

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-solarized_light";

function formatFunctionCode(str: string): string {
    const lines = str.split('\n');
    const match = lines[lines.length - 1].match(/^( *)/);
    if (!match) return str;

    const [_, spaces] = match;

    return lines.map(l => {
        const regex = new RegExp(`^${spaces}`);
        return l.replace(regex, '');
    }).join('\n');
}

const containerWidth = 350;
const containerHeight = 350;

function getChartId(chartId: string) {
    return `svg_chart_${chartId}`;
}

const themes = ['monokai', 'tomorrow', 'solarized_light'];

const Wrapper = styled.div`
  display: flex;
  gap: 1em;
`;

class Random {
    rangeInt(a: number, b: number) {
        return a + Math.floor(Math.random() * (b - a));
    }

    sample<T>(arr: T[]): T | undefined {
        if (arr.length == 0) return undefined;

        return arr[this.rangeInt(0, arr.length)];
    }
}

const random = new Random();

class ChartUI {
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

class CodeRunner {
    setUpdateFunction() {

    }

    setFramerate() {

    }

    start() {

    }

    pause() {

    }

    resume() {

    }

    toggle() {

    }
}

export const ChartBlock: React.FunctionComponent<{chart: Store.Chart}> = observer(({chart}) => {
    // const [theme, setTheme] = React.useState(themes[2]);
    // const [code, setCode] = React.useState(chart.code);
    // const [codeError, setCodeError] = React.useState<Error | null>(null);
    //// const [previousCode, setPreviousCode] = React.useState(code);
    // const [lastSavedCode, setLastSavedCode] = React.useState(code);
    // const [savePending, setSavePending] = React.useState(false);
    const [chartUI] = React.useState(
        new ChartUI(chart)
    );
    const [viz] = React.useState(
        new Viz.Viz(getChartId(chart.id), { containerWidth, containerHeight })
    );
    // const [lastCodeChangeTime, setLastCodeChangeTime] = React.useState<number>(0);

    // const [codeDisposer, setCodeDisposer] = React.useState<undefined | (() => void)>(undefined);
    let codeDisposer: undefined | (() => void);

    React.useEffect(() => {
        // console.log('fasf')
        runCode();

        return () => {
            chartUI.clear();

            // console.log('on dispose')
            if (codeDisposer) codeDisposer();
        };
    }, []);

    const onSwitchColorSchemeClick = () => chartUI.switchColorScheme();
    const onCodeChange = (val: string) => chartUI.setCode(val);;
    const onSaveClick = () => chartUI.save();

    // ! unregister loop (if not found in updated code)
    let loopFn: (() => void) | undefined;
    // const [loopFn, setLoopFn] = React.useState <(() => void) | undefined>(undefined);
    const [hasLoopFn, setHasLoopFn] = React.useState(false);

    // const [registerLoopCb, setRegisterLoopCb] = React.useState<((isLoopRunning: boolean) => void) | undefined>(undefined);
    let registerLoopCb: ((isLoopRunning: boolean) => void) | undefined;

    function registerLoop(loop: () => void, cb: (isLoopRunning: boolean) => void) {
        // if (loopFn) throw new Error('loop already registered');

        loopFn = loop;
        // setHasLoopFn(!!loop);

        // setRegisterLoopCb(() => cb);
        registerLoopCb = cb;
    }

    function runCode(): void {
        // console.log('runCode')
        chartUI.setCodeError(null);

        const chartId = getChartId(chart.id);
        const deps: [string, any][] = [
            ['registerLoop', registerLoop],
            ['d3', d3],
            ['random', random],
            ['viz', viz],
        ];

        const fn = new Function(...deps.map(d => d[0]), chartUI.code);

        // @todo handle error on invoke
        const svg = document.getElementById(chartId)
        if (svg) svg.innerHTML = '';

        if (codeDisposer) codeDisposer();

        try {
            const fnRes = fn(...deps.map(d => d[1]));

            if (typeof fnRes === 'function') {
                // setCodeDisposer(fnRes);
                codeDisposer = fnRes;
            }
            else if (fnRes !== undefined) {
                throw new Error('Return type must be a disposer function');
            }

            // setHasLoopFn(!!loopFn);
        }
        catch (err: unknown) {
            console.log('err', err)
            if (err instanceof Error)
                chartUI.setCodeError(err);
            else
                console.warn('unknown error', err);
        }
    }

    // @todo ctrl+enter to run
    const onRunClick = () => runCode();

    const [isLoopRunning, setIsLoopRunning] = React.useState(true);

    function onLoopToggleClick() {
        const val = !isLoopRunning;

        console.log('onLoopToggleClick', registerLoopCb)
        if (registerLoopCb) registerLoopCb(val);

        setIsLoopRunning(val);
    }

    return (
        <Wrapper>
            <div>
                {/* <pre><textarea
                    rows={10}
                    cols={80}
                    value={code}
                    disabled={savePending}
                    onChange={onCodeChange}
                /></pre> */}
                <button onClick={onSwitchColorSchemeClick}>{chartUI.theme}</button>

                <AceEditor
                    mode="javascript"
                    theme={chartUI.theme}
                    value={chartUI.code}
                    onChange={onCodeChange}
                    name={`ace_editor_${chart.projectId}_${chart.id}`}
                    editorProps={{ $blockScrolling: true }}
                    setOptions={{
                        useWorker: false,
                        fontSize: 16,
                    }}
                    width="800px"
                    height="800px"
                />

                <button
                    disabled={chartUI.savePending || !chartUI.isDirty}
                    style={{ color: chartUI.isDirty ? 'orange' : 'inherit'}}
                    onClick={onSaveClick}
                >
                    {chartUI.savePending ? 'saving...' : 'save'}
                </button>
                <button disabled={chartUI.savePending} onClick={onRunClick}>run</button>

                {
                    hasLoopFn
                    &&
                    <>
                        <button onClick={onLoopToggleClick}>{isLoopRunning ? 'pause' : 'resume'}</button>
                    </>
                }

                {
                    chartUI.codeError
                    &&
                    <div>
                        <div style={{fontFamily: 'monospace', backgroundColor: '#eee'}}>{chartUI.codeError.constructor.name}: {chartUI.codeError.message}</div>
                            <pre style={{ backgroundColor: 'hsl(0, 100%, 95%)' }}>{chartUI.codeError.stack}</pre>
                    </div>
                }
            </div>

            <div>
                <svg id={getChartId(chart.id)} width={containerWidth} height={containerHeight} style={{border: '1px solid'}}></svg>
            </div>
        </Wrapper>
    );
});