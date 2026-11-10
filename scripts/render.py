#!/usr/bin/env python3
"""render.py – đọc students/<id>/data.yaml → sinh website tĩnh vào dist/

Mỗi lần render ra website của ĐÚNG 1 sinh viên (dist/index.html là trang chủ).
Cách dùng:
    python scripts/render.py                  # nếu students/ chỉ có 1 người
    python scripts/render.py duong_nhu_quynh  # chỉ định người cần render
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
    """Render 1 sinh viên thẳng vào dist/ (index.html nằm ngay ở gốc site)."""
    data = load(student_id)
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True)
    shutil.copytree(ASSETS_DIR, DIST_DIR / "assets")
    (DIST_DIR / ".nojekyll").write_text("", encoding="utf-8")

    write(DIST_DIR, "index.html", env.get_template("index.html.j2").render(**data, page="home"))
    write(DIST_DIR, "projects.html", env.get_template("projects.html.j2").render(**data, page="projects"))

    projects = data["projects"]
    for i, p in enumerate(projects):
        prev_p = projects[i - 1] if i > 0 else None
        next_p = projects[i + 1] if i < len(projects) - 1 else None
        html = env.get_template("project.html.j2").render(
            **data, page="projects", project=p, prev_p=prev_p, next_p=next_p
        )
        write(DIST_DIR, f"project-{p['id']}.html", html)

    write(DIST_DIR, "conclusion.html", env.get_template("conclusion.html.j2").render(**data, page="conclusion"))


def main():
    all_ids = sorted(d.name for d in STUDENTS_DIR.iterdir() if (d / "data.yaml").exists())
    if len(sys.argv) > 1:
        student_id = sys.argv[1]
    elif len(all_ids) == 1:
        student_id = all_ids[0]
    else:
        sys.exit(f"Có {len(all_ids)} sinh viên trong students/: {all_ids}\n"
                 "Hãy chỉ định 1 người: python scripts/render.py <ma_sv>")
    if student_id not in all_ids:
        sys.exit(f"Không tìm thấy students/{student_id}/data.yaml")
    print(f"=== Rendering: {student_id} → dist/ ===")
    render_student(make_env(), student_id)


if __name__ == "__main__":
    main()
