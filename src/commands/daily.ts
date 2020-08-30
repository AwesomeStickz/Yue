import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;
    const streakResetTime = 1.728e8;

    const lastDaily = (await database.getProp('cooldown', message.author.id, 'daily')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastDaily);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const dailyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        dailyEmbed.setDescription(`You collected your daily reward already! Come back in ${time}!`);
    } else {
        const streak = (await database.getProp('economy', message.author.id, 'streak')) || 0;

        if (lastDaily && streakResetTime - (Date.now() - lastDaily) <= 0) {
            await database.addProp('economy', message.author.id, 250, 'balance');
            await database.setProp('economy', message.author.id, 1, 'streak');

            dailyEmbed.setDescription(`You collected your daily bonus of **$250** (Streak: **1**) You didn't collect your bonus for 2 days so your streak has been reset`);
        } else {
            const money = 250 + streak * 10;

            await database.addProp('economy', message.author.id, money, 'balance');
            await database.addProp('economy', message.author.id, 1, 'streak');

            dailyEmbed.setDescription(`You collected your daily bonus of **$${money}** (Streak: **${streak + 1}**)`);
        }
        await database.setProp('cooldown', message.author.id, Date.now(), 'daily');
    }
    message.channel.send(dailyEmbed);
    await utils.updateLevel(message, client);
};

export const help = {
    aliases: ['daily'],
    name: 'Daily',
    description: 'Collect daily reward',
    cooldown: 8.64e7,
    usage: 'daily',
    example: 'daily',
};

export const config = {
    args: 0,
    category: 'economy',
};
