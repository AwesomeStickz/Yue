import { Client, Message } from 'discord.js';
import fs from 'fs';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]) => {
    if (args[0] == 'all') {
        delete require.cache;

        const reloadEmbed = embed({ color: 'RANDOM', desc: `${emojis.tickYes} All commands have been reloaded!` });
        message.channel.send(reloadEmbed);
    } else {
        fs.access(`./commands/${args[0]}.js`, fs.constants.R_OK | fs.constants.W_OK, (error: any) => {
            if (error) {
                const reloadEmbed = embed({ color: 'RANDOM', desc: `${emojis.tickNo} Error while reloading!. Reason: The command **${args.join(' ')}** doesn't exist!` });

                message.channel.send(reloadEmbed);
            } else {
                delete require.cache[require.resolve(`./${args}`)];

                const reloadEmbed = embed({ color: 'RANDOM', desc: `${emojis.tickYes} Successfully reloaded **${args[0]}**!` });
                message.channel.send(reloadEmbed);
            }
        });
    }
};

export const help = {
    aliases: ['reload'],
    name: 'Reload',
    description: 'Reloads a command',
    usage: '>reload',
};

export const config = {
    args: 1,
    restricted: true,
};
