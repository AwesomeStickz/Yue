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
        'Flower w': 165,
        'Taco w': 1160,
        'Burger w': 3000,
        'Pizza w': 5800,
        'Barber w': 8300,
        'Optician w': 16500,
        'Chemist w': 25000,
        'Butcher w': 30000,
        'Baker w': 50000,
        'Shoe w': 100000,
        'Clothes w': 165000,
        'Book w': 300000,
        'Grocery w': 830000,
        'DIY w': 1650000,
        'Toy w': 3000000,
        'Music w': 8300000,
        'Jewelry w': 16500000,
        'Plane w': 30000000,
        Mud: 22500,
        Tent: 50000,
        Caravan: 75000,
        Shack: 280000,
        Apartment: 500000,
        Bungalow: 5000000,
        House: 10000000,
        Penthouse: 15000000,
        Mansion: 30000000,
        'Iron n': 500,
        'Bronze n': 1250,
        'Silver n': 4500,
        'Gold n': 17500,
        'Platinum n': 90000,
        'Diamond n': 500000,
    };

    const shopBuyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const itemAmountString = args[args.length - 1].toLowerCase();
    const itemName = itemAmountString !== 'all' && itemAmountString !== 'half' && itemAmountString !== 'quarter' && !itemAmountString.endsWith('%') && isNaN(Number(itemAmountString)) ? args.join(' ').toLowerCase() : args.slice(0, -1).join(' ').toLowerCase();

    let validItem = false;

    for (const [shopItemName, shopItemPrice] of Object.entries(shopItems)) {
        if (itemName.startsWith(shopItemName.toLowerCase())) {
            const balance = (await database.getProp('economy', message.author.id, 'balance')) || 0;

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

            const itemIsNotHouse = shopItemName.charAt(shopItemName.length - 2) === ' ';
            const inventoryItemType = shopItemName.slice(-1) === 'n' && itemIsNotHouse ? 'Navigator' : shopItemName.slice(-1) === 's' && itemIsNotHouse ? 'Shop' : shopItemName.slice(-1) === 'w' && itemIsNotHouse ? 'Worker' : 'House';
            const inventoryItemName = itemIsNotHouse ? shopItemName.slice(0, -2) : shopItemName;

            if (amountUserInvests < shopItemPrice) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy 1 **${inventoryItemName} ${inventoryItemType !== 'House' ? inventoryItemType : ''}**!`));

            let numberOfItemsToBuy = itemAmount > 0 ? Math.round(itemAmount) : Math.floor(amountUserInvests / shopItemPrice);
            const userLevelData = (await database.getProp('economy', message.author.id, 'level')) || {};
            const userLevel = userLevelData.level || 0;

            // @ts-expect-error
            const itemsInInventory = (await database.getProp('economy', message.author.id, `inventory.${inventoryItemType.toLowerCase()}s`)) || {};
            const amountOfItemsInInventory = Number(Object.values(itemsInInventory).reduce((a: any, b: any) => a + b, 0));

            const userSlots = (await database.getProp('economy', message.author.id, `inventory.slots`)) || {};
            const itemSlot = userSlots[`${inventoryItemType.toLowerCase()}s`] ? userSlots[`${inventoryItemType.toLowerCase()}s`] : inventoryItemType === 'Worker' ? (!userLevel ? 2 : userLevel * 4) : !userLevel ? 1 : userLevel * 2;
            const remainingSlots = itemSlot - amountOfItemsInInventory;

            if (remainingSlots === 0) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough any ${inventoryItemType.toLowerCase()} slots!`));
            if (amountOfItemsInInventory + numberOfItemsToBuy > itemSlot) numberOfItemsToBuy = itemSlot - amountOfItemsInInventory;

            const totalMoney = numberOfItemsToBuy * shopItemPrice;
            if (totalMoney > balance) return message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickNo} You don't have enough money to buy **${numberOfItemsToBuy.toLocaleString()} ${inventoryItemName} ${inventoryItemType !== 'House' ? inventoryItemType : ''}${numberOfItemsToBuy > 1 && inventoryItemType !== 'House' ? 's' : ''}**`));

            // @ts-expect-error
            await database.addProp('economy', message.author.id, numberOfItemsToBuy, `inventory.${inventoryItemType.toLowerCase()}s.${inventoryItemName.toLowerCase()}`);
            await database.subtractProp('economy', message.author.id, totalMoney, 'balance');

            validItem = true;
            message.channel.send(shopBuyEmbed.setDescription(`${emojis.tickYes} You've successfully bought **${numberOfItemsToBuy.toLocaleString()} ${inventoryItemName} ${inventoryItemType !== 'House' ? inventoryItemType : ''}${numberOfItemsToBuy > 1 && inventoryItemType !== 'House' ? 's' : ''}** for **$${totalMoney.toLocaleString()}**`));
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
    example: 'shop buy flower shop\nshop buy flower worker\nshop buy mud house',
};

export const config = {
    args: 1,
    category: 'economy',
};
