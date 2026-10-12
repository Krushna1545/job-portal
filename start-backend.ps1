# Start the AI Job Portal Backend
Write-Host "Starting AI Job Portal Backend..." -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
py -3.14 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
