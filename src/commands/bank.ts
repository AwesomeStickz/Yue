import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const bankEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(bankEmbed.setDescription(`${emojis.tickNo} Bots don't have bank accounts!`));

    const bankBalance = (await database.getProp('economy', user.id, 'bank')) || 0;
    const bankCapacity = await utils.getBankCapacity(user.id);

    bankEmbed.setAuthor(user.username, user.displayAvatarURL({ dynamic: true }));
    message.channel.send(bankEmbed.setDescription(`Bank: **$${bankBalance.toLocaleString()}**\nBank capacity: **$${bankCapacity.toLocaleString()}**`));
};

export const help = {
    aliases: ['bank'],
    name: 'Bank',
    description: 'View your balance in the bank',
    usage: 'bank [user]',
    example: 'bank\bank @Conor#0751',
};

export const config = {
    args: 0,
    category: 'economy',
};
