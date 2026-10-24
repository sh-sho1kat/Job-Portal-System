#!/usr/bin/env bash
# Final API test run for job-service ("final test all apis").
#
# Assumes the service is running (default http://localhost:5003) against a
# freshly created job_db schema. Creates its own taxonomy + postings
# (owner id 2002), walks the full lifecycle, and checks the error paths with
# expected HTTP codes. Prints PASS/FAIL per check; exits non-zero on failure.
#
# Slug assertions read job_db directly via psql (no response carries slug).
#
# Usage: ./seed/api-tests.sh [base_url]
set -u
BASE="${1:-http://localhost:5003}"
OWNER="2002"
TMP="$(mktemp -d)"
FAILS=0
export PGPASSWORD=sho1kat

call() { # method path [body] [auth|noauth] -> STATUS; response body in $TMP/res
  local m=$1 p=$2 b=${3:-} a=${4:-}
  local args=(-H 'Content-Type: application/json')
  if [ "$m" = GET ]; then
    if [ "$a" = auth ]; then
      STATUS=$(curl -sS -o "$TMP/res" -w '%{http_code}' -H "X-User-Id: $OWNER" "$BASE$p")
    else
      STATUS=$(curl -sS -o "$TMP/res" -w '%{http_code}' "$BASE$p")
    fi
  else
    [ "$a" = noauth ] || args+=(-H "X-User-Id: $OWNER")
    STATUS=$(curl -sS -o "$TMP/res" -w '%{http_code}' -X "$m" "${args[@]}" "$BASE$p" -d "$b")
  fi
}
check() { # name expected actual
  if [ "$3" = "$2" ]; then
    echo "PASS  $1 (HTTP $3)"
  else
    echo "FAIL  $1 expected $2 got $3"; head -c 400 "$TMP/res" | sed 's/^/      /'; echo; FAILS=$((FAILS+1))
  fi
}
check_ge() { # name minimum actual-number
  if [ "$3" != "?" ] && [ "$3" -ge "$2" ] 2>/dev/null; then
    echo "PASS  $1 ($3 >= $2)"
  else
    echo "FAIL  $1 expected >= $2 got $3"; FAILS=$((FAILS+1))
  fi
}
json_get() { # python-based field extraction from $TMP/res (dot path; digits = index)
  python3 -c "
import json,sys
try:
    cur=json.load(open('$TMP/res'))
    for part in sys.argv[1].split('.'):
        cur=cur[int(part)] if part.isdigit() else cur[part]
    print(cur)
except Exception: print('?')" "$1"
}

echo "=== 0. home"
call GET "/";            check "GET / (home)" 200 "$STATUS"

echo
echo "=== 1. taxonomy setup (categories, skills, tags)"
call POST "/api/job-categories" '{"name":"QA Test Root"}'; check "create root category" 201 "$STATUS"
ROOT_CAT=$(json_get id)
call POST "/api/job-categories" "{\"name\":\"QA Test Leaf\",\"parentId\":$ROOT_CAT}"; check "create child category" 201 "$STATUS"
LEAF_CAT=$(json_get id)
call POST "/api/job-categories" '{"name":"QA Test Root"}'; check "duplicate name -> slug -2" 201 "$STATUS"
DUP_CAT=$(json_get id)
call POST "/api/job-skills" '{"name":"QA Java","category":"PROGRAMMING_LANGUAGE"}'; check "create skill" 201 "$STATUS"
SKILL_A=$(json_get id)
call POST "/api/job-skills" '{"name":"QA Postgres","category":"DATABASE"}'; check "create skill 2" 201 "$STATUS"
SKILL_B=$(json_get id)
call POST "/api/job-tags" '{"name":"QA Only Tag"}'; check "create tag" 201 "$STATUS"
TAG_A=$(json_get id)

call GET "/api/job-categories"; check "GET categories (public)" 200 "$STATUS"
call GET "/api/job-skills"; check "GET skills (public)" 200 "$STATUS"
call GET "/api/job-tags"; check "GET tags (public)" 200 "$STATUS"
call GET "/api/job-skills/all"; check "GET skills /all without header -> 401" 401 "$STATUS"

echo
echo "=== 2. job lifecycle (DRAFT -> publish -> close -> delete)"
make_job() { # title workMode city country salaryMin salaryMax categoryId skillIds [tagIds]
  local city_json country_json
  city_json=$([ -n "$3" ] && printf '%s' "\"$3\"" || printf 'null')
  country_json=$([ -n "$4" ] && printf '%s' "\"$4\"" || printf 'null')
  cat <<EOF
{
 "companyId": 1, "title": "$1", "description": "API test posting for $1",
 "responsibilities": "Ship and maintain test features.",
 "requirements": "Knows how to read test output.",
 "benefits": "Green builds.",
 "employmentType": "FULL_TIME", "experienceLevel": "MID_LEVEL", "workMode": "$2",
 "address": null, "city": $city_json, "state": null, "country": $country_json, "zipCode": null,
 "salaryMin": $5, "salaryMax": $6, "salaryCurrency": "BDT", "salaryPeriod": "MONTHLY",
 "categoryId": $7, "skillIds": [$8], "tagIds": [$9], "vacancies": 2,
 "applicationDeadline": "2026-12-15", "expiresAt": "2027-01-31"
}
EOF
}

