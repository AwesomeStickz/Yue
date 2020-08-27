import { Client, Message } from 'discord.js';
import fs from 'fs';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]) => {
    fs.access(`./commands/${args.join(' ')}.js`, fs.constants.R_OK | fs.constants.W_OK, (error: any) => {
        if (error) {
            const reloadEmbed = embed({ color: 'RANDOM', desc: `${emojis.tickNo} Error while reloading!. Reason: The command **${args.join(' ')}** doesn't exist!` });

            message.channel.send(reloadEmbed);
        } else {
            delete require.cache[require.resolve(`./${args.join(' ')}`)];

            const reloadEmbed = embed({ color: 'RANDOM', desc: `${emojis.tickYes} Successfully reloaded **${args.join(' ')}**!` });
            message.channel.send(reloadEmbed);
        }
    });
};

export const help = {
    aliases: ['reload'],
    name: 'Reload',
    description: 'Reloads a command',
    usage: 'reload',
    example: 'reload reload',
};

export const config = {
    args: 1,
    owner: true,
    category: 'bot',
};
