# Web_CNS_for_NUAEs — Portfolio CNS&AI

Bộ khung sinh website Portfolio cho học phần **Nhập môn Công nghệ số và ứng dụng AI (INF2501)**.
Một template dùng cho nhiều sinh viên: mỗi người chỉ cần một file `data.yaml`.

## Cấu trúc
```
students/<ma_sv>/data.yaml   ← dữ liệu từng người
template/*.html.j2           ← Jinja2 templates (base, index, projects, project, conclusion, hub)
template/assets/             ← style.css + main.js (hiệu ứng)
scripts/render.py            ← YAML → HTML tĩnh
dist/                        ← kết quả (tự sinh, không commit)
```

## Dùng
```bash
pip install -r requirements.txt
python scripts/render.py               # render tất cả
python scripts/render.py duong_nhu_quynh  # render 1 người
```
Mở `dist/<ma_sv>/index.html` để xem. `dist/index.html` là trang danh sách tất cả portfolio.

## Thêm người mới
1. Copy `students/duong_nhu_quynh/` thành `students/<ma_sv>/`
2. Sửa `data.yaml`
3. `git push` → GitHub Actions tự render và deploy lên GitHub Pages
   (URL: `https://<user>.github.io/Web_CNS_for_NUAEs/<ma_sv>/`)

Mỗi bài tập có thể thêm `links:` (PDF, video, Drive…):
```yaml
    links:
      - { label: "Báo cáo PDF", url: "https://drive.google.com/...", icon: "📄" }
```

## Hiệu ứng
Aurora background, glassmorphism, viền sáng theo chuột, thẻ nghiêng 3D, nút "nam châm",
scroll reveal, đếm số, vòng tiến độ, typing effect, chuyển trang mượt, menu mobile.
Tự tắt animation khi người dùng bật *prefers-reduced-motion*.
