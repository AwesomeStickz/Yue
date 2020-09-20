import { Client, Message } from 'discord.js';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const calculatorEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Calculate',
        },
        color: message.guild?.me?.displayHexColor,
    });

    const expression = args.filter((arg) => arg !== '--no-comma').join(' ');
    if (/[^-()\d/*+. ]/.test(expression)) return message.channel.send(calculatorEmbed.setDescription(`${emojis.tickNo} That's not a valid mathematical expression!`));

    let evaluatedExpression: number;

    try {
        evaluatedExpression = eval(expression);
    } catch (_) {
        return message.channel.send(calculatorEmbed.setDescription(`${emojis.tickNo} That's not a valid mathematical expression!`));
    }

    calculatorEmbed.setFooter('Yue');
    calculatorEmbed.setTimestamp();

    message.channel.send(calculatorEmbed.setDescription(`${expression} = ${evaluatedExpression === Infinity ? 'Infinity' : args.find((arg) => arg.toLowerCase() === '--no-comma') ? BigInt(evaluatedExpression).toString() : BigInt(evaluatedExpression).toLocaleString()}`));
};

export const help = {
    aliases: ['calculate', 'calc'],
    name: 'Calculate',
    description: 'Calculate a mathematical expression. This sends the result with comma, you can use `--no-comma` option in end to get result without comma',
    usage: 'calculate <math expression>',
    example: 'calc (1+1)/2\ncalc 1000+2500 --no-comma',
};

export const config = {
    args: 0,
    category: 'economy',
};
