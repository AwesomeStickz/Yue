import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const { cooldown } = help;

    const lastRep = (await database.getProp('cooldown', message.author.id, 'rep')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastRep);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const repEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL(),
            name: 'Rep',
        },
        color: message.guild?.me?.displayHexColor,
    });

    const user = await utils.getUser(args.join(' '), client, message.guild!);
    if (!user) return message.channel.send(repEmbed.setDescription(`${emojis.tickNo} I couldn't find that user!`));
    if (user.bot) return message.channel.send(repEmbed.setDescription(`${emojis.tickNo} You can't rep bots!`));
    if (user.id === message.author.id) return message.channel.send(repEmbed.setDescription(`${emojis.tickNo} You can't rep yourself!`));

    if (lastRep !== null && cooldown - (Date.now() - lastRep) > 0) {
        message.channel.send(repEmbed.setDescription(`You already gave rep to someone! Come back in ${time}!`));
    } else {
        await database.setProp('cooldown', message.author.id, Date.now(), 'rep');
        await database.addProp('economy', user.id, 1, 'rep');

        message.channel.send(repEmbed.setDescription(`You gave a reputation to ${user.toString()}!`));
        utils.updateLevel(message, client);
    }
};

export const help = {
    aliases: ['rep'],
    name: 'Rep',
    cooldown: 86400000,
    description: 'Give rep to a user',
    usage: 'rep <user>',
    example: 'rep @Conor#0751',
};

export const config = {
    args: 1,
    category: 'economy',
};
