# Convert remaining .js files to .ts
$srcDir = "$PSScriptRoot\server\src"

Get-ChildItem -Path $srcDir -Recurse -Filter "*.js" | ForEach-Object {
    try {
        $tsPath = $_.FullName -replace '\.js$', '.ts'
        if (-not (Test-Path $tsPath)) {
            $content = Get-Content -Path $_.FullName -Raw
            # Add @ts-nocheck to suppress TypeScript errors
            $content = "// @ts-nocheck`n" + $content
            # Fix imports to use .js extension (TypeScript requires this for ESM)
            $content = $content -replace 'from\s+[''"]([^''"]+)(?<!\.js)[''"]', 'from "$1.js"'
            # Save as .ts
            Set-Content -Path $tsPath -Value $content
            # Remove original .js file
            Remove-Item -Path $_.FullName
            Write-Host "Converted $($_.FullName) to $tsPath"
        } else {
            Write-Host "Skipping $($_.FullName) - $tsPath already exists"
        }
    } catch {
        Write-Host "Error processing $($_.FullName): $_" -ForegroundColor Red
    }
}

Write-Host "Conversion complete!"
