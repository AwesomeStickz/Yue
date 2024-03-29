import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const { cooldown } = help;

    const lastRob = (await database.getProp('cooldown', message.author.id, 'rob')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastRob);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const robEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        robEmbed.setDescription(`You robbed a user recently! Come back in ${time}!`);
    } else {
        const member = utils.getMember(args.join(' '), message.guild!);
        if (!member) return message.channel.send(robEmbed.setDescription(`${emojis.tickNo} I couldn't find that user! Maybe they're not in this server!`));
        if (member.id === message.author.id) return message.channel.send(robEmbed.setDescription(`${emojis.tickNo} Why are you even trying to rob from yourself?`));

        const userLastRob = (await database.getProp('economy', member.id, 'robbed')) || 0;
        const remainingCooldownToStealUSer = 10800000 - (Date.now() - userLastRob);
        const userRobbableTime = remainingCooldownToStealUSer > 1000 ? prettyMs(remainingCooldownToStealUSer, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldownToStealUSer / 1000).toFixed(1)} seconds`;

        if (remainingCooldownToStealUSer > 0) return message.channel.send(robEmbed.setDescription(`${emojis.tickNo} That user was robbed recently! Come back in ${userRobbableTime} to rob that user or rob someone else!`));

        const authorBalance = (await database.getProp('economy', message.author.id, 'balance')) || 0;
        if (authorBalance < 1000) return message.channel.send(robEmbed.setDescription(`${emojis.tickNo} You need at least **$1,000** in your wallet to rob from someone!`));

        const randomNumber = Math.round(Math.random() * 100);
        let successfulRob = false;

        if (randomNumber > 30) successfulRob = true;
        if (successfulRob) {
            const userBalance = (await database.getProp('economy', member.id, 'balance')) || 0;
            const moneyThatCanBeRobbed = Math.ceil(userBalance * 0.01) < 500000 ? Math.ceil(userBalance * 0.01) : 500000;

            if (moneyThatCanBeRobbed < 1) return message.channel.send(robEmbed.setDescription(`${emojis.tickNo} That user is very poor! Try robbing someone else!`));

            await database.setProp('economy', member.id, Date.now(), 'robbed');
            await database.setProp('cooldown', message.author.id, Date.now(), 'rob');
            await database.addProp('economy', message.author.id, moneyThatCanBeRobbed, 'balance');
            await database.subtractProp('economy', member.id, moneyThatCanBeRobbed, 'balance');

            robEmbed.setDescription(`${emojis.tickYes} You successfully robbed ${member.toString()} and got **$${moneyThatCanBeRobbed.toLocaleString()}**`);
            await utils.updateLevel(message, client);
        } else {
            const fineToPay = Math.ceil(authorBalance * 0.02) < 500000 ? Math.ceil(authorBalance * 0.01) : 500000;

            if (fineToPay < 1) return message.channel.send(robEmbed.setDescription(`${emojis.tickNo} That user is very poor! Try robbing someone else!`));

            await database.setProp('cooldown', message.author.id, Date.now(), 'rob');
            await database.subtractProp('economy', message.author.id, fineToPay, 'balance');

            robEmbed.setDescription(`${emojis.tickYes} You were caught by police 🚓 when trying to rob ${member.toString()} and paid **$${fineToPay.toLocaleString()}** as fine!`);
            await utils.updateLevel(message, client);
        }
    }
    message.channel.send(robEmbed);
};

export const help = {
    aliases: ['rob'],
    name: 'Rob',
    description: 'Rob a user every minute',
    cooldown: 60000,
    usage: 'rob <user>',
    example: 'rob @Conor#0751',
};

export const config = {
    args: 0,
    category: 'economy',
};
