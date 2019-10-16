@echo off
cd "%~dp0"
set NODE=node
if exist "bin\node.exe" (
    set NODE="bin\node.exe"
)

"%NODE%" -v

IF NOT ERRORLEVEL 0 (
    echo "NodeJS not found, please install it." 
    exit
)

rem Overwrite passcode by passing arguments, (the last is used) ./qcdesa.cmd --passcode 1234
"%NODE%" js\qcdesa.js --self "%~dpnx0" --passcode admin 
