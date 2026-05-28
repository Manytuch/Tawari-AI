const { Pool } = require('pg');

function normalizeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return databaseUrl;

  const match = databaseUrl.match(/^(postgres(?:ql)?:\/\/)(.*)$/i);
  if (!match) return databaseUrl;

  const prefix = match[1];
  const rest = match[2];
  const atIndex = rest.lastIndexOf('@');
  if (atIndex === -1) return databaseUrl;

  const auth = rest.slice(0, atIndex);
  const host = rest.slice(atIndex + 1);
  if (!auth.includes(':')) return databaseUrl;

  const [user, ...passwordParts] = auth.split(':');
  const password = passwordParts.join(':');
  return `${prefix}${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}`;
}

function getDatabaseConfig() {
  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
  const ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;

  if (databaseUrl) {
    return { connectionString: databaseUrl, ssl };
  }

  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const host = process.env.PGHOST || 'localhost';
  const port = process.env.PGPORT || 5432;
  const database = process.env.PGDATABASE;

  if (user && password && database) {
    return { user, password, host, port, database, ssl };
  }

  throw new Error(
    'PostgreSQL configuration not found. Set DATABASE_URL or PGUSER/PGPASSWORD/PGHOST/PGPORT/PGDATABASE in a .env file.'
  );
}

const pool = new Pool(getDatabaseConfig());

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
