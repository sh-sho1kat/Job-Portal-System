#!/usr/bin/env python3
"""
Random seed for job_db, delivered through the job-service API.

Creates job categories (with sub-categories), skills, tags, and a varied set
of job postings, then walks some through the DRAFT -> publish -> close flow.
Generated ids are printed at the end for reuse in tests/Postman.

Usage:
    python3 seed/seed.py [base_url] [owner_id]

Defaults: http://localhost:5003, owner 1001 (temporary X-User-Id stand-in).
"""
import json
import random
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5003"
OWNER = sys.argv[2] if len(sys.argv) > 2 else "1001"
HEADERS = {"Content-Type": "application/json", "X-User-Id": OWNER}

random.seed(2026)  # reproducible "random" payloads run to run

CATEGORY_PATH = "/api/job-categories"
SKILL_PATH = "/api/job-skills"
TAG_PATH = "/api/job-tags"
CREATE_JOB_PATH = "/api/jobs/create"

PREFIX_BY_LEVEL = {"ENTRY_LEVEL": "Junior", "MID_LEVEL": "", "SENIOR_LEVEL": "Senior",
                   "LEAD": "Lead", "EXECUTIVE": "Principal"}


def call(method, path, body=None, expect=(200, 201)):
    """Upload a JSON payload; raises on unexpected status codes."""
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as resp:
            status, raw = resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read().decode()
    parsed = json.loads(raw) if raw else None
    if status not in expect:
        raise SystemExit(f"seed failure: {method} {path} -> {status}: {raw[:500]}")
    return parsed


def main():
    today = date.today()
    categories, skills, tags, jobs = {}, {}, {}, {}

    print(f"Seeding {BASE} as user {OWNER}\n")

    # ---- categories: roots first, sub-categories under Engineering ----
    for name in ["Engineering", "Human Resources", "Finance"]:
        cat = call("POST", CATEGORY_PATH, {"name": name})
        categories[name] = cat["id"]
        print(f"  category {name:>26} -> id {cat['id']}")
    for name in ["Backend Development", "Frontend Development", "Data & AI", "DevOps & SRE"]:
        cat = call("POST", CATEGORY_PATH, {"name": name, "parentId": categories["Engineering"]})
        categories[name] = cat["id"]
        print(f"  category {name:>26} -> id {cat['id']}")

    # ---- skills per SkillCategory ----
    for name, cat in [
        ("Java", "PROGRAMMING_LANGUAGE"), ("Python", "PROGRAMMING_LANGUAGE"),
        ("TypeScript", "PROGRAMMING_LANGUAGE"), ("Spring Boot", "FRAMEWORK"),
        ("Laravel", "FRAMEWORK"), ("PostgreSQL", "DATABASE"), ("Redis", "DATABASE"),
        ("Docker", "DEVOPS"), ("Terraform", "DEVOPS"), ("Figma", "DESIGN"),
        ("Communication", "SOFT_SKILL"),
    ]:
        skill = call("POST", SKILL_PATH, {"name": name, "category": cat})
        skills[name] = skill["id"]
        print(f"  skill    {name:>26} -> id {skill['id']}")

    # ---- tags (slashes/keywords slugify into safe urls) ----
    for name in ["AI/ML", "Remote Friendly", "Competitive Programming", "High Salary", "Growth Stage"]:
        tag = call("POST", TAG_PATH, {"name": name})
        tags[name] = tag["id"]
        print(f"  tag      {name:>26} -> id {tag['id']}")

    # ---- jobs: randomized combos across companies 1-3 ----
    print()
    sub_categories = ["Backend Development", "Frontend Development", "Data & AI", "DevOps & SRE",
                      "Human Resources", "Finance"]
    roles = ["Backend Engineer", "Python AI Engineer", "Data Analyst", "Frontend Developer",
             "DevOps Engineer", "QA Automation Engineer"]
    employment = ["FULL_TIME", "FULL_TIME", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]
    offices = [("Dhaka", "Bangladesh"), ("Bengaluru", "India"), ("Kuala Lumpur", "Malaysia")]
    skill_names = list(skills)

    for i in range(6):
        exp = random.choice(["ENTRY_LEVEL", "MID_LEVEL", "SENIOR_LEVEL", "LEAD"])
        title = f"{PREFIX_BY_LEVEL[exp]} {random.choice(roles)}".strip()
        work_mode = random.choice(["REMOTE", "REMOTE", "HYBRID", "ON_SITE"])
        city = country = None
        if work_mode != "REMOTE":
            city, country = random.choice(offices)
        currency = random.choice(["BDT", "USD"])
        period = "MONTHLY" if currency == "BDT" else "YEARLY"
        unit = 1000 if currency == "BDT" else 2000
        salary_min = random.randint(60, 220 if currency == "BDT" else 60) * unit
        salary_max = salary_min + random.randint(30, 120) * unit
        picked_skills = random.sample(skill_names, random.randint(2, 5))
        picked_tags = random.sample(list(tags), random.randint(0, 4))
        category_name = random.choice(sub_categories)
        deadline = today + timedelta(days=random.randint(30, 90))
        expires = today + timedelta(days=random.randint(120, 240))
        payload = {
            "companyId": random.choice([1, 2, 3]),
            "title": title,
            "description": (
                f"We are looking for a {title} to join our {category_name} team. You will design,"
                " build and operate systems with a cross-functional team that values clean code."
            ),
            "responsibilities": "Ship features, review code, mentor teammates, own your services.",
            "requirements": f"Hands-on experience with {', '.join(picked_skills[:3])}; CS fundamentals.",
            "benefits": "Health insurance, flexible hours, yearly learning budget.",
            "employmentType": random.choice(employment),
            "experienceLevel": exp,
            "workMode": work_mode,
            "address": None if city is None else f"{random.randint(1, 120)} Tech Street",
            "city": city,
            "state": None,
            "country": country,
            "zipCode": None if city is None else f"{random.randint(1000, 9999)}",
            "salaryMin": salary_min,
            "salaryMax": salary_max,
            "salaryCurrency": currency,
            "salaryPeriod": period,
            "categoryId": categories[category_name],
            "skillIds": [skills[s] for s in picked_skills],
            "tagIds": [tags[t] for t in picked_tags],
            "vacancies": random.randint(1, 4),
            "applicationDeadline": deadline.isoformat(),
            "expiresAt": expires.isoformat(),
        }
        job = call("POST", CREATE_JOB_PATH, payload)
        jobs[title] = job["id"]
        location = f"{city}, {country}" if city else "REMOTE"
        print(f"  draft    {title:>36} ({location}, {currency}) -> id {job['id']}")

    titles = list(jobs)
    # publish 4 of the 6 drafts, close one, leave the rest for draft-flow checks
    for title in titles[:4]:
        job = call("POST", f"/api/jobs/{jobs[title]}/publish")
        print(f"  publish  {title:>36} -> {job['status']}")
    closed = call("POST", f"/api/jobs/{jobs[titles[0]]}/close")
    print(f"  close    {titles[0]:>36} -> {closed['status']}")

    print("\nids summary:")
    print(json.dumps({"categories": categories, "skills": skills, "tags": tags, "jobs": jobs}, indent=2))


if __name__ == "__main__":
    main()
