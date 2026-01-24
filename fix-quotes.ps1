# PowerShell script to fix incorrect quoting of API_BASE_URL
$files = Get-ChildItem -Path "src" -Include *.jsx,*.js -Recurse

foreach ($file in $files) {
    if ($file.Name -match "ps1$") { continue }
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # We want to replace paths like:
    # '${API_BASE_URL}/foo'  ->  `${API_BASE_URL}/foo`
    # "${API_BASE_URL}/foo"  ->  `${API_BASE_URL}/foo`
    
    # Regular expression to find quoted strings starting with ${API_BASE_URL}
    # It handles both single and double quotes.
    
    # 1. Fix single quotes
    # Regex: '\$\{API_BASE_URL\}([^']*)'
    # Replacement: `${API_BASE_URL}$1`
    $content = [regex]::Replace($content, "'\$\{API_BASE_URL\}([^']*)'", '{ `${API_BASE_URL}$1` }'.Replace('{ ', '`').Replace(' }', '`'))
    
    # 2. Fix double quotes
    # Regex: "\$\{API_BASE_URL\}([^"]*)"
    # Replacement: `${API_BASE_URL}$1`
    $content = [regex]::Replace($content, '"\$\{API_BASE_URL\}([^"]*)"', '{ `${API_BASE_URL}$1` }'.Replace('{ ', '`').Replace(' }', '`'))

    if ($content -ne $originalContent) {
        Write-Host "Fixed quotes in: $($file.Name)"
        $content | Set-Content -Path $file.FullName -NoNewline
    }
}

Write-Host "Done! All quotes fixed."
