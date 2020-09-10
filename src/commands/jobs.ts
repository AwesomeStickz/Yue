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

    const jobs = {
        Waiter: 600,
        Cashier: 1000,
        'Construction Labourer': 1850,
        Administration: 2400,
        'Marketing Manager': 3000,
        Nurse: 6200,
        Fireman: 8000,
        Carpenter: 10000,
        Electrician: 13000,
        Doctor: 32000,
        Engineer: 50000,
        'Architectural Engineer': 75000,
    };

    let totalMoney = 0;

    for (const [jobName, jobAmount] of Object.entries(jobs)) {
        if (userJobs.includes(jobName.toLowerCase())) {
            totalMoney += Math.round(jobAmount * 0.01);
        }
    }

    jobEmbed.setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
    jobEmbed.setFooter('Yue');
    jobEmbed.setTimestamp();

    message.channel.send(jobEmbed.setDescription(`${totalJobList.join('\n')}\n\nAmount you get from working: **$${totalMoney.toLocaleString()}**`));
};

export const help = {
    aliases: ['jobs', 'job', 'myjob', 'myjobs'],
    name: 'Jobs',
    description: "View all the jobs you're in",
    usage: 'jobs [user]',
    example: 'jobs\njobs @Conor#0751',
};

export const config = {
    args: 0,
    category: 'economy',
};
