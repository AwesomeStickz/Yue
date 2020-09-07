import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;

    const itemsEmbed = embed({
        author: {
            image: user.displayAvatarURL({ dynamic: true }),
            name: `${user.username}'s Items`,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(itemsEmbed.setDescription(`${emojis.tickNo} Bots don't have inventory!`));

    const inventory = (await database.getProp('economy', user.id, 'inventory')) || {};

    const essences = inventory.essence || 0;
    const houses = inventory.houses || {};
    const navigators = inventory.navigators || {};
    const shops = inventory.shops || {};
    const workers = inventory.workers || {};
    const slots = await utils.getSlots(user.id);

    const essenceInv = `${emojis.essence} Essence: ${essences.toLocaleString()}`;

    const house = {
        [`${emojis.houses.mud} Mud House`]: houses.mud,
        [`${emojis.houses.caravan} Caravan`]: houses.caravan,
        [`${emojis.houses.tent} Tent`]: houses.tent,
        [`${emojis.houses.shack} Shack`]: houses.shack,
        [`${emojis.houses.apartment} Apartment`]: houses.apartment,
        [`${emojis.houses.bungalow} Bungalow`]: houses.bungalow,
        [`${emojis.houses.house} House`]: houses.house,
        [`${emojis.houses.penthouse} Penthouse`]: houses.penthouse,
        [`${emojis.houses.mansion} Mansion`]: houses.mansion,
    };

    const totalHouses = Object.values(house).reduce((a, b) => (a || 0) + (b || 0), 0);
    const totalHouseSlots = slots.houses;

    const houseInv = Object.entries(house)
        .filter(([, amount]) => amount)
        .map(([houseName, houseAmount]) => `${houseName}: ${houseAmount.toLocaleString()}`)
        .join('\n');

    const navigator = {
        [`${emojis.navigators.iron} Iron Navigator`]: navigators.iron,
        [`${emojis.navigators.bronze} Bronze Navigator`]: navigators.bronze,
        [`${emojis.navigators.silver} Silver Navigator`]: navigators.silver,
        [`${emojis.navigators.gold} Gold Navigator`]: navigators.gold,
        [`${emojis.navigators.platinum} Platinum Navigator`]: navigators.platinum,
        [`${emojis.navigators.diamond} Diamond Navigator`]: navigators.diamond,
    };

    const totalNavigators = Object.values(navigator).reduce((a, b) => (a || 0) + (b || 0), 0);
    const totalNavigatorSlots = slots.navigators;

    const navigatorInv = Object.entries(navigator)
        .filter(([, amount]) => amount)
        .map(([navigatorName, navigatorAmount]) => `${navigatorName}: ${navigatorAmount.toLocaleString()}`)
        .join('\n');

    const shop = {
        '🌸 Flower': shops.flower,
        '🌮 Taco': shops.taco,
        '🍔 Burger': shops.burger,
        '🍕 Pizza': shops.pizza,
        '💈 Barber': shops.barber,
        '👓 Optician': shops.optician,
        '🧪 Chemist': shops.chemist,
        '🔪 Butcher': shops.butcher,
        '🧁 Baker': shops.baker,
        '👟 Shoe': shops.shoe,
        '👕 Clothes': shops.clothes,
        '📘 Book': shops.book,
        '🥕 Grocery': shops.grocery,
        '✂️ DIY': shops.diy,
        '🧸 Toy': shops.toy,
        '🎸 Music': shops.music,
        '💍 Jewelry': shops.jewelry,
        '✈️ Plane': shops.plane,
    };

    const totalShops = Object.values(shop).reduce((a, b) => (a || 0) + (b || 0), 0);
    const totalShopSlots = slots.shops;

    const shopInv = Object.entries(shop)
        .filter(([, amount]) => amount)
        .map(([shopName, shopAmount]) => `${shopName}: ${shopAmount.toLocaleString()}`)
        .join('\n');

    const worker = {
        '🌸 Flower': workers.flower,
        '🌮 Taco': workers.taco,
        '🍔 Burger': workers.burger,
        '🍕 Pizza': workers.pizza,
        '💈 Barber': workers.barber,
        '👓 Optician': workers.optician,
        '🧪 Chemist': workers.chemist,
        '🔪 Butcher': workers.butcher,
        '🧁 Baker': workers.baker,
        '👟 Shoe': workers.shoe,
        '👕 Clothes': workers.clothes,
        '📘 Book': workers.book,
        '🥕 Grocery': workers.grocery,
        '✂️ DIY': workers.diy,
        '🧸 Toy': workers.toy,
        '🎸 Music': workers.music,
        '💍 Jewelry': workers.jewelry,
        '✈️ Plane': workers.plane,
    };

    const totalWorkers = Object.values(worker).reduce((a, b) => (a || 0) + (b || 0), 0);
    const totalWorkerSlots = slots.workers;

    const workerInv = Object.entries(worker)
        .filter(([, amount]) => amount)
        .map(([workerName, workerAmount]) => `${workerName}: ${workerAmount.toLocaleString()}`)
        .join('\n');

    if (essences < 1 && navigatorInv.length < 1 && houseInv.length < 1 && shopInv.length < 1 && workerInv.length < 1) return message.channel.send(itemsEmbed.setDescription(`${user.id === message.author.id ? `${emojis.tickNo} You don't` : `**${user.tag}** doesn't`} have any items`));

    if (houseInv) itemsEmbed.addField(`Houses (${totalHouses.toLocaleString()}/${totalHouseSlots.toLocaleString()})`, houseInv, true);
    if (navigatorInv) itemsEmbed.addField(`Navigators (${totalNavigators.toLocaleString()}/${totalNavigatorSlots.toLocaleString()})`, navigatorInv, true);
    if (shopInv) itemsEmbed.addField(`Shops (${totalShops.toLocaleString()}/${totalShopSlots.toLocaleString()})`, shopInv, true);
    if (workerInv) itemsEmbed.addField(`Workers (${totalWorkers.toLocaleString()}/${totalWorkerSlots.toLocaleString()})`, workerInv, true);
    if (essences > 0) itemsEmbed.addField('Essence', essenceInv, true);

    message.channel.send(itemsEmbed);
};

export const help = {
    aliases: ['items', 'inventory', 'inv'],
    name: 'Items',
    description: 'View the list of all your items',
    usage: 'items [user]',
    example: 'items\nitems @Conor#0751',
};

export const config = {
    args: 0,
    category: 'economy',
};
