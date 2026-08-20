import { execFileSync } from 'node:child_process'

execFileSync('npx', ['convex', 'run', 'accounts:seedDemoAccounts'], {
  stdio: 'inherit'
})