JOB_BODY=$(make_job "API QA Engineer" "HYBRID" "Dhaka" "Bangladesh" 80000 150000 "$LEAF_CAT" "$SKILL_A,$SKILL_B" "$TAG_A")
call POST "/api/jobs/create" "$JOB_BODY" noauth;             check "create w/o header (valid body) -> 401" 401 "$STATUS"
call POST "/api/jobs/create" "$JOB_BODY";                    check "create job (DRAFT, 201)" 201 "$STATUS"
JOB=$(json_get id)
check "created status is DRAFT" "DRAFT" "$(json_get status)"
check "created vacancies knock-on" "2" "$(json_get vacancies)"
call GET "/api/jobs/$JOB";                                   check "GET draft job -> hidden 404" 404 "$STATUS"
call POST "/api/jobs/$JOB/publish";                          check "publish DRAFT -> ACTIVE" 200 "$STATUS"
check "published status ACTIVE" "ACTIVE" "$(json_get status)"
call GET "/api/jobs/$JOB";                                   check "GET active job (view #1)" 200 "$STATUS"
call GET "/api/jobs/$JOB";                                   check "GET active job (view #2)" 200 "$STATUS"
call GET "/api/jobs/$JOB";                                   check "GET active job (view #3)" 200 "$STATUS"

echo
echo "=== 3. validations on create"
call POST "/api/jobs/create" "$(make_job "Salary Invalid" "REMOTE" "" "" 150000 80000 "$LEAF_CAT" "$SKILL_A" "")"; check "salaryMin > salaryMax -> 400" 400 "$STATUS"
call POST "/api/jobs/create" "$(make_job "No City Onsite" "ON_SITE" "" "" 50000 90000 "$LEAF_CAT" "$SKILL_A" "")"; check "ON_SITE without city -> 400" 400 "$STATUS"
call POST "/api/jobs/create" "$(make_job "No Period" "REMOTE" "" "" 50000 90000 "$LEAF_CAT" "$SKILL_A" "" | python3 -c "import sys,json;d=json.loads(sys.stdin.read());d.pop('salaryPeriod');d.pop('salaryCurrency');print(json.dumps(d))")"; check "salary without period -> 400" 400 "$STATUS"
call POST "/api/jobs/create" "$(make_job "Unknown Category" "REMOTE" "" "" 50000 90000 999999 "$SKILL_A" "")"; check "unknown categoryId -> 404" 404 "$STATUS"
call POST "/api/jobs/create" "$(make_job "Unknown Skill" "REMOTE" "" "" 50000 90000 "$LEAF_CAT" "999999" "")"; check "unknown skillId -> 400" 400 "$STATUS"
call POST "/api/jobs/create" "$(make_job "No Owner Company" "REMOTE" "" "" 10000 20000 "$LEAF_CAT" "$SKILL_A" "" | python3 -c "import sys,json;d=json.loads(sys.stdin.read());d['companyId']=424242;print(json.dumps(d))")"; check "nonexistent company (no FK yet) -> 201" 201 "$STATUS"
# (that draft references SKILL_A — expected: skill/delete guards count drafts too)

echo
echo "=== 4. public search + filters + company listing"
call GET "/api/jobs?keyword=QA";                             check "search keyword=QA" 200 "$STATUS"
check_ge "search finds our job(s)" 1 "$(json_get totalElements)"
call GET "/api/jobs?categoryId=$LEAF_CAT";                   check "search categoryId" 200 "$STATUS"
call GET "/api/jobs?skillIds=$SKILL_B";                      check "search skillIds" 200 "$STATUS"
call GET "/api/jobs?tagIds=$TAG_A";                          check "search tagIds" 200 "$STATUS"
call GET "/api/jobs?salaryPeriod=MONTHLY";                   check "search salaryPeriod" 200 "$STATUS"
call GET "/api/jobs?workMode=HYBRID";                        check "search workMode" 200 "$STATUS"
check_ge "hybrid filter finds job" 1 "$(json_get totalElements)"
call GET "/api/jobs/company/1";                              check "GET company 1 jobs (2 pages)" 200 "$STATUS"
call POST "/api/jobs/$JOB/publish";                          check "re-publish active -> 400" 400 "$STATUS"

