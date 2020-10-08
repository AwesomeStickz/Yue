import { Client, Message } from 'discord.js';
import { run as messageEventRun } from './message';

export const run = async (client: Client, oldMessage: Message, newMessage: Message): Promise<Message | void> => {
    if (newMessage.partial) newMessage = await newMessage.fetch();
    if (oldMessage.content === newMessage.content) return;

    messageEventRun(client, newMessage);
};
