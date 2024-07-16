const csvtojson = require('csvtojson');

class SimpleDBClient {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.ws.onmessage = (event) => this.#handleMessage(event.data);
        this.data = null;
    }

    sendMessage(message) {
        this.ws.send(message);
    }

    async #handleMessage(message) {
        if (this.#isValidCSV(message)) {
            try {
                this.data = {output: await csvtojson().fromString(message)};
            } catch(err) {
                console.error("Error converting CSV to JSON: ", err);
            }
        } else {
            this.data = {output: message}
        }
    }

    #isValidCSV(message) {
        const csvRegex = /^((?:"[^"]*(?:""[^"]*)*"|[^",\r\n]*)(?:,(?:"[^"]*(?:""[^"]*)*"|[^",\r\n]*))*)$/gm;
    
        const lines = message.split(/\r?\n/);
    
        for (let line of lines) {
            if (!csvRegex.test(line.trim())) {
                return false;
            }
        }
    
        return true;
    }
}

module.exports = SimpleDBClient;