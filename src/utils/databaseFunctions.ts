import lodash from 'lodash';
import sequelize from '../database/sequelize';

type DatbaseModelNames = 'blacklist' | 'cooldown' | 'economy' | 'guildsettings' | 'yue';
type PropertyNames = 'balance' | 'bank' | 'bankcapacity' | 'beg' | 'essence' | 'daily' | 'don' | 'getstarted' | 'getstartedhouse' | 'inventory' | 'inventory.slots' | 'level' | 'luck' | 'navigate' | 'networth' | 'owners' | 'pat' | 'prefix' | 'rentcollect' | 'rep' | 'rob' | 'robbed' | 'shopcollect' | 'streak' | 'tipcollect' | 'weekly' | 'winnings';

export const database = {
    async all(model: DatbaseModelNames): Promise<object[]> {
        const total = await sequelize.models[model].findAll({ attributes: ['userid', 'data'], raw: true });
        return total;
    },

    async delete(model: DatbaseModelNames, userid: string) {
        const deleted = await sequelize.models[model].destroy({ force: true, where: { userid } });

        if (deleted !== 0) return true;
        else return false;
    },

    async deleteProp(model: DatbaseModelNames, userid: string, prop: PropertyNames) {
        const exist = (await this.get(model, userid)) || {};
        lodash.unset(exist, prop);

        if (Object.values(exist).length > 0) return await this.set(model, userid, exist);
        else return await this.delete(model, userid);
    },

    async get(model: DatbaseModelNames, userid: string) {
        const result: any = (await sequelize.models[model].findOne({ attributes: ['data'], raw: true, where: { userid } })) || { data: null };

        return result.data;
    },

    async getProp(model: DatbaseModelNames, userid: string, prop: PropertyNames) {
        const result: any = (await sequelize.models[model].findOne({ attributes: ['data'], raw: true, where: { userid } })) || { data: null };

        return lodash.get(result.data, prop);
    },

    async set(model: DatbaseModelNames, userid: string, data: any) {
        let exist = await this.get(model, userid);
        if (exist === 0 || exist === '') exist = true;

        if (exist) await sequelize.models[model].update({ data }, { where: { userid } });
        else await sequelize.models[model].create({ userid, data });
    },

    async setProp(model: DatbaseModelNames, userid: string, data: any, prop: PropertyNames) {
        let exist = await this.get(model, userid);
        if (exist === 0 || exist === '') exist = true;
        if (typeof exist !== 'object' || exist == null) exist = {};

        const obj = lodash.set(exist, prop, data);

        await this.set(model, userid, obj);
    },

    async add(model: DatbaseModelNames, userid: string, number: number | string) {
        let exist = await this.get(model, userid);
        if (exist === 0 || exist === '') exist = true;

        number = Number(number);

        if (exist) await sequelize.models[model].increment(['data'], { by: number, where: { userid } });
        else await sequelize.models[model].create({ userid, data: number });
    },

    async addProp(model: DatbaseModelNames, userid: string, number: number | string, prop: PropertyNames) {
        let exist = (await this.get(model, userid)) || {};
        if (exist === 0 || exist === '') exist = true;

        number = Number(number);

        const previous = lodash.get(exist, prop) || 0;
        const obj = lodash.set(exist, prop, previous + number);

        await this.set(model, userid, obj);
    },

    async subtract(model: DatbaseModelNames, userid: string, number: number | string) {
        let exist = await this.get(model, userid);
        if (exist === 0 || exist === '') exist = true;

        number = Number(number);

        if (exist) await (sequelize.models[model] as any).decrement(['data'], { by: number, where: { userid } });
        else await sequelize.models[model].create({ userid, data: -number });
    },

    async subtractProp(model: DatbaseModelNames, userid: string, number: number | string, prop: PropertyNames) {
        let exist = (await this.get(model, userid)) || {};
        if (exist === 0 || exist === '') exist = true;

        number = Number(number);

        const previous = lodash.get(exist, prop) || 0;
        const obj = lodash.set(exist, prop, previous - number);
        const keepIfLesserThanZero = ['winnings'];

        if (lodash.get(obj, prop) <= 0 && !keepIfLesserThanZero.includes(prop)) await this.deleteProp(model, userid, prop);
        else await this.set(model, userid, obj);
    },
};
