import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;

    const lastDaily = (await database.getProp('cooldown', message.author.id, 'rentcollect')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastDaily);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const rentEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Rent Collect',
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        rentEmbed.setAuthor(message.author.username, message.author.displayAvatarURL());
        rentEmbed.setDescription(`You already collected the rent from your houses! Come back in ${time}!`);
    } else {
        // @ts-expect-error
        const houses = (await database.getProp('economy', message.author.id, 'inventory.houses')) || {};

        if (Object.keys(houses).length < 1) return message.channel.send(rentEmbed.setDescription(`${emojis.tickNo} You don't have any houses to collect rent!`));

        const allHouses: any = {
            mud: 22500,
            tent: 50000,
            caravan: 75000,
            shack: 280000,
            apartment: 500000,
            bungalow: 5000000,
            house: 10000000,
            penthouse: 15000000,
            mansion: 30000000,
        };

        const allHousesEmoji: any = {
            mud: emojis.houses.mud,
            tent: emojis.houses.tent,
            caravan: emojis.houses.caravan,
            shack: emojis.houses.shack,
            apartment: emojis.houses.apartment,
            bungalow: emojis.houses.bungalow,
            house: emojis.houses.house,
            penthouse: emojis.houses.penthouse,
            mansion: emojis.houses.mansion,
        };

        let totalMoney = 0;
        let totalText = '';

        for (const [houseName, housePrice] of Object.entries(allHouses)) {
            if (houses[houseName]) {
                const houseAmount = houses[houseName];
                const percentOfIncome = 1;
                const moneyToAdd = Math.round((percentOfIncome / 100) * (housePrice as number) * houseAmount);

                totalMoney += moneyToAdd;
                totalText += `${allHousesEmoji[houseName]} ${houseAmount.toLocaleString()} ${houseName[0].toUpperCase()}${houseName.slice(1)} House: **$${moneyToAdd.toLocaleString()}**\n`;
            }
        }

        totalMoney = Math.round(totalMoney);
        await database.addProp('economy', message.author.id, totalMoney, 'balance');
        await database.setProp('cooldown', message.author.id, Date.now(), 'rentcollect');

        rentEmbed.setDescription(`Your houses made you **$${totalMoney.toLocaleString()}**\n\n${totalText}`);
        rentEmbed.setFooter('Yue');
        rentEmbed.setTimestamp();
    }
    message.channel.send(rentEmbed);
};

export const help = {
    aliases: ['rent collect', 'house collect'],
    name: 'Rent Collect',
    cooldown: 43200000,
    description: 'Collect rent from your houses every 12 hours.',
    usage: 'rent collect',
    example: 'rent collect',
};

export const config = {
    args: 0,
};
