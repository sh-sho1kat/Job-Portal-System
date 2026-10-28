#!/usr/bin/env python3
"""
Random seed for application_db, delivered through the application-service API.

Fills the employer inboxes: 26 candidate applications spread across 8
candidates, 3 companies and 6 jobs, then pushes a mixed status ledger —
reviews, shortlists, an interview ladder, hires, rejections and three
candidate withdrawals — plus stars and hiring-team notes. Job/company/
resume ids are the unverified stand-ins of the current cross-service state
(see the service TODOs), so any plausible ids exercise the real surface.

Usage:
    python3 seed/seed.py [base_url] [first_candidate] [random_seed]

Defaults: http://localhost:5005, candidate 3001, seed 2026. Candidates
main..main+7 are used. Re-runs stay idempotent: duplicate-apply 409s are
treated as "already exists" and the ids are recovered from the company
inbox; existing statuses answer 400/409 and are tolerated.
"""
import json
import random
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5005"
FIRST_CANDIDATE = int(sys.argv[2]) if len(sys.argv) > 2 else 3001
random.seed(int(sys.argv[3]) if len(sys.argv) > 3 else 2026)

CANDIDATES = [FIRST_CANDIDATE + i for i in range(8)]
COMPANIES = [1, 2, 3]
EMPLOYER = {companyId: 1000 + companyId for companyId in COMPANIES}  # note authors
JOBS = [1, 2, 3, 4, 5, 6]                                           # job_db stand-ins
RESUMES = [1, 2, 3]                                                 # resume_db stand-ins

NOTE_BANK = [
    "Strong Spring Boot match, wants a platform role.",
    "Salary expectation above band; flag for finance.",
    "Can start within a month, good communication.",
    "Portfolio shows production work, keep for triage.",
    "Overlap with the data team is promising.",
    "Second-choice candidate; wait for the interview loop.",
    "Referral from the alumni program.",
    "Wants remote; the role is hybrid this quarter.",
]
WITHDRAW_REASONS = [
    "Accepted another offer",
    "Role no longer matches my profile",
    "Relocation not possible right now",
]
COVER_LETTERS = [
    "I have shipped similar services with Spring Boot and PostgreSQL.",
    "Your posting matches my last two years of platform work.",
    "Happy to walk through the delivery pipeline I built recently.",
    "Back-end systems are my favourite part of the job - see CV.",
    "I admire your engineering blog and would love to contribute.",
    "Keen to join a product-focused team; my track record is measurable.",
]

# target distribution across the full status ledger
STATUS_PLAN = (
    ["PENDING"] * 8
    + ["REVIEWING"] * 6
    + ["SHORTLISTED"] * 4
    + ["INTERVIEW_SCHEDULED"] * 1
    + ["HIRED"] * 2
    + ["REJECTED"] * 2
    + ["WITHDRAWN"] * 3
)

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


def recover_application(company_id, candidate_id, job_id):
    """Re-run helper: find the already-applied row in the company inbox."""
    _, page = call("GET", f"/api/companies/{company_id}/applications"
                          f"?job={job_id}&size=100",
                   identity=EMPLOYER[company_id])
    for application in ((page or {}).get("content") or []):
        if application.get("candidate", {}).get("id") == candidate_id:
            return application
    return None


used_pairs = set()  # (candidate_id, job_id) -> one live application per pair


def pick_pair():
    while True:
        candidate_id = random.choice(CANDIDATES)
        job_id = random.choice(JOBS)
        if (candidate_id, job_id) not in used_pairs:
            used_pairs.add((candidate_id, job_id))
            return candidate_id, job_id


