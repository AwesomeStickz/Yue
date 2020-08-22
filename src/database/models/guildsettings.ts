import { JSONB, STRING } from 'sequelize';
import { define } from '../sequelize';

export const guildsettings = define('guildsettings', {
    userid: {
        type: STRING,
    },
    data: {
        type: JSONB,
        defaultValue: {},
    },
});
