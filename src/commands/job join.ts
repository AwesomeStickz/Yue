import { Client, Message } from 'discord.js';
import fuzzysort from 'fuzzysort';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { tempCache } from '../utils/tempCache';

export const run = async (message: Message, _client: Client, args: string[]): Promise<Message | void> => {
    const jobJoinEmbed = embed({
        author: {
            image: message.author.displayAvatarURL({ dynamic: true }),
            name: message.author.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    const lastPendingReply = tempCache.get(`pending_reply_${message.author.id}`) || 0;
    if (10000 - (Date.now() - lastPendingReply) > 0) return message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} A command is already waiting for your reply so please send a reply if you want to execute this command!`));

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

    const fuzzySortedJobsNames = fuzzysort.go(args.join(' '), Object.keys(jobs), { allowTypo: false, limit: 1, threshold: -5000 });

    const jobName = fuzzySortedJobsNames.total > 0 ? fuzzySortedJobsNames[0].target : null;
    if (!jobName) return message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} That's not a valid job!`));

    const userEconomyData = (await database.get('economy', message.author.id)) || {};
    const userBalance = userEconomyData.balance || 0;
    const userJobs = userEconomyData.jobs || [];
    const jobAmount = (jobs as any)[jobName];

    if (userBalance < jobAmount) return message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} You don't have enough money to join **${jobName}** job!`));
    if (userJobs.includes(jobName.toLowerCase())) return message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} You're already in that job!`));

    await message.channel.send(jobJoinEmbed.setDescription(`Type \`yes\` if you want to join **${jobName}** job`));
    tempCache.set(`pending_reply_${message.author.id}`, Date.now());
    message.channel
        .awaitMessages((msg) => !msg.author.bot && msg.author.id === message.author.id, { max: 1, time: 10000, errors: ['time'] })
        .then(async (collected) => {
            const response = collected.first()?.content.toLowerCase();
            if (response === 'yes' || response === 'y') {
                userJobs.push(jobName.toLowerCase());

                await database.setProp('economy', message.author.id, userJobs, 'jobs');
                await database.subtractProp('economy', message.author.id, jobAmount, 'balance');

                tempCache.delete(`pending_reply_${message.author.id}`);

                message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickYes} You've successfully joined **${jobName}** job!`));
            } else {
                tempCache.delete(`pending_reply_${message.author.id}`);
                message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} You didn't respond with \`yes\`!`));
            }
        })
        .catch(() => {
            tempCache.delete(`pending_reply_${message.author.id}`);
            message.channel.send(jobJoinEmbed.setDescription(`${emojis.tickNo} You didn't respond in time!`));
        });
};

export const help = {
    aliases: ['job join'],
    name: 'Job Join',
    description: 'Join a job from the job list',
    usage: 'job join <job name>',
    example: 'job join waiter\njob join casier',
};

export const config = {
    args: 1,
    category: 'economy',
};
