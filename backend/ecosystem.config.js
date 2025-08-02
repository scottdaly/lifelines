export default {
  apps: [{
    name: 'lifelines-backend',
    script: './node_modules/.bin/tsx',
    args: 'src/index.ts',
    cwd: '/var/www/lifelines/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};