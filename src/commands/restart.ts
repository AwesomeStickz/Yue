import { Message } from 'discord.js';
import { emojis } from '../utils/emojis';

export const run = async (message: Message) => {
    message.channel.send(`${emojis.tickYes} Restarted!`);
    setTimeout(() => process.exit(), 3000);
};

export const help = {
    aliases: ['restart'],
    name: 'Restart',
    description: 'Restarts the Bot',
    usage: '>restart',
};

export const config = {
    args: 0,
    owner: true,
};
