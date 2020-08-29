import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';

export const run = async (message: Message, client: Client, args: string[], prefix: string): Promise<Message | void> => {
    const getStartedEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Get Started',
        },
        color: message.guild?.me?.displayHexColor,
        footer: 'Execute the above command to continue',
    });

    const { cooldown } = help;
    const lastGetStarted = tempCache.get(`getstarted_${message.author.id}`) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastGetStarted);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    if (remainingCooldown > 0) {
        getStartedEmbed.setFooter('');
        message.channel.send(getStartedEmbed.setDescription(`${emojis.tickNo} This command is in cooldown! Come back in ${time}!`));
    } else {
        tempCache.set(`getstarted_${message.author.id}`, Date.now());
        await database.setProp('economy', message.author.id, true, 'getstarted');

        if (args[0] === 'skip') {
            const finishedGetStarted = await database.getProp('economy', message.author.id, 'getstarted');
            if (!finishedGetStarted) {
                // @ts-expect-error
                await database.addProp('economy', message.author.id, 1, 'inventory.houses.mud');
            }

            getStartedEmbed.setFooter('');
            getStartedEmbed.setDescription(`Congratulations 🎉 on finishing get started! ${finishedGetStarted === true ? `You already completed get started once so you didn't get a mud house for completing this!` : `You got a mud house as a reward, you can do \`${prefix}house collect\` to get some money!`}`);

            message.channel.send(getStartedEmbed);
        } else {
            const allCommands = [
                'daily',
                'weekly',
                'beg',
                [`pat <@${client.user?.id}>`, `pat <@!${client.user?.id}>`],
                'shop shop',
                'shop buy flower shop 1',
                'shop collect',
                'shop worker',
                'shop buy flower worker 1',
                'tip collect',
                'shop navigator',
                'shop buy iron navigator 1',
                'navigate',
                'essence sell all',
                'shop slot',
                'slots buy worker 1',
                'capacity buy 1',
                'bal',
                'bank',
                'deposit 100',
                'withdraw 100',
            ];

            const allCommandsDescription = [
                'Collect your daily bonus',
                'Collect your weekly bonus',
                'Beg every 1 minute to get some money',
                'Pat me every 1 minute to get some money',
                'View the list of all shops',
                'Buy flower shop from shop',
                'Collect money from your shops',
                'View the list of all worker',
                'Buy flower worker from shop',
                'Collect tips from your workers',
                'View the list of all navigator',
                'Buy iron navigator from shop',
                'Collect essence from your navigators',
                'Sell all your essences for money',
                'View the list of all slots',
                'Buy worker slot from shop',
                'Buy bank capacity',
                'View your balance',
                'View your bank balance',
                'Deposit money to your bank',
                'Withdraw money from your bank',
            ];

            let numberOfTimesFailed = 0;

            const awaitMessage = (commandIndex: number) => {
                getStartedEmbed.setDescription(`${Array.isArray(allCommands[commandIndex]) ? `${prefix}${allCommands[commandIndex][0]}` : `${prefix}${allCommands[commandIndex]}`} - ${allCommandsDescription[commandIndex]}`);
                message.channel.send(getStartedEmbed);
                allCommands[commandIndex];
                message.channel
                    .awaitMessages((msg) => !msg.author.bot && msg.author.id === message.author.id, { max: 1, time: 20000, errors: ['time'] })
                    .then(async (collected) => {
                        const response = collected.first()?.content.toLowerCase();
                        if (Array.isArray(allCommands[commandIndex]) ? allCommands[commandIndex].includes(response?.slice(prefix.length)!) : response === `${prefix}${allCommands[commandIndex]}` && collected.first()?.author.id === message.author.id) {
                            if (commandIndex === allCommands.length - 1) {
                                const finishedGetStarted = await database.getProp('economy', message.author.id, 'getstarted');

                                getStartedEmbed.setFooter('');
                                getStartedEmbed.setDescription(`Congratulations 🎉 on finishing get started! ${finishedGetStarted === true ? `You already completed get started once so you didn't get a mud house for completing this!` : `You got a mud house as a reward, you can do \`${prefix}house collect\` to get some money!`}`);

                                if (!finishedGetStarted) {
                                    // @ts-expect-error
                                    await database.addProp('economy', message.author.id, 1, 'inventory.houses.mud');
                                }
                                return message.channel.send(getStartedEmbed);
                            } else {
                                numberOfTimesFailed = 0;
                                return setTimeout(() => awaitMessage(commandIndex + 1), 500);
                            }
                        } else {
                            if (numberOfTimesFailed === 2) {
                                getStartedEmbed.setFooter('');
                                return message.channel.send(getStartedEmbed.setDescription(`${emojis.tickNo} Cancelled get started as you have sent too many wrong inputs!`));
                            }

                            numberOfTimesFailed++;
                            return awaitMessage(commandIndex);
                        }
                    })
                    .catch(() => message.channel.send(getStartedEmbed.setDescription(`${emojis.tickNo} Response Timed Out!`)));
            };

            awaitMessage(0);
        }
    }
};

export const help = {
    aliases: ['get started', 'getstarted'],
    name: 'Get Started',
    cooldown: 300000,
    description: "Whilst using this command, it will take you through a broad spectrum of commands that are in the bot. Once, you've understood all the commands, this will in-return give you a mud house to gain money. You can also skip using `get started skip` to skip the whole process if you have an understanding of how it works and claim your mud house",
    usage: 'get started',
    example: 'get started\nget started skip',
};

export const config = {
    args: 0,
    category: 'economy',
};
