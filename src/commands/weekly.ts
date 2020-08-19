import { Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';

export const run = async (message: Message): Promise<Message | void> => {
    const { cooldown } = help;

    const lastWeekly = (await database.getProp('cooldown', message.author.id, 'weekly')) || 0;
    const time = prettyMs(cooldown - (Date.now() - lastWeekly), { secondsDecimalDigits: 0, verbose: true });

    const weeklyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (cooldown - (Date.now() - lastWeekly) > 0) {
        weeklyEmbed.setDescription(`You collected your weekly reward already! Come back in ${time}!`);
    } else if (cooldown - (Date.now() - lastWeekly) <= 0) {
        await database.setProp('cooldown', message.author.id, Date.now(), 'weekly');

        weeklyEmbed.setDescription(`You collected your weekly bonus of **$4,000**`);
    }

    message.channel.send(weeklyEmbed);
};

export const help = {
    aliases: ['weekly'],
    name: 'Weekly',
    description: 'Collect weekly reward',
    cooldown: 6.048e8,
    usage: 'weekly',
    example: 'weekly',
};

export const config = {
    args: 0,
    owner: false,
};
