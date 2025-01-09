import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('email_verifications', table => {
    table.increments('id').primary(); // 기본 키
    table.string('email').notNullable().unique(); // 이메일 (고유)
    table.string('verification_code').notNullable(); // 인증번호
    table.timestamp('expires_at').notNullable(); // 만료 시간
    table.boolean('is_verified').defaultTo(false); // 인증 여부
    table.timestamp('created_at').defaultTo(knex.fn.now()); // 생성 시간
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('email_verifications'); // 테이블 삭제
}
