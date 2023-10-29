export class LukRandom {
    rangeInt(a: number, b: number) {
        return a + Math.floor(Math.random() * (b - a));
    }

    sample<T>(arr: T[]): T | undefined {
        if (arr.length == 0) return undefined;

        return arr[this.rangeInt(0, arr.length)];
    }
}
