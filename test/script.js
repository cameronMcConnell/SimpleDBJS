class SimpleDBClient {
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

    messageForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const message = document.getElementById("message").value;

        try {
            simpleDBClient.sendMessage(message);
            const data = simpleDBClient.getData();
            
            const responseList = document.getElementById("response-container");
            responseList.innerHTML += `<p>${JSON.stringify(data)}</p>`;
        } catch (err) {
            console.err("Error trying to send message: ", err);
            messageForm.innerHTML += `<p>Error: ${err}</p>`;
        }
    })
})