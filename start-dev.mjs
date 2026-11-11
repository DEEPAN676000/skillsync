import { spawn } from 'child_process';
import path from 'path';

console.log('====================================================');
console.log('   🚀 Launching SkillSync Development Environment   ');
console.log('====================================================');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Start Server in background
console.log('[SkillSync] Starting Backend Server (port 5000)...');
const serverProc = spawn(npmCmd, ['--prefix', 'server', 'run', 'start'], {
  stdio: 'inherit',
  shell: true,
});

serverProc.on('error', (err) => {
  console.warn('[SkillSync Backend] Note: Backend process notice:', err.message);
});

// 2. Start Vite Client
console.log('[SkillSync] Starting Frontend Client (port 5173)...');
const clientProc = spawn(npmCmd, ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

clientProc.on('error', (err) => {
  console.error('[SkillSync Frontend Error]:', err);
});

process.on('SIGINT', () => {
  console.log('\n[SkillSync] Shutting down services...');
  serverProc.kill('SIGINT');
  clientProc.kill('SIGINT');
  process.exit(0);
});
