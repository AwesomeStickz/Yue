import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client)) || message.author;
    if (user.bot) return message.channel.send(`${emojis.tickNo} Bots don't have inventory!`);

    const itemsEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Items',
        },
        color: message.guild?.me?.displayHexColor,
    });

    const inventory = (await database.getProp('economy', user.id, 'inventory')) || {};

    const shops = inventory.shops || {};
    const workers = inventory.workers || {};

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
        '✈️ Plane': shops.plance,
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
        '✈️ Plane': workers.plance,
    };

    const workerInv = Object.entries(worker)
        .filter(([, amount]) => amount)
        .map(([workerName, workerAmount]) => `${workerName}: ${workerAmount.toLocaleString()}`)
        .join('\n');

    if (typeof shopInv === 'string' && shopInv.length < 1 && shopInv.length < 1 && workerInv.length < 1) return message.channel.send(itemsEmbed.setDescription(`${user.id === message.author.id ? `${emojis.tickNo} You don't` : `**${user.tag}** doesn't`} have any items`));

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
