#!/usr/bin/env python3
"""
Random seed for resume_db, delivered through the resume-service API.

Builds three candidates' resume sets: one power user (multiple resumes,
every sub-section, default flip + delete-promotion flow), one minimal shell,
and one medium resume. Generated ids are printed at the end for reuse in
tests/Postman. Re-runs tolerate previous leftovers via the 409 duplicate
guards (ids recovered from the list endpoint).

Usage:
    python3 seed/seed.py [base_url] [main_candidate]

Defaults: http://localhost:5004, candidate 3001 (temporary X-User-Id stand-in).
The other candidates are main+1 and main+2.
"""
import json
import random
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5004"
MAIN_CANDIDATE = sys.argv[2] if len(sys.argv) > 2 else "3001"
OTHER_CANDIDATES = [str(int(MAIN_CANDIDATE) + 1), str(int(MAIN_CANDIDATE) + 2)]

random.seed(2026)  # reproducible "random" payloads run to run

RESUME_PATH = "/api/resumes"

FIRST_NAMES = ["Amir", "Benjamin", "Chen", "Diego", "Esther", "Farah", "Gina", "Hana"]
LAST_NAMES = ["Ahmed", "Boateng", "Chu", "Duarte", "Ezra", "Fischer", "Gomez", "Hussain"]
CITIES = [("Dhaka", "Bangladesh"), ("Berlin", "Germany"), ("Toronto", "Canada")]
COMPANIES = ["Acme Corp", "Nimbus Software", "Vector Labs", "Delta Systems"]
INSTITUTIONS = ["TU Hamburg", "University of Dhaka", "Georgia Tech"]
DEGREES = ["B.Sc. Computer Science", "M.Sc. Information Systems", "BBA Management"]
LANGS = ["English", "German", "Spanish", "French"]
TITLES = ["Full-stack CV", "Backend Focus CV", "Analyst CV"]


def call(method, path, body=None, candidate=None, expect=(200, 201, 204, 409)):
    """JSON request helper; returns (status, parsed). 409s are tolerated."""
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json", "X-User-Id": candidate or MAIN_CANDIDATE}
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            status, raw = resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read().decode()
    parsed = json.loads(raw) if raw else None
    if status not in expect:
        raise SystemExit(f"seed failure: {method} {path} -> {status}: {raw[:500]}")
    return status, parsed


def reserve_resume(candidate, title, extra=None):
    """Creates a resume (or recovers its id after a duplicate-title conflict)."""
    payload = {"title": title}
    payload.update(extra or {})
    status, resume = call("POST", RESUME_PATH + "/create", payload, candidate=candidate)
    resume_id = resume.get("id") if resume else None
    if resume_id is None:
        mine, _ = call("GET", RESUME_PATH + "/my-resumes", None, candidate=candidate, expect=(200,))
        resume_id = next((r["id"] for r in mine if r.get("title") == title), None)
    label = "[exists]" if status == 409 else ""
    print(f"  resume  {title:>18} ({candidate}) -> id {resume_id} {label}")
    return resume_id


