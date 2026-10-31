#!/usr/bin/env python3
"""
AI service smoke suite: exercises every generation surface of the running
ai-service (direct port 5007, like the sibling seed scripts) with fixed sample
payloads. At least one AI key (GEMINI_API_KEY / GROQ_API_KEY) must be present
inside the service process; when the service answers 503
"No AI provider is configured", every generation check reports SKIP instead of
FAIL so the suite doubles as a "did the keys land?" probe.

Usage:
    python3 seed/smoke.py [base_url]

Defaults: http://localhost:5007. Unlike the sibling seed scripts nothing is
persisted - the service has no database; every check is a live generation.

Checks (PASS / FAIL / SKIP, one line each):
  health, playground GET, playground POST (gemini + groq), then the four
  feature areas: resume (summary, experience-bullets, improvements,
  career-feedback), job (description, requirements, responsibilities,
  benefits, skills, tags, salary-suggestion), application (cover-letter,
  screening-score, skills-gap), search (enhance, alert-suggestion).
Exit code 0 unless a check FAILed.
"""
import json
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5007"
if not BASE.startswith("http://"):  # tolerate scheme-less "localhost:5007"
    BASE = "http://" + BASE

IDENTITY = {"X-User-Id": "9999"}  # the service ignores it; mirrors sibling seeds

results = []


def call(method, path, body=None, timeout=90, expect=(200,)):
    """JSON request helper; returns (status, parsed-or-None)."""
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json", **IDENTITY}
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status, raw = resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read().decode()
    try:
        parsed = json.loads(raw) if raw else None
    except json.JSONDecodeError:
        parsed = raw
    ok = status in expect
    return ok, status, parsed


def record(name, ok, status, parsed, extra=""):
    """SKIP on a deliberate provider-unconfigured 503, otherwise PASS/FAIL."""
    unconfigured = status == 503 and parsed and isinstance(parsed, dict) \
        and "No AI provider is configured" in str(parsed.get("message", ""))
    verdict = "SKIP" if unconfigured else ("PASS" if ok else "FAIL")
    line = f"{verdict:4} {name}  (HTTP {status})"
    if not ok and parsed is not None:
        line += f" - {str(parsed)[:200]}"
    if ok and extra:
        line += f"  [{extra}]"
    results.append((verdict, line))
    print(line)


def get(name, path, expect=(200,), expect_json=True):
    ok, status, parsed = call("GET", path, expect=expect)
    record(name, ok, status, parsed if expect_json else "text")


def post(name, path, body, expect=(200,), validate=None):
    ok, status, parsed = call("POST", path, body=body, expect=expect)
    detail = ""
    if ok and validate:
        try:
            detail = validate(parsed)
            ok = detail is not None
        except Exception as probe:  # shape mismatch shows up as a FAIL
            ok, parsed = False, probe
    record(name, ok, status, parsed, detail)


def text_ok(parsed):
    content = (parsed or {}).get("content")
    return content if content and len(content) > 40 else None


def field(name):
    def probe(parsed):
        data = parsed or {}
        return f"{name}={str(data.get(name))[:60]}"
    return probe


# ------------------------------------------------------------ 1. plumbing

get("health", "/")
get("playground GET /default", "/api/ai/default/careertips", expect_json=False)
post("playground POST gemini", "/api/ai/gemini/generate",
     {"prompt": "In one sentence, why should a candidate tailor a resume per job?"}, validate=text_ok)
post("playground POST groq", "/api/ai/groq/generate",
     {"prompt": "In one sentence, what does an ATS scan look for?"}, validate=text_ok)

# --------------------------------------------------------- 2. resume optimization

post("resume/summary", "/api/ai/resume/summary", {
    "targetJobTitle": "Senior Backend Engineer",
    "yearsOfExperience": 6,
    "workExperiences": [
        {"jobTitle": "Backend Engineer", "company": "Dhaka Soft",
         "description": "Built payment APIs handling 200k requests a day on Java and Spring Boot."}
    ],
    "skills": ["Java", "Spring Boot", "PostgreSQL", "Kafka"],
    "educations": [{"degree": "BSc", "fieldOfStudy": "CSE", "institutionName": "BUET"}]
}, validate=text_ok)

post("resume/experience-bullets", "/api/ai/resume/experience-bullets", {
    "jobTitle": "Backend Engineer",
    "company": "Dhaka Soft",
    "rawDescription": "worked on backend apis and fixed some performance issues, mentored juniors",
    "achievementsHint": "payment api cut checkout time roughly in half"
}, validate=field("bullets"))

post("resume/improvements", "/api/ai/resume/improvements", {
    "resumeContent": "Junior developer. Skills: Java, Python. Studies at DU. "
                     "3 months internship at a local company, no projects listed.",
    "targetJobTitle": "Backend Engineer"
}, validate=field("overallScore"))

