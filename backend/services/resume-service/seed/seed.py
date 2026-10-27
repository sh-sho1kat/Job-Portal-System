#!/usr/bin/env python3
"""
Random seed for resume_db, delivered through the resume-service API.

Builds three candidates' resume sets: one power user (multiple resumes,
every sub-section, default flip + delete-promotion flow), one minimal shell,
and one medium resume. Generated ids are printed at the end for reuse in
tests/Postman. Re-runs tolerate previous leftovers via the 409 duplicate
guards (ids recovered from the list endpoint).

Usage:
    python3 seed/seed.py [base_url] [main_candidate] [random_seed]

Defaults: http://localhost:5004, candidate 3001, seed 2026 (temporary
X-User-Id stand-in). The other candidates are main+1 and main+2; give
different candidates and/or seeds to grow more distinct sample data.
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
random.seed(int(sys.argv[3]) if len(sys.argv) > 3 else 2026)

RESUME_PATH = "/api/resumes"

FIRST_NAMES = ["Amir", "Benjamin", "Chen", "Diego", "Esther", "Farah", "Gina", "Hana",
               "Ivan", "Junaid", "Kemi", "Leila", "Marcus", "Nadia", "Omar", "Priya"]
LAST_NAMES = ["Ahmed", "Boateng", "Chu", "Duarte", "Ezra", "Fischer", "Gomez", "Hussain",
              "Iqbal", "Jensen", "Kowalski", "Lindqvist", "Moreau", "Novak", "Okafor", "Patel"]
CITIES = [("Dhaka", "Bangladesh"), ("Berlin", "Germany"), ("Toronto", "Canada"),
          ("Madrid", "Spain"), ("Singapore", "Singapore"), ("Austin", "United States")]
COMPANIES = ["Acme Corp", "Nimbus Software", "Vector Labs", "Delta Systems",
             "Helios Digital", "Quanta Works", "Orbital Retail", "Cobalt Health"]
INSTITUTIONS = ["TU Hamburg", "University of Dhaka", "Georgia Tech",
                "TU Delft", "NUS Singapore", "University of Waterloo"]
DEGREES = ["B.Sc. Computer Science", "M.Sc. Information Systems", "BBA Management",
           "B.Sc. Data Science", "M.Eng. Software Engineering"]
HEADLINES = ["Backend engineer", "Full-stack developer", "Data analyst",
             "Frontend developer", "DevOps engineer", "Product-minded engineer"]
SUMMARIES = [
    "Building reliable platform services with Spring Boot and PostgreSQL.",
    "Turning data into decisions with SQL, Python and dashboarding.",
    "Shipping accessible web experiences from design hand-off to prod.",
    "Automating everything twice; operating it once with care.",
    "Design systems, performance budgets and a distaste for flaky tests.",
    "Products over projects: shipping measurable improvements weekly.",
]
POSITIONS = ["Backend Lead", "Senior Engineer", "Platform Engineer",
             "Data Engineer", "Frontend Developer", "QA Automation Engineer"]
SKILL_BANK = ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Redis", "Docker",
              "TypeScript", "React", "GraphQL", "AWS", "Python", "pandas",
              "Kubernetes", "Terraform", "MongoDB", "Go", "Figma", "Playwright"]
PROJECTS = ["Job Portal AI Matcher", "Data Pipeline Toolkit", "Wallet Sync Service",
            "Inventory Forecasting App", "Team retro board", "Resume builder parser"]
CERTS = ["AWS Certified Solutions Architect", "Oracle Java SE", "Azure Developer Associate",
         "Google Cloud Professional", "Certified Scrum Master"]
AWARDS = ["Hackathon winner", "Employee of the quarter", "Best capstone project",
          "Open-source contributor spotlight"]
LANGS = ["English", "German", "Spanish", "French", "Bengali", "Portuguese", "Dutch"]
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
        _, mine = call("GET", RESUME_PATH + "/my-resumes", None, candidate=candidate, expect=(200,))
        resume_id = next((r["id"] for r in mine if r.get("title") == title), None)
    label = "" if resume_id is not None else "[unavailable]"
    print(f"  resume  {title:>18} ({candidate}) -> id {resume_id} {label}")
    return resume_id


def add_section(candidate, resume_id, segment, payload, label=None):
    """Adds a sub-section row; duplicates (409) and bad targets are skipped."""
    if resume_id is None:
        return None
    status, row = call("POST", f"{RESUME_PATH}/{resume_id}/{segment}", payload, candidate=candidate)
    if row and row.get("id"):
        return row
    print(f"  skip    {segment} -> {status} (duplicate or invalid)")
    return None


def main():
    today = date.today()
    ids = {"resumes": {}, "sections": {}}
    print(f"Seeding {BASE} as candidates {MAIN_CANDIDATE}/{','.join(OTHER_CANDIDATES)}\n")

    # ==================== candidate 1: the power user ====================
    def track(segment, row):
        if row:
            ids["sections"].setdefault(segment, []).append(row["id"])
        return row

    me = MAIN_CANDIDATE
    first, last = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    city, country = random.choice(CITIES)

    resume_ids = {}
    for title in TITLES:
        resume_ids[title] = reserve_resume(me, title, {
            "template": random.choice(["DEFAULT", "MODERN", "CLASSIC", "PROFESSIONAL"]),
            "visibility": random.choice(["PRIVATE", "PUBLIC", "LINK_ONLY"]),
        })
        ids["resumes"][title] = resume_ids[title]

    main_id = resume_ids[TITLES[0]]
    second_id = resume_ids[TITLES[1]]

    if main_id:
        call("PATCH", f"{RESUME_PATH}/{main_id}/personal-info", {
            "firstName": first, "lastName": last,
            "headline": random.choice(HEADLINES),
            "email": f"{first.lower()}.{last.lower()}{random.randint(1, 99)}@example.com",
            "phone": f"+88017{random.randint(10000000, 99999999)}",
            "city": city, "country": country,
            "linkedInUrl": f"https://linkedin.com/in/{first.lower()}{last.lower()}"
                           f"{random.randint(1, 999)}",
        }, candidate=me)
        print(f"  info    personal info on '{TITLES[0]}'")

    for title, resume_id in resume_ids.items():
        if not resume_id:
            continue
        call("PATCH", f"{RESUME_PATH}/{resume_id}/summary",
             {"summary": random.choice(SUMMARIES)}, candidate=me)
        print(f"  summary on '{title}'")

    # work experiences: one current, one ended posting
    picked = random.sample(COMPANIES, 2)
    for name, current in [(picked[0], True), (picked[1], False)]:
        start = today - timedelta(days=random.randint(700, 1200 if current else 2200))
        exp = track("work-experiences", add_section(me, main_id, "work-experiences", {
            "companyName": name,
            "companyLogoUrl": f"https://pics.example.com/{name.lower().replace(' ', '')}.png",
            "position": random.choice(POSITIONS),
            "employmentType": random.choice(["FULL_TIME", "FULL_TIME", "CONTRACT"]),
            "address": f"{random.randint(1, 120)} Tech Street", "city": city,
            "state": None, "country": country, "zipCode": str(random.randint(1000, 9999)),
            "startDate": start.isoformat(),
            "endDate": None if current else (start + timedelta(days=random.randint(300, 600))).isoformat(),
            "isCurrentJob": current,
            "description": random.choice([
                "Leading the payments platform team and their reliability roadmap.",
                "Designed event pipelines that cut batch settlement time by half.",
                "Scaled the ingest service from 5k to 1M events/day without new nodes.",
            ]),
            "technologies": random.sample(SKILL_BANK[:8], random.randint(2, 5)),
            "displayOrder": 0,
        }))
        print(f"  work    {name:>14} ({'current' if current else 'past'}) -> id {exp['id'] if exp else '-'}")

    # education: one ongoing programme plus one finished one
    for degree, studying in [(random.choice(DEGREES), True), (random.choice(DEGREES), False)]:
        inst = random.choice(INSTITUTIONS)
        start = today - timedelta(days=random.randint(1500, 3000))
        grad = start + timedelta(days=1095)
        edu = track("educations", add_section(me, main_id, "educations", {
            "institutionName": inst, "degree": degree,
            "fieldOfStudy": random.choice(
                ["Software Systems", "Data Management", "Human-Computer Interaction"]),
            "grade": f"{random.uniform(1.0, 4.0):.1f}",
            "startDate": start.isoformat(),
            "endDate": None if studying else grad.isoformat(),
            "isCurrentlyStudying": studying,
            "description": None, "displayOrder": 0,
        }))
        print(f"  educ    {inst:>18} ({degree[:20]:<20}) -> id {edu['id'] if edu else '-'}")

    for name in random.sample(SKILL_BANK, random.randint(5, 8)):
        skill = track("skills", add_section(me, main_id, "skills", {
            "skillName": name,
            "proficiencyLevel": random.choice(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
            "yearsOfExperience": random.randint(1, 12), "displayOrder": 0,
        }))
        print(f"  skill   {name:>18} -> id {skill['id'] if skill else '-'}")

    for lang in random.sample(LANGS, 3):
        row = track("languages", add_section(me, main_id, "languages", {
            "languageName": lang,
            "proficiency": random.choice(["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE"]),
            "displayOrder": 0,
        }))
        print(f"  lang    {lang:>18} -> id {row['id'] if row else '-'}")

    for name in random.sample(PROJECTS, 2):
        ongoing = random.random() < 0.6
        start = today - timedelta(days=random.randint(200, 500))
        slug = name.lower().replace(" ", "-")
        proj = track("projects", add_section(me, main_id, "projects", {
            "title": name,
            "description": random.choice(SUMMARIES),
            "technologies": random.sample(SKILL_BANK, random.randint(2, 4)),
            "projectUrl": f"https://example.com/{slug}-{random.randint(1, 99)}",
            "sourceCodeUrl": f"https://github.com/example/{slug}",
            "startDate": start.isoformat(),
            "endDate": None if ongoing else (start + timedelta(days=random.randint(60, 240))).isoformat(),
            "displayOrder": 0,
        }))
        print(f"  project {name:>18} -> id {proj['id'] if proj else '-'}")

    for name in random.sample(CERTS, 2):
        issue = today - timedelta(days=random.randint(100, 900))
        cert = track("certifications", add_section(me, main_id, "certifications", {
            "name": name,
            "issuingOrganization": random.choice(["Amazon Web Services", "Oracle", "CNCF",
                                                  "Microsoft", "Google", "Scrum Alliance"]),
            "issueDate": issue.isoformat(),
            "expirationDate": None if random.random() < 0.4
            else (issue + timedelta(days=730)).isoformat(),
            "credentialId": f"CRED-{random.randint(10000, 99999)}",
            "credentialUrl": f"https://cred.example.com/{random.randint(1000, 9999)}",
            "displayOrder": 0,
        }))
        print(f"  cert    {name:>34} -> id {cert['id'] if cert else '-'}")

    for name in random.sample(AWARDS, 2):
        award = track("awards", add_section(me, main_id, "awards", {
            "title": name,
            "issuer": random.choice(COMPANIES + ["DemoDay", "City Hack 2025"]),
            "dateAwarded": (today - timedelta(days=random.randint(60, 1200))).isoformat(),
            "description": "Recognised for measurable impact.", "displayOrder": 0,
        }))
        print(f"  award   {name:>18} -> id {award['id'] if award else '-'}")

    # default flip + delete to exercise the promotion rule
    if second_id:
        call("POST", f"{RESUME_PATH}/{second_id}/set-default", None, candidate=me)
        print(f"  default '{TITLES[1]}' is now the apply-with resume")
    third_id = resume_ids[TITLES[2]]
    if third_id:
        call("DELETE", f"{RESUME_PATH}/{third_id}", None, candidate=me, expect=(204, 404))
        print(f"  delete  '{TITLES[2]}' removed (newest survivor gets promoted)")

    # ====================== candidate 2: minimal shell ===================
    me2 = OTHER_CANDIDATES[0]
    ids["resumes"][f"minimal:{me2}"] = reserve_resume(
        me2, f"{random.choice(FIRST_NAMES)}'s first CV")

    # ======================= candidate 3: medium =========================
    me3 = OTHER_CANDIDATES[1]
    first3, last3 = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    city3, country3 = random.choice(CITIES)
    mid_id = reserve_resume(me3, random.choice(["Frontend CV", "Data CV", "Mobile CV"]),
                            {"template": "MODERN", "isDefault": True})
    ids["resumes"][f"medium:{me3}"] = mid_id
    if mid_id:
        call("PATCH", f"{RESUME_PATH}/{mid_id}/personal-info", {
            "firstName": first3, "lastName": last3,
            "email": f"{first3.lower()}.{last3.lower()}{random.randint(1, 99)}@example.com",
            "city": city3, "country": country3,
        }, candidate=me3)
        call("PATCH", f"{RESUME_PATH}/{mid_id}/summary",
             {"summary": random.choice(SUMMARIES)}, candidate=me3)
        for company, current in [(COMPANIES[2], True), (COMPANIES[3], False)]:
            start = today - timedelta(days=random.randint(400, 1500))
            exp = track(f"work-experiences({me3})", add_section(me3, mid_id,
                          "work-experiences", {
                "companyName": company,
                "position": random.choice(POSITIONS),
                "employmentType": "FULL_TIME",
                "city": city3, "country": country3,
                "startDate": start.isoformat(),
                "endDate": None if current else (start + timedelta(days=random.randint(200, 600))).isoformat(),
                "isCurrentJob": current,
                "technologies": random.sample(SKILL_BANK, 3), "displayOrder": 0,
            }))
            print(f"  work    {company:>14} ({me3}) -> id {exp['id'] if exp else '-'}")
        for name in random.sample(SKILL_BANK, 4):
            skill = track(f"skills({me3})", add_section(me3, mid_id, "skills", {
                "skillName": name,
                "proficiencyLevel": random.choice(["ADVANCED", "INTERMEDIATE"]),
                "yearsOfExperience": random.randint(1, 8), "displayOrder": 0,
            }))
            print(f"  skill   {name:>18} ({me3}) -> id {skill['id'] if skill else '-'}")
        for lang in random.sample(LANGS, 2):
            row = track(f"languages({me3})", add_section(me3, mid_id, "languages", {
                "languageName": lang,
                "proficiency": random.choice(["FLUENT", "NATIVE", "CONVERSATIONAL"]),
                "displayOrder": 0,
            }))
            print(f"  lang    {lang:>18} ({me3}) -> id {row['id'] if row else '-'}")

    print("\nids summary:")
    print(json.dumps(ids, indent=2))


if __name__ == "__main__":
    main()
