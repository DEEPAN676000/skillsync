import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('   🚀 Launching SkillSync Full-Stack Application   ');
console.log('====================================================');

const clientDir = path.resolve(__dirname, 'client');
const serverDir = path.resolve(__dirname, 'server');
const serverJs = path.resolve(serverDir, 'dist', 'server.js');
const serverTsc = path.resolve(serverDir, 'node_modules', 'typescript', 'bin', 'tsc');
const viteBin = path.resolve(clientDir, 'node_modules', 'vite', 'bin', 'vite.js');

// Proactively clear ports 5000 and 5173 if lingering
function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== String(process.pid)) {
          try {
            process.kill(Number(pid), 'SIGKILL');
          } catch {}
        }
      }
    }
  } catch {}
}

freePort(5000);
freePort(5173);

// Ensure server TypeScript is built
if (!fs.existsSync(serverJs)) {
  console.log('[SkillSync] Building server distribution...');
  try {
    if (fs.existsSync(serverTsc)) {
      execSync(`"${process.execPath}" "${serverTsc}" -p "${serverDir}"`, { stdio: 'inherit' });
    }
  } catch (buildErr) {
    console.warn('[SkillSync] Notice: Server build check warning:', buildErr.message);
  }
}

// 1. Start Server
console.log('[SkillSync] Starting Backend Server on http://localhost:5000 ...');
const serverProc = fs.existsSync(serverJs)
  ? spawn(process.execPath, [serverJs], {
      cwd: serverDir,
      stdio: 'inherit',
    })
  : spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'start'], {
      cwd: serverDir,
      stdio: 'inherit',
      shell: true,
    });

serverProc.on('error', (err) => {
  console.warn('[SkillSync Backend Error]:', err.message);
});

serverProc.on('exit', (code, signal) => {
  if (code !== 0 && code !== null) {
    console.warn(`[SkillSync Backend] Exited with code ${code} / signal ${signal}`);
  }
});

// 2. Start Vite Client
console.log('[SkillSync] Starting Vite React Frontend on http://localhost:5173 ...');
const clientProc = fs.existsSync(viteBin)
  ? spawn(process.execPath, [viteBin], {
      cwd: clientDir,
      stdio: 'inherit',
    })
  : spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
      cwd: clientDir,
      stdio: 'inherit',
      shell: true,
    });

clientProc.on('error', (err) => {
  console.error('[SkillSync Frontend Error]:', err.message);
});

clientProc.on('exit', (code, signal) => {
  if (code !== 0 && code !== null) {
    console.warn(`[SkillSync Frontend] Exited with code ${code} / signal ${signal}`);
  }
});

console.log('\n----------------------------------------------------');
console.log('  🌐 SkillSync Web App:  http://localhost:5173');
console.log('  ⚙️  SkillSync API:      http://localhost:5000/api');
console.log('----------------------------------------------------\n');

const cleanup = () => {
  console.log('\n[SkillSync] Shutting down services cleanly...');
  try {
    if (serverProc && serverProc.pid) process.kill(serverProc.pid, 'SIGKILL');
  } catch {}
  try {
    if (clientProc && clientProc.pid) process.kill(clientProc.pid, 'SIGKILL');
  } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
