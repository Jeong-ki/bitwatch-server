# express-knex-boilerplate
Express, Knex (+ Docker, PostgreSQL)를 사용하여 기본 백엔드 구조 세팅 및 테스트 코드 작성

## Version
node: 20.11.0  
pnpm: 9.5.0  
docker: 27.0.3  
express: 4.18.2  
knex: 3.1.0  
pg: 8.11.1  

## 사용법
1.레포지토리 클론  
2.Docker Postgres 세팅
  - 도커 설치
  - docker pull postgres
  - docker run --name [컨테이너이름] -e POSTGRES_PASSWORD=[컨테이너비밀번호] -p 5432:5432 -d postgres
  - docker exec -it [컨테이너이름] psql -U postgres
  - CREATE USER [유저이름] WITH PASSWORD '[유저비밀번호]';
  - ALTER USER [유저이름] WITH SUPERUSER;
  - CREATE DATABASE [디비이름];
  - GRANT ALL PRIVILEGES ON DATABASE [디비이름] TO [유저이름];
  - GRANT ALL PRIVILEGES ON SCHEMA public TO [유저이름];
  - docker exec -it [컨테이너이름] psql -U [유저명] -d [디비이름]  

3.환경 변수 설정
```
# General
PORT=9000

# DB
DB_HOST="localhost"
DB_PORT=5432
DB_NAME="dbname"
DB_USER="username"
DB_PASSWORD="userpassword"

# seed
DEFAULT_PASSWORD="defaultpassword"
```  

## Knex 기본 명령어
테이블 마이그레이션 파일 생성  
`npx knex migrate: make create_users_table`

마이그레이션 파일 실행  
`npx knex migrate:latest`

스캐폴드 시드 파일 생성  
`npx knex seed:make 01-users`

시드 파일 실행  
`npx seed:run`

