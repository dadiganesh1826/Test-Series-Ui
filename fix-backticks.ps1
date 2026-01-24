# PowerShell script to fix double backticks
$files = Get-ChildItem -Path "src" -Include *.jsx,*.js -Recurse

foreach ($file in $files) {
    if ($file.Name -match "ps1$") { continue }
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace double backticks with single backtick
    $content = $content.Replace("````", "``")
    
    if ($content -ne $originalContent) {
        Write-Host "Fixed backticks in: $($file.Name)"
        $content | Set-Content -Path $file.FullName -NoNewline
    }
}

Write-Host "Done!"
