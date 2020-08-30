import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;

    const lastShopCollect = (await database.getProp('cooldown', message.author.id, 'shopcollect')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastShopCollect);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const shopEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Shop Collect',
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        shopEmbed.setAuthor(message.author.username, message.author.displayAvatarURL());
        shopEmbed.setDescription(`You already collected money from your shops! Come back in ${time}!`);
    } else {
        // @ts-expect-error
        const shops = (await database.getProp('economy', message.author.id, 'inventory.shops')) || {};

        if (Object.keys(shops).length < 1) return message.channel.send(shopEmbed.setDescription(`${emojis.tickNo} You don't have any shops to collect!`));

        const allShops: any = {
            flower: 500,
            taco: 3500,
            burger: 10000,
            pizza: 17500,
            barber: 25000,
            optician: 50000,
            chemist: 75000,
            butcher: 100000,
            baker: 150000,
            shoe: 300000,
            clothes: 500000,
            book: 1000000,
            grocery: 2500000,
            diy: 5000000,
            toy: 10000000,
            music: 25000000,
            jewelry: 50000000,
            plane: 100000000,
        };

        const allShopsEmoji: any = {
            flower: '🌸',
            taco: '🌮',
            burger: '🍔',
            pizza: '🍕',
            barber: '💈',
            optician: '👓',
            chemist: '🧪',
            butcher: '🔪',
            baker: '🧁',
            shoe: '👟',
            clothes: '👕',
            book: '📘',
            grocery: '🥕',
            diy: '✂️',
            toy: '🧸',
            music: '🎸',
            jewelry: '💍',
            plane: '✈️',
        };

        let totalMoney = 0;
        let totalText = '';

        for (const [shopName, shopPrice] of Object.entries(allShops)) {
            if (shops[shopName]) {
                const shopAmount = shops[shopName];
                let percentOfIncome = Math.floor(Math.random() * 5 + 15);
                const moneyToAdd = Math.round((percentOfIncome / 100) * (shopPrice as number) * shopAmount);

                totalMoney += moneyToAdd;
                totalText += `${allShopsEmoji[shopName]} ${shopAmount.toLocaleString()} ${shopName[0].toUpperCase()}${shopName.slice(1)} Shop: **$${moneyToAdd.toLocaleString()}**\n`;
            }
        }

        totalMoney = Math.round(totalMoney);
        await database.addProp('economy', message.author.id, totalMoney, 'balance');
        await database.setProp('cooldown', message.author.id, Date.now(), 'shopcollect');

        shopEmbed.setDescription(`Your shops made you **$${totalMoney.toLocaleString()}**\n\n${totalText}`);
        shopEmbed.setFooter('Yue');
        shopEmbed.setTimestamp();
        await utils.updateLevel(message, client);
    }
    message.channel.send(shopEmbed);
};

export const help = {
    aliases: ['shop collect'],
    name: 'Shop Collect',
    cooldown: 14400000,
    description: 'Collect what your shops made you every 4 hours.',
    usage: 'shop collect',
    example: 'shop collect',
};

export const config = {
    args: 0,
    category: 'economy',
};
