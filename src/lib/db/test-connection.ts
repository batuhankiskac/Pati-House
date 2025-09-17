import db from './connection';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await db.close();
  }
}

testConnection();
