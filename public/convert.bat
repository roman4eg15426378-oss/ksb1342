@echo off
setlocal
cd /d "%~dp0"
if "%~1"=="" (
  echo Использование: convert.bat "путь\к\файлу.wrl" ["выход.glb"]
  exit /b 1
)
node scripts\convert-wrl-to-glb.mjs %*
exit /b %ERRORLEVEL%
