"""Builds the Strand 10 hype reel timeline (src/ten-timeline.json): Drew's own recording
opens it, then every cut is locked to the beat of the full-band version of his song.
Reuses the photo pools and face framing from build_ten.py."""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SRC_TXT = open(os.path.join(HERE, "build_ten.py")).read()
exec(SRC_TXT[:SRC_TXT.index("N,D,I,C,T,S,M,V,L,X,B")].replace("os.path.abspath(__file__)", "os.path.join(HERE, 'x.py')"))

BEAT = 12                       # frames per beat at 150 BPM
ROCK_IN = 24.0                  # where the reel joins the rock version (a bar before its first chorus)
F = lambda f, n, role: f"f:{f}|{n}|{role}"
FIELD = [("fred.jpg","Fred","The Commissioner"),("wix.jpg","Wix","The driver"),("kev.jpg","Kev","70 yards long"),("rhett.jpg","Rhett","Handicap: under review"),
         ("gord.jpg","Gord","Carry: 5 ft"),("kane.jpg","Kane","Ace*"),("drew.jpg","Drew","The soundtrack"),("matty-o.jpg","Matty O.","The Eagle Scout"),
         ("darcy.jpg","D’Arcy","The cot"),("nick.jpg","Nick",""),("p-mo.jpg","P-Mo",""),("tony-schroe.jpg","Tony Schroe",""),("j-bone.jpg","J-Bone",""),
         ("jack.jpg","Jack",""),("kerns-cartoon.png","Kerns",""),("hummel.jpg","Hummel",""),("jason.jpg","Jason",""),("shaun.jpg","Shaun",""),
         ("brett.jpg","Brett",""),("blonski.jpg","Blonski","")]
# (beats, token) — everything after the rock version comes in
ROCK = [
 (4,"title:|The Strand|"),
 (2,"v:flyover.mp4"),(1,"v:dvid/2023-079.mp4"),(1,"P:2026"),(1,"v:r-laugh.mp4"),(2,"T:2023"),(1,"P:2024"),(1,"v:r-cartselfie.mp4"),
 (2,"v:convoy.mp4"),(1,"P:2025"),(1,"v:dvid/2024-012.mp4"),(2,"v:cup.mp4"),(1,"P:2023"),
 # the years, two beats each
 (2,"y:2018|Palm Springs"),(2,"y:2019|Indio"),(2,"y:2020|Palm Desert"),(2,"y:2021|La Quinta"),(2,"y:2022|Rams Hill"),
 (2,"y:2023|St. George"),(2,"y:2024|Ojai"),(2,"y:2025|Monterey"),(2,"y:2026|Gamble Sands"),
 # the recap, for people who were there
 (2,"flash:The Drop"),(2,"p:d/early-012#Actual photograph · 2019"),(2,"v:g-cart.mp4@1"),
 (2,"flash:Five Feet"),(4,"v:ten/gord-tee.mp4@0.5#Gord · the first tee"),
 (2,"flash:The Ace*"),(3,"v:ten/kane1.mp4#Kane · St. George"),(2,"flash:*Par 4"),
 (2,"flash:$80 Meatballs"),(2,"v:g-dinner.mp4@2"),(2,"flash:The Cot"),(2,"flash:The Taliban Won"),(3,"flash:Zero Lessons"),
 # verse two
 (2,"v:dvid/2023-203b.mp4"),(2,"v:nv/2024-025.mp4"),(2,"T:2024"),(1,"v:dvid/2023-058.mp4"),(1,"P:2022"),(2,"v:dvid/2025-041.mp4"),
 (2,"v:dvid/2024-002.mp4"),(2,"T:2025"),(2,"v:dvid/2023-024.mp4"),(1,"P:2021"),(1,"v:dvid/2025-043.mp4"),(2,"v:real-swing-a.mp4"),
 (2,"v:strike-full.mp4"),(2,"v:dvid/2024-004.mp4"),
 (4,"title:Twenty men|The Field|"),
] + [(3, F(f, n, role or "Reporting for year ten")) for f, n, role in FIELD] + [
 (3,"flash:Year Ten"),(5,"a:tease1"),(3,"title:|2027|"),(5,"a:tease2"),(8,"title:2027|Destination: classified|"),
]
SCRIPT = ROCK
exec(SRC_TXT[SRC_TXT.index("FACES = json.load"):SRC_TXT.index("def to_beat")])

# a hype reel wants the frame full: wide photos first, then the ones with the most faces
def wide(k):
    w, h = dims(os.path.join(PUB, k + ".jpg")); return w > h
for y in PHOTOS: PHOTOS[y].sort(key=lambda k: (not wide(k), -FACES.get(k + ".jpg", {}).get("n", 0)))

