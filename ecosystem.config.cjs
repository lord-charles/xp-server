module.exports = {
  apps: [
    {
      name: 'xpertfarmer-api',
      cwd: '/sf/clients/xp-server',
      script: 'dist/main.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: 9003,
      },
    },
  ],
};
