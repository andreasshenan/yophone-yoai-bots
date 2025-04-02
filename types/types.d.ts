export interface ICommands {
    command: string;
    description: string;
}
export interface IReplyOption {
    label: string;
    value: string;
}

export interface IReplyButtons {
    grid?: number;
    options?: IReplyOption[];
    inline_buttons?: {
        label: string;
        data?: string;
        url?: string;
    }[];
}
