import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const capacityBuyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const balance = (await database.getProp('economy', message.author.id, 'balance')) || 0;

    const bankCapacityString = args[0].toLowerCase();
    let bankCapacity = Number(bankCapacityString);

    if (bankCapacityString === 'all') bankCapacity = balance;
    else if (bankCapacityString === 'half') bankCapacity = balance / 2;
    else if (bankCapacityString === 'quarter') bankCapacity = balance / 4;
    else if (bankCapacityString.endsWith('%')) bankCapacity = (Number(bankCapacityString.slice(0, -1)) * balance) / 100;

    if (isNaN(bankCapacity)) return message.channel.send(capacityBuyEmbed.setDescription(`${emojis.tickNo} ${args[0]} is not a number`));

    bankCapacity = bankCapacity === Number(bankCapacityString) ? bankCapacity : Math.floor(bankCapacity / 10);
    const amountUserInvests = Math.floor(bankCapacity * 10);

    if (bankCapacity < 1) return message.channel.send(capacityBuyEmbed.setDescription(`${emojis.tickNo} You can't buy less than $1 bank capacity!`));
    if (balance < amountUserInvests) return message.channel.send(capacityBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy **$${bankCapacity.toLocaleString()}** bank capacity!`));

    const oldBankCapacity = await utils.getBankCapacity(message.author.id);
    const newBankCapacity = oldBankCapacity + bankCapacity;

    await database.subtractProp('economy', message.author.id, amountUserInvests, 'balance');
    await database.addProp('economy', message.author.id, bankCapacity, 'bankcapacity');

    capacityBuyEmbed.setDescription(`${emojis.tickYes} You successfully bought **$${bankCapacity.toLocaleString()}** bank capacity for **$${amountUserInvests.toLocaleString()}**! You got **$${newBankCapacity.toLocaleString()}** bank capacity now!`);

    message.channel.send(capacityBuyEmbed);
};

export const help = {
    aliases: ['capacity buy', 'bank capacity buy'],
    name: 'Bank Capacity Buy',
    description: 'Buy bank capacity, $1 worth of bank capacity is $10',
    usage: 'capacity buy <amount of capacity you want>',
    example: 'capacity buy 100',
};

export const config = {
    args: 1,
    category: 'economy',
};
