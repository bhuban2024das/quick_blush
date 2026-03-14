module.exports = {
  apps: [
    {
      name: 'quick-blush-backend',
      script: 'dist/server.js',
      instances: 'max', // Utilizes all available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
