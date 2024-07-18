class SimpleDBClient {
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

let simpleDBClient;

document.addEventListener("DOMContentLoaded", () => {
    const urlForm = document.getElementById("set-url");

    urlForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const url = document.getElementById("url").value;

        try {
            simpleDBClient = new SimpleDBClient(url);
            urlForm.innerHTML += "<p>Success!</p>";
        } catch (err) {
            console.error("Error trying to set url: ", err);
            urlForm.innerHTML += `<p>Error: ${err}</p>`;
        }
    });

    const messageForm = document.getElementById("send-message");

    messageForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const message = document.getElementById("message").value;

        try {
            simpleDBClient.sendMessage(message);
            const data = await simpleDBClient.getData();
            
            const responseContainer = document.getElementById("response-container");
            responseContainer.innerHTML += `<p>${data.output}</p>`;
        } catch (err) {
            console.error("Error trying to send message: ", err);
            messageForm.innerHTML += `<p>Error: ${err}</p>`;
        }
    })
})