# SkillFirst Hire - Master Startup Script (Windows PowerShell)
# This script launches all 5 platform services in separate terminal windows.

Write-Host "🧹 Cleaning up existing processes on ports 5000, 5001, 5002, 8000, 5173..." -ForegroundColor Gray
$ports = 5000, 5001, 5002, 8000, 5173
foreach ($port in $ports) {
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique -ErrorAction SilentlyContinue
    if ($proc) { Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue }
}

Write-Host "🚀 Launching SkillFirst Hire Platform..." -ForegroundColor Cyan

# 1. Main Core Backend (Port 5000) - AUTH & JOBS & AI (Primary API)
Write-Host "1. Starting Core Backend (Port 5000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node server.js"

# 2. LiveCode Backend (Port 5001) - CODING & AI
Write-Host "2. Starting LiveCode Backend (Port 5001)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd live-code/livecode; node index.js"

# 3. Database Middleware (Port 5002) - MONGO MIDDLEWARE
Write-Host "3. Starting Database Middleware (Port 5002)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Database/backend; node server.js"

# 4. ML Service (Port 8000) - MULTIMODAL VERIFICATION
Write-Host "4. Starting ML Service (Port 8000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml-service; python app.py"

# 5. LiveCode Frontend (Vite) - CODING LAB
Write-Host "5. Starting LiveCode Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd live-code/livecode/frontend; npm run dev"

Write-Host "`n✅ All 5 services initiated!" -ForegroundColor Green
Write-Host "💡 Access Platform: http://localhost:5000/auth.html (Login/Signup)" -ForegroundColor Yellow
Write-Host "💡 Access Lab: http://localhost:5173 (Direct Live-Code Lab)" -ForegroundColor Yellow
