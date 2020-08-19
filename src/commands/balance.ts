import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client)) || message.author;
    if (user.bot) return message.channel.send(`${emojis.tickNo} Bots don't have bank accounts!`);

    const balance = (await database.getProp('economy', user.id, 'balance')) || 0;

    const balanceEmbed = embed({
        author: {
            image: user.displayAvatarURL(),
            name: user.username,
        },
        color: message.guild?.me?.displayHexColor,
        desc: `${user.id === message.author.id ? 'Your' : 'Their'} balance: **$${balance.toLocaleString()}**`,
    });

    message.channel.send(balanceEmbed);
};

export const help = {
    aliases: ['bal', 'balance'],
    name: 'Balance',
    description: 'Sends your balance',
    usage: 'balance <user>',
    example: 'balance\nbalance @*',
};

export const config = {
    args: 0,
    owner: false,
};
