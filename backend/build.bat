@echo off
echo Building C++ Marketplace Backend...

:: Try G++ first
where g++ >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using G++ (MSYS2/Mingw)...
    g++ -o server.exe main.cpp -lws2_32
    if %ERRORLEVEL% EQU 0 (
        echo Build Successful: server.exe
        exit /b 0
    )
)

:: Fallback to MSVC if available
where cl >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using MSVC (Visual Studio)...
    cl /EHsc main.cpp /Fe:server.exe ws2_32.lib
    if %ERRORLEVEL% EQU 0 (
        echo Build Successful: server.exe
        exit /b 0
    )
)

echo No suitable compiler found. Please install G++ (MSYS2) or Visual Studio Build Tools.
exit /b 1
