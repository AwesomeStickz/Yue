import { Client, Message } from 'discord.js';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (message: Message, client: Client, args: string[], prefix: string): Promise<Message | void> => {
    const user = (await utils.getUser(args.join(' '), client, message.guild!)) || message.author;
    const jobEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (user.bot) return message.channel.send(jobEmbed.setDescription(`${emojis.tickNo} Bots don't have jobs!`));

    const userJobs = (await database.getProp('economy', user.id, 'jobs')) || [];

    jobEmbed.setAuthor(`${user.id === message.author.id ? 'Your' : `${user.username}'s`} Jobs`, user.displayAvatarURL({ dynamic: true }));

    if (userJobs.length === 0) return message.channel.send(jobEmbed.setDescription(`${emojis.tickNo} ${user.id === message.author.id ? "You don't" : `${user.username} doesn't`} have any jobs! ${user.id === message.author.id ? `Use \`${prefix}job list\` to view the job list!` : ''}`));

    const totalJobList: string[] = [];
    userJobs.forEach((job: string) => totalJobList.push((utils.capitalize(job.split(' ')) as string[]).join(' ')));

    message.channel.send(jobEmbed.setDescription(totalJobList));
};

export const help = {
    aliases: ['jobs', 'job', 'myjob', 'myjobs'],
    name: 'Jobs',
    description: "View all the jobs you're in",
    usage: 'jobs',
    example: 'jobs',
};

export const config = {
    args: 0,
    category: 'economy',
};
