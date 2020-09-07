import { Client, Message } from 'discord.js';
import prettyMs from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';

export const run = async (message: Message, client: Client): Promise<Message | void> => {
    const { cooldown } = help;

    const lastBeg = (await database.getProp('cooldown', message.author.id, 'work')) || 0;
    const remainingCooldown = cooldown - (Date.now() - lastBeg);
    const time = remainingCooldown > 1000 ? prettyMs(remainingCooldown, { secondsDecimalDigits: 0, verbose: true }) : `${(remainingCooldown / 1000).toFixed(1)} seconds`;

    const jobEmbed = embed({
        author: {
            image: client.user!.displayAvatarURL({ dynamic: true }),
            name: client.user!.username,
        },
        color: message.guild?.me?.displayHexColor,
    });

    if (remainingCooldown > 0) {
        jobEmbed.setDescription(`You worked just recently, don't try to work too much! Come back in ${time}`);
    } else {
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

        const userJobs = (await database.getProp('economy', message.author.id, 'jobs')) || [];
        let totalMoney = 0;

        for (const [jobName, jobAmount] of Object.entries(jobs)) {
            if (userJobs.includes(jobName.toLowerCase())) {
                totalMoney += Math.round(jobAmount * 0.01);
            }
        }

        await database.addProp('economy', message.author.id, totalMoney, 'balance');
        await database.setProp('cooldown', message.author.id, Date.now(), 'work');

        jobEmbed.setAuthor('Work', client.user!.displayAvatarURL({ dynamic: true }));
        jobEmbed.setDescription(`You worked and got **$${totalMoney.toLocaleString()}**`);
    }
    message.channel.send(jobEmbed);
};

export const help = {
    aliases: ['work', 'job work'],
    name: 'Work',
    description: 'Work every 5 minutes to get some money',
    cooldown: 300000,
    usage: 'work',
    example: 'work',
};

export const config = {
    args: 0,
    category: 'economy',
};
