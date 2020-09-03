import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const networthEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(networthEmbed.setDescription(`${emojis.tickNo} Bots don't have bank accounts!`));

    const networth = (await database.getProp('economy', user.id, 'networth')) || 0;

    networthEmbed.setAuthor(user.username, user.displayAvatarURL({ dynamic: true }));
    message.channel.send(networthEmbed.setDescription(`${user.id === message.author.id ? 'Your' : 'Their'} networth: **$${networth.toLocaleString()}**`));
};

export const help = {
    aliases: ['networth'],
    name: 'Networth',
    description: 'Sends your networth',
    usage: 'networth [user]',
    example: 'networth\nnetworth @Conor#0751',
};

export const config = {
    args: 0,
    category: 'economy',
};
