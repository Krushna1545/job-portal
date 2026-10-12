# Start the AI Job Portal Frontend
Write-Host "Starting AI Job Portal Frontend..." -ForegroundColor Green
Write-Host "App URL: http://localhost:5173" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
npm run dev
