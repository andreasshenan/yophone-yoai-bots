import { AxiosInstance } from "axios";
import { ICommands, IReplyOption } from "../types/types";
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
    replyWithPhoto(photo: string): Promise<void>;
}
export declare class YoAIClient {
    client: AxiosInstance;
    constructor(token: string);
    sendMessage(to: string, text: string): Promise<void>;
    sendMessageWithOptions(to: string, text: string, options?: IReplyOption[]): Promise<void>;
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
export default Bot;
//# sourceMappingURL=Bot.d.ts.map