def main():
    today = date.today()
    ids = {"resumes": {}, "sections": {}}
    print(f"Seeding {BASE} as candidates {MAIN_CANDIDATE}/{','.join(OTHER_CANDIDATES)}\n")

    # ==================== candidate 1: the power user ====================
    me = MAIN_CANDIDATE
    first, last = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    city, country = random.choice(CITIES)

    for title in TITLES:
        ids["resumes"][title] = reserve_resume(me, title, {
            "template": random.choice(["DEFAULT", "MODERN", "CLASSIC", "PROFESSIONAL"]),
            "visibility": random.choice(["PRIVATE", "PUBLIC", "LINK_ONLY"]),
        })

    main_id = ids["resumes"][TITLES[0]]
    second_id = ids["resumes"][TITLES[1]]

    call("PATCH", f"{RESUME_PATH}/{main_id}/personal-info", {
        "firstName": first, "lastName": last,
        "headline": random.choice(["Backend engineer", "Full-stack developer", "Data analyst"]),
        "email": f"{first.lower()}.{last.lower()}@example.com",
        "phone": f"+88017{random.randint(10000000, 99999999)}",
        "city": city, "country": country,
        "linkedInUrl": f"https://linkedin.com/in/{first.lower()}{last.lower()}",
    }, candidate=me)
    print(f"  info    personal info on '{TITLES[0]}'")

    for title in TITLES:
        call("PATCH", f"{RESUME_PATH}/{ids['resumes'][title]}/summary", {
            "summary": random.choice([
                "Building reliable platform services with Spring Boot and PostgreSQL.",
                "Turning data into decisions with SQL, Python and dashboarding.",
                "Shipping accessible web experiences from design hand-off to prod.",
            ])
        }, candidate=me)
        print(f"  summary on '{title}'")

    def push(segment, payload):
        _, row = call("POST", f"{RESUME_PATH}/{main_id}/{segment}", payload, candidate=me)
        if row:
            ids["sections"].setdefault(segment, []).append(row["id"])
        return row

    # work experiences: one current, one ended posting
    for name, current in [(COMPANIES[0], True), (COMPANIES[1], False)]:
        start = today - timedelta(days=random.randint(700, 1200 if current else 2200))
        exp = push("work-experiences", {
            "companyName": name,
            "companyLogoUrl": f"https://pics.example.com/{name.lower().replace(' ', '')}.png",
            "position": random.choice(["Backend Lead", "Senior Engineer", "Platform Engineer"]),
            "employmentType": "FULL_TIME",
            "address": f"{random.randint(1, 120)} Tech Street", "city": city,
            "state": None, "country": country, "zipCode": str(random.randint(1000, 9999)),
            "startDate": start.isoformat(),
            "endDate": None if current else (start + timedelta(days=random.randint(300, 600))).isoformat(),
            "isCurrentJob": current,
            "description": random.choice([
                "Leading the payments platform team and their reliability roadmap.",
                "Designed event pipelines that cut batch settlement time by half.",
            ]),
            "technologies": random.sample(
                ["Java", "Spring Boot", "Kotlin", "Kafka", "PostgreSQL", "Redis", "Docker"],
                random.randint(2, 5)),
            "displayOrder": 0,
        })
        print(f"  work    {name:>14} ({'current' if current else 'past'}) -> id {exp['id']}")

    # education: one ongoing master plus one finished bachelor
    for degree, studying in [(DEGREES[1], True), (DEGREES[0], False)]:
        inst = random.choice(INSTITUTIONS)
        start = today - timedelta(days=random.randint(1500, 3000))
        grad = start + timedelta(days=1095)
        edu = push("educations", {
            "institutionName": inst, "degree": degree,
            "fieldOfStudy": random.choice(
                ["Software Systems", "Data Management", "Human-Computer Interaction"]),
            "grade": f"{random.uniform(1.0, 4.0):.1f}",
            "startDate": start.isoformat(),
            "endDate": None if studying else grad.isoformat(),
            "isCurrentlyStudying": studying,
            "description": None, "displayOrder": 0,
        })
        print(f"  educ    {inst:>18} ({degree[:20]:<20}) -> id {edu['id']}")

    for name in random.sample(["Java", "Spring Boot", "PostgreSQL", "Kafka", "Redis", "Docker",
                               "TypeScript", "React", "GraphQL", "AWS", "Python", "pandas"],
                              random.randint(5, 8)):
        skill = push("skills", {
            "skillName": name,
            "proficiencyLevel": random.choice(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
            "yearsOfExperience": random.randint(1, 12), "displayOrder": 0,
        })
        print(f"  skill   {name:>18} -> id {skill['id']}")

    for lang in random.sample(LANGS, 3):
        lang = push("languages", {
            "languageName": lang,
            "proficiency": random.choice(["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE"]),
            "displayOrder": 0,
        })
        print(f"  lang    {lang['language']:>18} -> id {lang['id']}")

    for name in ["Job Portal AI Matcher", "Data Pipeline Toolkit"]:
        ongoing = name == "Job Portal AI Matcher"
        start = today - timedelta(days=random.randint(200, 500))
        slug = name.lower().replace(" ", "-")
        proj = push("projects", {
            "title": name,
            "description": random.choice([
                "Prototype matching engine pairing candidate resumes with postings.",
                "Small data-pipeline toolkit with connectors and retries.",
            ]),
            "technologies": random.sample(
                ["Spring Boot", "PostgreSQL", "Python", "Airflow", "React"], random.randint(2, 4)),
            "projectUrl": f"https://example.com/{slug}",
            "sourceCodeUrl": f"https://github.com/example/{slug}",
            "startDate": start.isoformat(),
            "endDate": None if ongoing else (start + timedelta(days=random.randint(60, 240))).isoformat(),
            "displayOrder": 0,
        })
        print(f"  project {name:>18} -> id {proj['id']}")

    for name in ["AWS Certified Solutions Architect", "Oracle Java SE"]:
        issue = today - timedelta(days=random.randint(100, 900))
        cert = push("certifications", {
            "name": name,
            "issuingOrganization": random.choice(["Amazon Web Services", "Oracle", "CNCF"]),
            "issueDate": issue.isoformat(),
            "expirationDate": None if random.random() < 0.4
            else (issue + timedelta(days=730)).isoformat(),
            "credentialId": f"CRED-{random.randint(10000, 99999)}",
            "credentialUrl": f"https://cred.example.com/{random.randint(1000, 9999)}",
            "displayOrder": 0,
        })
        print(f"  cert    {name:>34} -> id {cert['id']}")

    for name in ["Hackathon winner", "Employee of the quarter"]:
        award = push("awards", {
            "title": name,
            "issuer": random.choice(COMPANIES + ["DemoDay", "City Hack 2025"]),
            "dateAwarded": (today - timedelta(days=random.randint(60, 1200))).isoformat(),
            "description": "Recognised for measurable impact.", "displayOrder": 0,
        })
        print(f"  award   {name:>18} -> id {award['id']}")

    # default flip + delete to exercise the promotion rule
    call("POST", f"{RESUME_PATH}/{second_id}/set-default", None, candidate=me)
    print(f"  default '{TITLES[1]}' is now the apply-with resume")
    call("DELETE", f"{RESUME_PATH}/{ids['resumes'][TITLES[2]]}", None, candidate=me, expect=(204, 404))
    print(f"  delete  '{TITLES[2]}' removed (newest survivor gets promoted)")

    # ====================== candidate 2: minimal shell ===================
    me2 = OTHER_CANDIDATES[0]
    ids["resumes"][f"minimal:{me2}"] = reserve_resume(
        me2, f"{random.choice(FIRST_NAMES)}'s first CV")

    # ======================= candidate 3: medium =========================
    me3 = OTHER_CANDIDATES[1]
    first3, last3 = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    city3, country3 = random.choice(CITIES)
    mid_id = reserve_resume(me3, "Frontend CV", {"template": "MODERN", "isDefault": True})
    ids["resumes"][f"medium:{me3}"] = mid_id
    call("PATCH", f"{RESUME_PATH}/{mid_id}/personal-info", {
        "firstName": first3, "lastName": last3,
        "email": f"{first3.lower()}.{last3.lower()}@example.com",
        "city": city3, "country": country3,
    }, candidate=me3)
    call("PATCH", f"{RESUME_PATH}/{mid_id}/summary",
         {"summary": "React specialist with a taste for design systems."}, candidate=me3)
    for company, current in [(COMPANIES[2], True), (COMPANIES[3], False)]:
        start = today - timedelta(days=random.randint(400, 1500))
        _, exp = call("POST", f"{RESUME_PATH}/{mid_id}/work-experiences", {
            "companyName": company,
            "position": random.choice(["Frontend Developer", "UI Engineer"]),
            "employmentType": "FULL_TIME",
            "city": city3, "country": country3,
            "startDate": start.isoformat(),
            "endDate": None if current else (start + timedelta(days=random.randint(200, 600))).isoformat(),
            "isCurrentJob": current, "technologies": ["React", "TypeScript"], "displayOrder": 0,
        }, candidate=me3)
        if exp:
            ids["sections"].setdefault(f"work-experiences({me3})", []).append(exp["id"])
            print(f"  work    {company:>14} ({me3}) -> id {exp['id']}")
    for name in random.sample(["React", "TypeScript", "CSS", "Figma"], 3):
        _, skill = call("POST", f"{RESUME_PATH}/{mid_id}/skills", {
            "skillName": name, "proficiencyLevel": "ADVANCED",
            "yearsOfExperience": random.randint(1, 8), "displayOrder": 0,
        }, candidate=me3)
        if skill:
            ids["sections"].setdefault(f"skills({me3})", []).append(skill["id"])

    print("\nids summary:")
    print(json.dumps(ids, indent=2))


if __name__ == "__main__":
    main()
