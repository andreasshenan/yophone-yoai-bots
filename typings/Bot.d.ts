import { AxiosInstance } from "axios";
import { ICommands, IReplyButtons, IReplyOption } from "../types/types";
/**
 * Represents the context of a message or update.
 */
export declare class Context {
    update: any;
    content: string;
    sender: {
        id: string;
    };
    yoaiClient: YoAIClient;
    constructor(update: any, content: string, sender: {
        id: string;
    }, yoaiClient: YoAIClient);
    reply(text: string): Promise<void>;
    replyWithOptions(text: string, options?: IReplyOption[]): Promise<void>;
    replyWithButtons(text: string, buttons?: IReplyButtons): Promise<void>;
    replyWithPhoto(photo: string): Promise<void>;
}
export declare class YoAIClient {
    client: AxiosInstance;
    constructor(token: string);
    sendMessage(to: string, text: string): Promise<void>;
    sendMessageWithOptions(to: string, text: string, options?: IReplyOption[]): Promise<void>;
    sendMessageWithButtons(to: string, text: string, buttons?: IReplyButtons): Promise<void>;
    setCommands(commands: ICommands[]): Promise<void>;
    webhookURL(webhookURL: string): Promise<void>;
    getChannelMember(id: string, userId: string): Promise<void>;
    sendPhoto(to: string, text: string, photo: string): Promise<void>;
    getUpdates(): Promise<any>;
}
export declare class Bot {
    middlewares: Array<(ctx: Context, next: () => Promise<void>) => Promise<void>>;
    yoaiClient: YoAIClient;
    constructor(token: string);
    command(command: string, handler: (ctx: Context) => Promise<void>): void;
    on(event: string, handler: (ctx: Context) => Promise<void>): void;
    start(): void;
    setWebhook(): void;
    use(handler: (ctx: Context, next: () => Promise<void>) => Promise<void>): void;
    private runMiddlewares;
    private handleMessage;
    private _getUpdates;
}
export declare class Markup {
    private value;
    constructor(value?: string);
    static header(text: string | number | Markup, prefix?: string, postfix?: string): string;
    static subheader(text: string | number | Markup, prefix?: string, postfix?: string): string;
    static bold(text: string | number | Markup, prefix?: string, postfix?: string): string;
    static underline(text: string | number | Markup, prefix?: string, postfix?: string): string;
    static italic(text: string | number | Markup, prefix?: string, postfix?: string): string;
    static strike(text: string | number | Markup, prefix?: string, postfix?: string): string;
    static copyable(text: string | number | Markup, prefix?: string, postfix?: string): string;
    static link(text: string | number | Markup, link: string, prefix?: string, postfix?: string): string;
    clear(): void;
    newLine(count?: number): this;
    text(text: string | number, prefix?: string, postfix?: string): this;
    header(text: string, prefix?: string, postfix?: string): this;
    subheader(text: string, prefix?: string, postfix?: string): this;
    underline(text: string | number | Markup, prefix?: string, postfix?: string): this;
    bold(text: string | number | Markup, prefix?: string, postfix?: string): this;
    italic(text: string | number | Markup, prefix?: string, postfix?: string): this;
    strike(text: string | number | Markup, prefix?: string, postfix?: string): this;
    copyable(text: string | number | Markup, prefix?: string, postfix?: string): this;
    link(text: string | number, link: string, prefix?: string, postfix?: string): this;
    toString(): string;
}
//# sourceMappingURL=Bot.d.ts.map