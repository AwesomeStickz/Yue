import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[]): Promise<Message | void> => {
    const user = await utils.getUser(args[0], client, message.guild!);
    if (!user)
        return message.channel.send(
            embed({
                color: message.guild?.me?.displayHexColor,
                desc: `${emojis.tickNo} I couldn't find that user!`,
            })
        );

    const luckSetEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const luckOptions = ['0%', '100%', 'default'];

    if (luckOptions.includes(args[1])) {
        if (args[1] === '0%') {
            database.setProp('economy', user.id, 0, 'luck');
        } else if (args[1] === '100%') {
            database.setProp('economy', user.id, 100, 'luck');
        } else if (args[1] === 'default') {
            database.deleteProp('economy', user.id, 'luck');
        }
        luckSetEmbed.setDescription(`${emojis.tickYes} ${user.toString()}'s luck has been set to **${args[1]}**`);
        return message.channel.send(luckSetEmbed);
    } else {
        luckSetEmbed.setDescription(`${emojis.tickNo} That's not a valid option! The valid options are \`0%\`, \`100%\`, \`default\``);
        return message.channel.send(luckSetEmbed);
    }
};

export const help = {
    aliases: ['luck set'],
    name: 'Luck Set',
    description: "Change someone's luck",
    usage: 'luck set <user> <luck %>',
    example: 'luck set @Conor#0751 0%\nluck set @Conor#0751 100%\nluck set @Conor#0751 default',
};

export const config = {
    args: 2,
    owner: true,
    category: 'economy',
};
