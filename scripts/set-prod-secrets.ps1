param(
  [string]$EnvPath = "production-platform/.env.production"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-Base64Secret([int]$bytes = 64) {
  $buf = New-Object byte[] $bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buf)
  [Convert]::ToBase64String($buf)
}

function New-UrlSafeSecret([int]$length = 96) {
  $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
  -join (1..$length | ForEach-Object { $chars[(Get-Random -Minimum 0 -Maximum $chars.Length)] })
}

function New-Password([int]$length = 32) {
  $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}:,.?"
  -join (1..$length | ForEach-Object { $chars[(Get-Random -Minimum 0 -Maximum $chars.Length)] })
}

function Upsert-EnvVar {
  param(
    [string]$Content,
    [string]$Key,
    [string]$Value
  )

  $escapedKey = [Regex]::Escape($Key)
  $pattern = "(?m)^$escapedKey=.*$"
  $replacement = "$Key=$Value"

  if ($Content -match $pattern) {
    return [Regex]::Replace($Content, $pattern, $replacement)
  } else {
    if ($Content.Length -gt 0 -and -not $Content.EndsWith("`n")) {
      $Content += "`r`n"
    }
    return $Content + $replacement + "`r`n"
  }
}

if (-not (Test-Path $EnvPath)) {
  throw "Env file not found: $EnvPath"
}

$backupPath = "$EnvPath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path $EnvPath -Destination $backupPath -Force

$secrets = [ordered]@{
  JWT_ACCESS_SECRET   = New-Base64Secret 64
  JWT_REFRESH_SECRET  = New-Base64Secret 64
  OTP_PEPPER          = New-UrlSafeSecret 96
  POSTGRES_PASSWORD   = New-Password 32
  MINIO_ROOT_PASSWORD = New-Password 32
}

$content = Get-Content -Raw -Path $EnvPath
foreach ($k in $secrets.Keys) {
  $content = Upsert-EnvVar -Content $content -Key $k -Value $secrets[$k]
}
Set-Content -Path $EnvPath -Value $content -NoNewline

Write-Host "UPDATED_ENV=$EnvPath"
Write-Host "BACKUP_ENV=$backupPath"
Write-Host "ROTATED_KEYS=$($secrets.Keys -join ',')"
