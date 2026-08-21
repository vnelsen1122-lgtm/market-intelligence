from __future__ import annotations

import csv
import json
import math
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile


WORKBOOK = Path("/Users/vanessanelsen/Desktop/enforcement_cases_osha_revised_march.xlsx")
INSPECTION_DIR = Path("/Users/vanessanelsen/Desktop/OSHA_inspection")
VIOLATION_DIR = Path("/Users/vanessanelsen/Desktop/OSHA_violation_event")
OUTPUT = Path(__file__).resolve().parents[1] / "app" / "enforcement-data.ts"

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def read_xlsx_rows(path: Path) -> list[dict[str, str]]:
    ns = {"m": MAIN_NS, "r": REL_NS}
    with ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in root.findall("m:si", ns):
                shared_strings.append("".join(node.text or "" for node in item.iter(f"{{{MAIN_NS}}}t")))

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relationship_map = {item.attrib["Id"]: item.attrib["Target"] for item in relationships}
        sheet = workbook.find("m:sheets", ns)[0]
        target = relationship_map[sheet.attrib[f"{{{REL_NS}}}id"]]
        if not target.startswith("/"):
            target = f"xl/{target.lstrip('/')}"
        root = ET.fromstring(archive.read(target))

        raw_rows: list[dict[str, str]] = []
        for row in root.findall(".//m:sheetData/m:row", ns):
            values: dict[str, str] = {}
            for cell in row.findall("m:c", ns):
                column = re.match(r"[A-Z]+", cell.attrib["r"]).group()
                value_node = cell.find("m:v", ns)
                value = ""
                if cell.attrib.get("t") == "s" and value_node is not None:
                    value = shared_strings[int(value_node.text)]
                elif cell.attrib.get("t") == "inlineStr":
                    inline = cell.find("m:is", ns)
                    if inline is not None:
                        value = "".join(node.text or "" for node in inline.iter(f"{{{MAIN_NS}}}t"))
                elif value_node is not None:
                    value = value_node.text or ""
                values[column] = value
            raw_rows.append(values)

    headers = raw_rows[0]
    return [
        {headers[column]: row.get(column, "") for column in headers}
        for row in raw_rows[1:]
        if any(row.get(column, "") for column in headers)
    ]


def inspection_key(value: str) -> str:
    try:
        return str(math.floor(float(value)))
    except (TypeError, ValueError):
        return ""


def excel_date(value: str) -> str:
    try:
        return (datetime(1899, 12, 30) + timedelta(days=float(value))).date().isoformat()
    except (TypeError, ValueError):
        return value[:10]


def number(value: str) -> float:
    try:
        return float(value or 0)
    except ValueError:
        return 0


def sector_code(naics: str) -> str:
    digits = re.sub(r"\D", "", naics or "")
    if len(digits) < 2:
        return "Unknown"
    prefix = digits[:2]
    return "31-33" if prefix in {"31", "32", "33"} else "44-45" if prefix in {"44", "45"} else "48-49" if prefix in {"48", "49"} else prefix


SECTOR_TITLES = {
    "11": "Agriculture, Forestry, Fishing & Hunting",
    "21": "Mining, Quarrying & Oil and Gas",
    "22": "Utilities",
    "23": "Construction",
    "31-33": "Manufacturing",
    "42": "Wholesale Trade",
    "44-45": "Retail Trade",
    "48-49": "Transportation & Warehousing",
    "51": "Information",
    "52": "Finance & Insurance",
    "53": "Real Estate, Rental & Leasing",
    "54": "Professional, Scientific & Technical Services",
    "55": "Management of Companies",
    "56": "Administrative, Waste & Remediation Services",
    "61": "Educational Services",
    "62": "Health Care & Social Assistance",
    "71": "Arts, Entertainment & Recreation",
    "72": "Accommodation & Food Services",
    "81": "Other Services",
    "92": "Public Administration",
    "Unknown": "Unclassified",
}


