import { JSONB, STRING } from 'sequelize';
import { define } from '../sequelize';

export const yue = define('yue', {
    userid: {
        type: STRING,
    },
    data: {
        type: JSONB,
        defaultValue: {},
    },
});
