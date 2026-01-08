import * as bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { adminUserSchema } from '../src/models/Schema';

async function seedAdminUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.insert(adminUserSchema).values({
      username,
      passwordHash,
    });

    console.log(`Admin user created successfully!`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  } finally {
    await pool.end();
  }
}

seedAdminUser();
