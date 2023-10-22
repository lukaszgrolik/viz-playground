import * as React from 'react';
import { observer } from 'mobx-react-lite';
// import {config} from "ace-builds";
// import ace from 'ace-builds/src-noconflict/ace';
import AceEditor from "react-ace";
import styled from '@emotion/styled';
import * as d3 from 'd3';

import * as Store from '../../store/store';
import * as Viz from '../../lib/viz';

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

class Loop {
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
    const [theme, setTheme] = React.useState(themes[2]);
    const [code, setCode] = React.useState(chart.code);
    const [codeError, setCodeError] = React.useState<Error | null>(null);
    // const [previousCode, setPreviousCode] = React.useState(code);
    const [lastSavedCode, setLastSavedCode] = React.useState(code);
    const [savePending, setSavePending] = React.useState(false);
    const [viz] = React.useState(
        new Viz.Viz(getChartId(chart.id), { containerWidth, containerHeight })
    );
    const isDirty = () => code !== lastSavedCode;

    // const [codeDisposer, setCodeDisposer] = React.useState<undefined | (() => void)>(undefined);
    let codeDisposer: undefined | (() => void);

    React.useEffect(() => {
        // console.log('fasf')
        runCode();

        return () => {
            // console.log('on dispose')
            if (codeDisposer) codeDisposer();
        };
    }, []);

    function onSwitchColorSchemeClick() {
        const currentThemeIndex = themes.indexOf(theme);
        let i = currentThemeIndex === themes.length - 1 ? 0 : currentThemeIndex + 1;

        setTheme(themes[i]);
    }

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
        setCodeError(null);

        const chartId = getChartId(chart.id);
        const deps: [string, any][] = [
            ['registerLoop', registerLoop],
            ['d3', d3],
            ['random', random],
            ['viz', viz],
        ];

        const fn = new Function(...deps.map(d => d[0]), code);

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
                setCodeError(err);
            else
                console.warn('unknown error', err);
        }
    }

    // async function onCodeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    async function onCodeChange(val: string) {
        // chart.setCode(e.currentTarget.value);

        // setCode(e.currentTarget.value);
        setCode(val);
    }

    // @todo ctrl+s to save
    async function onSaveClick() {
        setSavePending(true);

        await chart.store.api.updateChart(chart.id, {code});

        setLastSavedCode(code);
        setSavePending(false);
    }

    // @todo ctrl+enter to run
    function onRunClick() {
        runCode();
    }

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
                <button onClick={onSwitchColorSchemeClick}>{theme}</button>

                <AceEditor
                    mode="javascript"
                    theme={theme}
                    value={code}
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

                <button disabled={savePending || !isDirty()} style={{color: isDirty() ? 'orange' : 'inherit'}} onClick={onSaveClick}>{savePending ? 'saving...' : 'save'}</button>
                <button disabled={savePending} onClick={onRunClick}>run</button>

                {
                    hasLoopFn
                    &&
                    <>
                        <button onClick={onLoopToggleClick}>{isLoopRunning ? 'pause' : 'resume'}</button>
                    </>
                }

                {
                    codeError
                    &&
                    <div>
                        <div style={{fontFamily: 'monospace', backgroundColor: '#eee'}}>{codeError.constructor.name}: {codeError.message}</div>
                        <pre style={{backgroundColor: 'hsl(0, 100%, 95%)'}}>{codeError.stack}</pre>
                    </div>
                }
            </div>

            <div>
                <svg id={getChartId(chart.id)} width={containerWidth} height={containerHeight} style={{border: '1px solid'}}></svg>
            </div>
        </Wrapper>
    );
});