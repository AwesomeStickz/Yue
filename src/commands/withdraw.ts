import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const depositEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const userEconomyData = (await database.get('economy', message.author.id)) || {};
    const bankBalance = userEconomyData.bank || 0;

    const withAmountString = args[0]?.toLowerCase();
    let withAmount = Number(withAmountString);

    if (withAmountString === 'all') withAmount = bankBalance;
    else if (withAmountString === 'half') withAmount = bankBalance / 2;
    else if (withAmountString === 'quarter') withAmount = bankBalance / 4;
    else if (withAmountString.endsWith('%')) withAmount = (Number(withAmountString.slice(0, -1)) * bankBalance) / 100;

    if (isNaN(withAmount)) return message.channel.send(depositEmbed.setDescription(`${emojis.tickNo} ${args[0]} is not a number!`));

    withAmount = Math.round(withAmount);

    if (withAmount < 1) return message.channel.send(depositEmbed.setDescription(`${emojis.tickNo} You can't withdraw less than $1`));
    if (bankBalance < withAmount) return message.channel.send(depositEmbed.setDescription(`${emojis.tickNo} You don't have enough money in bank to withdraw!`));

    await database.subtractProp('economy', message.author.id, withAmount, 'bank');
    await database.addProp('economy', message.author.id, withAmount, 'balance');

    message.channel.send(depositEmbed.setDescription(`${emojis.tickYes} Successfully withdrew **$${withAmount.toLocaleString()}** to your bank!`));
};

export const help = {
    aliases: ['withdraw', 'with'],
    name: 'Withdraw',
    description: 'Withdraw your money from bank',
    usage: 'withdraw <amount>',
    example: 'withdraw 100\nwithdraw all',
};

export const config = {
    args: 0,
    category: 'economy',
};
