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
        '<:MudHouse:746026271749701722> Mud House': houses.mud,
        '<:Caravan:746031340830589020> Caravan': houses.caravan,
        '🎪 Tent': houses.tent,
        '<:Shack:746027605010022531> Shack': houses.shack,
        '<:Apartment:744302863391391834> Apartment': houses.apartment,
        '🏠 Bungalow': houses.bungalow,
        '<:Bungalow:744304109888208986> House': houses.house,
        '<:Penthouse:744302835662979072> Penthouse': houses.penthouse,
        '<:Mansion:744302803098533898> Mansion': houses.mansion,
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
