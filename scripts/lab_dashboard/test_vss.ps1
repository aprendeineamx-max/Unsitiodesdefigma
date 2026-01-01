$ErrorActionPreference = "Stop"
try {
    $class = [WMICLASS]"root\cimv2:Win32_ShadowCopy"
    $result = $class.Create("C:\", "ClientAccessible")
    if ($result.ReturnValue -eq 0) {
        $shadow = Get-WmiObject Win32_ShadowCopy | Where-Object { $_.ID -eq $result.ShadowID }
        Write-Output "$($shadow.DeviceObject)|$($shadow.ID)|$($shadow.InstallDate)"
    }
    else {
        Write-Error "Failed to create shadow copy. ReturnValue: $($result.ReturnValue)"
        exit 1
    }
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
