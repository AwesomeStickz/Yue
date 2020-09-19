import { Client, TextChannel } from 'discord.js';
import prettyMilliseconds from 'pretty-ms';
import { database } from '../utils/databaseFunctions';
import { embed } from '../utils/embed';
import { emojis } from '../utils/emojis';
import { utils } from '../utils/utils';

export const run = async (client: Client) => {
    const Ready = [
        `--------------------------------------------------------`,
        `Ready since :  ${new Date().toUTCString()}`,
        `Bot         :  ${client.user!.username}`,
        `Members     :  ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
        `Servers     :  ${client.guilds.cache.size}`,
        `--------------------------------------------------------`,
    ].join('\n');

    console.log(`[Ready]\n${Ready}`);

    client.user!.setStatus('idle');

    const changeStatus = () => {
        const status = [`${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} users`, ` ${client.guilds.cache.size.toLocaleString()} servers`];
        const random = status[Math.floor(Math.random() * status.length)];
        client.user!.setActivity(random, { type: 'WATCHING' });
    };

    const moneyDrop = async () => {
        const allGuildSettingsData: any = await database.all('guildsettings');
        let initalTime = 0;

        for (const guildSettingsData of allGuildSettingsData) {
            const moneyDropData = guildSettingsData.data.moneydrop;
            if (moneyDropData) {
                const moneyDropGuild = client.guilds.cache.get(moneyDropData.guildID);
                if (!moneyDropGuild) continue;

                const moneyDropChannel = moneyDropGuild.channels.cache.get(moneyDropData.channelID);
                if (!moneyDropChannel || !(moneyDropChannel instanceof TextChannel)) continue;
                if (!moneyDropChannel.permissionsFor(client.user!.id)?.has('SEND_MESSAGES')) continue;

                const moneyDropCode = utils.makeRandomCharacters(5);
                const moneyDropAmount = Math.round(Math.random() * 200 + 200);

                const moneyDropEmbed = embed({
                    author: {
                        image: client.user?.displayAvatarURL(),
                        name: 'Money Drop',
                    },
                    color: moneyDropGuild?.me?.displayHexColor,
                    desc: `A money drop of **$${moneyDropAmount.toLocaleString()}** has appeared, type \`${moneyDropCode}\` to claim it!`,
                    footer: 'Yue',
                    timestamp: true,
                });

                setTimeout(async () => {
                    await (moneyDropChannel as TextChannel).send(moneyDropEmbed);

                    const timeBotSentMoneyDrop = Date.now();

                    (moneyDropChannel as TextChannel)
                        .awaitMessages((msg) => !msg.author.bot && msg.content === moneyDropCode, { max: 1, time: 180000, errors: ['time'] })
                        .then(async (collected) => {
                            const respondedMember = collected.first()!.member;

                            await database.addProp('economy', respondedMember!.id, moneyDropAmount, 'balance');

                            try {
                                const timeUserSentReply = Date.now();
                                if (timeUserSentReply - timeBotSentMoneyDrop < 5000)
                                    (client.channels.cache.get('754715396329701407') as TextChannel).send(
                                        moneyDropEmbed.setDescription(`A money drop of **$${moneyDropAmount.toLocaleString()}** with code \`${moneyDropCode}\` was claimed by **${respondedMember?.user.tag}** (${respondedMember?.id}) within **${prettyMilliseconds(timeUserSentReply - timeBotSentMoneyDrop, { verbose: true })}**`)
                                    );
                            } catch {}

                            await moneyDropChannel.send(moneyDropEmbed.setDescription(`${emojis.tickYes} You've successfully claimed a money drop and received **$${moneyDropAmount.toLocaleString()}**`));
                        })
                        .catch((_) => _);
                }, (initalTime += 1000));
            }
        }
    };

    const sweepChannels = () => {
        client.channels.cache.sweep((channel) => channel.type !== 'text');
    };

    const removeBoosters = async () => {
        const allEconomyData: any = await database.all('economy');

        for (const economyData of allEconomyData) {
            const currentBoosters = economyData.data.boosters || [];
            if (currentBoosters.length > 0) {
                const newBoosters = currentBoosters.filter((booster: { name: string; endTime: number }) => booster.endTime > Date.now());
                if (currentBoosters.length !== newBoosters.length) {
                    newBoosters.length > 0 ? await database.setProp('economy', economyData.userid, newBoosters, 'boosters') : await database.deleteProp('economy', economyData.userid, 'boosters');
                }
            }
        }
    };

    setInterval(changeStatus, 20000);
    setInterval(moneyDrop, 300000);
    setInterval(sweepChannels, 300000);
    setInterval(removeBoosters, 60000);
};
