import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const balance: number = (await database.getProp('economy', message.author.id, 'balance')) || 0;
    const bullets = Math.round(Number(args[0]));

    const rusrEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    let betString = args[1].toLowerCase();
    let bet = Number(betString);

    if (betString === 'all') bet = balance;
    else if (betString === 'half') bet = balance / 2;
    else if (betString === 'quarter') bet = balance / 4;
    else if (betString.endsWith('%')) bet = (Number(betString.slice(0, -1)) * balance) / 100;
    else if (isNaN(bet)) return message.channel.send(rusrEmbed.setDescription(`${emojis.tickNo} The bet must be a number`));

    if (isNaN(Number(bullets))) return message.channel.send(rusrEmbed.setDescription(`${emojis.tickNo} Number of bullets must be a number`));

    if (bullets >= 6 || bullets <= 0) return message.channel.send(rusrEmbed.setDescription(`${emojis.tickNo} Invalid number of bullets. 1-5 bullets only are allowed`));
    if (bet < 20) return message.channel.send(rusrEmbed.setDescription(`${emojis.tickNo} You should bet a minimum of $20`));
    if (bet > balance) return message.channel.send(rusrEmbed.setDescription(`${emojis.tickNo} You don't have enough balance`));

    bet = Math.round(bet);

    const multiplier = [1.15, 1.45, 1.9, 2.85, 5.7];
    const randomNumber = Math.round(Math.random() * 6);

    let money = Math.floor(bet * multiplier[bullets - 1]);
    let won: boolean;
    if (randomNumber >= 6 - bullets) won = false;
    else won = true;

    const userLuck = await database.getProp('economy', message.author.id, 'luck');
    if (userLuck == 0) won = false;
    else if (userLuck == 100) won = true;

    if (won === true) {
        await database.addProp('economy', message.author.id, money - bet, 'balance');
        await database.addProp('economy', message.author.id, money - bet, 'winnings');
        rusrEmbed.setDescription(`You won! You got **$${money.toLocaleString()}**`);
    } else {
        await database.subtractProp('economy', message.author.id, bet, 'balance');
        await database.subtractProp('economy', message.author.id, bet, 'winnings');
        rusrEmbed.setDescription(`You were shot 🔫 You lost your bet of **$${bet.toLocaleString()}** for medical expenses`);
    }
    message.channel.send(rusrEmbed);
};

export const help = {
    aliases: ['rusr'],
    name: 'Rusr',
    cooldown: 0,
    description: "You bet your money for a gun loaded with the number of bullets you choose and the gun is shot at you. If you didn't get shot, you win more else you lose your bet",
    usage: 'rusr <1/2/3/4/5> <amount>',
    example: 'rusr 3 1000\nrusr 5 all',
};

export const config = {
    args: 2,
    category: 'economy',
};
