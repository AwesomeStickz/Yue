import { Client, Message, TextChannel } from 'discord.js';
import fuzzysort from 'fuzzysort';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const slots = {
        'Worker Slot': 75,
        'House Slot': 150,
        'Navigator Slot': 150,
        'Shop Slot': 150,
    };

    const slotBuyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const fuzzySortedSlotNames = fuzzysort.go((isNaN(Number(args[args.length - 1])) && !['all', 'half', 'quarter'].includes(args[args.length - 1].toLowerCase()) && !args[args.length - 1].endsWith('%') ? args : args.slice(0, -1)).join(' '), Object.keys(slots), { allowTypo: false, limit: 1, threshold: -5000 });

    const slotName = fuzzySortedSlotNames.total > 0 ? fuzzySortedSlotNames[0].target.split(' ')[0] : null;
    if (!slotName) return message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickNo} That is not a valid slot!`));

    const slotPrice = (slots as any)[`${slotName} Slot`];
    const slotAmountString = args[args.length - 1].toLowerCase();

    const balance = (await database.getProp('economy', message.author.id, 'balance')) || 0;

    let amountUserInvests = 0;
    let slotAmount = 0;

    if (slotAmountString === 'all') amountUserInvests = balance;
    else if (slotAmountString === 'half') amountUserInvests = balance / 2;
    else if (slotAmountString === 'quarter') amountUserInvests = balance / 4;
    else if (slotAmountString.endsWith('%')) amountUserInvests = (Number(slotAmountString.slice(0, -1)) * balance) / 100;
    else {
        slotAmount = Number(slotAmountString);
        if (isNaN(slotAmount)) slotAmount = 1;
        amountUserInvests = slotAmount * slotPrice;
    }

    if (isNaN(amountUserInvests)) return message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickNo} The amount of slots must be a number!`));

    const numberOfSlotsToBuy = slotAmount > 0 ? Math.round(slotAmount) : Math.floor(amountUserInvests / slotPrice);
    if (numberOfSlotsToBuy * slotPrice > balance) return message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy a **${slotName} Slot**!`));
    if (numberOfSlotsToBuy < 1) return message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickNo} You can't buy less than 1 slot!`));

    const totalMoney = numberOfSlotsToBuy * slotPrice;
    if (totalMoney > balance) return message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy **${slotName} Slot${numberOfSlotsToBuy > 1 ? 's' : ''}**`));

    await database.subtractProp('economy', message.author.id, totalMoney, 'balance');
    // @ts-expect-error
    await database.addProp('economy', message.author.id, numberOfSlotsToBuy, `inventory.slots.${slotName.toLowerCase()}s`);

    message.channel.send(slotBuyEmbed.setDescription(`${emojis.tickYes} You've successfully bought **${numberOfSlotsToBuy.toLocaleString()} ${slotName} Slot${numberOfSlotsToBuy > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
    (client.channels.cache.get('745930847433261057') as TextChannel).send(slotBuyEmbed.setDescription(`**${message.author.tag}** bought **${numberOfSlotsToBuy.toLocaleString()} ${slotName} Slot${numberOfSlotsToBuy > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
};

export const help = {
    aliases: ['slots buy', 'slot buy'],
    name: 'Slots Buy',
    description: 'Buy slots from the shop for your houses, navigators, shops and workers',
    usage: 'slot buy <slot type> [amount]',
    example: 'shop buy flower shop\nshop buy flower worker\nshop buy mud house',
};

export const config = {
    args: 1,
    category: 'economy',
};
