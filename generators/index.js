import pgGenerator from './pg/index.js';
import backGenerator from './back/index.js';
import frontGenerator from './front/index.js';

export const generate = async (schema, tables) => {
    await pgGenerator.generate(schema, tables);
    await backGenerator.generate(schema, tables);
    await frontGenerator.generate(schema, tables);
}

export default { generate };