def main() -> None:
    workbook_rows = read_xlsx_rows(WORKBOOK)
    targets = {inspection_key(row["INSPECTION_NUMBER"]) for row in workbook_rows}
    inspections: dict[str, dict[str, str]] = {}

    for path in sorted(INSPECTION_DIR.glob("*.csv")):
        with path.open(newline="", encoding="utf-8-sig", errors="replace") as handle:
            for row in csv.DictReader(handle):
                key = row.get("ACTIVITY_NR", "")
                if key in targets:
                    inspections[key] = row

    violation_counts: Counter[str] = Counter()
    violation_penalties: defaultdict[str, float] = defaultdict(float)
    willful_counts: Counter[str] = Counter()
    repeat_counts: Counter[str] = Counter()
    for path in sorted(VIOLATION_DIR.glob("*.csv")):
        with path.open(newline="", encoding="utf-8-sig", errors="replace") as handle:
            for row in csv.DictReader(handle):
                key = row.get("ACTIVITY_NR", "")
                if key not in targets:
                    continue
                violation_counts[key] += 1
                violation_penalties[key] += number(row.get("HIST_PENALTY", ""))
                violation_type = (row.get("HIST_VTYPE") or "").upper()
                if violation_type == "W":
                    willful_counts[key] += 1
                if violation_type == "R":
                    repeat_counts[key] += 1

    cases = []
    for row in workbook_rows:
        key = inspection_key(row["INSPECTION_NUMBER"])
        inspection = inspections.get(key, {})
        naics = (inspection.get("NAICS_CODE") or "").strip()
        cases.append({
            "inspectionNumber": row["INSPECTION_NUMBER"],
            "activityNumber": key,
            "employer": row["EMPLOYER"].strip(),
            "state": row["STATE"].strip(),
            "city": row["CITY"].strip().title(),
            "issuanceDate": excel_date(row["ISSUANCE_DATE"]),
            "initialPenalty": round(number(row["INITIAL_PENALTY"])),
            "naics": naics,
            "sector": sector_code(naics),
            "establishmentSize": round(number(inspection.get("NR_IN_ESTAB", ""))) or None,
            "inspectionType": inspection.get("INSP_TYPE", ""),
            "inspectionScope": inspection.get("INSP_SCOPE", ""),
            "safetyHealth": inspection.get("SAFETY_HLTH", ""),
            "openDate": (inspection.get("OPEN_DATE") or "")[:10],
            "closeDate": (inspection.get("CLOSE_CASE_DATE") or "")[:10],
            "violationEvents": violation_counts[key],
            "historicalPenaltyEvents": round(violation_penalties[key]),
            "willfulEvents": willful_counts[key],
            "repeatEvents": repeat_counts[key],
            "matchedInspection": bool(inspection),
        })

    state_summary: defaultdict[str, dict[str, int]] = defaultdict(lambda: {"cases": 0, "penalty": 0, "violations": 0})
    sector_summary: defaultdict[str, dict[str, int]] = defaultdict(lambda: {"cases": 0, "penalty": 0, "violations": 0, "matched": 0})
    employer_summary: defaultdict[str, dict[str, int]] = defaultdict(lambda: {"cases": 0, "penalty": 0, "violations": 0})
    yearly_summary: defaultdict[str, dict[str, int]] = defaultdict(lambda: {"cases": 0, "penalty": 0})
    for case in cases:
        state_summary[case["state"]]["cases"] += 1
        state_summary[case["state"]]["penalty"] += case["initialPenalty"]
        state_summary[case["state"]]["violations"] += case["violationEvents"]
        sector_summary[case["sector"]]["cases"] += 1
        sector_summary[case["sector"]]["penalty"] += case["initialPenalty"]
        sector_summary[case["sector"]]["violations"] += case["violationEvents"]
        sector_summary[case["sector"]]["matched"] += int(case["matchedInspection"])
        employer_summary[case["employer"]]["cases"] += 1
        employer_summary[case["employer"]]["penalty"] += case["initialPenalty"]
        employer_summary[case["employer"]]["violations"] += case["violationEvents"]
        year = case["issuanceDate"][:4]
        yearly_summary[year]["cases"] += 1
        yearly_summary[year]["penalty"] += case["initialPenalty"]

    payload = {
        "meta": {
            "cases": len(cases),
            "matchedInspections": sum(case["matchedInspection"] for case in cases),
            "violationEvents": sum(case["violationEvents"] for case in cases),
            "initialPenalty": sum(case["initialPenalty"] for case in cases),
            "source": "enforcement_cases_osha_revised_march.xlsx + OSHA enforcement bulk files",
            "retrieved": datetime.now().date().isoformat(),
            "joinKey": "inspection number → OSHA ACTIVITY_NR",
        },
        "cases": cases,
        "states": sorted(({"state": key, **value} for key, value in state_summary.items()), key=lambda item: item["penalty"], reverse=True),
        "sectors": sorted(({"code": key, "title": SECTOR_TITLES.get(key, key), **value} for key, value in sector_summary.items()), key=lambda item: item["penalty"], reverse=True),
        "employers": sorted(({"employer": key, **value} for key, value in employer_summary.items()), key=lambda item: (item["cases"], item["penalty"]), reverse=True),
        "years": sorted(({"year": key, **value} for key, value in yearly_summary.items()), key=lambda item: item["year"]),
    }
    content = "export const enforcementDataset = " + json.dumps(payload, separators=(",", ":")) + " as const;\n"
    OUTPUT.write_text(content, encoding="utf-8")
    print(json.dumps(payload["meta"], indent=2))


if __name__ == "__main__":
    main()
