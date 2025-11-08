@echo off
echo ========================================
echo AGREGAR VARIABLES DE API A VERCEL
echo ========================================
echo.
echo IMPORTANTE: Este script agregara las API keys SIN el prefijo VITE_
echo para que funcionen en los endpoints del backend.
echo.
pause

echo.
echo [1/6] Agregando GEMINI_API_KEY a Production...
vercel env add GEMINI_API_KEY production

echo.
echo [2/6] Agregando GEMINI_API_KEY a Preview...
vercel env add GEMINI_API_KEY preview

echo.
echo [3/6] Agregando DEEPSEEK_API_KEY a Production...
vercel env add DEEPSEEK_API_KEY production

echo.
echo [4/6] Agregando DEEPSEEK_API_KEY a Preview...
vercel env add DEEPSEEK_API_KEY preview

echo.
echo [5/6] Agregando QWEN_API_KEY a Production...
vercel env add QWEN_API_KEY production

echo.
echo [6/6] Agregando QWEN_API_KEY a Preview...
vercel env add QWEN_API_KEY preview

echo.
echo ========================================
echo COMPLETADO - Ahora ejecuta: vercel env ls
echo ========================================
pause
