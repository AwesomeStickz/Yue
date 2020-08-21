import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;

    const lastDaily = (await database.getProp('cooldown', message.author.id, 'tipcollect')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastDaily);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const workerEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Worker Collect',
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        workerEmbed.setAuthor(message.author.username, message.author.displayAvatarURL());
        workerEmbed.setDescription(`You already collected tips from your workers! Come back in ${time}!`);
    } else {
        // @ts-expect-error
        const workers = (await database.getProp('economy', message.author.id, 'inventory.workers')) || {};

        if (Object.keys(workers).length < 1) return message.channel.send(workerEmbed.setDescription(`${emojis.tickNo} You don't have any workers to collect tips!`));

        const allWorkers: any = {
            flower: 165,
            taco: 1160,
            burger: 3000,
            pizza: 5800,
            barber: 8300,
            optician: 16500,
            chemist: 25000,
            butcher: 30000,
            baker: 50000,
            shoe: 100000,
            clothes: 165000,
            book: 300000,
            grocery: 830000,
            diy: 1650000,
            toy: 3000000,
            music: 8300000,
            jewelry: 16500000,
            plane: 30000000,
        };

        const allWorkersEmoji: any = {
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

        for (const [workerName, workerPrice] of Object.entries(allWorkers)) {
            if (workers[workerName]) {
                const workerAmount = workers[workerName];
                let percentOfIncome = 0;

                if ((workerAmount as number) <= 10) percentOfIncome = 6;
                else if ((workerAmount as number) <= 20) percentOfIncome = 5;
                else if ((workerAmount as number) <= 30) percentOfIncome = 4;
                else if ((workerAmount as number) <= 40) percentOfIncome = 3;
                else if ((workerAmount as number) <= 50) percentOfIncome = 2;
                else percentOfIncome = 1;

                const moneyToAdd = Math.round((percentOfIncome / 100) * (workerPrice as number) * workerAmount);

                totalMoney += moneyToAdd;
                totalText += `${allWorkersEmoji[workerName]} ${workerAmount.toLocaleString()} ${workerName[0].toUpperCase()}${workerName.slice(1)} Shop: **$${moneyToAdd.toLocaleString()}**\n`;
            }
        }

        totalMoney = Math.round(totalMoney);
        await database.addProp('economy', message.author.id, totalMoney, 'balance');
        await database.setProp('cooldown', message.author.id, Date.now(), 'tipcollect');

        workerEmbed.setDescription(`Your workers made you **$${totalMoney.toLocaleString()}**\n\n${totalText}`);
        workerEmbed.setFooter('Yue');
        workerEmbed.setTimestamp();
    }
    message.channel.send(workerEmbed);
};

export const help = {
    aliases: ['tip collect', 'worker collect'],
    name: 'Tip Collect',
    cooldown: 900000,
    description: 'Collect tips from workers every 15 mins',
    usage: 'tip collect',
    example: 'tip collect',
};

export const config = {
    args: 0,
};
