import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const depositEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const userEconomyData = (await database.get('economy', message.author.id)) || {};
    const balance = userEconomyData.balance || 0;
    const bankBalance = userEconomyData.bank || 0;
    const userLevelData = userEconomyData.level || {};
    const userLevel = userLevelData.level || 0;
    const bankCapacity = Math.round(Math.pow(1.5, userLevel) * 100);

    const depAmountString = args[0]?.toLowerCase();
    let depAmount = Number(depAmountString);

    if (depAmountString === 'all') depAmount = balance;
    else if (depAmountString === 'half') depAmount = balance / 2;
    else if (depAmountString === 'quarter') depAmount = balance / 4;
    else if (depAmountString.endsWith('%')) depAmount = (Number(depAmountString.slice(0, -1)) * balance) / 100;

    if (isNaN(depAmount)) return message.channel.send(depositEmbed.setDescription(`${emojis.tickNo} ${args[0]} is not a number!`));

    depAmount = Math.round(depAmount);

    if (depAmount < 1) return message.channel.send(depositEmbed.setDescription(`${emojis.tickNo} You can't deposit less than $1`));
    if (balance < depAmount) return message.channel.send(depositEmbed.setDescription(`${emojis.tickNo} You don't have enough money to deposit!`));

    if (depAmount + bankBalance > bankCapacity) depAmount = bankCapacity - bankBalance;
    if (depAmount === 0) return message.channel.send(depositEmbed.setDescription(`${emojis.tickNo} Your bank is already full!`));

    await database.subtractProp('economy', message.author.id, depAmount, 'balance');
    await database.addProp('economy', message.author.id, depAmount, 'bank');

    message.channel.send(depositEmbed.setDescription(`${emojis.tickYes} Successfully deposited **$${depAmount.toLocaleString()}** to your bank!`));
};

export const help = {
    aliases: ['deposit', 'dep'],
    name: 'Deposit',
    description: 'Deposit your money in your wallet to bank',
    usage: 'deposit <amount>',
    example: 'deposit 100\ndeposit all',
};

export const config = {
    args: 1,
    category: 'economy',
};
