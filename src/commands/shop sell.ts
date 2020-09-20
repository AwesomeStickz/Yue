import { Client, Message, TextChannel } from 'discord.js';
import fuzzysort from 'fuzzysort';
import lodash from 'lodash';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const shopSellEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const pendingReplyEndingTime = tempCache.get(`pending_reply_${message.author.id}`) || 0;
    if (pendingReplyEndingTime > Date.now()) return message.channel.send(shopSellEmbed.setDescription(`${emojis.tickNo} A command is already waiting for your reply so please send a reply to that if you want to execute this command!`));

    const shopItems = {
        'Flower Shop': 500,
        'Taco Shop': 3500,
        'Burger Shop': 10000,
        'Pizza Shop': 17500,
        'Barber Shop': 25000,
        'Optician Shop': 50000,
        'Chemist Shop': 75000,
        'Butcher Shop': 100000,
        'Baker Shop': 150000,
        'Shoe Shop': 300000,
        'Clothes Shop': 500000,
        'Book Shop': 1000000,
        'Grocery Shop': 2500000,
        'DIY Shop': 5000000,
        'Toy Shop': 10000000,
        'Music Shop': 25000000,
        'Jewelry Shop': 50000000,
        'Plane Shop': 100000000,
        'Flower Worker': 165,
        'Taco Worker': 1160,
        'Burger Worker': 3000,
        'Pizza Worker': 5800,
        'Barber Worker': 8300,
        'Optician Worker': 16500,
        'Chemist Worker': 25000,
        'Butcher Worker': 30000,
        'Baker Worker': 50000,
        'Shoe Worker': 100000,
        'Clothes Worker': 165000,
        'Book Worker': 300000,
        'Grocery Worker': 830000,
        'DIY Worker': 1650000,
        'Toy Worker': 3000000,
        'Music Worker': 8300000,
        'Jewelry Worker': 16500000,
        'Plane Worker': 30000000,
        'Mud House': 22500,
        Tent: 50000,
        Caravan: 75000,
        Shack: 280000,
        Apartment: 500000,
        Bungalow: 5000000,
        House: 10000000,
        Penthouse: 15000000,
        Mansion: 30000000,
        'Iron Navigator': 500,
        'Bronze Navigator': 1250,
        'Silver Navigator': 4500,
        'Gold Navigator': 17500,
        'Platinum Navigator': 90000,
        'Diamond Navigator': 500000,
    };

    const fuzzySortedItemNames = fuzzysort.go((isNaN(Number(args[args.length - 1])) && !['all', 'half', 'quarter'].includes(args[args.length - 1].toLowerCase()) && !args[args.length - 1].endsWith('%') ? args : args.slice(0, -1)).join(' '), Object.keys(shopItems), { allowTypo: false, limit: 1, threshold: -5000 });

    const itemName = fuzzySortedItemNames.total > 0 ? fuzzySortedItemNames[0].target : null;
    if (!itemName) return message.channel.send(shopSellEmbed.setDescription(`${emojis.tickNo} That's not a valid item!`));

    const itemPrice = Math.round((shopItems as any)[itemName] * 0.9);
    const itemAmountString = args[args.length - 1].toLowerCase();
    const economyData = (await database.get('economy', message.author.id)) || {};

    const inventoryItemName = itemName.split(' ')[0].toLowerCase();
    const inventoryItemType = itemName.split(' ')[1]?.toLowerCase() ?? 'house';

    const numberOfItemsInInvetory = lodash.get(economyData, `inventory.${inventoryItemType}s.${inventoryItemName}`) || 0;

    let numberOfItemsToSell = 0;

    if (itemAmountString === 'all') numberOfItemsToSell = numberOfItemsInInvetory;
    else if (itemAmountString === 'half') numberOfItemsToSell = numberOfItemsInInvetory / 2;
    else if (itemAmountString === 'quarter') numberOfItemsToSell = numberOfItemsInInvetory / 4;
    else if (itemAmountString.endsWith('%')) numberOfItemsToSell = (Number(itemAmountString.slice(0, -1)) * numberOfItemsInInvetory) / 100;
    else {
        numberOfItemsToSell = Number(itemAmountString);
        if (isNaN(numberOfItemsToSell)) numberOfItemsToSell = 1;
    }

    if (isNaN(numberOfItemsToSell)) return message.channel.send(shopSellEmbed.setDescription(`${emojis.tickNo} The amount of item must be a number!`));
    numberOfItemsToSell = Math.round(numberOfItemsToSell);

    if (numberOfItemsToSell > numberOfItemsInInvetory) return message.channel.send(shopSellEmbed.setDescription(`${emojis.tickNo} You don't have **${numberOfItemsToSell.toLocaleString()} ${itemName}${numberOfItemsToSell > 1 ? 's' : ''}** to sell!`));
    if (numberOfItemsToSell < 1) return message.channel.send(shopSellEmbed.setDescription(`${emojis.tickNo} You should sell at least 1 or more number of items!`));

    const totalMoney = numberOfItemsToSell * itemPrice;

    await message.channel.send(shopSellEmbed.setDescription(`Type \`yes\` if you want to sell **${numberOfItemsToSell.toLocaleString()} ${itemName}${numberOfItemsToSell > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));

    tempCache.set(`pending_reply_${message.author.id}`, Date.now() + 10000);

    message.channel
        .awaitMessages((msg) => !msg.author.bot && msg.author.id === message.author.id, { max: 1, time: 10000, errors: ['time'] })
        .then(async (collected) => {
            const response = collected.first()?.content.toLowerCase();
            if (response === 'yes' || response === 'y') {
                // @ts-expect-error
                await database.subtractProp('economy', message.author.id, numberOfItemsToSell, `inventory.${inventoryItemType}s.${inventoryItemName}`);
                await database.addProp('economy', message.author.id, totalMoney, 'balance');

                tempCache.delete(`pending_reply_${message.author.id}`);

                message.channel.send(shopSellEmbed.setDescription(`${emojis.tickYes} You've successfully sold **${numberOfItemsToSell.toLocaleString()} ${itemName}${numberOfItemsToSell > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
                (client.channels.cache.get('756957381488935013') as TextChannel).send(shopSellEmbed.setDescription(`**${message.author.tag}** sold **${numberOfItemsToSell.toLocaleString()} ${itemName}${numberOfItemsToSell > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
            } else {
                tempCache.delete(`pending_reply_${message.author.id}`);
                message.channel.send(shopSellEmbed.setDescription(`${emojis.tickNo} You didn't respond with \`yes\`!`));
            }
        })
        .catch(() => {
            tempCache.delete(`pending_reply_${message.author.id}`);
            message.channel.send(shopSellEmbed.setDescription(`${emojis.tickNo} You didn't respond in time!`));
        });
};

export const help = {
    aliases: ['shop sell'],
    name: 'Shop Sell',
    description: 'Sell your items for 90% of the original rate in the shop',
    usage: 'shop sell <item name> [amount]',
    example: 'shop sell flower shop\nshop sell flower shop all',
};

export const config = {
    args: 0,
    category: 'economy',
};
