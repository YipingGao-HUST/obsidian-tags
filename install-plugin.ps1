$sourcePath = "f:\code\obsidian-tags\dist"
$destPath = "$env:APPDATA\Obsidian\plugins\obsidian-tags"

Write-Host "Copying plugin files to Obsidian plugins directory..."
Write-Host "Source: $sourcePath"
Write-Host "Destination: $destPath"

if (Test-Path $destPath) {
    Remove-Item "$destPath\*" -Recurse -Force
    Write-Host "Cleared target directory"
} else {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    Write-Host "Created target directory"
}

Copy-Item "$sourcePath\*" -Destination $destPath -Recurse -Force

Write-Host ""
Write-Host "Files copied successfully!"
Write-Host "Please restart Obsidian and enable 'Auto Tagger' plugin"
Write-Host ""

Get-ChildItem $destPath | Format-Table Name, Length -AutoSize