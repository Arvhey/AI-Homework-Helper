Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  AI Homework Helper - Git Push Repair Script" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Undoing the problematic commit (keeping your local code intact)..." -ForegroundColor Yellow
git reset --soft HEAD~1

Write-Host "[2/4] Unstaging all files to apply the new .gitignore rules..." -ForegroundColor Yellow
git reset

Write-Host "[3/4] Re-adding your files (excluding node_modules and .env)..." -ForegroundColor Yellow
git add .

Write-Host "[4/4] Re-committing your clean project..." -ForegroundColor Yellow
git commit -m "upload full react project"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Your local commit is now clean and secure." -ForegroundColor Green
Write-Host "  You can now run: git push" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
