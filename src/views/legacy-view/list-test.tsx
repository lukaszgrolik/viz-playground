import * as React from 'react';
import * as d3 from "d3";

const sentence = 'Line chart are built thanks to the d3.line() helper function. I strongly advise to have a look to the basics of this function before trying to build your first chart. First example here is the most basic line plot you can do. Next one shows how to display several groups, and how to use small multiple to avoid the spaghetti chart.';
const randomInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const randomFloat = (a: number, b: number) => a + Math.random() * (b - a + 1);
const randomSample: <T>(arr: T[]) => T = arr => arr[Math.floor(Math.random() * arr.length)];
const genName = () => {
    const words = sentence.split(' ')

    return new Array(randomInt(3, 8)).fill(undefined).map((_, i) => {
        return randomSample(words);
    }).join(' ');
}

function renderList() {
    let idCounter = 0;
    let data = [
        { id: ++idCounter, name: 'terefere', numbers: [1, 2, 3] },
        { id: ++idCounter, name: 'lorem ipsum', numbers: [4, 5, 6] },
        { id: ++idCounter, name: 'qwe asd zxc', numbers: [99, 33] }
    ];
    const container = d3.select(`#list-test-list1`)

    function update(data: {id: number; name: string; numbers: number[]}[]) {
        const listItem = container
            .selectChildren('li')
            .data(data);

        const x = listItem.enter()
            .append('li')
            .append('div').classed('component', true)

        x
            .append('div').classed('header', true)
            .text(d => `#${d.id} ${d.name}`);
        x
            .append('ul')
            .selectChildren('li')
            .data(d => d.numbers)
            .enter()
            .append('li')
            .text(d => d);

        listItem.exit()
            .remove()

        const component = listItem
            .selectChild('div.component');

        // component.enter()
        //     .append('div').classed('component', true)
        //     .append('div').classed('header', true)

        const header = component
            .selectChild('div.header')
            .text(d => `#${d.id} ${d.name}`);

        const subList = component
            .selectChild('ul');

        const subListItem = subList
            .selectChildren('li')
            .data(d => d.numbers)
            .text(d => d);

        subListItem.enter()
            .append('li')
            .text(d => d);

        subListItem.exit()
            .remove();


        // header.enter()
        //     .append('div').classed('header', true)
        //     .text(d => `#${d.id} ${d.name}`);


        // const component = listItem.enter()
        //     .append('li')
        //     .select('div')

        // const header = component.enter()
        //     .append('div')
        //     .select('div')
        // // component
        // //     .select('div')
        // //     .text(d => `#${d.id} ${d.name}`);

        // // component.enter()
        // header.enter()
        //     .append('div')
        //     .text(d => `#${d.id} ${d.name}`);

        // const componentList = component
        //     .append('div')
        //     .append('ul')

        // const componentListItem = componentList
        //     .selectAll('li')
        //     .data(d => d.numbers)

        // componentListItem.enter()
        //     .append('li')
        //     .text((d, i) => {
        //         // return `${d.numbers[i]}`;
        //         return `${d}`;
        //     })
    }

    update(data);

    // listItem.exit().remove();

    setInterval(() => {
        // idCounter += 1;
        // // data = data.concat({id: idCounter, name: genName()})
        // // data[0] = {...data[0], name: 'ble ble'};

        // data.splice(0, 1);
        // data[0].name = 'lorem dolor'
        // data.push({id: idCounter, name: 'asd asd asd'})

        // // data = data.slice();
        // // data = [{id: 1, name: 'qwe'}, {id: 2, name: 'wsad'}, {id: 3, name: 'zxc'}]


        // const listItem = container
        //     .selectAll('li')
        //     .data(data)
        //     // .text(d => d.name);

        // // const component = listItem
        // //     .select('div')
        // //     .text(d => `#${d.id} ${d.name}`)

        // listItem.enter()
        //     .append('li')
        //     .text(d => d.name)

        // listItem.exit().remove();

        randomSample(data).name += ' (updated)';
        randomSample(data).numbers.push(randomInt(5000, 5999));
        const x = randomSample(data);
        x.numbers[randomInt(0, x.numbers.length - 1)] = randomFloat(10, 15);
        randomSample(data).numbers.pop();
        if (data.length > 1 && Math.random() < .9) data.splice(randomInt(0, data.length - 1), 1);

        if (Math.random() < .95) {
            const numbers = new Array(randomInt(1, 5)).fill(undefined).map((_, i) => i);
            data.push({id: ++idCounter, name: genName(), numbers})
            // data.push({id: 5, name: 'aaa 2', numbers: [2448]})
        }

        update(data);
    }, 1000);
}

export function ListTest() {
    React.useEffect(() => {
        renderList();
    }, [])

    return (
        <div id="list-test-container">
            <ul id="list-test-list1"></ul>
        </div>
    );
}