const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting Parity Development Environment...\n');

// Function to kill existing processes
function killExistingProcesses() {
  return new Promise((resolve) => {
    console.log('🧹 Cleaning up existing processes...');
    
    // Kill Node.js processes (except this one)
    exec('taskkill /F /IM node.exe /FI "PID ne ' + process.pid + '"', (error) => {
      // Ignore errors - processes might not exist
    });
    
    // Kill MongoDB processes
    exec('taskkill /F /IM mongod.exe', (error) => {
      // Ignore errors - MongoDB might not be running
    });
    
    // Kill any processes on our ports
    exec('netstat -ano | findstr :5000 | for /f "tokens=5" %i in (\'more\') do taskkill /F /PID %i', (error) => {
      // Ignore errors
    });
    
    exec('netstat -ano | findstr :8081 | for /f "tokens=5" %i in (\'more\') do taskkill /F /PID %i', (error) => {
      // Ignore errors
    });
    
    // Wait a moment for processes to be killed
    setTimeout(resolve, 2000);
  });
}

// Main execution flow
async function startDevelopmentEnvironment() {
  // First, kill any existing processes
  await killExistingProcesses();
  
  // Start MongoDB
  console.log('📦 Starting MongoDB...');
  const mongod = spawn('C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe', [
    '--dbpath', 'C:\\data\\db'
  ], {
    stdio: 'pipe',
    detached: false
  });

  mongod.stdout.on('data', (data) => {
    // Only show important MongoDB messages
    const output = data.toString();
    if (output.includes('Waiting for connections') || output.includes('mongod startup complete')) {
      console.log('✅ MongoDB started successfully');
    }
  });

  mongod.stderr.on('data', (data) => {
    // Suppress most MongoDB logs, only show errors
    const output = data.toString();
    if (output.includes('ERROR') || output.includes('FATAL')) {
      console.error('❌ MongoDB Error:', output);
    }
  });

  // Wait a moment for MongoDB to start
  setTimeout(() => {
    console.log('🌐 Starting Backend and Frontend...\n');
    
    // Start backend and frontend separately
    const backend = spawn('npm', ['run', 'backend:dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    const frontend = spawn('npx', ['expo', 'start', '--web', '--clear'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    // Handle backend output
    backend.stdout.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    backend.stderr.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    // Handle frontend output
    frontend.stdout.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    frontend.stderr.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    // Handle process exits
    backend.on('close', (code) => {
      console.log(`[Backend] Process exited with code ${code}`);
      if (code !== 0) {
        frontend.kill();
        mongod.kill();
      }
    });

    frontend.on('close', (code) => {
      console.log(`[Frontend] Process exited with code ${code}`);
      if (code !== 0) {
        backend.kill();
        mongod.kill();
      }
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      backend.kill();
      frontend.kill();
      mongod.kill();
      process.exit(0);
    });

  }, 3000); // Wait 3 seconds for MongoDB to start
}

// Start the development environment
startDevelopmentEnvironment();
