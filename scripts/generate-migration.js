const { spawn } = require('child_process');

const name = process.argv[2];

if (!name) {
  console.error('Você precisa informar o nome da migration:');
  console.error('Ex: npm run migration:generate InitialDatabase');
  process.exit(1);
}

const path = `src/database/migrations/${name}`;

const child = spawn(
  'ts-node',
  [
    '-r',
    'tsconfig-paths/register',
    './node_modules/typeorm/cli.js',
    'migration:generate',
    path,
    '-d',
    'src/database/data-source.ts',
  ],
  { stdio: 'inherit' }
);

child.on('exit', (code) => {
  process.exit(code);
});
