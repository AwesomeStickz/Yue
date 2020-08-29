import { Client, Message } from 'discord.js';
import lodash from 'lodash';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const allItems = [
        'Flower s',
        'Taco s',
        'Burger s',
        'Pizza s',
        'Barber s',
        'Optician s',
        'Chemist s',
        'Butcher s',
        'Baker s',
        'Shoe s',
        'Clothes s',
        'Book s',
        'Grocery s',
        'DIY s',
        'Toy s',
        'Music s',
        'Jewelry s',
        'Plane s',
        'Flower w',
        'Taco w',
        'Burger w',
        'Pizza w',
        'Barber w',
        'Optician w',
        'Chemist w',
        'Butcher w',
        'Baker w',
        'Shoe w',
        'Clothes w',
        'Book w',
        'Grocery w',
        'DIY w',
        'Toy w',
        'Music w',
        'Jewelry w',
        'Plane w',
        'Mud',
        'Tent',
        'Caravan',
        'Shack',
        'Apartment',
        'Bungalow',
        'House',
        'Penthouse',
        'Mansion',
        'Iron n',
        'Bronze n',
        'Silver n',
        'Gold n',
        'Platinum n',
        'Diamond n',
    ];

    const giftEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const user = await utils.getUser(args.shift()!, client, message.guild!);
    if (!user) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (user.bot) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} You can't gift items to bots!`));
    if (user.id === message.author.id) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} You can't gift your items to yourself!`));

    const giftItemAmountString = args[args.length - 1].toLowerCase();
    const giftItemName = giftItemAmountString !== 'all' && giftItemAmountString !== 'half' && giftItemAmountString !== 'quarter' && !giftItemAmountString.endsWith('%') && isNaN(Number(giftItemAmountString)) ? args.join(' ').toLowerCase() : args.slice(0, -1).join(' ').toLowerCase();

    let validItem = false;

    for (const itemName of allItems) {
        if (giftItemName.startsWith(itemName.toLowerCase())) {
            const authorEconomyData = (await database.get('economy', message.author.id)) || {};

            const itemIsNotHouse = itemName.charAt(itemName.length - 2) === ' ';
            const inventoryItemType = itemName.slice(-1) === 'n' && itemIsNotHouse ? 'Navigator' : itemName.slice(-1) === 's' && itemIsNotHouse ? 'Shop' : itemName.slice(-1) === 'w' && itemIsNotHouse ? 'Worker' : 'House';
            const inventoryItemName = itemIsNotHouse ? itemName.slice(0, -2) : itemName;

            const authorItemsInInventory = lodash.get(authorEconomyData, `inventory.${inventoryItemType.toLowerCase()}s.${inventoryItemName.toLowerCase()}`) || 0;
            if (authorItemsInInventory < 1) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} You don't have any ${inventoryItemName.toLowerCase()} ${inventoryItemType.toLowerCase()}!`));

            let numberOfItemsToGive = 0;

            if (giftItemAmountString === 'all') numberOfItemsToGive = authorItemsInInventory;
            else if (giftItemAmountString === 'half') numberOfItemsToGive = authorItemsInInventory / 2;
            else if (giftItemAmountString === 'quarter') numberOfItemsToGive = authorItemsInInventory / 4;
            else if (giftItemAmountString.endsWith('%')) numberOfItemsToGive = (Number(giftItemAmountString.slice(0, -1)) * authorItemsInInventory) / 100;
            else {
                numberOfItemsToGive = Number(giftItemAmountString);
            }

            if (isNaN(numberOfItemsToGive)) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} The amount of item must be a number!`));
            numberOfItemsToGive = Math.round(numberOfItemsToGive);

            if (numberOfItemsToGive > authorItemsInInventory) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} You don't have enough ${inventoryItemName.toLowerCase()} ${inventoryItemType.toLowerCase()} to give to ${user.toString()}!`));

            const userEconomyData = (await database.get('economy', user.id)) || {};

            const userLevelData = lodash.get(userEconomyData, 'level') || {};
            const userLevel = userLevelData.level || 0;

            const userItemsInInventory = lodash.get(userEconomyData, `inventory.${inventoryItemType.toLowerCase()}s`) || {};
            const userAmountOfItemsInInventory = Number(Object.values(userItemsInInventory).reduce((a: any, b: any) => a + b, 0));
            const userItemSlots = lodash.get(userEconomyData, `inventory.slots.${inventoryItemType.toLowerCase()}s`) || inventoryItemType === 'Worker' ? (!userLevel ? 2 : userLevel * 4) : !userLevel ? 1 : userLevel * 2;

            if (userAmountOfItemsInInventory + numberOfItemsToGive > userItemSlots) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} That user doesn't have enough slots left to accept this gift!`));

            const userNewItemAmount = (lodash.get(userItemsInInventory, inventoryItemName.toLowerCase()) ?? 0) + numberOfItemsToGive;
            const authorNewItemAmount = authorItemsInInventory - numberOfItemsToGive;
            const fullItemName = `${inventoryItemName} ${inventoryItemType !== 'House' ? inventoryItemType : ''}${numberOfItemsToGive > 1 && inventoryItemType !== 'House' ? 's' : ''}`;

            // @ts-expect-error
            await database.subtractProp('economy', message.author.id, numberOfItemsToGive, `inventory.${inventoryItemType.toLowerCase()}s.${inventoryItemName.toLowerCase()}`);
            // @ts-expect-error
            await database.addProp('economy', user.id, numberOfItemsToGive, `inventory.${inventoryItemType.toLowerCase()}s.${inventoryItemName.toLowerCase()}`);

            validItem = true;
            giftEmbed.setDescription(`${emojis.tickYes} You gifted **${numberOfItemsToGive.toLocaleString()} ${fullItemName}** to **${user.username}**\n\n**${message.author.username}**'s new ${fullItemName} amount is **${authorNewItemAmount.toLocaleString()}**\n**${user.username}**'s new ${fullItemName} amount is **${userNewItemAmount.toLocaleString()}**`);
            message.channel.send(giftEmbed);
            break;
        }
    }

    if (!validItem) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} That's not a valid item!`));
};

export const help = {
    aliases: ['gift'],
    name: 'Gift',
    description: 'Gift your item to someone',
    usage: 'gift <user> <item name> [amount]',
    example: 'gift @Conor#0751 flower shop\ngift @Conor#0751 flower worker 10',
};

export const config = {
    args: 2,
    category: 'economy',
};
