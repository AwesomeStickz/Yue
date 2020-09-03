import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const essenceSellEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    // @ts-expect-error
    const essences = (await database.getProp('economy', message.author.id, 'inventory.essence')) || 0;
    if (essences < 1) return message.channel.send(essenceSellEmbed.setDescription(`${emojis.tickNo} You don't have any essences to sell!`));

    let amountString = args[0].toLowerCase();
    let amountOfEssence = Number(amountString);

    if (amountString === 'all') amountOfEssence = essences;
    else if (amountString === 'half') amountOfEssence = essences / 2;
    else if (amountString === 'quarter') amountOfEssence = essences / 4;
    else if (amountString.endsWith('%')) amountOfEssence = (Number(amountString.slice(0, -1)) * essences) / 100;
    else if (isNaN(amountOfEssence)) return message.channel.send(essenceSellEmbed.setDescription(`${emojis.tickNo} Amount of essence must be a number!`));

    if (amountOfEssence > essences) return message.channel.send(essenceSellEmbed.setDescription(`${emojis.tickNo} You don't have enough essence!`));

    amountOfEssence = Math.round(amountOfEssence);

    const balanceToAdd = amountOfEssence * 25;

    // @ts-expect-error
    await database.subtractProp('economy', message.author.id, amountOfEssence, 'inventory.essence');
    await database.addProp('economy', message.author.id, balanceToAdd, 'balance');

    message.channel.send(essenceSellEmbed.setDescription(`You sold **${amountOfEssence.toLocaleString()} ${emojis.essence} Essence** for **$${balanceToAdd.toLocaleString()}**`));
    await utils.updateLevel(message, client);
};

export const help = {
    aliases: ['essence sell'],
    name: 'Essence Sell',
    description: 'Sell your essence for money',
    usage: 'essence sell <amount>',
    example: 'essence sell 10\nessence sell all',
};

export const config = {
    args: 1,
    category: 'economy',
};
