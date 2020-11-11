import * as React from 'react';
import { observer } from 'mobx-react-lite';
// import {config} from "ace-builds";
// import ace from 'ace-builds/src-noconflict/ace';
import AceEditor from "react-ace";

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

    React.useEffect(() => {
        runCode();
    }, []);

    function onSwitchColorSchemeClick() {
        const currentThemeIndex = themes.indexOf(theme);
        let i = currentThemeIndex === themes.length - 1 ? 0 : currentThemeIndex + 1;

        setTheme(themes[i]);
    }

    function runCode() {
        setCodeError(null);

        try {
            const fn = new Function('viz', code);

            // @todo handle error on invoke
            const svg = document.getElementById(getChartId(chart.id))
            if (svg) svg.innerHTML = '';

            fn(viz);
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

    return (
        <div style={{display: 'flex'}}>
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
                    setOptions={{ useWorker: false }}
                />

                <button disabled={savePending || !isDirty()} style={{color: isDirty() ? 'orange' : 'inherit'}} onClick={onSaveClick}>{savePending ? 'saving...' : 'save'}</button>
                <button disabled={savePending} onClick={onRunClick}>run</button>

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
        </div>
    );
});