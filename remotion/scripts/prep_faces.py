"""Finds where faces sit in every still and re-cuts the tall phone clips around them,
so the framing keeps people's faces in shot. Detection only: nobody is identified."""
import cv2, glob, json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PUB = os.path.join(ROOT, "public")
YEARS = sys.argv[1]  # folder holding the original year folders and idx-*.txt
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
prof = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")

def faces(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY); h, w = g.shape
    s = 900 / max(h, w); g = cv2.resize(g, (int(w*s), int(h*s))) if s < 1 else g
    m = max(24, int(min(g.shape) * 0.045))
    f = list(casc.detectMultiScale(g, 1.1, 6, minSize=(m, m))) + list(prof.detectMultiScale(g, 1.1, 7, minSize=(m, m)))
    H, W = g.shape
    return [((x + fw/2)/W, (y + fh/2)/H, fh/H) for x, y, fw, fh in f]

out = {}
for pat in ["d/*.jpg", "p/*.jpg", "players/*.jpg", "strand26-*.jpg"]:
    for p in sorted(glob.glob(os.path.join(PUB, pat))):
        img = cv2.imread(p)
        if img is None: continue
        f = faces(img); rel = os.path.relpath(p, PUB)
        if f:
            ys = [y for _, y, _ in f]; xs = [x for x, _, _ in f]
            out[rel] = {"x": round(sum(xs)/len(xs), 3), "y": round(sum(ys)/len(ys), 3), "top": round(min(y - s/2 for _, y, s in f), 3), "n": len(f)}
json.dump(out, open(os.path.join(ROOT, "src", "ten-faces.json"), "w"), indent=0)
print("stills with faces:", len(out))

CLIPS = [("early","021",17.8,3.4,"early-021"),("2023","214",0.2,3.2,"2023-214"),("2023","032",2.8,3.2,"2023-032"),("2023","079",21.8,3.4,"2023-079"),("2023","079",11.5,3.2,"2023-079b"),
 ("2023","063",8.6,3.2,"2023-063"),("2023","203",40.5,3.2,"2023-203"),("2023","024",42.0,3.2,"2023-024"),("2023","058",0.6,3.0,"2023-058"),("2023","203",6.0,3.2,"2023-203b"),
 ("2024","012",5.2,3.2,"2024-012"),("2024","004",0.2,3.2,"2024-004"),("2024","002",3.4,3.2,"2024-002"),("2024","051",18.0,3.2,"2024-051a"),
 ("2025","116",3.6,3.2,"2025-116"),("2025","039",2.9,3.2,"2025-039"),("2025","041",15.0,3.2,"2025-041"),("2025","094",9.3,3.2,"2025-094"),("2025","043",28.8,3.2,"2025-043")]
def src(year, idx):
    for line in open(os.path.join(YEARS, f"idx-{year}.txt")):
        a = line.rstrip("\n").split("\t")
        if a[0] == idx: return os.path.join(YEARS, year, a[1])
for year, idx, ss, t, name in CLIPS:
    s = src(year, idx); ys = []; dims = None
    for k in (0.3, 0.5, 0.7):
        raw = subprocess.run(["ffmpeg","-v","error","-ss",str(ss + t*k),"-i",s,"-frames:v","1","-f","image2pipe","-vcodec","png","-"],capture_output=True).stdout
        import numpy as np
        img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
        if img is None: continue
        dims = img.shape[:2]; ys += [y for _, y, _ in faces(img)]
    h, w = dims
    if h <= w: continue
    win = 1.25 * w / h                       # crop window height as a fraction of the frame
    cy = (sorted(ys)[len(ys)//2] + 0.06) if ys else 0.47
    top = min(max(cy - win/2, 0), 1 - win)
    vf = (f"split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=28:4,eq=brightness=-0.22[bg];"
          f"[b]crop=iw:iw*1.25:0:ih*{top:.4f},scale=-2:900[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30")
    subprocess.run(["ffmpeg","-y","-v","error","-ss",str(ss),"-t",str(t),"-i",s,"-filter_complex",f"[0:v]{vf}[v]","-map","[v]","-an","-c:v","libx264","-crf","19","-pix_fmt","yuv420p",os.path.join(PUB,"dvid",name+".mp4")],check=True)
    print(name, "faces" if ys else "no-face", round(top, 2))
