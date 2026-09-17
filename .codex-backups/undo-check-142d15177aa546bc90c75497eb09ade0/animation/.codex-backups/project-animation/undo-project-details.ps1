$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$backupDir = Join-Path $projectRoot '.codex-backups/project-details'
$manifest = Get-Content -LiteralPath (Join-Path $backupDir 'manifest.json') -Raw | ConvertFrom-Json
# Check every file before changing anything, so later edits are never discarded.
foreach ($entry in $manifest) {
  $target = Join-Path $projectRoot $entry.path
  if (!(Test-Path -LiteralPath $target) -or (Get-FileHash -LiteralPath $target).Hash -ne $entry.hash) {
    throw "Undo stopped: $($entry.path) has changed since this feature was added. Ask Codex to undo this feature while preserving your later edits."
  }
}
Copy-Item -LiteralPath (Join-Path $backupDir 'SelectedWork.tsx') -Destination (Join-Path $projectRoot 'components/sections/SelectedWork.tsx')
foreach ($entry in $manifest) {
  if ($entry.path -ne 'components/sections/SelectedWork.tsx') {
    Remove-Item -LiteralPath (Join-Path $projectRoot $entry.path)
  }
}
Write-Host 'Project detail pages removed and original work-card links restored. Other changes were preserved.'
