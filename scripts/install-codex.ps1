# OrchestrUI
# Copyright (c) 2026 ECD5A
# Licensed under the MIT License.
# https://github.com/ECD5A/OrchestrUI
# SPDX-License-Identifier: MIT

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Dest = Join-Path $HOME ".agents\skills"
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
foreach ($Skill in @("ui-library-router","ui-orchestrator","ui-quality-audit")) {
  $Src = Join-Path $Root ".agents\skills\$Skill"; $Dst = Join-Path $Dest $Skill
  if (Test-Path $Dst) { Remove-Item -Recurse -Force $Dst }
  try { New-Item -ItemType SymbolicLink -Path $Dst -Target $Src | Out-Null; Write-Host "Linked $Skill" }
  catch { Copy-Item -Recurse -Force $Src $Dst; Write-Host "Copied $Skill" }
}
