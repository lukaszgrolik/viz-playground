import * as React from 'react';
import { observer } from 'mobx-react-lite';

import * as Store from '../../store/store';
import * as Viz from '../../viz';

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

function getChartId(chartId: number) {
    return `svg_chart_${chartId}`;
}

export const ChartBlock: React.FunctionComponent<{chart: Store.Chart}> = observer(({chart}) => {
    const [code, setCode] = React.useState(formatFunctionCode(chart.code));
    const [codeError, setCodeError] = React.useState<Error | null>(null);
    const [viz] = React.useState(
        new Viz.Viz(getChartId(chart.id), { containerWidth, containerHeight })
    );

    React.useEffect(() => {
        runCode();
    }, []);

    function runCode() {
        setCodeError(null);

        try {
            const fn = new Function('viz', chart.code);

            // @todo handle error on invoke
            const svg = document.getElementById(getChartId(chart.id))
            if (svg) svg.innerHTML = '';

            fn(viz);
        }
        catch (err: unknown) {
            if (err instanceof Error)
                setCodeError(err);
            else
                console.warn('unknown error', err);
        }
    }

    function onCodeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        chart.setCode(e.currentTarget.value);

        setCode(e.currentTarget.value);
    }

    // @todo ctrl+enter to run
    function onRunClick() {
        runCode();
    }

    return (
        <div style={{display: 'flex'}}>
            <div>
                <pre><textarea
                    rows={10}
                    cols={80}
                    value={code}
                    onChange={onCodeChange}
                /></pre>
                <button onClick={onRunClick}>run</button>

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