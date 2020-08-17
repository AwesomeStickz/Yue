import { ARRAY, JSONB, STRING } from 'sequelize';
import { define } from '../sequelize';

export const ventura = define('ventura', {
    userid: {
        type: STRING,
    },
    data: {
        type: JSONB,
        owners: ARRAY(STRING),
        defaultValue: {},
    },
});
