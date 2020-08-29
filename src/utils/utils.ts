import { Client, Guild, Message } from 'discord.js';
import lodash from 'lodash';
import { aliases, commands } from './commandsAndAliases';
import { database } from './databaseFunctions';
import { embed } from './embed';

export const utils = {
    capitalize(arg: string) {
        return arg.charAt(0).toUpperCase() + arg.slice(1);
    },
    async getBankCapacity(userid: string) {
        const bankCapacities = [100, 150, 250, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500, 10000, 15000, 20000, 25000, 32000, 40000, 50000, 65000, 80000, 100000, 125000, 150000, 200000, 250000, 350000, 500000, 650000, 825000, 1000000];
        const userBankCapacity = await database.getProp('economy', userid, 'bankcapacity');

        if (userBankCapacity) return userBankCapacity;

        const userLevelData = (await database.getProp('economy', userid, 'level')) || {};
        const userLevel = userLevelData.level || 0;

        return bankCapacities[userLevel];
    },
    getMember(arg: string, guild: Guild) {
        if (arg?.length < 1 || arg == undefined) return undefined;
        let member = guild.members.cache.get(arg);
        if (!member) member = guild.members.cache.find((m) => m.user.username.toLowerCase() === arg.toLowerCase());
        if (!member) member = guild.members.cache.filter((m) => m.user.username.toLowerCase().includes(arg.toLowerCase())).first();
        if (!member) member = guild.members.cache.filter((m) => m.user.tag.toLowerCase() === arg.toLowerCase()).first();
        if (!member) member = guild.members.cache.get(arg.slice(3, -1));
        if (!member) member = guild.members.cache.get(arg.slice(2, -1));
        if (member) return member;
        else return undefined;
    },
    async getNetworth(userid: string) {
        const economyData = (await database.get('economy', userid)) || {};
        let networth = 0;

        if (economyData.balance) networth += economyData.balance;
        if (economyData.bank) networth += economyData.bank;
        if (economyData.inventory) {
            const { inventory } = economyData;

            if (inventory.essence) networth += inventory.essence * 25;

            if (inventory.houses) {
                const { houses } = inventory;

                const allHousePrices = {
                    mud: 22500,
                    tent: 50000,
                    caravan: 75000,
                    shack: 280000,
                    apartment: 500000,
                    bungalow: 5000000,
                    house: 10000000,
                    penthouse: 15000000,
                    mansion: 30000000,
                };

                for (const [houseName, housePrice] of Object.entries(allHousePrices)) {
                    if (houses[houseName]) {
                        networth += houses[houseName] * housePrice;
                    }
                }
            }
            if (inventory.navigators) {
                const { navigators } = inventory;

                const allNavigatorPrices = {
                    iron: 500,
                    bronze: 1250,
                    silver: 4500,
                    gold: 17500,
                    platinum: 90000,
                    diamond: 500000,
                };

                for (const [navigatorName, navigatorPrice] of Object.entries(allNavigatorPrices)) {
                    if (navigators[navigatorName]) {
                        networth += navigators[navigatorName] * navigatorPrice;
                    }
                }
            }
            if (inventory.shops) {
                const { shops } = inventory;

                const allShopPrices = {
                    flower: 500,
                    taco: 3500,
                    burger: 10000,
                    pizza: 17500,
                    barber: 25000,
                    optician: 50000,
                    chemist: 75000,
                    butcher: 100000,
                    baker: 150000,
                    shoe: 300000,
                    clothes: 500000,
                    book: 1000000,
                    grocery: 2500000,
                    diy: 5000000,
                    toy: 10000000,
                    music: 25000000,
                    jewelry: 50000000,
                    plane: 100000000,
                };

                for (const [shopName, shopPrice] of Object.entries(allShopPrices)) {
                    if (shops[shopName]) {
                        networth += shops[shopName] * shopPrice;
                    }
                }
            }
            if (inventory.workers) {
                const { workers } = inventory;

                const allWorkerPrices = {
                    flower: 165,
                    taco: 1160,
                    burger: 3000,
                    pizza: 5800,
                    barber: 8300,
                    optician: 16500,
                    chemist: 25000,
                    butcher: 30000,
                    baker: 50000,
                    shoe: 100000,
                    clothes: 165000,
                    book: 300000,
                    grocery: 830000,
                    diy: 1650000,
                    toy: 3000000,
                    music: 8300000,
                    jewelry: 16500000,
                    plane: 30000000,
                };

                for (const [workerName, workerPrice] of Object.entries(allWorkerPrices)) {
                    if (workers[workerName]) {
                        networth += workers[workerName] * workerPrice;
                    }
                }
            }
        }
        return networth;
    },
    async getUser(arg: string, client: Client, guild?: Guild) {
        if (arg?.length < 1 || arg == undefined) return undefined;
        let user = guild ? this.getMember(arg, guild)?.user : undefined;
        if (!user) user = client.users.cache.find((u) => u.username.toLowerCase() === arg.toLowerCase());
        if (!user) user = client.users.cache.filter((u) => u.username.toLowerCase().includes(arg.toLowerCase())).first();
        if (!user) user = client.users.cache.filter((u) => u.tag.toLowerCase() === arg.toLowerCase()).first();
        if (!user && /[0-9]{17,20}/.test(arg)) {
            arg = /[0-9]{17,20}/.exec(arg)![0];
            if (!user) user = client.users.cache.get(arg);
            if (!user) user = await client.users.fetch(arg);
        }
        if (user) return user;
        else return undefined;
    },
    async help(commandName: string, client: Client, message: Message) {
        const commandInfo: any = commands.get(aliases.get(commandName));
        if (!commandInfo) return;

        const helpEmbed = embed({
            author: {
                image: client.user?.displayAvatarURL(),
                name: commandInfo.help.name,
            },
            color: message.guild?.me?.displayHexColor,
            fields: [
                { name: 'Description', value: commandInfo.help.description },
                { name: 'Usage', value: commandInfo.help.usage },
                { name: 'Example', value: commandInfo.help.example },
            ],
            footer: 'Yue',
            timestamp: true,
            thumbnail: client.user!.displayAvatarURL(),
        });

        if (commandInfo.config.owner === true) return;
        if (commandInfo.help.aliases.length > 1) helpEmbed.addField('Aliases', `\`${commandInfo.help.aliases.filter((alias: string) => alias !== commandName.toLowerCase()).join('`, `')}\``);

        return helpEmbed;
    },
    async updateLevel(userid: string, message: Message, client: Client) {
        const userLevelData = (await database.getProp('economy', userid, 'level')) || {};
        const randomXP = Math.round(Math.random() * 20 + 20);

        const userLevel = userLevelData.level || 0;
        const currentXP = userLevelData.xp ? userLevelData.xp + randomXP : 0;
        const nextLevelXP = Math.round((5 / 6) * (userLevel + 1) * (2 * (userLevel + 1) * (userLevel + 1) + 27 * (userLevel + 1) + 91));

        if (currentXP >= nextLevelXP) {
            // @ts-expect-error
            await database.setProp('economy', userid, currentXP - nextLevelXP, 'level.xp');
            // @ts-expect-error
            await database.addProp('economy', userid, 1, 'level.level');

            const newLevel = userLevel + 1;
            const workerSlots = newLevel === 1 ? 2 : newLevel * 4;
            const otherSlots = newLevel === 1 ? 1 : newLevel * 2;
            const levelUpEmbed = embed({
                author: {
                    image: client.user?.displayAvatarURL(),
                    name: 'Level Up!',
                },
                color: message.guild?.me?.displayHexColor,
                desc: `You advanced to level **${newLevel}**!\n**Unlocked**: \`${workerSlots.toLocaleString()} worker slots\`, \`${otherSlots.toLocaleString()} house slots\`, \`${otherSlots.toLocaleString()} navigator slots\`, \`${otherSlots.toLocaleString()} shop slots\`!`,
            });

            message.channel.send(levelUpEmbed);
            const userSlots = (await database.getProp('economy', userid, 'inventory.slots')) || {};

            lodash.set(userSlots, 'houses', isNaN(userSlots.houses) ? otherSlots + 1 : Number(userSlots.houses) + otherSlots);
            lodash.set(userSlots, 'navigators', isNaN(userSlots.navigators) ? otherSlots + 1 : Number(userSlots.navigators) + otherSlots);
            lodash.set(userSlots, 'shops', isNaN(userSlots.shops) ? otherSlots + 1 : Number(userSlots.shops) + otherSlots);
            lodash.set(userSlots, 'workers', isNaN(userSlots.workers) ? workerSlots + 2 : Number(userSlots.workers) + workerSlots);

            await database.setProp('economy', userid, userSlots, 'inventory.slots');
        } else {
            // @ts-expect-error
            await database.addProp('economy', userid, randomXP, 'level.xp');
        }

        // @ts-expect-error
        await database.addProp('economy', message.author.id, randomXP, 'level.totalXp');
    },
};
