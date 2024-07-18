export default class SimpleDBClient {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.ws.onmessage = async (event) => await this.#handleMessage(event.data);
        this.data = null;
        this.messagePromise = null;
        this.messageResolver = null;
    }

    sendMessage(message) {
        this.ws.send(message);
        this.messagePromise = new Promise((resolve) => {
            this.messageResolver = resolve;
        });
    }

    async getData() {
        return this.messagePromise;
    }

    async #handleMessage(message) {
        await this.#parseMessage(message);
        if (this.messageResolver) {
            this.messageResolver(this.data);
            this.messageResolver = null;
        }
    }

    async #parseMessage(message) {
        try {
            this.data = await JSON.parse(message);
            if (this.data.output === "QUITTING PROGRAM;") {
                this.ws.close();
            }
        } catch (err) {
            console.error("Error parsing WebSocket message: ", err);
            this.data = {output: err};
        }
    }
}