audio = []; shots = []; music = []; subs = []; lyrics = []; sfx = []; hush = []
def fx(name, at, vol=1.0): sfx.append({"file": f"ten/sfx/{name}.mp3", "at": round(at - PEAK.get(name,0)*FPS), "vol": vol})
def sec(t): return round(t*FPS)

# ---- Drew, raw: the recording carries the sound, the picture cuts away and back to him
D0 = 0.6
music.append({"file": "ten/o1.mp3", "from": 0, "to": sec(16.2), "offset": sec(D0), "vol": 1.0, "cut": True})
def drew(a, b, tag=None):
    s = {"from": sec(a), "len": sec(b)-sec(a), "t": "v", "src": "ten/drew0.mp4", "trim": sec(a + D0), "rate": 1.0}
    if tag: s["tag"] = tag
    shots.append(s)
def cut(a, b, tok): shots.extend(shots_for([tok], sec(a), sec(b), f"intro {a}"))
drew(0, 4.6, "Drew · the original · 2023")
cut(4.6, 6.1, "P:2018"); drew(6.1, 8.1); cut(8.1, 9.1, "P:2019"); cut(9.1, 10.1, "P:2021"); cut(10.1, 11.1, "P:2022")
drew(11.1, 13.1); cut(13.1, 14.1, "v:dvid/2023-203.mp4"); cut(14.1, 15.1, "v:dvid/2024-051a.mp4"); drew(15.1, 16.2)
lyrics += [{"text": "Hey, it’s here, that special time of year", "from": sec(6.2), "len": sec(4.2)}, {"text": "Where we golf and drink lots of beer", "from": sec(10.9), "len": sec(4.6)}]
fx("riser", sec(16.2) - sec(3.9) + round(PEAK.get("riser",0)*FPS), 0.9)

# ---- the rock version, on the grid
R0 = sec(16.2); frame = R0
music.append({"file": "ten/song5.mp3", "from": R0, "to": None, "offset": sec(ROCK_IN), "vol": 0.85})
fx("boom", R0, 1.0)
def rock_t(t): return R0 + sec(t - ROCK_IN)          # a time in the song -> a frame in the film
for beats, tok in ROCK:
    n = beats * BEAT; where = f"rock @{(frame-R0)/FPS+ROCK_IN:.1f}s"
    if tok.startswith(("title:", "flash:")):
        kind, _, rest = tok.partition(":"); LAST[0] = None
        k, ti, sub = (rest.split("|") + ["", ""])[:3] if kind == "title" else ("", rest, "")
        shots.append({"from": frame, "len": n, "t": "title", "kicker": k, "title": ti, "sub": sub})
        fx("boom" if kind == "title" else "hit", frame, 0.9 if kind == "title" else 0.55)
    else:
        new = shots_for([tok], frame, frame + n, where)
        if len(new) > 1: raise SystemExit(f"clip too short for {beats} beats: {tok}")
        shots += new
    frame += n
# Song captions live in a local file that is not in the repository (see .gitignore).
LYR = os.path.join(HERE, "hype-lyrics.local.json")
if os.path.exists(LYR): lyrics += [{"text": t, "from": rock_t(a), "len": sec(d)} for a, d, t in json.load(open(LYR))]
def vo(name, at):
    path = prep(name); n = round(dur(path)*FPS); audio.append({"file": f"ten/vo/{name}.mp3", "at": at, "len": n, "kind": "N"}); return n
vo("h1", rock_t(32.3)); vo("h2", rock_t(86.7))
# ---- the last word, as the final chord rings out
end = dur(os.path.join(PUB, "ten", "song5.mp3"))
tail = rock_t(min(end, 96.2))
if tail > frame: shots[-1]["len"] += tail - frame; frame = tail
n3 = vo("h3", frame + 6); fx("boom", frame, 1.0)
shots.append({"from": frame, "len": n3 + 60, "t": "title", "kicker": "The tenth Strand Invitational", "title": "Be there", "sub": "2027"})
frame += n3 + 60; music[-1]["to"] = frame
total = frame + 12
json.dump({"total": total, "duck": 0.5, "audio": audio, "shots": shots, "music": music, "sfx": sfx, "subs": subs, "lyrics": lyrics, "hush": hush},
          open(os.path.join(ROOT, "src", "ten-timeline.json"), "w"), indent=1)
print("total", total, "frames =", round(total/FPS, 1), "s; shots", len(shots), "players", len(FIELD), "unique", len(USED))
for s in shots:
    for p in s.get("srcs", [s.get("src")] if s.get("src") else []):
        if not os.path.exists(os.path.join(PUB, p)): print("MISSING", p)
    if s.get("rate", 1) < 1: print("slowed", s.get("src"), s["rate"])
