module.exports = {
  apps: [{
    name: 'atm',
    script: './server/index.js',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    restart_delay: 3000,
    max_restarts: 10,
  }]
}
