# Deploy V11 to Production
$ServerIP = "108.61.91.112"
$User = "root"
$LocalPath = "c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard"

Write-Host "🚀 Starting V11 Deployment to $ServerIP..." -ForegroundColor Cyan

# 1. Build Client (Already done, but enforcing)
Write-Host "📦 Verifying Frontend Build..."
if (-not (Test-Path "$LocalPath\client\dist\index.html")) {
    Write-Host "❌ Build not found! Run 'npm run build' in client folder first." -ForegroundColor Red
    exit
}

# 2. Upload Frontend
Write-Host "📤 Uploading Frontend (client/dist)..." -ForegroundColor Yellow
scp -r -o StrictHostKeyChecking=no "$LocalPath\client\dist\*" "$User@$ServerIP:/var/www/lab-dashboard/client/dist/"

# 3. Upload Backend
Write-Host "📤 Uploading Backend Code (server/)..." -ForegroundColor Yellow
# Exclude node_modules to be faster, but here copying all sources
scp -r -o StrictHostKeyChecking=no "$LocalPath\server\*.js" "$User@$ServerIP:/var/www/lab-dashboard/server/"
scp -r -o StrictHostKeyChecking=no "$LocalPath\server\routes" "$User@$ServerIP:/var/www/lab-dashboard/server/"
scp -r -o StrictHostKeyChecking=no "$LocalPath\server\services" "$User@$ServerIP:/var/www/lab-dashboard/server/"

# 4. Restart Server
Write-Host "🔄 Restarting Remote Server..." -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no "$User@$ServerIP" "pm2 restart all || node /var/www/lab-dashboard/server/server.js &"

Write-Host "✅ Deployment Complete! Visit https://micuenta.shop/" -ForegroundColor Green
