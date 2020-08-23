import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;

    const lastNavigate = (await database.getProp('cooldown', message.author.id, 'navigate')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastNavigate);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const navigateEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Navigator Collect',
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        navigateEmbed.setAuthor(message.author.username, message.author.displayAvatarURL());
        navigateEmbed.setDescription(`You already collected essence from your navigators! Come back in ${time}!`);
    } else {
        // @ts-expect-error
        const navigators = (await database.getProp('economy', message.author.id, 'inventory.navigators')) || {};

        if (Object.keys(navigators).length < 1) return message.channel.send(navigateEmbed.setDescription(`${emojis.tickNo} You don't have any navigators to collect essence!`));

        const allNavigatorsEssence: any = {
            iron: 1,
            bronze: 2,
            silver: 8,
            gold: 34,
            platinum: 180,
            diamond: 410,
        };

        const allNavigatorsEmoji: any = {
            iron: emojis.navigators.iron,
            bronze: emojis.navigators.bronze,
            silver: emojis.navigators.silver,
            gold: emojis.navigators.gold,
            platinum: emojis.navigators.platinum,
            diamond: emojis.navigators.diamond,
        };

        let totalEssence = 0;
        let totalText = '';

        for (const [navigatorName, amountOfEssence] of Object.entries(allNavigatorsEssence)) {
            if (navigators[navigatorName]) {
                const navigatorAmount = navigators[navigatorName];
                const essenceToAdd = Math.round((amountOfEssence as number) * navigatorAmount);

                totalEssence += essenceToAdd;
                totalText += `${allNavigatorsEmoji[navigatorName]} ${navigatorAmount.toLocaleString()} ${navigatorName[0].toUpperCase()}${navigatorName.slice(1)} Navigator: **${essenceToAdd.toLocaleString()}** Essence\n`;
            }
        }

        totalEssence = Math.round(totalEssence);
        await database.addProp('economy', message.author.id, 1, 'navigate');

        // @ts-expect-error
        await database.addProp('economy', message.author.id, totalEssence, 'inventory.essence');
        await database.setProp('cooldown', message.author.id, Date.now(), 'navigate');

        navigateEmbed.setDescription(`Your navigators made you **${totalEssence.toLocaleString()}** Essence\n\n${totalText}`);
        navigateEmbed.setFooter('Yue');
        navigateEmbed.setTimestamp();
        utils.updateLevel(message.author.id, message, client);
    }
    message.channel.send(navigateEmbed);
};

export const help = {
    aliases: ['navigate', 'navi', 'navigator collect'],
    name: 'Navigate',
    cooldown: 1800000,
    description: 'Collect essence from your navigators every 45 minutes',
    usage: 'navigate',
    example: 'navigate',
};

export const config = {
    args: 0,
};
