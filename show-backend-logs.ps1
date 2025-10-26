# Backend Console Viewer
Write-Host "=" -ForegroundColor Cyan
Write-Host "   Django Backend Console Viewer" -ForegroundColor Green
Write-Host "=" -ForegroundColor Cyan
Write-Host ""

Write-Host "Backend URL: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view live backend console logs:" -ForegroundColor Yellow
Write-Host "  1. Open a new terminal" -ForegroundColor White
Write-Host "  2. Run: cd fleet\apps\backend" -ForegroundColor White
Write-Host "  3. Run: python manage.py runserver" -ForegroundColor White
Write-Host ""
Write-Host "This will show all API requests in real-time!" -ForegroundColor Green
Write-Host ""
Write-Host "Current running processes on port 8000:" -ForegroundColor Cyan
netstat -ano | Select-String ":8000" | Select-Object -First 5
Write-Host ""
Write-Host "Press any key to start backend in this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

cd fleet\apps\backend
python manage.py runserver

