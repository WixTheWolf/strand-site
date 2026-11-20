"""Cuts the long real-footage scenes for the film. Every clip is shown whole — fitted
inside the frame over a blurred copy of itself, never cropped — with its own sound levelled."""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, "public", "mv")
S = sys.argv[1]  # scratch folder holding years/, songs/, y26/
def year(y, idx):
    for line in open(f"{S}/years/idx-{y}.txt"):
        a = line.rstrip("\n").split("\t")
        if a[0] == idx: return f"{S}/years/{y}/{a[1]}"
CUTS = [
 ("cer1", year("2023","024"), 31, 41), ("cer2", year("2023","024"), 74, 30.5), ("cer3", year("2023","024"), 118, 68), ("cer4", year("2023","024"), 207, 75),
 ("poem1", year("2023","025"), 0, 63), ("poem2", year("2023","025"), 70, 20.5), ("poem3", year("2023","025"), 98.6, 18), ("poem4", year("2023","025"), 135, 79.8), ("poem5", year("2023","025"), 284, 52),
 ("callback", year("2023","025"), 184.6, 7.2),
 ("g215", year("2023","215"), 0, 17), ("g046", year("2023","046"), 0, 26.5), ("g062", year("2023","062"), 0, 27), ("g205", year("2023","205"), 0, 17),
 ("g206", year("2023","206"), 0, 11), ("g212", year("2023","212"), 0, 20), ("g058", year("2023","058"), 0, 6), ("g076", year("2023","076"), 0, 13),
 ("hist", year("2023","203"), 0, 93),
 ("s1a", f"{S}/songs/s0506.mov", 0.5, 25.8), ("s1b", f"{S}/songs/s0506.mov", 26.3, 33.7), ("s2", f"{S}/songs/s1216.mov", 0, 31.5), ("s3", f"{S}/songs/s2536.mov", 0, 31.5), ("s4", f"{S}/songs/s3796.mov", 0, 49.5),
 ("o49", year("2024","049"), 0, 20), ("o24", year("2024","024"), 0, 22), ("m44", year("2025","044"), 0, 21), ("m43", year("2025","043"), 0, 50), ("m38", year("2025","038"), 3, 12),
 ("gs06", f"{S}/y26/IMG_7006.MOV", 2, 12), ("gs15", f"{S}/y26/IMG_7015.MOV", 0, 8), ("gs74", f"{S}/y26/IMG_7074.MOV", 0, 9), ("gs75", f"{S}/y26/IMG_7075.MOV", 0, 10),
 ("gs09", f"{S}/y26/IMG_7009.MOV", 5, 12.5), ("gs02", f"{S}/y26/IMG_7002.MOV", 3.5, 6.8), ("gs80", f"{S}/y26/IMG_7080.MOV", 0, 11), ("gs16", f"{S}/y26/IMG_7016.MOV", 0, 7), ("gs01", f"{S}/y26/IMG_7001.MOV", 6, 7),
]
VF = ("split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=30:5,eq=brightness=-0.22[bg];"
      "[b]scale=1920:1080:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30,format=yuv420p")
os.makedirs(OUT, exist_ok=True)
for name, src, ss, t in CUTS:
    out = os.path.join(OUT, name + ".mp4")
    if os.path.exists(out) and "--force" not in sys.argv: continue
    r = subprocess.run(["ffmpeg","-y","-v","error","-ss",str(ss),"-t",str(t),"-i",src,"-filter_complex",f"[0:v]{VF}[v]","-map","[v]","-map","0:a?",
                        "-af","loudnorm=I=-17:TP=-2:LRA=11,afade=t=in:d=0.08","-c:v","libx264","-crf","22","-preset","veryfast","-c:a","aac","-b:a","160k","-ar","48000",out])
    print(name, "ok" if r.returncode == 0 else "FAILED", flush=True)
print("PREPDONE")
