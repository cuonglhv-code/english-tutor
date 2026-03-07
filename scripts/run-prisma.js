const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
console.log('Reading .env from:', envPath);
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        envVars[key] = value;
    }
});

console.log('Environment variables loaded:', Object.keys(envVars));

const result = spawnSync('npx.cmd', ['prisma', 'db', 'push'], {
    stdio: 'inherit',
    env: { ...process.env, ...envVars },
    shell: true
});

if (result.status === 0) {
    spawnSync('npx.cmd', ['prisma', 'generate'], {
        stdio: 'inherit',
        env: { ...process.env, ...envVars },
        shell: true
    });
}

process.exit(result.status);
