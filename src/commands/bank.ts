import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const bankEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(bankEmbed.setDescription(`${emojis.tickNo} Bots don't have bank accounts!`));

    const userEconomyData = (await database.get('economy', message.author.id)) || {};
    const bankBalance = userEconomyData.bank || 0;
    const userLevelData = userEconomyData.level || {};
    const userLevel = userLevelData.level || 0;
    const bankCapacity = Math.round(Math.pow(1.5, userLevel));

    bankEmbed.setAuthor(user.username, user.displayAvatarURL());
    message.channel.send(bankEmbed.setDescription(`${user.id === message.author.id ? 'Your' : 'Their'} balance in bank: **$${bankBalance.toLocaleString()}**\nBank capacity: **$${bankCapacity.toLocaleString()}**`));
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
};
