#!/usr/bin/env python3
"""
Random seed for job_preference_db, delivered through the job-preference-service API.

Fills the bookmarks shelf: 8 candidates each save 3-5 of the 6 stand-in jobs
(companies 1-3), most with a personal note, then a delete round-trip plus the
isSaved probe are exercised. Job/company ids are the unverified stand-ins of
the current cross-service state (see the service TODOs), so any plausible ids
exercise the real surface.

Usage:
    python3 seed/seed.py [base_url] [first_candidate] [random_seed]

Defaults: http://localhost:5006, candidate 4001, seed 2026. Candidates
main..main+7 are used. Re-runs stay idempotent: duplicate-save 409s are
treated as "already exists" and the ids are recovered from the list view.
"""
import json
import random
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5006"
if not BASE.startswith("http://"):  # tolerate scheme-less "localhost:5006"
    BASE = "http://" + BASE
FIRST_CANDIDATE = int(sys.argv[2]) if len(sys.argv) > 2 else 4001
random.seed(int(sys.argv[3]) if len(sys.argv) > 3 else 2026)

CANDIDATES = [FIRST_CANDIDATE + i for i in range(8)]
COMPANIES = [1, 2, 3]
JOBS = [1, 2, 3, 4, 5, 6]  # job_db stand-ins

NOTE_BANK = [
    "Great engineering culture, follow up after the January roadmap.",
    "Remote-first but the core team sits in Dhaka; check.",
    "Salary band was published, aligns with my target.",
    "Recruiter mentioned a platform-track interview loop.",
    "Second-choice role; keep warm for the next cycle.",
    "Met two of their engineers at the dev meetup.",
    "Team owns exactly the stack I profiled in my resume.",
    "Referred by someone inside; ping them after applying.",
]

rows = []      # per-slot bookkeeping for the final summary
failed = []    # unexpected (method, path, status, message)


def call(method, path, body=None, identity=None, expect=(200, 201, 204, 409)):
    """JSON request helper; returns (status, parsed). Expected-code tolerant."""
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json",
               "X-User-Id": str(identity if identity is not None else CANDIDATES[0])}
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            status, raw = resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read().decode()
    parsed = json.loads(raw) if raw else None
    if status not in expect:
        failed.append((method, path, status, (parsed or {}).get("message", "")[:160]))
    return status, parsed


def recover_saved(candidate_id, job_id):
    """Re-run helper: find the already-saved row in the candidate's shelf."""
    _, saved = call("GET", "/api/preferences/saved-jobs", identity=candidate_id)
    for row in (saved or []):
        if row.get("jobId") == job_id:
            return row
    return None


print("Seeding job_preference_db via", BASE)

for candidate_id in CANDIDATES:
    shelf = random.sample(JOBS, random.randrange(3, 6))  # 3-5 distinct jobs
    saved_ids = []
    for job_id in shelf:
        # companies follow the job ownership mapping used by the other seeds
        company_id = (job_id - 1) % len(COMPANIES) + 1
        body = {"jobId": job_id, "companyId": company_id,
                "notes": random.choice(NOTE_BANK) if random.random() < 0.7 else None}
        status, created_now = call(
            "POST", "/api/preferences/saved-jobs", body, identity=candidate_id,
            expect=(201, 409))  # 409 = seed re-run: recover the existing row
        if status == 201:
            row = created_now
        else:
            row = recover_saved(candidate_id, job_id)
            if row is None:
                failed.append(("recover", f"candidate={candidate_id} job={job_id}", "no row", ""))
                continue
        saved_ids.append(row["id"])
        rows.append({"id": row["id"], "candidate": candidate_id,
                     "company": company_id, "job": job_id,
                     "notes": bool(row.get("notes"))})

# ---- smoke checks (PASS/FAIL per sibling seed convention) ----
checks = []


def check(name, ok):
    checks.append((name, bool(ok)))


main_candidate = CANDIDATES[0]
other_candidate = CANDIDATES[-1]

_, shelf = call("GET", "/api/preferences/saved-jobs", identity=main_candidate)
shelf = shelf or []
check("main candidate holds a full shelf", len(shelf) >= 3)
check("shelf rows carry the denormalized job/company ids",
      all(row.get("jobId") and row.get("companyId") for row in shelf))

_, other_shelf = call("GET", "/api/preferences/saved-jobs", identity=other_candidate)
check("shelf is owner-scoped (candidates see only their rows)",
      all(row.get("jobId") not in [row["jobId"] for row in shelf] or
          row.get("id") not in [row["id"] for row in shelf]
          for row in (other_shelf or [])))

_, probe = call("GET", "/api/preferences/saved-jobs/check?jobId=6",
                identity=main_candidate)
saved_six = any(row.get("jobId") == 6 for row in shelf)
check("isSaved probe agrees with the shelf", probe is saved_six)

# a fresh duplicate save still answers 409 through the real surface
if shelf:
    status, _ = call("POST", "/api/preferences/saved-jobs",
                     {"jobId": shelf[0]["jobId"], "companyId": shelf[0]["companyId"]},
                     identity=main_candidate, expect=(409,))
    check("duplicate save answers 409", status == 409)

# delete round-trip on a throwaway row (candidate main, free job id 7)
status, throwaway = call("POST", "/api/preferences/saved-jobs",
                         {"jobId": 7, "companyId": 1, "notes": "seed throwaway"},
                         identity=main_candidate, expect=(201, 409))
if status == 409:  # an earlier run didn't finish its delete
    throwaway = recover_saved(main_candidate, 7)
if throwaway:
    call("DELETE", f"/api/preferences/saved-jobs/{throwaway['id']}",
         identity=main_candidate, expect=(204,))
    _, probe_left = call("GET", "/api/preferences/saved-jobs/check?jobId=7",
                         identity=main_candidate)
    check("deleted bookmark disappears from the probe", probe_left is False)
    status, _ = call("DELETE", f"/api/preferences/saved-jobs/{throwaway['id']}",
                     identity=main_candidate, expect=(404,))
    check("second delete of the same bookmark answers 404", status == 404)

per_candidate = {candidate_id: 0 for candidate_id in CANDIDATES}
with_notes = 0
for row in rows:
    per_candidate[row["candidate"]] += 1
    with_notes += 1 if row["notes"] else 0

print()
print("== seed summary ==")
print("candidate ids:", ",".join(str(c) for c in CANDIDATES))
print("companies:", COMPANIES, "| jobs:", JOBS)
print("bookmarks this pass:", len(rows), "| noted:", with_notes,
      "| plain:", len(rows) - with_notes)
print("per candidate:", per_candidate)
print()
print("== smoke checks ==")
for name, ok in checks:
    print(("PASS" if ok else "FAIL") + " - " + name)
if failed:
    print()
    print("== unexpected codes ==")
    for method, path, status, message in failed:
        print(f"{method} {path} -> {status} {message}")
    sys.exit(1)
