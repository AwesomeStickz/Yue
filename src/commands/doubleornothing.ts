import { Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';

export const run = async (message: Message): Promise<Message | void> => {
    const { cooldown } = help;

    const lastDon = tempCache.get(`don_${message.author.id}`) || 0;
    const time = prettyMs(cooldown - (Date.now() - lastDon), { secondsDecimalDigits: 0, verbose: true });

    if (cooldown - (Date.now() - lastDon) > 0) {
        message.channel.send(
            embed({
                author: {
                    image: message.author.displayAvatarURL(),
                    name: message.author.username,
                },
                color: message.guild?.me?.displayHexColor,
                desc: `${emojis.tickNo} This command is in cooldown! Come back in ${time}`,
            })
        );
    } else if (cooldown - (Date.now() - lastDon) <= 0) {
        tempCache.set(`don_${message.author.id}`, Date.now());

        const balance = (await database.getProp('economy', message.author.id, 'balance')) || 0;
        if (balance == 0)
            return message.channel.send(
                embed({
                    author: {
                        image: message.author.displayAvatarURL(),
                        name: message.author.username,
                    },
                    color: message.guild?.me?.displayHexColor,
                    desc: `${emojis.tickNo} You need at least **$1** to use this command!`,
                })
            );

        const donEmbed = embed({
            author: {
                image: message.author.displayAvatarURL(),
                name: message.author.username,
            },
            color: message.guild?.me?.displayHexColor,
            desc: `Do you want to bet **$${balance.toLocaleString()}** in the hope of doubling your money?`,
            footer: 'Are you sure you want to bet this (Yes or No)',
        });

        await message.channel.send(donEmbed);
        donEmbed.setFooter('');

        message.channel
            .awaitMessages((msg) => !msg.author.bot && msg.author.id === message.author.id, { max: 1, time: 10000, errors: ['time'] })
            .then(async (collected) => {
                const response = collected.first()?.content.toLowerCase();
                if ((response === 'yes' || response === 'y') && collected.first()?.author.id === message.author.id) {
                    donEmbed.setDescription('You bet all of your money and...');

                    const donMessage = await message.channel.send(donEmbed);
                    const rand = ['w', 'l'];
                    let result = rand[Math.floor(Math.random() * rand.length)];

                    const userLuck = await database.getProp('economy', message.author.id, 'luck');
                    if (userLuck == 0) result = 'l';
                    else if (userLuck == 100) result = 'w';

                    if (result === 'w') {
                        setTimeout(async () => {
                            donEmbed.setDescription(`You just doubled your money and got **+$${(balance * 2).toLocaleString()}** totally!`);
                            donMessage.edit(donEmbed);
                            await database.addProp('economy', message.author.id, balance, 'balance');
                            await database.addProp('economy', message.author.id, balance, 'winnings');
                        }, 2000);
                    } else {
                        setTimeout(async () => {
                            donEmbed.setDescription(`You just lost your bet money **-$${balance.toLocaleString()}**`);
                            donMessage.edit(donEmbed);
                            await database.deleteProp('economy', message.author.id, 'balance');
                            await database.subtractProp('economy', message.author.id, balance, 'winnings');
                        }, 2000);
                    }
                } else {
                    donEmbed.setDescription(`${emojis.tickYes} Cancelled double or nothing`);
                    message.channel.send(donEmbed);
                }
            })
            .catch(() =>
                message.channel.send(
                    embed({
                        color: message.guild?.me?.displayHexColor,
                        desc: `${emojis.tickYes} Cancelled double or nothing`,
                    })
                )
            );
    }
};

export const help = {
    aliases: ['doubleornothing', 'don', 'dn'],
    name: 'Double Or Nothing',
    description: 'Bet all of your money for a 50% chance of doubling your money or losing all',
    cooldown: 3000,
    usage: 'doubleornothing',
    example: 'doubleornothing',
};

export const config = {
    args: 0,
};
