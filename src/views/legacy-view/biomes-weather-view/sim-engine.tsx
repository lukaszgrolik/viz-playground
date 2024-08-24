// height, moisture, temperature, insolation
export class SimEngine {
    constructor(private readonly opts: { onUpdate: () => void; }) {
    }

    start() {
        this.opts.onUpdate();

        // requestAnimationFrame(this.loop);
    }

    loop() {
        // requestAnimationFrame(this.loop);
    }
}
