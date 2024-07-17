export default class SimpleDBClient {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.ws.onmessage = async (event) => await this.#handleMessage(event.data);
        this.data = null;
        this.messageResolved = false;
    }

    sendMessage(message) {
        this.client.write(message);
        this.messageResolved = false;
    }

    async getData() {
        while (!this.messageResolved) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return this.data;
    }

    async #handleMessage(message) {
        await this.#parseMessage(message);
        this.messageResolved = true;
    }

    async #parseMessage(message) {
        try {
            this.data = await JSON.parse(message);
        } catch (err) {
            console.error("Error parsing WebSocket message: ", err);
            this.data = null;
        }
    }
}