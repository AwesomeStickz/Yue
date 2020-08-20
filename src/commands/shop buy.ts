import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const shopItems = {
        'Flower s': 500,
        'Taco s': 3500,
        'Burger s': 10000,
        'Pizza s': 17500,
        'Barber s': 25000,
        'Optician s': 50000,
        'Chemist s': 75000,
        'Butcher s': 100000,
        'Baker s': 150000,
        'Shoe s': 300000,
        'Clothes s': 500000,
        'Book s': 1000000,
        'Grocery s': 2500000,
        'DIY s': 5000000,
        'Toy s': 10000000,
        'Music s': 25000000,
        'Jewelry s': 50000000,
        'Plane s': 100000000,
        'Flower w': 500,
        'Taco w': 3500,
        'Burger w': 10000,
        'Pizza w': 17500,
        'Barber w': 25000,
        'Optician w': 50000,
        'Chemist w': 75000,
        'Butcher w': 100000,
        'Baker w': 150000,
        'Shoe w': 300000,
        'Clothes w': 500000,
        'Book w': 1000000,
        'Grocery w': 2500000,
        'DIY w': 5000000,
        'Toy w': 10000000,
        'Music w': 25000000,
        'Jewelry w': 50000000,
        'Plane w': 100000000,
    };

    const shopBuyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const itemName = args.length > 2 ? args.slice(0, -1).join(' ').toLowerCase() : args.join(' ').toLowerCase();
    let validItem = false;

    for (const [shopItemName, shopItemPrice] of Object.entries(shopItems)) {
        if (itemName.startsWith(shopItemName.toLowerCase())) {
            const balance = (await database.getProp('economy', message.author.id, 'balance')) || 0;

            let itemAmountString = args[args.length - 1].toLowerCase();
            let amountUserInvests = 0;
            let itemAmount = 0;

            if (itemAmountString === 'all') amountUserInvests = balance;
            else if (itemAmountString === 'half') amountUserInvests = balance / 2;
            else if (itemAmountString === 'quarter') amountUserInvests = balance / 4;
            else if (itemAmountString.endsWith('%')) amountUserInvests = (Number(itemAmountString.slice(0, -1)) * balance) / 100;
            else {
                itemAmount = Number(itemAmountString);
                if (isNaN(itemAmount)) itemAmount = 1;
                amountUserInvests = itemAmount * shopItemPrice;
            }

            if (isNaN(amountUserInvests)) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} The amount of item must be a number!`));

            const inventoryItemType = shopItemName.slice(-1) === 's' ? 'Shop' : 'Worker';
            const inventoryItemName = shopItemName.slice(0, -2);

            if (amountUserInvests < shopItemPrice) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy 1 **${inventoryItemName} ${inventoryItemType}**!`));

            const numberOfItemsToBuy = itemAmount > 0 ? Math.round(itemAmount) : Math.floor(amountUserInvests / shopItemPrice);

            const totalMoney = numberOfItemsToBuy * shopItemPrice;
            if (totalMoney > balance) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy **${numberOfItemsToBuy.toLocaleString()} ${inventoryItemName} ${inventoryItemType}${numberOfItemsToBuy > 1 ? 's' : ''}**`));

            // @ts-expect-error
            await database.addProp('economy', message.author.id, numberOfItemsToBuy, `inventory.${inventoryItemType.toLowerCase()}s.${inventoryItemName.toLowerCase()}`);
            await database.subtractProp('economy', message.author.id, totalMoney, 'balance');

            validItem = true;
            message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickYes} You've successfully bought **${numberOfItemsToBuy.toLocaleString()} ${inventoryItemName} ${inventoryItemType}${numberOfItemsToBuy > 1 ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
            break;
        }
    }

    if (!validItem) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} That item is not in the shop!`));
};

export const help = {
    aliases: ['shop buy'],
    name: 'Shop Buy',
    description: 'Buy items from the shop',
    usage: 'shop buy <item name> [amount]',
    example: 'shop buy flower shop\nshop buy flower worker',
};

export const config = {
    args: 2,
};