

export class LukRandom {
    rangeInt(a: number, b: number) {
        return a + Math.floor(Math.random() * (b - a));
    }

    sample<T>(arr: T[]): T | undefined {
        if (arr.length == 0) return undefined;

        return arr[this.rangeInt(0, arr.length)];
    }

    sampleMany<T>(arr: T[], count: number): T[] {
        return this.shuffle(arr).slice(0, count);
    }

    shuffle<T>(array: T[]): T[] {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }
}
