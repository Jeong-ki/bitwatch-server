require('dotenv').config();
import * as process from 'process';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import type { Knex } from 'knex';

const tableName = 'users';
const defaultPassword = process.env.DEFAULT_PASSWORD as string;

exports.seed = async function (knex: Knex): Promise<void> {
  await knex(tableName).del();
  const hashed_password: string = await bcrypt.hash(defaultPassword, 10);
  const users = Array(10)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      email: faker.internet.email().toLowerCase(),
      nick_name: faker.person.fullName(),
      role: 'user',
    }));

  await knex(tableName).insert(users.map(user => ({ ...user, password: hashed_password })));
};
