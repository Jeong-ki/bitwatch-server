import { Knex } from 'knex';

const tableName = 'users';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(tableName, table => {
    // 기존 컬럼 제거
    table.dropColumn('first_name');
    table.dropColumn('last_name');

    // 새로운 컬럼 추가
    table.string('nickname').notNullable().defaultTo('default_nick');
  });

  // 기본값 제거 (선택적으로 수행 가능)
  await knex.schema.alterTable(tableName, table => {
    table.string('nickname').notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(tableName, table => {
    // 기존 상태로 복원
    table.dropColumn('nickname');
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
  });
}
