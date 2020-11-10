import * as React from 'react';

function circlePos(r: number, angle: number): [number, number] {
    const rad = angle * Math.PI / 180;
    return [r * Math.sin(rad), r * Math.cos(rad)];
}

function d(values: [number, number][]): string {
    let res = 'M';
    res += values.map(val => `${val[0]},${val[1]}`).join(' L');
    res += ' Z'

    return res;
}

function circle([x, y]: [number, number], r: number, n: number): [number, number][] {
    const angle = Math.round(360 / n);
    return new Array(n).fill(undefined).map((_, i) => {
        const pos = circlePos(r, angle * i);
        return [Math.round(x + pos[0]), Math.round(y + pos[1])];
    });
}

export function CirclesBox() {
    React.useEffect(() => {

    }, []);

    return (
        <div>
            <svg width="500" height="500" style={{border: '1px solid grey'}}>
                <circle cx="125" cy="125" r="50" stroke="red" fill="transparent" />

                <path d={d(circle([375, 125], 50, 6))} stroke="red" strokeWidth="1" fill="transparent" />

                <path d={d(circle([125, 375], 25, 6))} stroke="hsl(0, 50%, 50%)" strokeWidth="5" fill="transparent" />
                <path d={d(circle([125, 375], 50, 8))} stroke="hsl(120, 50%, 50%)" strokeWidth="5" fill="transparent" />
                <path d={d(circle([125, 375], 75, 10))} stroke="hsl(240, 50%, 50%)" strokeWidth="5" fill="transparent" />
                <path d={d(circle([125, 375], 100, 12))} stroke="hsl(30, 50%, 50%)" strokeWidth="5" fill="transparent" />
            </svg>
        </div>
    )
}