@echo off
echo Agregando variables de entorno a Vercel...
echo.

vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_GEMINI_API_KEY production
vercel env add VITE_DEEPSEEK_API_KEY production
vercel env add VITE_YOUTUBE_API_KEY production
vercel env add VITE_TWITTER_API_KEY production
vercel env add VITE_NEWSAPI_KEY production
vercel env add VITE_MERCADOPAGO_PUBLIC_KEY production

echo.
echo Variables agregadas. Ahora puedes hacer: vercel --prod
pause
