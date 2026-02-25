$ErrorActionPreference = 'Stop'

Write-Host '==> Starting required containers' -ForegroundColor Cyan
docker compose up -d mysql backend frontend | Out-Host

Write-Host '==> Backend maintenance (autoload/cache/migrate/seed)' -ForegroundColor Cyan
docker exec contabilidad_backend composer dump-autoload | Out-Host
docker exec contabilidad_backend php artisan optimize:clear | Out-Host
docker exec contabilidad_backend php artisan migrate --force | Out-Host
docker exec contabilidad_backend php artisan db:seed | Out-Host

Write-Host '==> API smoke test' -ForegroundColor Cyan
$base = 'http://localhost:8000/api'

function Get-Data($resp) {
  if ($resp -and $resp.PSObject.Properties.Name -contains 'data') { return $resp.data }
  return $resp
}

$loginBody = @{ email = 'admin@example.com'; password = 'password' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body $loginBody
if (-not $login.token) { throw 'Login failed: token not returned' }

$authHeaders = @{ Authorization = "Bearer $($login.token)"; Accept = 'application/json' }
$companies = Get-Data (Invoke-RestMethod -Method Get -Uri "$base/companies" -Headers $authHeaders)
if (-not $companies -or -not $companies[0].id) { throw 'No company available for context' }

$companyId = [int]$companies[0].id
$h = @{ Authorization = "Bearer $($login.token)"; Accept = 'application/json'; 'X-Company-Id' = "$companyId" }

$accounts = Get-Data (Invoke-RestMethod -Method Get -Uri "$base/accounts?per_page=200" -Headers $h)
if (-not $accounts -or $accounts.Count -lt 14) { throw 'Accounts not loaded as expected' }

$today = (Get-Date).ToString('yyyy-MM-dd')
$entryPayload = @{
  entry_date = $today
  entry_type = 'PD'
  description = 'One-click smoke test entry'
  status = 'DRAFT'
  lines = @(
    @{ account_id = 2; debit = 25.00; credit = 0; line_number = 1; description = 'Smoke debit' }
    @{ account_id = 13; debit = 0; credit = 25.00; line_number = 2; description = 'Smoke credit' }
  )
} | ConvertTo-Json -Depth 8

$entry = Invoke-RestMethod -Method Post -Uri "$base/journal-entries" -Headers $h -ContentType 'application/json' -Body $entryPayload
if (-not $entry.id) { throw 'Journal entry creation failed' }
Invoke-RestMethod -Method Post -Uri "$base/journal-entries/$($entry.id)/post" -Headers $h -ContentType 'application/json' -Body '{}' | Out-Null

$trial = Invoke-RestMethod -Method Get -Uri "$base/reports/trial-balance?date=$today" -Headers $h
$trialRows = if ($trial.balances) { $trial.balances.Count } elseif ($trial.items) { $trial.items.Count } else { 0 }
if ($trialRows -lt 1) { throw 'Trial balance returned no rows' }

$csvPath = Join-Path $env:TEMP 'trial-balance-one-click.csv'
Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$base/reports/export/trial-balance/csv?date=$today" -Headers $h -OutFile $csvPath
if (-not (Test-Path $csvPath) -or (Get-Item $csvPath).Length -le 0) { throw 'CSV export failed' }

$pref = Invoke-RestMethod -Method Put -Uri "$base/company-preferences" -Headers $h -ContentType 'application/json' -Body (@{ primary_color = 'indigo' } | ConvertTo-Json)
if ($pref.primary_color -ne 'indigo') { throw 'Company preference update failed' }

$audit = Get-Data (Invoke-RestMethod -Method Get -Uri "$base/audit-logs?per_page=100" -Headers $h)
$hasJournalPost = (($audit | Where-Object { $_.action -eq 'journal.post' } | Measure-Object).Count -gt 0)
$hasReportExport = (($audit | Where-Object { $_.action -eq 'report.export' } | Measure-Object).Count -gt 0)
$hasPrefUpdate = (($audit | Where-Object { $_.action -eq 'company.preference.update' } | Measure-Object).Count -gt 0)

if (-not ($hasJournalPost -and $hasReportExport -and $hasPrefUpdate)) {
  throw "Audit checks failed (journal.post=$hasJournalPost, report.export=$hasReportExport, company.preference.update=$hasPrefUpdate)"
}

Write-Host ''
Write-Host '✅ ONE-CLICK VERIFY PASSED' -ForegroundColor Green
Write-Host "CompanyId=$companyId EntryId=$($entry.id) TrialRows=$trialRows CSV=$csvPath" -ForegroundColor Green
