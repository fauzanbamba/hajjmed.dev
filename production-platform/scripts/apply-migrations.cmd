@echo off
set "PATH=C:\Program Files\nodejs;C:\Users\prinz\AppData\Roaming\npm;%PATH%"
cd /d "%~dp0.."
node --version
pnpm.cmd --version
node node_modules\.pnpm\prisma@6.19.3_typescript@5.9.3\node_modules\prisma\build\index.js migrate deploy --schema apps/api/prisma/schema.prisma > prisma-migrate.log 2>&1
set "MIGRATE_EXIT=%ERRORLEVEL%"
type prisma-migrate.log
echo PRISMA_EXIT=%MIGRATE_EXIT%
exit /b %MIGRATE_EXIT%