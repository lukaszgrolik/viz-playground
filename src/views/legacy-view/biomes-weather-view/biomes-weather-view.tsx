import * as React from 'react';
import styled from '@emotion/styled';
import * as d3 from "d3";
import { observable, runInAction, observe, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';

import * as BiomeEngine from './biome-engine';
import * as TreeSim from './tree-sim';
import { SimEngine } from './sim-engine';

const world = new BiomeEngine.World({
    size: {x: 50, y: 50},
    // climate: new BiomeEngine.Climate()
    yearDuration: 60,
    yearTemperature: {min: 8, max: 22},
    currentTime: 0
});


const treeSim = new TreeSim.TreeSim(world);

const simEngine = new SimEngine({
    onUpdate: () => {
        world.update();
        treeSim.update();
    }
});

// ! draw temperature chart - blue -> yellow -> orange -> red
// ! draw biome chart - ice, snow, sparse green, dense green, bush, desert
// ! display year progress

// case 1: terrain with desert, polar and green
// case: leaf and pine trees, palm, cactus
// case: add height noise - the more height, the less temperature
// case: moving areas of different temp - clouds blocking sun; heat/ice wave
// case: evo sim -  use pixi

const Wrapper = styled.div`
    display: flex;
    gap: 2em;
`;

export const BiomesWeatherView = observer(() => {
    // ! disposer
    React.useEffect(() => {
        simEngine.start();
    }, []);

    return (
        <Wrapper>
            <div>

            </div>

            <div>

            </div>
        </Wrapper>
    );
});