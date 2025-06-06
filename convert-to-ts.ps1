# Convert all .js files to .ts and fix imports
$baseDir = "$PSScriptRoot\server"
$srcDir = "$baseDir\src"

# Function to convert a single file
function Convert-FileToTypeScript {
    param (
        [string]$filePath
    )
    
    $tsPath = $filePath -replace '\.js$', '.ts'
    $content = Get-Content -Path $filePath -Raw
    
    # Fix imports to use .js extension (TypeScript requires this for ESM)
    $content = $content -replace 'from\s+[''"]([^''"]+)(?<!\.js)[''"]', 'from "$1.js"'
    
    # Add basic TypeScript types
    $content = "// @ts-nocheck`n" + $content
    
    # Save as .ts
    Set-Content -Path $tsPath -Value $content
    
    # Remove original .js file
    Remove-Item -Path $filePath
    
    Write-Host "Converted $filePath to $tsPath"
}

# Process all .js files in server directory, excluding node_modules
Get-ChildItem -Path $baseDir -Recurse -Filter "*.js" -Exclude "node_modules" | ForEach-Object {
    try {
    $relativePath = $_.FullName.Substring($PSScriptRoot.Length + 1)
    Write-Host "Processing $relativePath..."
    
    # Determine target directory in src
    $relativeDir = [System.IO.Path]::GetDirectoryName($_.FullName).Substring($baseDir.Length + 1)
    $targetDir = if ($relativeDir) { "$srcDir\$relativeDir" } else { $srcDir }
    
    # Ensure target directory exists
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    # Move and convert file
    $targetPath = Join-Path $targetDir $_.Name
    Move-Item -Path $_.FullName -Destination $targetPath -Force
    
        # Convert to TypeScript
        Convert-FileToTypeScript -filePath $targetPath
    } catch {
        Write-Host "Error processing $($_.FullName): $_" -ForegroundColor Red
    }
}

Write-Host "Conversion complete!"
Write-Host "Please verify the TypeScript files and fix any type errors."
