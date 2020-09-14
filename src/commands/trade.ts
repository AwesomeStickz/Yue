import { Client, Message, TextChannel } from 'discord.js';
import fuzzysort from 'fuzzysort';
import lodash from 'lodash';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const allItems = [
        'Essence',
        'Mud House',
        'Tent',
        'Caravan',
        'Shack',
        'Apartment',
        'Bungalow',
        'House',
        'Penthouse',
        'Mansion',
        'Iron Navigator',
        'Bronze Navigator',
        'Silver Navigator',
        'Gold Navigator',
        'Platinum Navigator',
        'Diamond Navigator',
        'Flower Shop',
        'Taco Shop',
        'Burger Shop',
        'Pizza Shop',
        'Barber Shop',
        'Optician Shop',
        'Chemist Shop',
        'Butcher Shop',
        'Baker Shop',
        'Shoe Shop',
        'Clothes Shop',
        'Book Shop',
        'Grocery Shop',
        'DIY Shop',
        'Toy Shop',
        'Music Shop',
        'Jewelry Shop',
        'Plane Shop',
        'Flower Worker',
        'Taco Worker',
        'Burger Worker',
        'Pizza Worker',
        'Barber Worker',
        'Optician Worker',
        'Chemist Worker',
        'Butcher Worker',
        'Baker Worker',
        'Shoe Worker',
        'Clothes Worker',
        'Book Worker',
        'Grocery Worker',
        'DIY Worker',
        'Toy Worker',
        'Music Worker',
        'Jewelry Worker',
        'Plane Worker',
    ];

    const makeEmbed = () =>
        embed({
            author: {
                image: client.user!.displayAvatarURL(),
                name: 'Trade',
            },
            color: message.guild?.me?.displayHexColor,
        });

    const pendingReplyEndingTimeOfAuthor = tempCache.get(`pending_reply_${message.author.id}`) || 0;
    if (pendingReplyEndingTimeOfAuthor > Date.now()) return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} ${message.author.toString()}, a command is already waiting for your reply so please send a reply to that if you want to execute this command!`));

    const tradeEmbed = makeEmbed();

    const member = utils.getMember(args.shift()!, message.guild!);
    if (!member) return message.channel.send(tradeEmbed.setDescription(`${emojis.tickNo} I couldn't find that user! Maybe they're not in this server!`));
    if (member.user.bot) return message.channel.send(tradeEmbed.setDescription(`${emojis.tickNo} You can't trade items with bots!`));
    if (member.id === message.author.id) return message.channel.send(tradeEmbed.setDescription(`${emojis.tickNo} You can't trade items with yourself!`));

    const userFinishedGetStarted = await database.getProp('economy', member.id, 'getstarted');
    if (!userFinishedGetStarted) return message.channel.send(tradeEmbed.setDescription(`${emojis.tickNo} You can't trade items with ${member.toString()} as they did not use \`get started\` command yet!`));

    const totalItemsAuthorGives: { itemName: string; itemFullName: string | null; itemType: string | null; itemAmount: number }[] = [];
    const totalItemsUserGives: { itemName: string; itemFullName: string | null; itemType: string | null; itemAmount: number }[] = [];

    tempCache.set(`pending_reply_${message.author.id}`, Date.now() + 30000);
    message.channel.send(makeEmbed().setDescription(`Alright ${message.author.toString()}, what items do you want to give to ${member.toString()}? Send like \`<item amount> <item name>\` and separate by \`,\` if you want to trade more than 1 item. Example: \`500 flower worker, 200 mansion\``));
    message.channel
        .awaitMessages((msg) => !msg.author.bot && msg.author.id === message.author.id, { max: 1, time: 30000, errors: ['time'] })
        .then(
            async (collected): Promise<Message | void> => {
                const response = collected.first()?.content.toLowerCase();
                const userTradeItemsWithAmount = response?.split(',');

                let invalidUsage = false;

                for (const tradeItemWithAmountString of userTradeItemsWithAmount!) {
                    const tradeItemWithAmountArray = tradeItemWithAmountString.trim().split(' ');
                    const tradeItemAmount = tradeItemWithAmountArray.length === 1 && tradeItemWithAmountArray[0].startsWith('$') ? Math.round(Number(tradeItemWithAmountArray[0].slice(1))) : Math.round(Number(tradeItemWithAmountArray[0]));

                    if (isNaN(tradeItemAmount)) {
                        invalidUsage = true;
                        break;
                    }

                    if (tradeItemAmount < 0) {
                        tempCache.delete(`pending_reply_${message.author.id}`);
                        return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} You can't give negative number of items!`));
                    }

                    if (tradeItemWithAmountArray.length !== 1) {
                        tradeItemWithAmountArray.shift();

                        const fuzzySortedItemNames = fuzzysort.go(tradeItemWithAmountArray.join(' '), allItems, { allowTypo: false, limit: 1, threshold: -5000 });
                        const tradeItemName = fuzzySortedItemNames.total > 0 ? fuzzySortedItemNames[0].target : null;

                        if (!tradeItemName) {
                            invalidUsage = true;
                            break;
                        }

                        const inventoryItemName = tradeItemName.split(' ')[0].toLowerCase();
                        const inventoryItemType = tradeItemName.split(' ')[1]?.toLowerCase() ?? (tradeItemName.split(' ')[0] === 'essence' ? null : 'house');

                        const itemIsAlreadyAdded = totalItemsAuthorGives.find((item) => item.itemName === inventoryItemName && item.itemType === inventoryItemType);
                        if (itemIsAlreadyAdded) {
                            tempCache.delete(`pending_reply_${message.author.id}`);
                            return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} Cancelled the trade as you're not allowed to mention the same item twice! That is \`1 flower shop, 2 flower shop\` isn't allowed!`));
                        }

                        totalItemsAuthorGives.push({ itemName: inventoryItemName, itemFullName: tradeItemName, itemType: inventoryItemType, itemAmount: tradeItemAmount });
                    } else {
                        totalItemsAuthorGives.push({ itemName: 'balance', itemFullName: null, itemType: null, itemAmount: tradeItemAmount });
                    }
                }

                if (invalidUsage) {
                    tempCache.delete(`pending_reply_${message.author.id}`);
                    return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} Cancelled the trade as the reply you sent is not in the correct format! An example of correct reply is: \`500 flower worker, 200 mansion\``));
                }

                tradeEmbed.addField(
                    `What ${message.author.tag} gives`,
                    totalItemsAuthorGives.map((authorItem) => (!authorItem.itemFullName ? `$${authorItem.itemAmount.toLocaleString()}` : `${authorItem.itemAmount.toLocaleString()}x ${utils.capitalize(authorItem.itemFullName)}`))
                );

                await message.channel.send(tradeEmbed);
                await message.channel.send(makeEmbed().setDescription(`${message.author.toString()}, What items do you want from ${member.toString()}? Send like \`<item amount> <item name>\` and separate by \`,\` if you want to trade more than 1 item. Example: \`500 flower worker, 200 mansion\``));

                tempCache.set(`pending_reply_${message.author.id}`, Date.now() + 30000);
                message.channel
                    .awaitMessages((msg) => !msg.author.bot && msg.author.id === message.author.id, { max: 1, time: 30000, errors: ['time'] })
                    .then(
                        async (collected): Promise<Message | void> => {
                            const anotherResponse = collected.first()?.content.toLowerCase();
                            const userTradeItemsWithAmount = anotherResponse?.split(',');

                            let userInvalidUsage = false;

                            for (const userTradeItemWithAmountString of userTradeItemsWithAmount!) {
                                const userTradeItemWithAmountArray = userTradeItemWithAmountString.trim().split(' ');
                                const userTradeItemAmount = userTradeItemWithAmountArray.length === 1 && userTradeItemWithAmountArray[0].startsWith('$') ? Math.round(Number(userTradeItemWithAmountArray[0].slice(1))) : Math.round(Number(userTradeItemWithAmountArray[0]));

                                if (isNaN(userTradeItemAmount)) {
                                    invalidUsage = true;
                                    break;
                                }

                                if (userTradeItemAmount < 0) {
                                    tempCache.delete(`pending_reply_${message.author.id}`);
                                    return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} You can't give negative number of items!`));
                                }

                                if (userTradeItemWithAmountArray.length !== 1) {
                                    userTradeItemWithAmountArray.shift();

                                    const fuzzySortedItemNames = fuzzysort.go(userTradeItemWithAmountArray.join(' '), allItems, { allowTypo: false, limit: 1, threshold: -5000 });
                                    const userTradeItemName = fuzzySortedItemNames.total > 0 ? fuzzySortedItemNames[0].target : null;

                                    if (!userTradeItemName) {
                                        invalidUsage = true;
                                        break;
                                    }

                                    const inventoryItemName = userTradeItemName.split(' ')[0].toLowerCase();
                                    const inventoryItemType = userTradeItemName.split(' ')[1]?.toLowerCase() ?? (inventoryItemName === 'essence' ? null : 'house');

                                    const userItemIsAlreadyAdded = totalItemsUserGives.find((item) => item.itemName === inventoryItemName && item.itemType === inventoryItemType);
                                    if (userItemIsAlreadyAdded) {
                                        tempCache.delete(`pending_reply_${message.author.id}`);
                                        return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} Cancelled the trade as you're not allowed to mention the same item twice! That is \`1 flower shop, 2 flower shop\` isn't allowed!`));
                                    }

                                    totalItemsUserGives.push({ itemName: inventoryItemName, itemFullName: userTradeItemName, itemType: inventoryItemType, itemAmount: userTradeItemAmount });
                                } else {
                                    totalItemsUserGives.push({ itemName: 'balance', itemFullName: null, itemType: null, itemAmount: userTradeItemAmount });
                                }
                            }

                            if (userInvalidUsage) {
                                tempCache.delete(`pending_reply_${message.author.id}`);
                                return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} Cancelled the trade as the reply you sent is not in the correct format! An example of correct reply is: \`500 flower worker, 200 mansion\``));
                            }

                            tradeEmbed.addField(
                                `What ${message.author.tag} gets`,
                                totalItemsUserGives.map((userItem) => (!userItem.itemFullName ? `$${userItem.itemAmount.toLocaleString()}` : `${userItem.itemAmount.toLocaleString()}x ${utils.capitalize(userItem.itemFullName)}`))
                            );

                            tradeEmbed.setDescription(`${member.user.tag}, do you want to accept this trade? Type \`yes\` if you want to!`);
                            tradeEmbed.setFooter('Yue');
                            tradeEmbed.setTimestamp();

                            await message.channel.send(tradeEmbed);

                            const userPendingReplyEndTime = Date.now() + 30000;

                            tempCache.set(`pending_reply_${member.id}`, userPendingReplyEndTime);
                            tempCache.delete(`pending_reply_${message.author.id}`);

                            message.channel
                                .awaitMessages((msg) => !msg.author.bot && msg.author.id === member.id, { max: 1, time: 30000, errors: ['time'] })
                                .then(
                                    async (collected): Promise<Message | void> => {
                                        const response = collected.first()?.content.toLowerCase();
                                        if (response === 'yes' || response === 'y') {
                                            const pendingReplyEndingTimeOfUser = tempCache.get(`pending_reply_${member.id}`) || 0;
                                            if (pendingReplyEndingTimeOfUser > Date.now() && userPendingReplyEndTime !== pendingReplyEndingTimeOfUser) return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} ${member.toString()}, a command is already waiting for your reply so please send a reply to that if you want to reply \`yes\` to this command!`));

                                            const authorEconomyData = (await database.get('economy', message.author.id)) || {};
                                            const userEconomyData = (await database.get('economy', member.id)) || {};

                                            const authorNotEnoughItems: string[] = [];
                                            const userNotEnoughItems: string[] = [];

                                            const authorNotEnoughSlots: string[] = [];
                                            const userNotEnoughSlots: string[] = [];

                                            for (const itemAuthorGives of totalItemsAuthorGives) {
                                                const { itemAmount, itemFullName, itemName, itemType } = itemAuthorGives;

                                                if (itemName === 'balance') {
                                                    const remainingAuthorBalance = (authorEconomyData.balance ?? 0) - itemAmount;

                                                    if (remainingAuthorBalance < 0) return message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Cancelled the trade as ${message.author.toString()} doesn't have enough balance to give to ${member.toString()}`));

                                                    lodash.set(userEconomyData, 'balance', (userEconomyData.balance ?? 0) + itemAmount);
                                                    remainingAuthorBalance > 0 ? (authorEconomyData.balance = remainingAuthorBalance) : lodash.unset(authorEconomyData, 'balance');
                                                } else if (itemName === 'essence') {
                                                    const remainingAuthorEssence = (lodash.get(authorEconomyData, 'inventory.essence') ?? 0) - itemAmount;

                                                    if (remainingAuthorEssence < 0) return message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Cancelled the trade as ${message.author.toString()} doesn't have enough essence to give to ${member.toString()}`));

                                                    lodash.set(userEconomyData, 'inventory.essence', (lodash.get(userEconomyData, 'inventory.essence') ?? 0) + itemAmount);
                                                    remainingAuthorEssence > 0 ? lodash.set(authorEconomyData, 'inventory.essence', remainingAuthorEssence) : lodash.unset(authorEconomyData, 'inventory.essence');
                                                } else if (itemType !== null && itemFullName !== null) {
                                                    const remainingItemsInAuthorInventory = (lodash.get(authorEconomyData, `inventory.${itemType}s.${itemName}`) ?? 0) - itemAmount;

                                                    if (remainingItemsInAuthorInventory < 0) {
                                                        authorNotEnoughItems.push(itemFullName);
                                                        continue;
                                                    }

                                                    const itemsInUserInventory = lodash.get(userEconomyData, `inventory.${itemType}s`) || {};
                                                    const totalAmountOfItemsInUserInventory = Number(Object.values(itemsInUserInventory).reduce((a: any, b: any) => a + b, 0));

                                                    // @ts-expect-error
                                                    const userItemSlots = (await utils.getSlots(member.id))[`${itemType}s`];

                                                    if (totalAmountOfItemsInUserInventory - (totalItemsUserGives.find((item) => item.itemFullName === itemFullName)?.itemAmount ?? 0) + itemAmount > userItemSlots) {
                                                        if (!userNotEnoughSlots.includes(itemType)) userNotEnoughSlots.push(itemType);
                                                        continue;
                                                    }

                                                    lodash.set(userEconomyData, `inventory.${itemType}s.${itemName}`, (lodash.get(userEconomyData, `inventory.${itemType}s.${itemName}`) || 0) + itemAmount);
                                                    remainingItemsInAuthorInventory > 0 ? lodash.set(authorEconomyData, `inventory.${itemType}s.${itemName}`, remainingItemsInAuthorInventory) : lodash.unset(authorEconomyData, `inventory.${itemType}s.${itemName}`);
                                                }
                                            }

                                            for (const itemUserGives of totalItemsUserGives) {
                                                const { itemAmount, itemFullName, itemName, itemType } = itemUserGives;

                                                if (itemName === 'balance') {
                                                    const remainingUserBalance = (userEconomyData.balance ?? 0) - itemAmount;

                                                    if (remainingUserBalance < 0) return message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Cancelled the trade as ${member.toString()} doesn't have enough balance to give to ${message.author.toString()}`));

                                                    lodash.set(authorEconomyData, 'balance', (authorEconomyData.balance ?? 0) + itemAmount);
                                                    remainingUserBalance > 0 ? (userEconomyData.balance = remainingUserBalance) : lodash.unset(userEconomyData, 'balance');
                                                } else if (itemName === 'essence') {
                                                    const remainingUserEssence = (lodash.get(userEconomyData, 'inventory.essence') ?? 0) - itemAmount;

                                                    if (remainingUserEssence < 0) return message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Cancelled the trade as ${member.toString()} doesn't have enough essence to give to ${message.author.toString()}`));

                                                    lodash.set(authorEconomyData, 'inventory.essence', (lodash.get(authorEconomyData, 'inventory.essence') ?? 0) + itemAmount);
                                                    remainingUserEssence > 0 ? lodash.set(userEconomyData, 'inventory.essence', remainingUserEssence) : lodash.unset(userEconomyData, 'inventory.essence');
                                                } else if (itemType !== null && itemFullName !== null) {
                                                    const remainingItemsInUserInventory = (lodash.get(userEconomyData, `inventory.${itemType}s.${itemName}`) ?? 0) - itemAmount;

                                                    if (remainingItemsInUserInventory < 0) {
                                                        userNotEnoughItems.push(itemFullName);
                                                        continue;
                                                    }

                                                    const itemsInAuthorInventory = lodash.get(authorEconomyData, `inventory.${itemType}s`) || {};
                                                    const totalAmountOfItemsInAuthorInventory = Number(Object.values(itemsInAuthorInventory).reduce((a: any, b: any) => a + b, 0));

                                                    // @ts-expect-error
                                                    const authorItemSlots = (await utils.getSlots(message.author.id))[`${itemType}s`];

                                                    if (totalAmountOfItemsInAuthorInventory - (totalItemsAuthorGives.find((item) => item.itemFullName === itemFullName)?.itemAmount ?? 0) + itemAmount > authorItemSlots) {
                                                        if (!authorNotEnoughSlots.includes(itemType)) authorNotEnoughSlots.push(itemType);
                                                        continue;
                                                    }

                                                    lodash.set(authorEconomyData, `inventory.${itemType}s.${itemName}`, (lodash.get(authorEconomyData, `inventory.${itemType}s.${itemName}`) || 0) + itemAmount);
                                                    remainingItemsInUserInventory > 0 ? lodash.set(userEconomyData, `inventory.${itemType}s.${itemName}`, remainingItemsInUserInventory) : lodash.unset(userEconomyData, `inventory.${itemType}s.${itemName}`);
                                                }
                                            }

                                            if (authorNotEnoughItems.length > 0) {
                                                tempCache.delete(`pending_reply_${member.id}`);
                                                return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} ${message.author.toString()} doesn't have enough amount of these items: \`${authorNotEnoughItems.join('`, `')}\``));
                                            }
                                            if (userNotEnoughItems.length > 0) {
                                                tempCache.delete(`pending_reply_${member.id}`);
                                                return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} ${member.toString()} doesn't have enough amount of these items: \`${userNotEnoughItems.join('`, `')}\``));
                                            }

                                            if (authorNotEnoughSlots.length > 0) {
                                                tempCache.delete(`pending_reply_${member.id}`);
                                                return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} ${message.author.toString()} doesn't have enough number of these slots: \`${authorNotEnoughSlots.join('`, `')}\``));
                                            }
                                            if (userNotEnoughSlots.length > 0) {
                                                tempCache.delete(`pending_reply_${member.id}`);
                                                return message.channel.send(makeEmbed().setDescription(`${emojis.tickNo} ${member.toString()} doesn't have these enough number of slots: \`${userNotEnoughSlots.join('`, `')}\``));
                                            }

                                            await database.set('economy', message.author.id, authorEconomyData);
                                            await database.set('economy', member.id, userEconomyData);

                                            message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Trade was successful`));

                                            const logTradeEmbed = makeEmbed();

                                            logTradeEmbed.addField(
                                                `${message.author.tag} Got`,
                                                totalItemsUserGives.map((userItem) => (!userItem.itemFullName ? `$${userItem.itemAmount.toLocaleString()}` : `${userItem.itemAmount.toLocaleString()}x ${utils.capitalize(userItem.itemFullName)}`))
                                            );
                                            logTradeEmbed.addField(
                                                `${member.user.tag} Got`,
                                                totalItemsAuthorGives.map((authorItem) => (!authorItem.itemFullName ? `$${authorItem.itemAmount.toLocaleString()}` : `${authorItem.itemAmount.toLocaleString()}x ${utils.capitalize(authorItem.itemFullName)}`))
                                            );
                                            logTradeEmbed.setDescription(`**${message.author.tag}** (${message.author.id}) and **${member.user.tag}** (${member.id}) have traded these items!`);

                                            (client.channels.cache.get('753556341502771240') as TextChannel).send(logTradeEmbed);
                                        } else {
                                            message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Cancelled the trade as the reply wasn't \`yes\``));
                                            tempCache.delete(`pending_reply_${member.id}`);
                                        }
                                    }
                                )
                                .catch(() => {
                                    tempCache.delete(`pending_reply_${member.id}`);
                                    message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Cancelled the trade as ${member.toString()} didn't respond in time!`));
                                });
                        }
                    )
                    .catch(() => {
                        tempCache.delete(`pending_reply_${message.author.id}`);
                        message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Cancelled the trade as ${message.author.toString()} didn't respond in time!`));
                    });
            }
        )
        .catch(() => {
            tempCache.delete(`pending_reply_${message.author.id}`);
            message.channel.send(makeEmbed().setDescription(`${emojis.tickYes} Cancelled the trade as ${message.author.toString()} didn't respond in time!`));
        });
};

export const help = {
    aliases: ['trade'],
    name: 'Trade',
    cooldown: 10000,
    description: 'Trade your items for some other items to someone',
    usage: 'trade <user>',
    example: 'trade @Conor#0751',
};

export const config = {
    args: 1,
    category: 'economy',
};
