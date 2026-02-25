#!/usr/bin/env bash
set -euo pipefail

echo "==> Starting required containers"
docker compose up -d mysql backend frontend

echo "==> Backend maintenance (autoload/cache/migrate/seed)"
docker exec contabilidad_backend composer dump-autoload
docker exec contabilidad_backend php artisan optimize:clear
docker exec contabilidad_backend php artisan migrate --force
docker exec contabilidad_backend php artisan db:seed

echo "==> API smoke test"
BASE="http://localhost:8000/api"
TOKEN=$(curl -sS -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"password"}' | php -r '$x=json_decode(stream_get_contents(STDIN),true); echo $x["token"] ?? "";')
if [[ -z "$TOKEN" ]]; then
  echo "Login failed: token not returned" >&2
  exit 1
fi

COMPANY_ID=$(curl -sS -X GET "$BASE/companies" -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json' | php -r '$x=json_decode(stream_get_contents(STDIN),true); if(isset($x["data"])) $x=$x["data"]; echo $x[0]["id"] ?? "";')
if [[ -z "$COMPANY_ID" ]]; then
  echo "No company available for context" >&2
  exit 1
fi

TODAY=$(date +%F)
ENTRY_ID=$(curl -sS -X POST "$BASE/journal-entries" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/json' \
  -H "X-Company-Id: $COMPANY_ID" \
  -H 'Content-Type: application/json' \
  -d "{\"entry_date\":\"$TODAY\",\"entry_type\":\"PD\",\"description\":\"One-click smoke test entry\",\"status\":\"DRAFT\",\"lines\":[{\"account_id\":2,\"debit\":25,\"credit\":0,\"line_number\":1,\"description\":\"Smoke debit\"},{\"account_id\":13,\"debit\":0,\"credit\":25,\"line_number\":2,\"description\":\"Smoke credit\"}]}" | php -r '$x=json_decode(stream_get_contents(STDIN),true); echo $x["id"] ?? "";')
if [[ -z "$ENTRY_ID" ]]; then
  echo "Journal entry creation failed" >&2
  exit 1
fi

curl -sS -X POST "$BASE/journal-entries/$ENTRY_ID/post" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/json' \
  -H "X-Company-Id: $COMPANY_ID" \
  -H 'Content-Type: application/json' \
  -d '{}' >/dev/null

TRIAL_ROWS=$(curl -sS -X GET "$BASE/reports/trial-balance?date=$TODAY" -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json' -H "X-Company-Id: $COMPANY_ID" | php -r '$x=json_decode(stream_get_contents(STDIN),true); if(isset($x["balances"])) echo count($x["balances"]); else if(isset($x["items"])) echo count($x["items"]); else echo 0;')
if [[ "$TRIAL_ROWS" -lt 1 ]]; then
  echo "Trial balance returned no rows" >&2
  exit 1
fi

CSV_PATH="/tmp/trial-balance-one-click.csv"
curl -sS -X GET "$BASE/reports/export/trial-balance/csv?date=$TODAY" -H "Authorization: Bearer $TOKEN" -H 'Accept: */*' -H "X-Company-Id: $COMPANY_ID" -o "$CSV_PATH"
if [[ ! -s "$CSV_PATH" ]]; then
  echo "CSV export failed" >&2
  exit 1
fi

PREF=$(curl -sS -X PUT "$BASE/company-preferences" -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json' -H "X-Company-Id: $COMPANY_ID" -H 'Content-Type: application/json' -d '{"primary_color":"indigo"}')
PREF_OK=$(echo "$PREF" | php -r '$x=json_decode(stream_get_contents(STDIN),true); echo (($x["primary_color"] ?? "") === "indigo") ? "1" : "0";')
if [[ "$PREF_OK" != "1" ]]; then
  echo "Company preference update failed" >&2
  exit 1
fi

AUDIT=$(curl -sS -X GET "$BASE/audit-logs?per_page=100" -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json' -H "X-Company-Id: $COMPANY_ID")
HAS_POST=$(echo "$AUDIT" | php -r '$x=json_decode(stream_get_contents(STDIN),true); $d=$x["data"] ?? $x; $ok=0; foreach($d as $r){ if(($r["action"] ?? "") === "journal.post") $ok=1; } echo $ok;')
HAS_EXPORT=$(echo "$AUDIT" | php -r '$x=json_decode(stream_get_contents(STDIN),true); $d=$x["data"] ?? $x; $ok=0; foreach($d as $r){ if(($r["action"] ?? "") === "report.export") $ok=1; } echo $ok;')
HAS_PREF=$(echo "$AUDIT" | php -r '$x=json_decode(stream_get_contents(STDIN),true); $d=$x["data"] ?? $x; $ok=0; foreach($d as $r){ if(($r["action"] ?? "") === "company.preference.update") $ok=1; } echo $ok;')

if [[ "$HAS_POST" != "1" || "$HAS_EXPORT" != "1" || "$HAS_PREF" != "1" ]]; then
  echo "Audit checks failed (journal.post=$HAS_POST, report.export=$HAS_EXPORT, company.preference.update=$HAS_PREF)" >&2
  exit 1
fi

echo ""
echo "✅ ONE-CLICK VERIFY PASSED"
echo "CompanyId=$COMPANY_ID EntryId=$ENTRY_ID TrialRows=$TRIAL_ROWS CSV=$CSV_PATH"
