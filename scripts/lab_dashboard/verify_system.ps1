$base = "http://localhost:3000"

Write-Host "1. Testing /api/system/drives..."
try {
    $drives = Invoke-RestMethod -Uri "$base/api/system/drives" -Method Get
    Write-Host "   Drives Found: $($drives -join ', ')"
} catch {
    Write-Error "   Failed to list drives: $_"
}

Write-Host "2. Creating dummy file..."
"Testing Vultr Upload" | Out-File "c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\verifyme.txt"

Write-Host "3. Testing /api/cloud/transfer..."
$body = @{
    sourcePath = "c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\verifyme.txt"
    targetPath = "autotest/verifyme.txt"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$base/api/cloud/transfer" -Method Post -Body $body -ContentType "application/json"
    Write-Host "   Upload Success! Key: $($res.key)"
    
    # 4. List to verify
    Write-Host "4. Verifying existence in Cloud..."
    $list = Invoke-RestMethod -Uri "$base/api/cloud/list" -Method Get
    $found = $list | Where-Object { $_.key -eq "autotest/verifyme.txt" }
    
    if ($found) {
        Write-Host "   ✅ VERIFIED: File exists in Vultr Cloud. Size: $($found.size)"
        
        # 5. Clean up
        Write-Host "5. Cleaning up Cloud..."
        $delBody = @{ backupKey = "autotest/verifyme.txt" } | ConvertTo-Json
        Invoke-RestMethod -Uri "$base/api/cloud/delete" -Method Delete -Body $delBody -ContentType "application/json"
        Write-Host "   Cleanup successful."
    } else {
        Write-Host "   ❌ FAILED: File uploaded but not found in list."
    }

} catch {
    Write-Error "   Transfer failed: $_"
}
