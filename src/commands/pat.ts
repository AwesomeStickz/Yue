import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import superagent from 'superagent';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const patEmbed = embed({
        author: {
            image: message.author.displayAvatarURL(),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const user = await utils.getUser(args.join(' '), client, message.guild!);
    if (!user) return message.channel.send(patEmbed.setDescription(`${emojis.tickNo} I couldn't find that user`));

    const { body } = await superagent.get(`https://nekos.life/api/v2/img/pat`);
    const { url } = body;

    patEmbed.setFooter('Yue');
    patEmbed.setTimestamp();

    if (user.id === message.author.id) {
        patEmbed.setImage('https://media.giphy.com/media/Y4z9olnoVl5QI/giphy.gif');
        patEmbed.setAuthor(`${message.author.username} Patted ${message.author.username}.. Oh wait! You can't pat yourself!`, message.author.displayAvatarURL());
        message.channel.send(patEmbed);
    } else if (user.id === client.user!.id) {
        const { cooldown } = help;

        const lastPatYue = (await database.getProp('cooldown', message.author.id, 'pat')) || 0;
        const remainingCooldown = cooldown - (Date.now() - lastPatYue);
        const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

        if (remainingCooldown > 0) {
            message.channel.send(patEmbed.setDescription(`You patted me just before a min! Come back in ${time}!`));
        } else {
            const patMoney = Math.round(Math.random() * 25 + 25);

            await database.setProp('cooldown', message.author.id, Date.now(), 'pat');
            await database.addProp('economy', message.author.id, patMoney, 'balance');

            patEmbed.setAuthor(`${message.author.username} Patted ${user.username}`, message.author.displayAvatarURL());
            patEmbed.setDescription(`You gave me a head pat, here's **$${patMoney}**`);
            patEmbed.setImage(url);

            message.channel.send(patEmbed);
            utils.updateLevel(message.author.id, message, client);
        }
    } else {
        patEmbed.setAuthor(`${message.author.username} Patted ${user.username}`, message.author.displayAvatarURL());
        patEmbed.setImage(url);
        message.channel.send(patEmbed);
    }
};

export const help = {
    aliases: ['pat'],
    name: 'Pat',
    cooldown: 60000,
    description: 'Pat a user. You can also pat Yue every 1 min to get some money',
    usage: 'pat <user>',
    example: 'pat @Conor#0751\npat Yue#7352',
};

export const config = {
    args: 0,
    category: ['image', 'economy'],
};
