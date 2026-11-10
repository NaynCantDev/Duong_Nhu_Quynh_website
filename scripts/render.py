#!/usr/bin/env python3
"""render.py – đọc students/<id>/data.yaml → sinh website tĩnh vào dist/<id>/

Cách dùng:
    python scripts/render.py               # render tất cả sinh viên
    python scripts/render.py demo_student  # render 1 người
"""

import re
import shutil
import sys
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_DIR = ROOT / "template"
ASSETS_DIR = TEMPLATE_DIR / "assets"
STUDENTS_DIR = ROOT / "students"
DIST_DIR = ROOT / "dist"

def split_principles(text):
    """'Bộ 5 nguyên tắc: (1) A, (2) B' → ('Bộ 5 nguyên tắc:', ['A', 'B'])"""
    parts = re.split(r"\(\d+\)\s*", text or "")
    if len(parts) < 3:
        return None
    head = parts[0].strip()
    items = [p.strip().rstrip(",.;") for p in parts[1:] if p.strip()]
    return {"head": head, "items": items}


def classify_step(line):
    """Phân loại 1 dòng trong 'process' để tô màu timeline."""
    low = line.lower()
    if low.startswith("khó khăn"):
        return "challenge"
    if low.startswith("ai:"):
        return "ai"
    return "step"


def make_env():
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATE_DIR)),
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    env.filters["principles"] = split_principles
    env.filters["step_kind"] = classify_step
    return env


def load(student_id):
    with open(STUDENTS_DIR / student_id / "data.yaml", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    data["slug"] = student_id
    return data


def write(out_dir, name, html):
    (out_dir / name).write_text(html, encoding="utf-8")
    print(f"  [OK] {name}")


def render_student(env, student_id):
    data = load(student_id)
    out_dir = DIST_DIR / student_id
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    shutil.copytree(ASSETS_DIR, out_dir / "assets")

    write(out_dir, "index.html", env.get_template("index.html.j2").render(**data, page="home"))
    write(out_dir, "projects.html", env.get_template("projects.html.j2").render(**data, page="projects"))

    projects = data["projects"]
    for i, p in enumerate(projects):
        prev_p = projects[i - 1] if i > 0 else None
        next_p = projects[i + 1] if i < len(projects) - 1 else None
        html = env.get_template("project.html.j2").render(
            **data, page="projects", project=p, prev_p=prev_p, next_p=next_p
        )
        write(out_dir, f"project-{p['id']}.html", html)

    write(out_dir, "conclusion.html", env.get_template("conclusion.html.j2").render(**data, page="conclusion"))
    return data


def render_hub(env, students):
    """Trang gốc dist/index.html liệt kê tất cả portfolio (tiện khi làm cho nhiều người)."""
    shutil.copytree(ASSETS_DIR, DIST_DIR / "assets", dirs_exist_ok=True)
    html = env.get_template("hub.html.j2").render(students=students)
    (DIST_DIR / "index.html").write_text(html, encoding="utf-8")
    (DIST_DIR / ".nojekyll").write_text("", encoding="utf-8")
    print("[OK] dist/index.html (hub)")


def main():
    all_ids = sorted(d.name for d in STUDENTS_DIR.iterdir() if (d / "data.yaml").exists())
    targets = sys.argv[1:] or all_ids
    env = make_env()
    for t in targets:
        print(f"\n=== Rendering: {t} ===")
        render_student(env, t)
    render_hub(env, [load(s) for s in all_ids])


if __name__ == "__main__":
    main()
