call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
set "PGROOT=C:\Program Files\PostgreSQL\16"
nmake /F Makefile.win
nmake /F Makefile.win install
