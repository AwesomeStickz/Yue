import { Client, Message, TextChannel } from 'discord.js';
import fuzzysort from 'fuzzysort';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const shopBuyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const pendingReplyEndingTime = tempCache.get(`pending_reply_${message.author.id}`) || 0;
    if (pendingReplyEndingTime > Date.now()) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} A command is already waiting for your reply so please send a reply to that if you want to execute this command!`));

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
    if (!itemName) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} That item is not in the shop!`));

    const itemPrice = (shopItems as any)[itemName];
    const itemAmountString = args[args.length - 1].toLowerCase();
    const userEconomyData = (await database.get('economy', message.author.id)) || {};
    const balance = userEconomyData.balance || 0;

    let amountUserInvests = 0;
    let itemAmount = 0;

    if (itemAmountString === 'all') amountUserInvests = balance;
    else if (itemAmountString === 'half') amountUserInvests = balance / 2;
    else if (itemAmountString === 'quarter') amountUserInvests = balance / 4;
    else if (itemAmountString.endsWith('%')) amountUserInvests = (Number(itemAmountString.slice(0, -1)) * balance) / 100;
    else {
        itemAmount = Number(itemAmountString);
        if (isNaN(itemAmount)) itemAmount = 1;
        amountUserInvests = itemAmount * itemPrice;
    }

    if (isNaN(amountUserInvests)) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} The amount of item must be a number!`));
    if (itemAmount < 1) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You can't buy less than 1 item!`));

    const inventoryItemName = itemName.split(' ')[0].toLowerCase();
    const inventoryItemType = itemName.split(' ')[1]?.toLowerCase() ?? 'house';

    let numberOfItemsToBuy = itemAmount > 0 ? Math.round(itemAmount) : Math.floor(amountUserInvests / itemPrice);

    const itemsInInventory = userEconomyData.inventory[`${inventoryItemType}s`] || {};
    const amountOfItemsInInventory = Number(Object.values(itemsInInventory).reduce((a: any, b: any) => a + b, 0));

    const userSlots = await utils.getSlots(message.author.id);

    // @ts-expect-error
    const itemSlot = userSlots[`${inventoryItemType}s`];
    const remainingSlots = itemSlot - amountOfItemsInInventory;

    if (remainingSlots === 0) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough **${utils.capitalize(inventoryItemType)}** slots!`));
    if (amountOfItemsInInventory + numberOfItemsToBuy > itemSlot) numberOfItemsToBuy = itemSlot - amountOfItemsInInventory;

    const totalMoney = numberOfItemsToBuy * itemPrice;
    if (totalMoney > balance) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy **${numberOfItemsToBuy.toLocaleString()} ${itemName}${numberOfItemsToBuy > 1 ? 's' : ''}**`));

    await message.channel.send(shopBuyEmbed.setDescription(`Type \`yes\` if you want to buy **${numberOfItemsToBuy.toLocaleString()} ${itemName}${numberOfItemsToBuy > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
    tempCache.set(`pending_reply_${message.author.id}`, Date.now() + 10000);
    message.channel
        .awaitMessages((msg) => !msg.author.bot && msg.author.id === message.author.id, { max: 1, time: 10000, errors: ['time'] })
        .then(async (collected) => {
            const response = collected.first()?.content.toLowerCase();
            if (response === 'yes' || response === 'y') {
                // @ts-expect-error
                await database.addProp('economy', message.author.id, numberOfItemsToBuy, `inventory.${inventoryItemType}s.${inventoryItemName}`);
                await database.subtractProp('economy', message.author.id, totalMoney, 'balance');

                tempCache.delete(`pending_reply_${message.author.id}`);

                message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickYes} You've successfully bought **${numberOfItemsToBuy.toLocaleString()} ${itemName}${numberOfItemsToBuy > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
                (client.channels.cache.get('745930847433261057') as TextChannel).send(shopBuyEmbed.setDescription(`**${message.author.tag}** bought **${numberOfItemsToBuy.toLocaleString()} ${itemName}${numberOfItemsToBuy > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
            } else {
                tempCache.delete(`pending_reply_${message.author.id}`);
                message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You didn't respond with \`yes\`!`));
            }
        })
        .catch(() => {
            tempCache.delete(`pending_reply_${message.author.id}`);
            message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You didn't respond in time!`));
        });
};

export const help = {
    aliases: ['shop buy'],
    name: 'Shop Buy',
    description: 'Buy items from the shop',
    usage: 'shop buy <item name> [amount]',
    example: 'shop buy flower shop\nshop buy flower worker\nshop buy mud house',
};

export const config = {
    args: 1,
    category: 'economy',
};
