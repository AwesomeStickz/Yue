import { JSONB, NUMBER, STRING } from 'sequelize';
import { define } from '../sequelize';

export const cooldown = define('cooldown', {
    userid: {
        type: STRING,
    },
    data: {
        type: JSONB,
        daily: NUMBER,
        weekly: NUMBER,
        defaultValue: {},
    },
});
