import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const member = utils.getMember(args[0], message.guild!);
    const rpsEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (!member) return message.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (member.user.bot) return message.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} You can't play rps with bots!`));

    const amountString = args[1]?.toLowerCase();
    let amount = Number(amountString);

    if (amountString) {
        const authorBalance = (await database.getProp('economy', message.author.id, 'balance')) || 0;
        const userBalance = (await database.getProp('economy', member.id, 'balance')) || 0;

        if (amountString === 'all') amount = authorBalance;
        else if (amountString === 'half') amount = authorBalance / 2;
        else if (amountString === 'quarter') amount = authorBalance / 4;
        else if (amountString.endsWith('%')) amount = (Number(amountString.slice(0, -1)) * authorBalance) / 100;

        if (isNaN(amount)) return message.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} Your bet is not a number!`));

        amount = Math.round(Number(amount));

        if (amount > authorBalance) return message.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} You don't have **$${amount.toLocaleString()}**!`));
        if (amount > userBalance) return message.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} ${member.toString()} doesn't have **$${amount.toLocaleString()}**!`));
    }

    message.channel.send(rpsEmbed.setDescription(`${member.toString()} Type \`yes\` to play Rock Paper Scissors with ${message.author.toString()} ${!isNaN(amount) ? `for **$${amount}**` : ''}`));
    message.channel
        .awaitMessages((msg) => !msg.author.bot && msg.author.id === member.id, { max: 1, time: 20000, errors: ['time'] })
        .then(async (collected) => {
            const response = collected.first()?.content.toLowerCase();
            if ((response === 'yes' || response === 'y') && collected.first()?.author.id === member.id) {
                let memberChoice = '';
                let authorChoice = '';

                let memberChoiceEmoji = '';
                let authorChoiceEmoji = '';

                rpsEmbed.setAuthor('');
                rpsEmbed.setTitle('Rock Paper Scissors');
                message.channel.send(rpsEmbed.setDescription(`I have sent a message to **${member.toString()}**. Once they've responded, I will send a message to **${message.author.toString()}**`));

                const dmMessageOfMember = await member.send(rpsEmbed.setDescription(`Respond with Rock ${emojis.rock}, Paper ${emojis.paper} or Scissors ${emojis.scissors}`));
                dmMessageOfMember.channel
                    .awaitMessages((msg) => msg.author.id === member.id, { max: 1, time: 20000, errors: ['time'] })
                    .then(async (collected) => {
                        const response = collected.first()?.content.toLowerCase();
                        if (response === 'rock' || response === 'paper' || response === 'scissors') {
                            memberChoice = response;
                            memberChoiceEmoji = memberChoice === 'rock' ? emojis.rock : memberChoice === 'paper' ? emojis.paper : emojis.scissors;

                            dmMessageOfMember.channel.send(rpsEmbed.setDescription(`Your answer has been locked in! Waiting on a response from ${message.author.toString()}. Results will be sent in ${message.channel.toString()}`));

                            const dmMessageOfAuthor = await message.author.send(rpsEmbed.setDescription(`Respond with Rock ${emojis.rock}, Paper ${emojis.paper} or Scissors ${emojis.scissors}`));
                            dmMessageOfAuthor.channel
                                .awaitMessages((msg) => msg.author.id === message.author.id, { max: 1, time: 20000, errors: ['time'] })
                                .then(async (collected) => {
                                    const response = collected.first()?.content.toLowerCase();
                                    if (response === 'rock' || response === 'paper' || response === 'scissors') {
                                        authorChoice = response;
                                        authorChoiceEmoji = authorChoice === 'rock' ? emojis.rock : authorChoice === 'paper' ? emojis.paper : emojis.scissors;

                                        dmMessageOfAuthor.channel.send(`Your answer has been locked in! Results have been sent to ${message.channel.toString()}`);

                                        let authorWonRPS = false;
                                        let isDraw = false;

                                        if (authorChoice === 'rock' && memberChoice === 'scissors') authorWonRPS = true;
                                        else if (authorChoice === 'scissors' && memberChoice === 'paper') authorWonRPS = true;
                                        else if (authorChoice === 'paper' && memberChoice === 'rock') authorWonRPS = true;
                                        else if (authorChoice === memberChoice) isDraw = true;

                                        if (authorWonRPS) {
                                            message.channel.send(rpsEmbed.setDescription(`${member.toString()} chose ${memberChoiceEmoji}\n${message.author.toString()} chose ${authorChoiceEmoji}\n\n${message.author.toString()} won ${isNaN(amount) ? 'the Rock Paper Scissors!' : `**$${amount.toLocaleString()}**`}`));
                                            await database.addProp('economy', message.author.id, amount, 'balance');
                                            await database.subtractProp('economy', member.id, amount, 'balance');
                                        } else if (isDraw) {
                                            message.channel.send(rpsEmbed.setDescription(`${member.toString()} chose ${memberChoiceEmoji}\n${message.author.toString()} chose ${authorChoiceEmoji}\n\nThe game has ended in a tie!`));
                                            await database.addProp('economy', member.id, amount, 'balance');
                                            await database.subtractProp('economy', message.author.id, amount, 'balance');
                                        } else if (!authorWonRPS) message.channel.send(rpsEmbed.setDescription(`${member.toString()} chose ${memberChoiceEmoji}\n${message.author.toString()} chose ${authorChoiceEmoji}\n\n${member.toString()} won ${isNaN(amount) ? 'the Rock Paper Scissors!' : `**$${amount.toLocaleString()}**`}`));
                                    } else {
                                        dmMessageOfAuthor.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} That's not a valid input!`));
                                        message.channel.send(`${emojis.tickNo} ${message.author.toString()} didn't send a correct input!`);
                                    }
                                })
                                .catch(() => {
                                    dmMessageOfAuthor.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} You didn't respond in time!`));
                                    message.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} ${message.author.toString()} didn't respond in time!`));
                                });
                        } else {
                            dmMessageOfMember.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} That's not a valid input!`));
                            message.channel.send(`${emojis.tickNo} ${member.toString()} didn't send a correct input!`);
                        }
                    })
                    .catch(() => {
                        dmMessageOfMember.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} You didn't respond in time!`));
                        message.channel.send(rpsEmbed.setDescription(`${emojis.tickNo} ${member.toString()} didn't respond in time!`));
                    });
            } else {
                message.channel.send(rpsEmbed.setDescription(`${emojis.tickYes} Cancelled`));
            }
        })
        .catch(() => message.channel.send(rpsEmbed.setDescription(`${emojis.tickYes} Cancelled`)));
};

export const help = {
    aliases: ['rps'],
    name: 'Rock Paper Scissors',
    description: 'Play Rock Paper Scissors with a user',
    usage: 'rps <user> [amount]',
    example: 'rps @Conor#0751',
};

export const config = {
    args: 1,
};
