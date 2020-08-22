import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;

    const lastBeg = (await database.getProp('cooldown', message.author.id, 'beg')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastBeg);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const begEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: client.user!.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        begEmbed.setDescription(`You begged me a lot of times already! I'm not giving you money for the next **${time}**`);
    } else {
        let begMoney = Math.ceil(Math.random() * 150 + 100);

        await database.setProp('cooldown', message.author.id, Date.now(), 'beg');
        await database.addProp('economy', message.author.id, begMoney, 'balance');

        begEmbed.setDescription(`Take **$${begMoney}** and come back in 30 minutes`);
    }
    message.channel.send(begEmbed);
};

export const help = {
    aliases: ['beg'],
    name: 'Beg',
    description: 'Beg me for some money',
    cooldown: 1800000,
    usage: 'beg',
    example: 'beg',
};

export const config = {
    args: 0,
};
