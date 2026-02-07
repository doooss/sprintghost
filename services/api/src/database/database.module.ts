import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export const DRIZZLE = Symbol('DRIZZLE');

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (configService: ConfigService) => {
        const dbPath = configService.get<string>('DATABASE_PATH', './data/sprintghost.db');
        const sqlite = new Database(dbPath);

        // WAL 모드 활성화 (성능 향상)
        sqlite.pragma('journal_mode = WAL');

        const db = drizzle(sqlite, { schema });

        // 마이그레이션 실행
        const migrationsFolder = path.join(__dirname, '../../drizzle');
        migrate(db, { migrationsFolder });

        return db;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
