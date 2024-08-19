import * as React from 'react';
import styled from '@emotion/styled';
import * as d3 from "d3";
import { observable, runInAction, observe } from 'mobx';
import * as Simplex from 'open-simplex-noise';
import { observer } from 'mobx-react-lite';
import { DelaunayData } from './voronoi';

export const VoronoiChart = observer((props: { delaunayData: DelaunayData }) => {
    const { delaunayData } = props;

    return (
        <>
            {
                delaunayData.origCoords.map((c, i) => {
                    return (
                        <circle key={i} cx={c[0]} cy={c[1]} r={3} fill='red'></circle>
                    )
                })
            }
            {
                delaunayData.triangleCoords.map((t, i) => {
                    // console.log('t[0]', t[0])
                    const p1 = t[0];
                    const p2 = t[1];
                    const p3 = t[2];
                    // const y1 = t[0];
                    // const p2 = t[1];
                    return (
                        <g key={i}>
                            <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="grey"></line>
                            <line x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} stroke="grey"></line>
                            <line x1={p3[0]} y1={p3[1]} x2={p1[0]} y2={p1[1]} stroke="grey"></line>
                        </g>
                    )
                })
            }
            {
                delaunayData.circumcenters.map((p, i) => {
                    return (
                        <circle key={i} cx={p[0]} cy={p[1]} r={5} fill='black'></circle>
                    )
                })
            }
            {
                delaunayData.cellPolygons.map((poly, i) => {
                    // console.log('poly', poly);
                    // return poly.map((p, i) => {
                    //     const nextPoint = i < (poly.length - 1) ? poly[i + 1] : poly[0];
                    //     return (
                    //         <g key={i}>
                    //             <line x1={p[0]} y1={p[1]} x2={nextPoint[0]} y2={nextPoint[1]} stroke="orange"></line>
                    //         </g>
                    //     )
                    // })
                    const points = poly.map(p => {
                        return `${p[0]},${p[1]}`
                    }).join(' ');
                    const color = delaunayData.cellColors[i];

                    return (
                        <polygon key={i} points={points} fill={color} />
                    )
                })
            }
        </>
    );
});