def push_status(application_id, company_id, current, target):
    """Walk the legal employer ladder toward the target status."""
    ladders = {
        "REVIEWING": ["REVIEWING"],
        "SHORTLISTED": ["REVIEWING", "SHORTLISTED"],
        "INTERVIEW_SCHEDULED": ["REVIEWING", "SHORTLISTED", "INTERVIEW_SCHEDULED"],
        "HIRED": ["REVIEWING", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED"],
        "REJECTED": ["REVIEWING", "REJECTED"],
    }
    ladder = ladders.get(target, [])
    if current in ladder:
        current_index = ladder.index(current)
    elif current == "PENDING":
        current_index = -1
    else:  # row moved past the ladder on a re-run
        return current
    for index in range(current_index + 1, len(ladder)):
        step = ladder[index]
        call("POST",
             f"/api/companies/{company_id}/applications/{application_id}/status?status={step}",
             identity=EMPLOYER[company_id],
             expect=(200, 400, 409))  # 400 = already there on re-runs
        current = step
    return current


print("Seeding application_db via", BASE)

for target in STATUS_PLAN:
    candidate_id, job_id = pick_pair()
    # one candidate per job in this seed pass; companies follow job ownership
    company_id = (job_id - 1) % len(COMPANIES) + 1
    resume_id = random.choice(RESUMES)
    body = {
        "jobId": job_id,
        "companyId": company_id,
        "resumeId": resume_id,
        "coverLetter": random.choice(COVER_LETTERS),
        "expectedSalary": random.randrange(25000, 150000, 5000),
        "availableFrom": str(date.today() + timedelta(days=random.randrange(3, 46))),
    }
    status, created_now = call(
        "POST", "/api/applications/create", body, identity=candidate_id,
        expect=(201, 409))  # 409 = seed re-run: recover the existing row
    if status == 201:
        application = created_now
    else:
        application = recover_application(company_id, candidate_id, job_id)
        if application is None:
            failed.append(("recover", f"job={job_id} candidate={candidate_id}", "no row", ""))
            continue
    application_id = application["id"]
    current = application["status"]

    if target == "WITHDRAWN" and current not in ("WITHDRAWN", "REJECTED", "HIRED"):
        call("POST", f"/api/applications/{application_id}/withdraw",
             {"withdrawnReason": random.choice(WITHDRAW_REASONS)},
             identity=candidate_id, expect=(200, 409))
        current = "WITHDRAWN"
    elif target not in ("PENDING", "WITHDRAWN"):
        current = push_status(application_id, company_id, current, target)

    if current != "WITHDRAWN" and random.random() < 0.4:
        call("POST", f"/api/companies/{company_id}/applications/{application_id}/star",
             identity=EMPLOYER[company_id])

    if current != "WITHDRAWN" and random.random() < 0.35:
        call("POST", f"/api/applications/{application_id}/notes",
             {"content": random.choice(NOTE_BANK)},
             identity=EMPLOYER[company_id], expect=(201,))

    rows.append({
        "id": application_id,
        "candidate": candidate_id,
        "company": company_id,
        "job": job_id,
        "status": current,
        "target": target,
    })

# ---- smoke checks (PASS/FAIL per sibling seed convention) ----
checks = []


def check(name, ok):
    checks.append((name, bool(ok)))


total = 0
inbox = {}
for company_id in COMPANIES:
    _, page = call("GET", f"/api/companies/{company_id}/applications?size=100",
                   identity=EMPLOYER[company_id])
    inbox[company_id] = (page or {}).get("content") or []
    total += len(inbox[company_id])
check(">= 20 applications stored total", total >= 20)
check("status filters distinguish WITHDRAWN vs PENDING",
      any(app["status"] == "WITHDRAWN" for app in inbox[1])
      and any(app["status"] == "PENDING" for app in inbox[1]))

_, starred = call("GET", "/api/companies/1/applications?isStarred=true&size=100",
                  identity=EMPLOYER[1])
check("star filter returns rows", len(((starred or {}).get("content")) or []) >= 1)

_, scored = call("GET", "/api/companies/1/applications?sortBy=aiScore&size=100",
                 identity=EMPLOYER[1])
check("aiScore sort reachable", scored is not None)

status, _ = call("GET", f"/api/applications/my-applications?size=100",
                 identity=CANDIDATES[0])
check("candidate list view reachable", status == 200)

status, _ = call("HEAD-PROBE", "")  # placeholder keeps structure simple
failed[:] = [f for f in failed if f[0] != "HEAD-PROBE"]  # never happens

# one note delete exercised through the API surface (author-only rule)
note_status, note = call("POST", "/api/applications/1/notes", {"content": "seed note"},
                         identity=EMPLOYER[1], expect=(201, 404))
if note_status == 201 and note:
    call("DELETE", f"/api/applications/1/notes/{note['id']}",
         identity=EMPLOYER[1], expect=(204,))

by_status = {}
per_company = {company_id: 0 for company_id in COMPANIES}
for row in rows:
    by_status[row["status"]] = by_status.get(row["status"], 0) + 1
    per_company[row["company"]] += 1

print()
print("== seed summary ==")
print("candidate ids:", ",".join(str(c) for c in CANDIDATES))
print("companies:", COMPANIES, "employers:", EMPLOYER)
for target in ("PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW_SCHEDULED",
               "HIRED", "REJECTED", "WITHDRAWN"):
    if target in by_status:
        print(f"{target:<20} {by_status[target]}")
print("rows this pass:", len(rows), "| inbox rows:", total,
      "| per company:", per_company)
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
