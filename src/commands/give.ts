import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const giveEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const user = await utils.getUser(args[0], client, message.guild!);
    if (!user) return message.channel.send(giveEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (user.bot) return message.channel.send(giveEmbed.setDescription(`${emojis.tickNo} You can't give money to bots!`));
    if (user.id === message.author.id) return message.channel.send(giveEmbed.setDescription(`${emojis.tickNo} You can't give money to yourself`));

    const balance: number = (await database.getProp('economy', message.author.id, 'balance')) || 0;

    const amountString = args[1].toLowerCase();
    let amount = Number(amountString);

    if (amountString === 'all') amount = balance;
    else if (amountString === 'half') amount = balance / 2;
    else if (amountString === 'quarter') amount = balance / 4;
    else if (amountString.endsWith('%')) amount = (Number(amountString.slice(0, -1)) * balance) / 100;

    if (isNaN(amount)) return message.channel.send(giveEmbed.setDescription(`${emojis.tickNo} ${args[1]} is not a number`));

    amount = Math.round(amount);

    if (amount < 1) return message.channel.send(giveEmbed.setDescription(`${emojis.tickNo} You can't give less than $1`));
    if (balance < amount) return message.channel.send(giveEmbed.setDescription(`${emojis.tickNo} You don't have enough money to give!`));

    await database.addProp('economy', user.id, amount, 'balance');
    await database.subtractProp('economy', message.author.id, amount, 'balance');

    const senderBalance = (await database.getProp('economy', message.author.id, 'balance')) || 0;
    const receiverBalance = (await database.getProp('economy', user.id, 'balance')) || 0;

    const receiverNetworth = await utils.getNetworth(user.id);
    await database.setProp('economy', user.id, receiverNetworth, 'networth');

    giveEmbed.setAuthor('Money Transfer', message.author.displayAvatarURL({ dynamic: true }));
    giveEmbed.setDescription(`You gave **$${amount.toLocaleString()}** to **${user.username}**\n\n**${message.author.username}**'s new balance is **$${senderBalance.toLocaleString()}**\n**${user.username}**'s new balance is **$${receiverBalance.toLocaleString()}**`);

    message.channel.send(giveEmbed);
};

export const help = {
    aliases: ['give'],
    name: 'Give',
    description: 'Give user an amount of money',
    usage: 'give <user> <amount>',
    example: 'give @Conor#0751 10000',
};

export const config = {
    args: 2,
    category: 'economy',
};
