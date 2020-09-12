import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { aliases, commands } from '../yue';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const reloadEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Reload',
        },
        color: message.guild?.me?.displayHexColor,
        footer: 'Yue',
        timestamp: true,
    });

    const commandName = args.join(' ').toLowerCase();
    if (!aliases.has(commandName.toUpperCase())) return message.channel.send(reloadEmbed.setDescription(`${emojis.tickNo} Command **${commandName}** doesn't exist!`));

    const commandInfo = commands.get(aliases.get(commandName.toUpperCase()));
    delete require.cache[require.resolve(`./${(commandInfo as any).fileName}`)];

    message.channel.send(reloadEmbed.setDescription(`${emojis.tickYes} Successfully reloaded **${(commandInfo as any).help.name.toLowerCase()}**!`));
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
