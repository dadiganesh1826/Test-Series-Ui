# PowerShell script to remove ALL duplicate API_BASE_URL imports
$files = Get-ChildItem -Path "src" -Include *.jsx,*.js -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file has duplicate imports
    if ($content -match "import API_BASE_URL") {
        $lines = Get-Content $file.FullName
        $newLines = @()
        $foundApiImport = $false
        
        foreach ($line in $lines) {
            # If this is an API_BASE_URL import line
            if ($line -match "^import API_BASE_URL") {
                # Only add it once
                if (-not $foundApiImport) {
                    $newLines += "import API_BASE_URL from '../config/api';"
                    $foundApiImport = $true
                    Write-Host "Fixing duplicates in: $($file.Name)"
                }
                # Skip all other API_BASE_URL import lines
            } else {
                $newLines += $line
            }
        }
        
        # Save the cleaned file
        $newLines | Set-Content -Path $file.FullName
    }
}

Write-Host "Done! All duplicate imports removed."
