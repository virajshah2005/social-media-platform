const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_PORT',
  'JWT_SECRET',
  'NODE_ENV'
];

function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate PORT
  if (isNaN(process.env.PORT)) {
    throw new Error('PORT must be a number');
  }

  // Validate DB_PORT
  if (isNaN(process.env.DB_PORT)) {
    throw new Error('DB_PORT must be a number');
  }

  return true;
}

module.exports = validateEnv;
