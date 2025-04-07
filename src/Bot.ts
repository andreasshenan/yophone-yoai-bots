import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
import fs from "fs";
import FormData from "form-data";
import { ICommands, IReplyButtons, IReplyOption } from "../types/types";

/**
 * Represents the context of a message or update.
 */
export class Context {
    update: any;
    content: string;
    callbackData: string | null;
    sender: { id: string };
    yoaiClient: YoAIClient;

    constructor(
        update: any,
        content: string,
        callbackData: string | null,
        sender: { id: string },
        yoaiClient: YoAIClient
    ) {
        this.update = update;
        this.content = content || "";
        this.callbackData = callbackData;
        this.sender = sender;
        this.yoaiClient = yoaiClient;
    }

    async reply(text: string): Promise<void> {
        return this.yoaiClient.sendMessage(this.sender.id, text);
    }
    async replyWithOptions(
        text: string,
        options: IReplyOption[] = []
    ): Promise<void> {
        return this.yoaiClient.sendMessageWithOptions(
            this.sender.id,
            text,
            options
        );
    }

    async replyWithButtons(
        text: string,
        buttons: IReplyButtons = {}
    ): Promise<void> {
        return this.yoaiClient.sendMessageWithButtons(
            this.sender.id,
            text,
            buttons
        );
    }

    replyWithPhoto(photo: string): Promise<void> {
        return this.yoaiClient.sendPhoto(this.sender.id, "photo", photo);
    }
}

export class YoAIClient {
    client: AxiosInstance;

    constructor(token: string) {
        this.client = axios.create({
            baseURL: "https://yoai.yophone.com/api/pub",
            headers: {
                post: {
                    "X-YoAI-API-Key": token,
                },
            },
        } as CreateAxiosDefaults);
    }

    async sendMessage(to: string, text: string): Promise<void> {
        await this.client.post("/sendMessage", { to, text });
    }
    async sendMessageWithOptions(
        to: string,
        text: string,
        options: IReplyOption[] = []
    ): Promise<void> {
        await this.client.post("/sendMessage", { to, text, options });
    }
    async sendMessageWithButtons(
        to: string,
        text: string,
        buttons: IReplyButtons = {}
    ): Promise<void> {
        await this.client.post("/sendMessage", { to, text, buttons });
    }
    async setCommands(commands: ICommands[]): Promise<void> {
        await this.client.post("/sendMessage", { commands });
    }
    async webhookURL(webhookURL: string): Promise<void> {
        await this.client.post("/webhookURL", { webhookURL });
    }
    async getChannelMember(id: string, userId: string): Promise<void> {
        await this.client.post("/getChannelMember", { id, userId });
    }

