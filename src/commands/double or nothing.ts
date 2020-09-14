import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;

    const lastDon = tempCache.get(`don_${message.author.id}`) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastDon);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    if (remainingCooldown > 0) {
        message.channel.send(
            embed({
                author: {
                    image: message.author.displayAvatarURL({ dynamic: true }),
                    name: message.author.username,
                },
                color: message.guild?.me?.displayHexColor,
                desc: `${emojis.tickNo} This command is in cooldown! Come back in ${time}`,
            })
        );
    } else {
        tempCache.set(`don_${message.author.id}`, Date.now());

        const balance = (await database.getProp('economy', message.author.id, 'balance')) || 0;
        if (balance == 0)
            return message.channel.send(
                embed({
                    author: {
                        image: message.author.displayAvatarURL({ dynamic: true }),
                        name: message.author.username,
                    },
                    color: message.guild?.me?.displayHexColor,
                    desc: `${emojis.tickNo} You need at least **$1** to use this command!`,
                })
            );

        const donEmbed = embed({
            author: {
                image: message.author.displayAvatarURL({ dynamic: true }),
                name: message.author.username,
            },
            color: message.guild?.me?.displayHexColor,
            desc: `Do you want to bet **$${balance.toLocaleString()}** in the hope of doubling your money?`,
            footer: 'Are you sure you want to bet this (Yes or No)',
        });

        const donMessage = await message.channel.send(donEmbed);
        donEmbed.setFooter('');

        message.channel
            .awaitMessages((msg) => !msg.author.bot && msg.author.id === message.author.id, { max: 1, time: 10000, errors: ['time'] })
            .then(async (collected) => {
                const response = collected.first()?.content.toLowerCase();
                if ((response === 'yes' || response === 'y') && collected.first()?.author.id === message.author.id) {
                    tempCache.set(`don_${message.author.id}`, Date.now());
                    await donMessage.edit(donEmbed.setDescription('You bet all of your money and...'));

                    const rand = ['w', 'l'];
                    let result = rand[Math.floor(Math.random() * rand.length)];

                    const userLuck = await database.getProp('economy', message.author.id, 'luck');
                    if (userLuck == 0) result = 'l';
                    else if (userLuck == 100) result = 'w';

                    if (result === 'w') {
                        setTimeout(async () => {
                            const balanceNow = (await database.getProp('economy', message.author.id, 'balance')) || 0;

                            if (balanceNow !== balance) donMessage.edit(donEmbed.setDescription(`${emojis.tickYes} Cancelled double or nothing because your balance is not the same as before!`));
                            else {
                                donMessage.edit(donEmbed.setDescription(`You just doubled your money and got **+$${(balance * 2).toLocaleString()}**`));

                                const lastGamble = tempCache.get(`gamble_${message.author.id}`) || 0;
                                if (Date.now() - lastGamble > 60000) {
                                    tempCache.set(`gamble_${message.author.id}`, Date.now());
                                    await utils.updateLevel(message, client);
                                }

                                await database.addProp('economy', message.author.id, balance, 'balance');
                                await database.addProp('economy', message.author.id, balance, 'winnings');
                            }
                        }, 2000);
                    } else {
                        setTimeout(async () => {
                            const balanceNow = (await database.getProp('economy', message.author.id, 'balance')) || 0;

                            if (balanceNow !== balance) donMessage.edit(donEmbed.setDescription(`${emojis.tickYes} Cancelled double or nothing because your balance is not the same as before!`));
                            else {
                                donMessage.edit(donEmbed.setDescription(`You just lost your bet money **-$${balance.toLocaleString()}**`));
                                await database.deleteProp('economy', message.author.id, 'balance');
                                await database.subtractProp('economy', message.author.id, balance, 'winnings');
                            }
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
    aliases: ['double or nothing', 'doubleornothing', 'don', 'dn'],
    name: 'Double Or Nothing',
    description: 'Bet all of your money for a 50% chance of doubling your money or losing all',
    cooldown: 3000,
    usage: 'double or nothing',
    example: 'double or nothing\ndon',
};

export const config = {
    args: 0,
    category: 'economy',
};
