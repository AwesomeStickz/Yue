import { Client, Message } from 'discord.js';

// @ts-expect-error
export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    if (message.author.id !== '228182903140515841') return;

    // @ts-expect-error
    const { db } = require('../database/index');

    const clean = (text: string) => {
        if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
        else return text;
    };

    try {
        const code = args.join(' ');
        let evaled = await eval(code);

        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
        if (evaled.includes(process.env.TOKEN)) return message.channel.send(`\`\`\`js\n${'NDM4NDM4MzgzMzY3MzU2NDE2.DjEOFg.Qhu4upnvn_C5feYz2wsdN09QKUI'}\`\`\``);

        message.channel.send(clean(evaled), { code: 'xl' });
    } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
};

export const help = {
    aliases: ['eval'],
    name: 'Eval',
    description: 'Eval',
    usage: 'eval <code>',
    example: 'eval console.log(true)',
};

export const config = {
    args: 1,
    owner: true,
    category: 'bot',
};
