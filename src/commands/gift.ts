import { Client, Message, TextChannel } from 'discord.js';
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
        'essence',
    ];

    const giftEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const user = await utils.getUser(args.shift()!, client, message.guild!);
    if (!user) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (user.bot) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} You can't gift items to bots!`));
    if (user.id === message.author.id) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} You can't gift your items to yourself!`));

    const userFinishedGetStarted = await database.getProp('economy', user.id, 'getstarted');
    if (!userFinishedGetStarted) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} You can't gift items to ${user.toString()} as they did not use \`get started\` command yet!`));

    const giftItemAmountString = args[args.length - 1].toLowerCase();
    const giftItemName = giftItemAmountString !== 'all' && giftItemAmountString !== 'half' && giftItemAmountString !== 'quarter' && !giftItemAmountString.endsWith('%') && isNaN(Number(giftItemAmountString)) ? args.join(' ').toLowerCase() : args.slice(0, -1).join(' ').toLowerCase();

    let validItem = false;

    for (const itemName of allItems) {
        if (giftItemName.startsWith(itemName.toLowerCase())) {
            const authorEconomyData = (await database.get('economy', message.author.id)) || {};

            const itemIsNotHouseAndNotEssence = itemName.charAt(itemName.length - 2) === ' ';
            const inventoryItemType = itemName.slice(-1) === 'n' && itemIsNotHouseAndNotEssence ? 'Navigator' : itemName.slice(-1) === 's' && itemIsNotHouseAndNotEssence ? 'Shop' : itemName.slice(-1) === 'w' && itemIsNotHouseAndNotEssence ? 'Worker' : 'House';
            const inventoryItemName = itemIsNotHouseAndNotEssence ? itemName.slice(0, -2) : itemName === 'essence' ? 'essence' : itemName;

            const authorItemsInInventory = lodash.get(authorEconomyData, `inventory.${itemName !== 'essence' ? `${inventoryItemType.toLowerCase()}s.` : ''}${inventoryItemName.toLowerCase()}`) || 0;
            if (authorItemsInInventory < 1) return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} You don't have any ${itemName !== 'essence' ? inventoryItemName.toLowerCase() : ''} ${inventoryItemType.toLowerCase()}!`));

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

            const userItemsInInventory = itemName !== 'essence' ? lodash.get(userEconomyData, `inventory.${inventoryItemType.toLowerCase()}s`) || {} : lodash.get(userEconomyData, 'inventory');
            const userAmountOfItemsInInventory = Number(Object.values(userItemsInInventory).reduce((a: any, b: any) => a + b, 0));

            // @ts-expect-error
            const userItemSlots = (await utils.getSlots(user.id))[`${inventoryItemType.toLowerCase()}s`];
            const remainingSlots = userItemSlots - userAmountOfItemsInInventory;

            if (remainingSlots === 0 && itemName !== 'essence') return message.channel.send(giftEmbed.setDescription(`${emojis.tickNo} That user doesn't have enough slots left to accept this gift!`));
            if (userAmountOfItemsInInventory + numberOfItemsToGive > userItemSlots && itemName !== 'essence') numberOfItemsToGive = userItemSlots - userAmountOfItemsInInventory;

            const userNewItemAmount = (lodash.get(userItemsInInventory, itemName !== 'essence' ? inventoryItemName.toLowerCase() : 'essence') ?? 0) + numberOfItemsToGive;
            const authorNewItemAmount = authorItemsInInventory - numberOfItemsToGive;
            const fullItemName = `${inventoryItemName} ${inventoryItemType !== 'House' || itemName !== 'essence' ? inventoryItemType : ''}${numberOfItemsToGive > 1 && inventoryItemType !== 'House' ? 's' : ''}`;

            // @ts-expect-error
            await database.subtractProp('economy', message.author.id, numberOfItemsToGive, `inventory.${itemName !== 'essence' ? `${inventoryItemType.toLowerCase()}s.` : ''}${inventoryItemName.toLowerCase()}`);
            // @ts-expect-error
            await database.addProp('economy', user.id, numberOfItemsToGive, `inventory.${itemName !== 'essence' ? `${inventoryItemType.toLowerCase()}s.` : ''}${inventoryItemName.toLowerCase()}`);

            validItem = true;
            giftEmbed.setDescription(`${emojis.tickYes} You gifted **${numberOfItemsToGive.toLocaleString()} ${fullItemName}** to **${user.username}**\n\n**${message.author.username}**'s new ${fullItemName} amount is **${authorNewItemAmount.toLocaleString()}**\n**${user.username}**'s new ${fullItemName} amount is **${userNewItemAmount.toLocaleString()}**`);
            message.channel.send(giftEmbed);
            (client.channels.cache.get('745930857272967249') as TextChannel).send(
                giftEmbed.setDescription(`**${message.author.tag}** gifted **${numberOfItemsToGive.toLocaleString()} ${fullItemName}** to **${user.tag}**\n\n**${message.author.tag}**'s new ${fullItemName} amount is **${authorNewItemAmount.toLocaleString()}**\n**${user.tag}**'s new ${fullItemName} amount is **${userNewItemAmount.toLocaleString()}**`)
            );
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