post("resume/career-feedback", "/api/ai/resume/career-feedback", {
    "resumeContent": "Graduate, taught himself React and Django, built 2 small portfolio "
                     "projects, no work experience, no certifications, no linkedin link.",
    "targetJobTitle": "Full Stack Developer"
}, validate=field("profileStrength"))

# --------------------------------------------------------- 3. job auto-generate

post("job/description", "/api/ai/job/description", {
    "title": "Senior Android Engineer",
    "skills": ["Kotlin", "Jetpack Compose", "Firebase"],
    "experienceLevel": "SENIOR_LEVEL",
    "jobType": "FULL_TIME",
    "workMode": "HYBRID",
    "category": "Mobile Development",
    "additionalContext": "Fintech scale-up, 200 engineers, ship weekly."
}, validate=text_ok)

post("job/requirements", "/api/ai/job/requirements?title=Data%20Analyst&category=Analytics",
     None, validate=text_ok)
post("job/responsibilities", "/api/ai/job/responsibilities?title=DevOps%20Engineer&category=Cloud",
     None, validate=text_ok)
post("job/benefits", "/api/ai/job/benefits?title=Graphic%20Designer&category=Design&jobType=FULL_TIME",
     None, validate=text_ok)

post("job/skills", "/api/ai/job/skills", {
    "title": "Machine Learning Engineer",
    "description": "Build recommendation pipelines on Spark, fine-tune transformer models, "
                   "deploy with Kubernetes."
}, validate=text_ok)
post("job/tags", "/api/ai/job/tags", {
    "title": "Machine Learning Engineer",
    "description": "Recommendation systems, Python, distributed training on GPUs."
}, validate=text_ok)

post("job/salary-suggestion", "/api/ai/job/salary-suggestion", {
    "title": "Staff Backend Engineer",
    "skills": ["Java", "Kafka", "gRPC"],
    "experienceLevel": "SENIOR_LEVEL",
    "jobType": "FULL_TIME",
    "location": "Dhaka, Bangladesh"
}, validate=field("minSalary"))

# ---------------------------------------------------- 4. application support

post("application/cover-letter", "/api/ai/application/cover-letter", {
    "jobTitle": "Platform Engineer",
    "jobDescription": "Automate the deploy pipeline, own the observability stack, "
                      "run the on-call rota for a Kubernetes platform.",
    "candidateName": "Rahim Uddin",
    "candidateSummary": "SRE-leaning backend engineer with 5 years on AWS and Terraform.",
    "candidateSkills": ["Kubernetes", "Terraform", "Go", "Prometheus"],
    "candidateExperience": [
        "Cut deploy time from 40 minutes to 6 minutes at a logistics company.",
        "Wrote the incident runbooks used company-wide."
    ],
    "targetCompanyName": "Yellow Energy"
}, validate=text_ok)

post("application/screening-score", "/api/ai/application/screening-score", {
    "jobTitle": "React Frontend Engineer",
    "experienceLevel": "MID_LEVEL",
    "requiredSkills": ["React", "TypeScript", "REST APIs", "testing"],
    "responsibilities": "Ship web features, keep component tests green, collaborate with design.",
    "candidateSummary": "2 years on Vue apps, keen to move to React.",
    "candidateSkills": ["Vue", "JavaScript", "TypeScript basics"],
    "candidateExperience": ["Maintained an admin dashboard used by 300 staff."]
}, validate=field("score"))

post("application/skills-gap", "/api/ai/application/skills-gap", {
    "jobTitle": "Data Engineer",
    "candidateSkills": ["Python", "SQL", "Pandas"],
    "requiredSkills": ["Airflow", "dbt", "BigQuery", "Spark", "SQL", "Python"]
}, validate=field("overallReadiness"))

# --------------------------------------------------------- 5. NL job search

post("search/enhance", "/api/ai/search/enhance", {
    "query": "remote full time python jobs in dhaka for a senior dev paying at least 150000"
}, validate=field("keywords"))

post("search/alert-suggestion", "/api/ai/search/alert-suggestion", {
    "skills": ["Go", "PostgreSQL", "Redis"],
    "experienceLevel": "MID_LEVEL",
    "previousJobTitles": ["Backend Developer"],
    "educations": ["BSc CSE"]
}, validate=field("reasoning"))

# ------------------------------------------------------------------ summary

passed = sum(1 for verdict, _ in results if verdict == "PASS")
skipped = sum(1 for verdict, _ in results if verdict == "SKIP")
failed = sum(1 for verdict, _ in results if verdict == "FAIL")
print(f"\n{len(results)} checks: {passed} PASS / {skipped} SKIP / {failed} FAIL")
print("SKIP usually means no AI key reached the service - export GEMINI_API_KEY "
      "or GROQ_API_KEY and restart it.")
sys.exit(1 if failed else 0)
