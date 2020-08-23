import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;

    const lastWeekly = (await database.getProp('cooldown', message.author.id, 'weekly')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastWeekly);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const weeklyEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        weeklyEmbed.setDescription(`You collected your weekly reward already! Come back in ${time}!`);
    } else if (remainingCooldown <= 0) {
        await database.setProp('cooldown', message.author.id, Date.now(), 'weekly');
        await database.addProp('economy', message.author.id, 4000, 'balance');

        weeklyEmbed.setDescription(`You collected your weekly bonus of **$4,000**`);
        utils.updateLevel(message.author.id, message, client);
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
};
