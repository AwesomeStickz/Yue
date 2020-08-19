import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = await utils.getUser(args[0], client);
    const balanceEmbed = embed({
        color: message.guild?.me?.displayHexColor,
    });

    if (!user) return message.channel.send(balanceEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (user.bot) return message.channel.send(balanceEmbed.setDescription(`${emojis.tickNo} You can't set balance of bots!`));
    if (isNaN(Number(args[1]))) return message.channel.send(balanceEmbed.setDescription(`${emojis.tickNo} Balance amount must be a number!`));

    const balance = Number(args[1]);
    await database.setProp('economy', user.id, balance, 'balance');

    balanceEmbed.setAuthor(user.username, user.displayAvatarURL());
    message.channel.send(balanceEmbed.setDescription(`${emojis.tickYes} ${user.toString()}'s balance has been set to **$${balance.toLocaleString()}**`));
};

export const help = {
    aliases: ['bal set', 'balance set'],
    name: 'Balance Set',
    description: "Set someone's balance",
    usage: 'balance set <user> <amount>',
    example: 'balance set @* 500',
};

export const config = {
    args: 2,
    owner: true,
    subCommand: true,
};