echo
echo "=== 5. admin views + counters"
call GET "/api/admin/jobs/$JOB";                             check "admin GET job" 200 "$STATUS"
check "viewCount=3 after 3 public GETs" "3" "$(json_get viewCount)"
check "applicationCount starts 0" "0" "$(json_get applicationCount)"
call GET "/api/admin/jobs?status=ACTIVE&companyId=1";         check "admin list filters" 200 "$STATUS"
call GET "/api/admin/jobs?title=QA";                         check "admin list title filter" 200 "$STATUS"
call GET "/api/jobs/my-jobs" "" auth;                       check "my-jobs (owner) page" 200 "$STATUS"
call POST "/api/admin/jobs/$JOB/suspend?reason=api-test";    check "suspend ACTIVE -> SUSPENDED" 200 "$STATUS"
check "status now SUSPENDED" "SUSPENDED" "$(json_get status)"
call GET "/api/jobs/$JOB";                                   check "GET suspended -> hidden 404" 404 "$STATUS"
call POST "/api/admin/jobs/$JOB/reactivate";                 check "reactivate -> ACTIVE" 200 "$STATUS"
call GET "/api/admin/jobs/999999";                           check "admin GET missing -> 404" 404 "$STATUS"
call POST "/api/admin/jobs/$JOB/reject";                     check "reject endpoint removed -> 404" 404 "$STATUS"

echo
echo "=== 6. slug regeneration + rename"
call PUT "/api/jobs/$JOB" "$(make_job "API QA Engineer II" "REMOTE" "" "" 90000 160000 "$LEAF_CAT" "$SKILL_A,$SKILL_B" "$TAG_A")"; check "update job (rename)" 200 "$STATUS"
check "title updated" "API QA Engineer II" "$(json_get title)"
DB_SLUG=$(psql -h localhost -U root -d job_db -tAc "SELECT slug FROM jobs WHERE id=$JOB")
case "$DB_SLUG" in
  api-qa-engineer-ii*) echo "PASS  slug regenerated for rename ($DB_SLUG, suffix allowed: dead slugs are never recycled)";;
  *) echo "FAIL  slug regenerated for rename expected base api-qa-engineer-ii got $DB_SLUG"; FAILS=$((FAILS+1));;
esac

echo
echo "=== 7. close + soft delete"
call PUT "/api/jobs/$JOB" "$(make_job "API QA Engineer II" "REMOTE" "" "" 90000 160000 "$LEAF_CAT" "$SKILL_A,$SKILL_B" "$TAG_A")"; check "update ACTIVE job ok" 200 "$STATUS"
call POST "/api/jobs/$JOB/close";                            check "close ACTIVE -> CLOSED" 200 "$STATUS"
check "status now CLOSED" "CLOSED" "$(json_get status)"
call GET "/api/jobs/$JOB";                                   check "GET closed -> hidden 404" 404 "$STATUS"
call POST "/api/jobs/$JOB/publish";                          check "publish closed -> 400" 400 "$STATUS"
call DELETE "/api/jobs/$JOB";                                check "delete job (soft, 204)" 204 "$STATUS"
call GET "/api/jobs/$JOB";                                   check "GET deleted -> 404" 404 "$STATUS"
call DELETE "/api/jobs/$JOB";                                check "re-delete -> 404" 404 "$STATUS"

echo
echo "=== 8. taxonomy guards (delete protection)"
REF_BODY=$(make_job "Ref Job" "REMOTE" "" "" 60000 99000 "$LEAF_CAT" "$SKILL_B" "")
call POST "/api/jobs/create" "$REF_BODY";                     check "create reference job" 201 "$STATUS"
REF_JOB=$(json_get id)
call DELETE "/api/job-skills/$SKILL_B";                       check "delete skill with DRAFT ref -> 409" 409 "$STATUS"
call POST "/api/jobs/$REF_JOB/publish";                       check "publish ref job" 200 "$STATUS"
call DELETE "/api/job-skills/$SKILL_B";                       check "delete skill with ACTIVE ref -> 409" 409 "$STATUS"
call DELETE "/api/job-tags/$TAG_A";                           check "delete tag (even deleted-posting ref) -> 409" 409 "$STATUS"
call DELETE "/api/job-categories/$LEAF_CAT";                  check "delete category with ref -> 409" 409 "$STATUS"
call POST "/api/job-skills" '{"name":"QA Unlinked","category":"DESIGN"}'; check "create unlinked skill" 201 "$STATUS"
UNLINKED=$(json_get id)
call DELETE "/api/job-skills/$UNLINKED";                      check "delete unused skill -> 204" 204 "$STATUS"
call PUT "/api/job-categories/$ROOT_CAT" "{\"name\":\"QA Test Root\",\"parentId\":$LEAF_CAT}"; check "cycle re-parent -> 400" 400 "$STATUS"
call PUT "/api/job-categories/$LEAF_CAT" '{"name":"QA Test Leaf","parentId":null}'; check "un-nest leaf -> 200" 200 "$STATUS"
call DELETE "/api/job-categories/$DUP_CAT";                  check "delete unused category -> 204" 204 "$STATUS"

echo
call GET "/api/admin/jobs";                                  check "admin list all jobs" 200 "$STATUS"
check_ge "admin list has rows" 1 "$(json_get totalElements)"

echo
if [ "$FAILS" -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "$FAILS CHECK(S) FAILED"; fi
rm -rf "$TMP"
exit $((FAILS > 0))
