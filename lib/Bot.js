"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Markup = exports.Bot = exports.YoAIClient = exports.Context = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
/**
 * Represents the context of a message or update.
 */
class Context {
    constructor(update, content, sender, yoaiClient) {
        this.update = update;
        this.content = content || "";
        this.sender = sender;
        this.yoaiClient = yoaiClient;
    }
    async reply(text) {
        return this.yoaiClient.sendMessage(this.sender.id, text);
    }
    async replyWithOptions(text, options = []) {
        return this.yoaiClient.sendMessageWithOptions(this.sender.id, text, options);
    }
    replyWithPhoto(photo) {
        return this.yoaiClient.sendPhoto(this.sender.id, "photo", photo);
    }
}
exports.Context = Context;
class YoAIClient {
    constructor(token) {
        this.client = axios_1.default.create({
            baseURL: "https://yoai.yophone.com/api/pub",
            headers: {
                post: {
                    "X-YoAI-API-Key": token,
                },
            },
        });
    }
    async sendMessage(to, text) {
        await this.client.post("/sendMessage", { to, text });
    }
    async sendMessageWithOptions(to, text, options = []) {
        await this.client.post("/sendMessage", { to, text, options });
    }
    async setCommands(commands) {
        await this.client.post("/sendMessage", { commands });
    }
    async webhookURL(webhookURL) {
        await this.client.post("/webhookURL", { webhookURL });
    }
    async getChannelMember(id, userId) {
        await this.client.post("/getChannelMember", { id, userId });
    }
    async sendPhoto(to, text, photo) {
        if (!fs_1.default.existsSync(photo)) {
            throw "file not found at path " + photo;
        }
        const fileBuffer = fs_1.default.readFileSync(photo);
        const formdata = new form_data_1.default();
        formdata.append("to", to);
        formdata.append("text", text);
        console.log(fileBuffer);
        formdata.append("file", fs_1.default.createReadStream(photo), photo);
        await this.client.post("/sendMessage", formdata, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
    getUpdates() {
        return this.client.post("/getUpdates");
    }
}
exports.YoAIClient = YoAIClient;
class Bot {
    constructor(token) {
        this.middlewares = [];
        this.yoaiClient = new YoAIClient(token);
    }
    command(command, handler) {
        this.middlewares.push(async (ctx, next) => {
            if (ctx.content.startsWith("/")) {
                const commandName = ctx.content.substring(1).trim();
                if (command === commandName) {
                    await handler(ctx);
                    await next();
                }
                else {
                    await next();
                }
            }
            else {
                await next();
            }
        });
    }
    on(event, handler) {
        this.middlewares.push(async (ctx, next) => {
            if (ctx.content && !ctx.content.startsWith("/")) {
                await handler(ctx);
                await next();
            }
            await next();
        });
    }
    start() {
        this._getUpdates();
    }
    setWebhook() {
        // Not implemented yet
    }
    use(handler) {
        this.middlewares.push(handler);
    }
    async runMiddlewares(ctx) {
        const next = async (index) => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index];
                await middleware(ctx, () => next(index + 1));
            }
        };
        await next(0);
    }
    async handleMessage(update) {
        const { text, sender } = update;
        let messageTextReceived = Buffer.from(text, "base64").toString("utf-8");
        try {
            const decodedData = JSON.parse(messageTextReceived);
            messageTextReceived = decodedData.content.content;
        }
        catch (e) {
            console.log("Received plain text", messageTextReceived);
        }
        const ctx = new Context(update, messageTextReceived, sender, this.yoaiClient);
        await this.runMiddlewares(ctx);
    }
    async _getUpdates() {
        try {
            const data = await this.yoaiClient.getUpdates();
            console.log("Status code", data.status);
            if (data.status === 200) {
                data.data.data.forEach((m) => {
                    this.handleMessage(m);
                });
            }
            if (data.status === 200 || data.status === 204) {
                return this._getUpdates();
            }
            else if (data.status >= 500) {
                await wait(5000);
            }
            else if (data.status === 429) {
                console.error("Rate limit reached");
            }
            else {
                console.error("Service unavailable");
            }
        }
        catch (e) {
            if (e.code === "ECONNRESET" || e.code === "ERR_BAD_RESPONSE") {
                return this._getUpdates();
            }
            else {
                await wait(5000);
                return this._getUpdates();
            }
        }
    }
}
exports.Bot = Bot;
class Markup {
    constructor(value = "") {
        this.value = value;
    }
    static header(text, prefix = "", postfix = "") {
        return `${prefix}###${text}${postfix}`;
    }
    static subheader(text, prefix = "", postfix = "") {
        return `${prefix}##${text}${postfix}`;
    }
    static bold(text, prefix = "", postfix = "") {
        return `${prefix}**${text}**${postfix}`;
    }
    static underline(text, prefix = "", postfix = "") {
        return `${prefix}__${text}__${postfix}`;
    }
    static italic(text, prefix = "", postfix = "") {
        return `${prefix}*${text}*${postfix}`;
    }
    static strike(text, prefix = "", postfix = "") {
        return `${prefix}~~${text}~~${postfix}`;
    }
    static copyable(text, prefix = "", postfix = "") {
        return `${prefix}\`${text}\`${postfix}`;
    }
    static link(text, link, prefix = "", postfix = "") {
        return `${prefix}[${text}](${link})${postfix}`;
    }
    clear() {
        this.value = "";
    }
    newLine(count = 1) {
        const line = "\n";
        this.value = `${this.value}${line.repeat(count)}`;
        return this;
    }
    text(text, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}${text}${postfix}`;
        return this;
    }
    header(text, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}###${text}${postfix}`;
        return this;
    }
    subheader(text, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}##${text}${postfix}`;
        return this;
    }
    underline(text, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}__${text}__${postfix}`;
        return this;
    }
    bold(text, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}**${text}**${postfix}`;
        return this;
    }
    italic(text, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}*${text}*${postfix}`;
        return this;
    }
    strike(text, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}~~${text}~~${postfix}`;
        return this;
    }
    copyable(text, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}\`${text}\`${postfix}`;
        return this;
    }
    link(text, link, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}[${text}](${link})${postfix}`;
        return this;
    }
    toString() {
        return this.value;
    }
}
exports.Markup = Markup;
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