    async sendPhoto(to: string, text: string, photo: string): Promise<void> {
        if (!fs.existsSync(photo)) {
            throw "file not found at path " + photo;
        }
        const fileBuffer = fs.readFileSync(photo);
        const formdata = new FormData();
        formdata.append("to", to);
        formdata.append("text", text);
        console.log(fileBuffer);
        formdata.append("file", fs.createReadStream(photo), photo);

        await this.client.post("/sendMessage", formdata, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    getUpdates(): Promise<any> {
        return this.client.post("/getUpdates");
    }
}

export class Bot {
    middlewares: Array<
        (ctx: Context, next: () => Promise<void>) => Promise<void>
    >;
    yoaiClient: YoAIClient;
    activeCommands: string[];

    constructor(token: string) {
        this.middlewares = [];
        this.yoaiClient = new YoAIClient(token);
        this.activeCommands = [];
    }

    command(command: string, handler: (ctx: Context) => Promise<void>): void {
        this.activeCommands.push(command);
        this.middlewares.push(async (ctx, next) => {
            if (ctx.content.startsWith("/")) {
                const commandName = ctx.content.substring(1).trim();
                if (command === commandName) {
                    await handler(ctx);
                    return next();
                }
            }
            return next();
        });
    }

    async setCommands(commands: ICommands[]): Promise<void> {
        await this.yoaiClient.setCommands(commands);
    }

    on(event: string, handler: (ctx: Context) => Promise<void>): void {
        this.middlewares.push(async (ctx, next) => {
            const { callbackData } = ctx;
            if (event === "message" && !callbackData) {
                if (ctx.content) {
                    if (!ctx.content.startsWith("/")) {
                        await handler(ctx);
                        return next();
                    } else {
                        const commandName = ctx.content.substring(1).trim();
                        if (!this.activeCommands.includes(commandName)) {
                            await handler(ctx);
                            return next();
                        }
                    }
                }
            }
            if (event === "callbackData" && callbackData) {
                await handler(ctx);
                return next();
            }
            return next();
        });
    }

    start(): void {
        this._getUpdates();
    }

    setWebhook(): void {
        // Not implemented yet
    }

    use(
        handler: (ctx: Context, next: () => Promise<void>) => Promise<void>
    ): void {
        this.middlewares.push(handler);
    }

    private async runMiddlewares(ctx: Context): Promise<void> {
        const next = async (index: number) => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index];
                await middleware(ctx, () => next(index + 1));
            }
        };
        await next(0);
    }

    private async handleMessage(update: any): Promise<void> {
        const { text, sender, callbackData } = update;
        let messageTextReceived = Buffer.from(text, "base64").toString("utf-8");
        let callbackDataReceived = Buffer.from(callbackData, "base64").toString(
            "utf-8"
        );

        try {
            const decodedData = JSON.parse(messageTextReceived);
            messageTextReceived = decodedData.content.content;
        } catch (e) {
            console.log("Received plain text", messageTextReceived);
        }

        try {
            const decodedData = JSON.parse(callbackDataReceived);
            callbackDataReceived = decodedData.content.content;
        } catch (e) {
            console.log(
                "Received plain text in callbackData",
                callbackDataReceived
            );
        }

        const ctx = new Context(
            update,
            messageTextReceived,
            callbackDataReceived,
            sender,
            this.yoaiClient
        );
        await this.runMiddlewares(ctx);
    }

    private async _getUpdates(): Promise<void> {
        try {
            const data = await this.yoaiClient.getUpdates();
            console.log("Status code", data.status);

            if (data.status === 200) {
                data.data.data.forEach((m: any) => {
                    this.handleMessage(m);
                });
            }

            if (data.status === 200 || data.status === 204) {
                return this._getUpdates();
            } else if (data.status >= 500) {
                await wait(5000);
            } else if (data.status === 429) {
                console.error("Rate limit reached");
            } else {
                console.error("Service unavailable");
            }
        } catch (e: any) {
            if (e.code === "ECONNRESET" || e.code === "ERR_BAD_RESPONSE") {
                return this._getUpdates();
            } else {
                await wait(5000);
                return this._getUpdates();
            }
        }
    }
}

export class Markup {
    private value: string;

    constructor(value: string = "") {
        this.value = value;
    }

    static header(text: string | number | Markup, prefix = "", postfix = "") {
        return `${prefix}###${text}${postfix}`;
    }
    static subheader(
        text: string | number | Markup,
        prefix = "",
        postfix = ""
    ) {
        return `${prefix}##${text}${postfix}`;
    }
    static bold(text: string | number | Markup, prefix = "", postfix = "") {
        return `${prefix}**${text}**${postfix}`;
    }
    static underline(
        text: string | number | Markup,
        prefix = "",
        postfix = ""
    ) {
        return `${prefix}__${text}__${postfix}`;
    }
    static italic(text: string | number | Markup, prefix = "", postfix = "") {
        return `${prefix}*${text}*${postfix}`;
    }
    static strike(text: string | number | Markup, prefix = "", postfix = "") {
        return `${prefix}~~${text}~~${postfix}`;
    }
    static copyable(text: string | number | Markup, prefix = "", postfix = "") {
        return `${prefix}\`${text}\`${postfix}`;
    }
    static link(
        text: string | number | Markup,
        link: string,
        prefix = "",
        postfix = ""
    ) {
        return `${prefix}[${text}](${link})${postfix}`;
    }

    clear() {
        this.value = "";
    }

    newLine(count: number = 1) {
        const line = "\n";
        this.value = `${this.value}${line.repeat(count)}`;
        return this;
    }

    text(text: string | number, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}${text}${postfix}`;
        return this;
    }

    header(text: string, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}###${text}${postfix}`;
        return this;
    }

    subheader(text: string, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}##${text}${postfix}`;
        return this;
    }

    underline(text: string | number | Markup, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}__${text}__${postfix}`;
        return this;
    }

    bold(text: string | number | Markup, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}**${text}**${postfix}`;
        return this;
    }

    italic(text: string | number | Markup, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}*${text}*${postfix}`;
        return this;
    }

    strike(text: string | number | Markup, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}~~${text}~~${postfix}`;
        return this;
    }

    copyable(text: string | number | Markup, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}\`${text}\`${postfix}`;
        return this;
    }

    link(text: string | number, link: string, prefix = "", postfix = "") {
        this.value = `${this.value}${prefix}[${text}](${link})${postfix}`;
        return this;
    }

    toString(): string {
        return this.value;
    }
}

async function wait(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}
