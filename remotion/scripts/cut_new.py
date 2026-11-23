"""Cuts the extra clips for the ten-year film from the original trip videos.
Tall phone clips become 2:3 panels centred on the faces found in them (detection
only, nobody is identified); wide clips are kept as they are."""
import cv2, numpy as np, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, "public", "nv")
YEARS = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
CLIPS = """2023-025 336 3|2023-045 17.2 3|2023-046 13.5 3|2023-047 6.5 3|2023-061 6.0 3|2023-062 17.7 3|2023-064 4.3 3|2023-077 5.5 3
2023-081 4.8 3|2023-082 18.2 3|2023-083 2 3|2023-114 2 3.4|2023-122 21 3|2023-190 0.3 3|2023-193 8.7 3|2023-194 6.4 3|2023-196 24.3 3
2023-204 8 3|2023-207 6.7 3|2023-213 8.5 3|2023-215 4 3.4|2023-216 7 3|2023-035 8.5 3|2023-038 4.2 3
2024-003 6.5 3|2024-006 6.3 3|2024-010 5 3|2024-014 2.9 3|2024-015 0.5 3|2024-018 12.5 3|2024-019 3.5 3|2024-021 32 3|2024-025 0 3
2024-026 57 3.4|2024-030 1 3|2024-049 11.5 3|2024-060 0 3|2024-061 0.2 3|2024-069 0.6 3|2024-080 1 3.4
2025-021 45.5 3|2025-027 1.4 3|2025-038 3.6 3|2025-042 7.3 3|2025-044 9.5 3|2025-046 18.5 3|2025-053 27.6 2.4|2025-099 5.5 3|2025-101 3.8 3
2025-110 0 3.4|2025-117 16.5 3.4|2025-037 1.5 3""".replace("\n", "|").split("|")
def src(year, idx):
    for line in open(os.path.join(YEARS, f"idx-{year}.txt")):
        a = line.rstrip("\n").split("\t")
        if a[0] == idx: return os.path.join(YEARS, year, a[1])
for c in CLIPS:
    name, ss, t = c.split(); ss = float(ss); t = float(t); year, idx = name.rsplit("-", 1); s = src(year, idx); ys = []; dims = None
    for k in (0.2, 0.5, 0.8):
        raw = subprocess.run(["ffmpeg","-v","error","-ss",str(ss + t*k),"-i",s,"-frames:v","1","-f","image2pipe","-vcodec","png","-"],capture_output=True).stdout
        img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
        if img is None: continue
        dims = img.shape[:2]; g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY); sc = 900 / max(g.shape); g = cv2.resize(g, None, fx=sc, fy=sc)
        ys += [(y + h/2) / g.shape[0] for x, y, w, h in casc.detectMultiScale(g, 1.1, 6, minSize=(36, 36))]
    h, w = dims
    if h > w:
        win = 1.5 * w / h; cy = (sorted(ys)[len(ys)//2] + 0.1) if ys else 0.5; top = min(max(cy - win/2, 0), 1 - win)
        vf = f"crop=iw:iw*1.5:0:ih*{top:.4f},scale=600:900,fps=30"; kind = "tall"
    else:
        vf = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30"; kind = "wide"
    subprocess.run(["ffmpeg","-y","-v","error","-ss",str(ss),"-t",str(t),"-i",s,"-vf",vf,"-an","-c:v","libx264","-crf","24","-pix_fmt","yuv420p",os.path.join(OUT, name + ".mp4")],check=True)
    print(name, kind, "face" if ys else "-")
