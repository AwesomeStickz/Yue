import { Client, Guild, Message } from 'discord.js';
import lodash from 'lodash';
import { aliases, commands } from './commandsAndAliases';
import { database } from './databaseFunctions';
import { embed } from './embed';

export const utils = {
    capitalize(arg: string | string[]) {
        if (Array.isArray(arg)) {
            const capitalizedArgs: (string | any[])[] = [];

            arg.forEach((arg) => capitalizedArgs.push(this.capitalize(arg)));

            return capitalizedArgs;
        } else return arg.charAt(0).toUpperCase() + arg.slice(1);
    },
    async getBankCapacity(userid: string) {
        const userBankCapacityThatWasBought = (await database.getProp('economy', userid, 'bankcapacity')) || 0;
        const userLevelData = (await database.getProp('economy', userid, 'level')) || {};
        const userLevel = userLevelData.level || 0;
        const userBankCapacityLevel = this.getBankCapacityOfLevel(userLevel);

        return userBankCapacityThatWasBought + userBankCapacityLevel;
    },
    getBankCapacityOfLevel(level: number) {
        const bankCapacities = [100, 150, 250, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500, 10000, 15000, 20000, 25000, 32000, 40000, 50000, 65000, 80000, 100000, 125000, 150000, 200000, 250000, 350000, 500000, 650000, 825000, 1000000, 1250000, 1500000, 2000000, 2500000, 3000000, 3750000, 5000000, 6000000, 7500000, 8000000, 10000000, 11500000, 13000000, 15000000, 17500000, 20000000, 22500000, 25000000, 30000000, 37500000 ];
        return bankCapacities[level];
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
    async getSlots(userid: string) {
        const userSlotsThatWasBought = (await database.getProp('economy', userid, 'inventory.slots')) || {};
        const userLevelData = (await database.getProp('economy', userid, 'level')) || {};
        const userLevel = userLevelData.level || 0;
        const userLevelSlots = await this.getSlotsOfLevel(userLevel);

        return {
            houses: (userSlotsThatWasBought.houses ?? 0) + (userLevelSlots.houses ?? 0),
            navigators: (userSlotsThatWasBought.navigators ?? 0) + (userLevelSlots.navigators ?? 0),
            shops: (userSlotsThatWasBought.shops ?? 0) + (userLevelSlots.shops ?? 0),
            workers: (userSlotsThatWasBought.workers ?? 0) + (userLevelSlots.workers ?? 0),
        };
    },
    async getSlotsOfLevel(level: number) {
        const otherSlots = [1, 2, 5, 8, 12, 18, 30, 45, 60, 75, 100, 125, 150, 200, 250, 300, 350, 450, 600, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3300, 3600, 3900, 4250, 4700, 5200, 5700, 6300, 7000, 7750, 8500, 9250, 10000, 11000, 12000, 13000, 14000, 15000, 16500, 18000, 19500, 21000];
        const workerSlots = [2, 5, 8, 12, 18, 30, 45, 60, 75, 100, 125, 150, 200, 250, 300, 350, 450, 600, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000, 3300, 3600, 3900, 4250, 4700, 5200, 5700, 6300, 7000, 7750, 8500, 9250, 10000, 11000, 12000, 13000, 14000, 15000, 16500, 18000, 19500, 21000];

        return {
            houses: otherSlots[level],
            navigators: otherSlots[level],
            shops: otherSlots[level],
            workers: workerSlots[level],
        };
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
        const commandInfo: any = commands.get(aliases.get(commandName.toUpperCase()));
        if (!commandInfo) return;

        const helpEmbed = embed({
            author: {
                image: client.user?.displayAvatarURL({ dynamic: true }),
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
            thumbnail: client.user!.displayAvatarURL({ dynamic: true }),
        });

        if (commandInfo.config.owner === true) return;
        if (commandInfo.help.aliases.length > 1) helpEmbed.addField('Aliases', `\`${commandInfo.help.aliases.filter((alias: string) => alias !== commandName.toLowerCase()).join('`, `')}\``);

        return helpEmbed;
    },
    async updateLevel(message: Message, client: Client) {
        const userLevelData = (await database.getProp('economy', message.author.id, 'level')) || {};
        const randomXP = Math.round(Math.random() * 20 + 20);

        const userLevel = userLevelData.level || 0;
        const currentXP = userLevelData.xp ? userLevelData.xp + randomXP : randomXP;
        const nextLevelXP = Math.round((5 / 6) * (userLevel + 1) * (2 * (userLevel + 1) * (userLevel + 1) + 27 * (userLevel + 1) + 91));

        if (currentXP >= nextLevelXP) {
            lodash.set(userLevelData, 'xp', currentXP - nextLevelXP);
            lodash.set(userLevelData, 'totalXp', userLevelData.totalXp + randomXP);
            lodash.set(userLevelData, 'level', userLevel + 1);

            await database.setProp('economy', message.author.id, userLevelData, 'level');

            const newLevel = userLevel + 1;
            const previousSlots = await this.getSlotsOfLevel(userLevel);
            const newSlots = await this.getSlotsOfLevel(userLevel + 1);
            const previousBankCapacity = await this.getBankCapacityOfLevel(userLevel);
            const newBankCapacity = await this.getBankCapacityOfLevel(userLevel + 1);

            const levelUpEmbed = embed({
                author: {
                    image: client.user?.displayAvatarURL({ dynamic: true }),
                    name: 'Level Up!',
                },
                color: message.guild?.me?.displayHexColor,
                desc: `You advanced to level **${newLevel}**!\n**Unlocked**: \`${(newBankCapacity - previousBankCapacity).toLocaleString()} bank capacity\`, \`${(previousSlots.workers - newSlots.workers).toLocaleString()} worker slots\`, \`${(previousSlots.houses - newSlots.houses).toLocaleString()} house slots\`, \`${(
                    previousSlots.navigators - newSlots.navigators
                ).toLocaleString()} navigator slots\`, \`${(previousSlots.shops - newSlots.shops).toLocaleString()} shop slots\`!`,
            });

            message.channel.send(levelUpEmbed);
        } else {
            lodash.set(userLevelData, 'xp', currentXP);
            lodash.set(userLevelData, 'totalXp', (userLevelData.totalXp ?? 0) + randomXP);

            await database.setProp('economy', message.author.id, userLevelData, 'level');
        }
    },
};
