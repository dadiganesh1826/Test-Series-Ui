# PowerShell script to replace all localhost URLs with dynamic API URL
$files = Get-ChildItem -Path "src" -Include *.jsx,*.js -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if file already imports API_BASE_URL
    if ($content -match "import API_BASE_URL") {
        continue
    }
    
    # Check if file contains localhost:8080
    if ($content -match "localhost:8080") {
        Write-Host "Fixing: $($file.Name)"
        
        # Add import at the top (after other imports)
        if ($content -match "import.*from") {
            $content = $content -replace "(import.*?;\r?\n)", "`$1import API_BASE_URL from '../config/api'`r`n"
        }
        
        # Replace all localhost URLs
        $content = $content -replace "http://localhost:8080/api", "`${API_BASE_URL}"
        $content = $content -replace "'http://localhost:8080/api", "``${API_BASE_URL}"
        $content = $content -replace """http://localhost:8080/api", "``${API_BASE_URL}"
        
        # Save the file
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "Done! All files updated."
