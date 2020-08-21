import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    if (user.bot) return message.channel.send(`${emojis.tickNo} Bots don't have inventory!`);

    const itemsEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Items',
        },
        color: message.guild?.me?.displayHexColor,
    });

    const inventory = (await database.getProp('economy', user.id, 'inventory')) || {};

    const houses = inventory.houses || {};
    const shops = inventory.shops || {};
    const workers = inventory.workers || {};

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

    const houseInv = Object.entries(house)
        .filter(([, amount]) => amount)
        .map(([houseName, houseAmount]) => `${houseName}: ${houseAmount.toLocaleString()}`)
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

    const workerInv = Object.entries(worker)
        .filter(([, amount]) => amount)
        .map(([workerName, workerAmount]) => `${workerName}: ${workerAmount.toLocaleString()}`)
        .join('\n');

    if (houseInv.length < 1 && shopInv.length < 1 && workerInv.length < 1) return message.channel.send(itemsEmbed.setDescription(`${user.id === message.author.id ? `${emojis.tickNo} You don't` : `**${user.tag}** doesn't`} have any items`));

    if (houseInv) itemsEmbed.addField('Houses', houseInv, true);
    if (shopInv) itemsEmbed.addField('Shops', shopInv, true);
    if (workerInv) itemsEmbed.addField('Workers', workerInv, true);

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
};
