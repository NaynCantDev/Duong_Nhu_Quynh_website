# Web_CNS_for_NUAEs — Portfolio CNS&AI

Bộ khung sinh website Portfolio cho học phần **Nhập môn Công nghệ số và ứng dụng AI (INF2501)**.
Một template dùng cho nhiều sinh viên: mỗi người chỉ cần một file `data.yaml`.

## Cấu trúc
```
students/<ma_sv>/data.yaml   ← dữ liệu từng người
template/*.html.j2           ← Jinja2 templates (base, index, projects, project, conclusion)
template/assets/             ← style.css + main.js (hiệu ứng)
scripts/render.py            ← YAML → HTML tĩnh
dist/                        ← website của 1 sinh viên (tự sinh, không commit)
```

## Dùng
```bash
pip install -r requirements.txt
python scripts/render.py                  # nếu students/ chỉ có 1 người
python scripts/render.py duong_nhu_quynh  # chỉ định 1 người
```
Mở `dist/index.html` để xem. Mỗi website chỉ chứa portfolio của **một** sinh viên.

## Làm cho người khác
Mỗi sinh viên một repo riêng (fork/copy repo này):
1. Đổi tên `students/duong_nhu_quynh/` thành `students/<ma_sv>/` và sửa `data.yaml`
2. `git push` → GitHub Actions tự render và deploy
3. Bật **Settings → Pages → Source: GitHub Actions** (1 lần cho mỗi repo)

Mỗi bài tập có thể thêm `links:` (PDF, video, Drive…):
```yaml
    links:
      - { label: "Báo cáo PDF", url: "https://drive.google.com/...", icon: "📄" }
```

## Hiệu ứng
Theme âm nhạc tông sáng: đĩa than quay, equalizer, khuông nhạc chạy ngang, nốt nhạc bay ở nền,
click bung nốt nhạc, thẻ nghiêng 3D, scroll reveal, typing effect, chuyển trang mượt, menu mobile.
Tự tắt animation khi người dùng bật *prefers-reduced-motion*.
