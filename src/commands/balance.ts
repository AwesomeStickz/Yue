import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const balanceEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(balanceEmbed.setDescription(`${emojis.tickNo} Bots don't have bank accounts!`));

    const balance = (await database.getProp('economy', user.id, 'balance')) || 0;

    balanceEmbed.setAuthor(user.username, user.displayAvatarURL());
    message.channel.send(balanceEmbed.setDescription(`${user.id === message.author.id ? 'Your' : 'Their'} balance: **$${balance.toLocaleString()}**`));
};

export const help = {
    aliases: ['bal', 'balance'],
    name: 'Balance',
    description: 'Sends your balance',
    usage: 'balance <user>',
    example: 'balance\nbalance @Conor#0751',
};

export const config = {
    args: 0,
};
