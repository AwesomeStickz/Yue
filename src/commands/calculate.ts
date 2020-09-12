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

    const expression = args.join(' ');
    if (/[^-()\d/*+. ]/.test(expression)) return message.channel.send(calculatorEmbed.setDescription(`${emojis.tickNo} That's not a valid mathematical expression!`));

    let evaluatedExpression: number;

    try {
        evaluatedExpression = eval(expression);
    } catch (_) {
        return message.channel.send(calculatorEmbed.setDescription(`${emojis.tickNo} That's not a valid mathematical expression!`));
    }

    calculatorEmbed.setFooter('Yue');
    calculatorEmbed.setTimestamp();

    message.channel.send(calculatorEmbed.setDescription(`${expression} = ${evaluatedExpression}`));
};

export const help = {
    aliases: ['calculate', 'calc'],
    name: 'Calculate',
    description: 'Calculate a mathematical expression',
    usage: 'calculate <math expression>',
    example: 'calc (1+1)/2',
};

export const config = {
    args: 0,
    category: 'economy',
};
