"""Builds src/ten-timeline.json for the ten-year film from the script below.
Each item is narration (N), a dramatized line (D), a card (C), a silent beat (S)
or a music change (M). Narration beats are split on the pauses in the recording."""
import json, os, re, subprocess, sys
FPS = 30
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
SRC = sys.argv[1]  # folder with downloaded recordings

def dur(path):
    return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",path],capture_output=True,text=True).stdout.strip())

def prep(name):
    out = os.path.join(PUB, "ten", "vo", name + ".mp3"); os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.run(["ffmpeg","-y","-v","error","-i",os.path.join(SRC,name+".mp3"),"-af","silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.04,afade=t=in:d=0.02","-c:a","libmp3lame","-b:a","160k",out],check=True)
    return out

def silences(path):
    err = subprocess.run(["ffmpeg","-v","info","-i",path,"-af","silencedetect=noise=-34dB:d=0.22","-f","null","-"],capture_output=True,text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return [(a+b)/2 for a,b in zip(st,en)]

N,D,I,C,T,S,M,V,L,X,B = "N","D","I","C","T","S","M","V","L","X","B"
F = lambda f,n,s: f"f:{f}|{n}|{s}"
ALSO = [("matty-o.jpg","MATTY O."),("darcy.jpg","D’ARCY"),("j-bone.jpg","J-BONE"),("jack.jpg","JACK"),("kerns-cartoon.png","KERNS"),("hummel.jpg","HUMMEL"),("jason.jpg","JASON"),("shaun.jpg","SHAUN"),("brett.jpg","BRETT"),("blonski.jpg","BLONSKI"),("tony-schroe.jpg","TONY SCHROE")]
BEAT = {"score": 0.255, "fin": 0.0}   # first beat of each cue, seconds; both run at 120 BPM
SCRIPT = [
 # ---- Cold open
 (M,"score",0,0.9),
 (S,1.2,["v:g-sunrise.mp4@1"]),
 (N,"x1",[("What if I told you...",["v:flyover.mp4"]),
          ("that the fiercest rivalry in golf has never been televised.",["v:dvid/2023-079.mp4","P:2023"]),
          ("Never been sanctioned.",["v:dvid/2024-012.mp4"]),
          ("And in ten years... has not produced one good golfer.",["t:2024-003,2023-045,2025-099"])]),
 (X,"riser",-3.6,0.8),
 (T,4.0,"A Strand Invitational film|The Strand|Ten years. Zero lessons."),
 (B,),
 (S,6.0,["P:2018","v:r-laugh.mp4","P:2021","v:r-selfie1.mp4","P:2024","v:r-cartselfie.mp4","P:2025","v:dvid/2023-214.mp4"]),
 (N,"x2",[("Twenty men. Ten years. One trophy.",["P:2026","P:2023","v:cup.mp4"]),
          ("And a commissioner who has not slept since 2018.",["v:g-freddy.mp4"])]),
 # ---- Part one
 (T,2.5,"Part one|The Commissioner"),
 (N,"x3",[("Every dynasty has an architect.",["P:2018#Palm Springs · February 2018"]),
          ("Fred Geisinger built his from a couch, long after bedtime, armed with a spreadsheet.",["v:g-desk.mp4","sheet"]),
          ("He has dodged calls from his own boss, to lock down tee times.",["P:2021","P:2022"]),
          ("At dinner, his wife talks. Fred hears one word.",["v:g-dinner.mp4@2"]),
          ("Strand.",["c:||Strand."])]),
 (I,"d02","Boys, I’ve got incredible news. I saved everyone seven dollars and forty-three cents.","fred.jpg|Fred Geisinger|Commissioner · Founder"),
 # ---- Part two
 (T,2.5,"Part two|The Drop"),
 (N,"x4",[("February, 2019. Tahquitz Creek. The eighteenth hole.",["P:2019#Tahquitz Creek · February 2019","P:2019"]),
          ("Kev has just flown the green by seventy yards.",["v:g-shot.mp4"]),
          ("Wix offers him a ride.",["a:wixcart"]),
          ("What neither man knows... is that the fairway is about to end.",["v:g-cart.mp4"])]),
 (M,None,"cut"),
 (X,"boom",0,1.0),
 (S,2.4,["v:g-stuck.mp4"]),
 (I,"b1","I never saw it. One second there’s fairway. The next second… there’s just sky.","wix.jpg|Matt “Wix” Wixted|The driver"),
 (I,"b2","I remember thinking… we’ve been in the air a while.","kev.jpg|Kev|The passenger"),
 (M,"score",32,0.9),
 (N,"x5",[("A five-foot drop. No sign. No brakes.",["p:d/early-012#Actual photograph · 2019"]),
          ("The cart landed upright.",["a:tractor"]),
          ("The course blamed the driver. The driver blamed the course.",["a:owner","P:2019"]),
          ("The cart was never the same.",["stat:5 FT|The drop|Tahquitz Creek · 18th hole"])]),
 # ---- Part three
 (T,2.5,"Part three|The Sandbagger"),
 (N,"x6",[("Then, there is Rhett.",[F("rhett.jpg","Rhett","Handicap: under review")]),
          ("He showed up swearing he couldn't break a hundred.",["v:real-swing-a.mp4","P:2021"]),
          ("The committee gave him a twelve.",["stat:12|Official handicap|Issued by the committee"]),
          ("He won low net. Then he won it again.",["v:envelope.mp4","P:2022"]),
          ("Years later, under the lights on eighteen, with a championship on the line...",["t:2023-081,2023-082,2023-196"]),
          ("he stuck it.",["v:strike-full.mp4"]),
          ("This is the same man who fell down on his first swing, and took a black eye from a ball washer.",["P:2022","stat:1|Black eye|Opponent: a ball washer"])]),
 (I,"b3","A twelve. He looked us in the eye… and said he was a twelve.","a:committee|Handicap committee|Name withheld"),
 # ---- Part four
 (T,2.5,"Part four|Five Feet"),
 (N,"x7",[("2023. The Strand leaves the desert.",["v:convoy.mp4"]),
          ("Saint George, Utah. Red rock. Real golf courses.",["t:2023-114,2023-215,2023-204","P:2023#St. George, Utah · October 2023"]),
          ("Tradition demands a ceremonial first tee shot.",["P:2023"]),
          ("One swing, to set the tone for the entire weekend.",["v:dvid/2023-032.mp4","P:2023"]),
          ("The honor goes to Gord.",[F("gord.jpg","Gord","Ceremonial first tee shot")])]),
 (M,None,"cut"),
 (V,"ten/gord-tee.mp4",0,12.2,1.0,"Actual footage · the first tee"),
 (X,"shutter",0,1.0),(X,"groan",0.2,0.7),
 (S,2.6,["z:ten/gord-tee.mp4@12.0|Gord|Ceremonial first tee shot"]),
 (M,"score",64,0.75),
 (N,"x8",[("Let's see that again. Carry: five feet. Lie: bush. Tone: set.",["r:ten/gord-tee.mp4@8.4|Carry: 5 ft|Lie: bush|Tone: set"])]),
 # ---- Part five
 (T,2.5,"Part five|The Ace"),
 (N,"x9",[("Same day. Nick Kane steps up on a par four,",["v:dvid/2023-063.mp4"]),
          ("and hits the best shot of his life.",["v:dvid/2023-079b.mp4"]),
          ("It tracks the flag... and disappears.",["P:2023"]),
          ("From the tee, there was only one explanation.",["stat:1|Hole-in-one|Par 4 · unconfirmed"])]),
 (D,"d10","NO WAY!",["a:kanesprint"]),
 (D,"d11","IT WENT IN!",["a:kanesprint"]),
 (V,"ten/kane1.mp4",0,3.6,1.0,"Actual footage · St. George, 2023",0.45),
 (N,"x10",[("He took his shirt off. He rode to the green like a man who had just won the Masters.",["v:ten/kane2.mp4","v:ten/kane3.mp4"])]),
 (M,None,"cut"),
 (X,"scratch",-0.15,0.9),
 (V,"ten/kane4.mp4",0,4.0,1.0,"Actual footage · the green"),
 (N,"x11",[("The ball was not in the hole.",["a:kanecup"]),("The ball was not on the green.",["a:kanestand"])]),
 (D,"d14","You still gotta chip, dude.",["p:d/2023-202"]),
 (M,"score",120,0.85),
 (I,"b4","From the tee, that ball was in the hole. I still believe that.","kane.jpg|Nick Kane|Zero career holes-in-one"),
 # ---- Part six
 (T,2.5,"Part six|The Soundtrack"),
 (N,"x12",[("Every great team has an anthem. The Strand has four.",["P:2024","P:2025"]),
           ("All written by one man, with one guitar, usually the night before.",[F("drew.jpg","Drew","Singer · songwriter · four releases")])]),
 (M,None,""),
 (L,[(0.8,4.6,"The Strand, the Strand, take me to the Strand")]),
 (V,"ten/drew1.mp4",0,7.0,1.0,"2023 · “The Strand”"),
 (L,[(0.1,3.0,"Hey… I’m at the Strand, with all of my friends"),(3.1,1.8,"No, I don’t want this night to end"),(5.0,2.5,"’Cause I’m at the Strand, with all of my friends")]),
 (V,"ten/drew2b.mp4",0,7.6,1.0,"2024 · “At the Strand”"),
 (L,[(0.4,5.0,"By the bay, in Monterey, it’s the Strand — ay, ay")]),
 (V,"ten/drew3.mp4",0,6.0,1.0,"2025 · “By the Bay”"),
 (M,"o3",47.6,1.0),
 (L,[(0.6,3.6,"New putter Tone, and Kaners in the zone"),(4.3,2.6,"So tee it high, boys, let it fly"),(6.9,1.6,"I hope I bomb a drive!"),(8.5,2.6,"So tee it high, boys, let it fly"),(11.1,1.3,"I hope I bomb a drive!")]),
 (S,12.4,["v:dvid/2025-043.mp4","T:2025","P:2025","v:nv/2025-046.mp4","v:dvid/2025-094.mp4","T:2024","v:dvid/2025-116.mp4","P:2024","v:dvid/2025-039.mp4","T:2023","v:dvid/2025-047.mp4","v:nv/2025-053.mp4"]),
 # ---- Part seven
 (M,"score",150,0.9),
 (T,2.5,"Part seven|The Record Book"),
 (N,"x13",[("The record book is not kind.",["v:dvid/2024-002.mp4"]),
           ("Eighty dollars, two meatballs: Drew.",["stat:$80|Two meatballs|Drew · The Nest"]),
           ("One round, two driver shafts: Jerf.",["stat:2|Driver shafts, one round|Jerf"]),
           ("Eighteen holes, one five-hybrid: Pat.",["stat:1|Club used all day|Pat · five-hybrid|p-mo.jpg"]),
           ("One hole-in-one, at somebody else's bachelor party: Sprowls.",["stat:1|Hole-in-one · wrong event|Nick Sprowls|nick.jpg"]),
           ("And one team called the Taliban.",["stat:1|Team named “the Taliban”|Monterey · 2025"]),
           ("They won.",["P:2025"])]),
 # ---- Finale
 (M,"fin",0,1.0),
 (B,),
 (N,"x14",[("Palm Springs. Indio. Palm Desert. La Quinta. Rams Hill. Saint George. Ojai. Monterey. Gamble Sands.",
            ["y:2018|Palm Springs","y:2019|Indio","y:2020|Palm Desert","y:2021|La Quinta","y:2022|Rams Hill","y:2023|St. George","y:2024|Ojai","y:2025|Monterey","y:2026|Gamble Sands"]),
           ("Nobody remembers the scores. Everybody remembers the stories.",["P:2023","P:2024"]),
           ("Ten years ago, some of these men were single. Some had hair.",["P:2018","P:2018"]),
           ("Every year, they come back.",["v:dvid/2023-203b.mp4","v:dvid/2024-024.mp4"]),
           ("Because the golf was never the point.",["P:2026"]),
           ("Here's to Fred, who built it.",["a:drone"]),
           ("And here's to the next ten.",["P:2026"])]),
 (T,4.5,"2018 – 2027|The Strand|Ten years. One brotherhood."),
 # ---- Year ten
 (M,"score",8,0.6),
 (N,"x15",[("Year ten is coming.",["a:tease1"]),("And the Commissioner... is already on the phone.",["a:tease2"])]),
 (T,3.2,"2027|Destination: classified"),
 # ---- Credits over Drew
 (M,"o4",70.2,1.0),
 (S,2.6,["c:All songs written and performed by|Drew"]),
 (S,14.3,[F(f,n,"Also starring") for f,n in ALSO]),
 (S,13.0,["P:*","P:*","v:dvid/2024-022.mp4","P:*","P:*","v:dvid/2024-051b.mp4","P:*","P:*","v:dvid/early-021.mp4","P:*"]),
 (C,4.6,"Toeing the line between golf trip and boys trip since 2018|See you in 2027"),
 (M,None,""),
 (S,1.4,["k"]),
 (S,2.0,["a:newcart"]),
 (D,"d16","Hey, Wix... you driving?",["a:newcart"]),
 (S,0.9,["a:newcart"]),
 (D,"d17","Fuck you.",["a:newcart"]),
 (C,2.2,"|The End"),
]

FACES = json.load(open(os.path.join(ROOT,"src","ten-faces.json")))
def year_of(name):
    if not name.startswith("early"): return name[:4]
    n = int(name.split("-")[1])
    if 31 <= n <= 50: return "2018"
    if n in (1,4,9,10,11,12,72): return "2019"
    if n in (14,15,17,18,19,20,22,23,67,68,69): return "2021"
    return "2022"
TXT = json.dumps(SCRIPT)
explicit = set(re.findall(r"(?:p|ps):([\w/-]+)", TXT))
for m in re.findall(r"t:([\w,-]+)", TXT): explicit |= {"nv/"+x for x in m.split(",")}
PHOTOS = {}
for f in sorted(os.listdir(os.path.join(PUB,"d"))):
    k = "d/"+f[:-4]
    if k in explicit or f[:-4] in ("2023-117",): continue
    PHOTOS.setdefault(year_of(f[:-4]), []).append(k)
PHOTOS["2026"] = ["p/"+f[:-4] for f in sorted(os.listdir(os.path.join(PUB,"p")))]
for y in PHOTOS: PHOTOS[y].sort(key=lambda k: -FACES.get(k+".jpg",{}).get("n",0))   # faces first
TALL = {}
for f in sorted(os.listdir(os.path.join(PUB,"nv"))):
    k = "nv/"+f[:-4]
    if k in explicit or ("v:"+k+".mp4") in TXT: continue
    w = subprocess.run(["ffprobe","-v","error","-select_streams","v","-show_entries","stream=width","-of","csv=p=0",os.path.join(PUB,k+".mp4")],capture_output=True,text=True).stdout.strip()
    if w == "600": TALL.setdefault(f[:4], []).append(k)
def pop_photo(y):
    if y == "*":
        y = max(PHOTOS, key=lambda k: len(PHOTOS[k]))
    if not PHOTOS.get(y): raise SystemExit("out of photos for "+y)
    return PHOTOS[y].pop(0)

def dims(path):
    w,h = subprocess.run(["ffprobe","-v","error","-select_streams","v","-show_entries","stream=width,height","-of","csv=p=0",path],capture_output=True,text=True).stdout.strip().split(",")[:2]
    return int(w), int(h)
def photo_fit(rel):
    """Where to hold a wide photo so the faces (and the tops of the heads) stay inside the bars."""
    w,h = dims(os.path.join(PUB,rel)); f = FACES.get(rel); out = {}
    if h > w: return {"tall": True}
    H = 1920*h/w
    if not f or H <= 1080: return out
    top = min(f["y"]*H - 500, (f["top"] - 0.06)*H - 90); pos = min(max(top/(H-1080), 0), 1)
    out["oy"] = f"{round(100*pos)}%"; out["org"] = f"{round(100*f['x'])}% {round(100*(f['y']*H - pos*(H-1080))/1080)}%"
    return out
# faces the detector missed, placed by eye: x, y, face height (fractions of the picture)
BY_EYE = {"kev.jpg": (.37,.60,.09), "matty-o.jpg": (.68,.35,.35), "darcy.jpg": (.52,.45,.3), "drew.jpg": (.48,.32,.13), "gord.jpg": (.58,.22,.1),
          "hummel.jpg": (.50,.68,.3), "jason.jpg": (.52,.15,.08), "blonski.jpg": (.58,.6,.5), "kerns-cartoon.png": (.5,.45,.6)}
def face_fit(rel, pw=560, ph=860):
    """Crop, zoom and nudge a headshot so the face fills the card."""
    name = os.path.basename(rel); f = FACES.get(rel)
    fx, fy, fh = BY_EYE[name] if name in BY_EYE else (f["x"], f["y"], 2.2*(f["y"]-f["top"]))
    w,h = dims(os.path.join(PUB,rel)); sc = max(pw/w, ph/h); W, H = w*sc, h*sc
    ox = 0.5 if W-pw < 1 else min(max((fx*W-pw/2)/(W-pw),0),1); oy = 0.3 if H-ph < 1 else min(max((fy*H-ph*0.42)/(H-ph),0),1)
    px, py = fx*W - ox*(W-pw), fy*H - oy*(H-ph); z = min(max(0.3*ph/(fh*H), 1), 3.2)
    dx = min(max(pw/2 - px, -(z-1)*(pw-px)), (z-1)*px); dy = min(max(ph*0.42 - py, -(z-1)*(ph-py)), (z-1)*py)
    return {"op": f"{round(100*ox)}% {round(100*oy)}%", "zoom": round(z,2), "org": f"{round(px)}px {round(py)}px", "tr": f"{round(dx)}px {round(dy)}px"}

def peak(name):
    """Seconds into a sound effect where it hits hardest, so the hit can land on the cut."""
    raw = subprocess.run(["ffmpeg","-v","error","-i",os.path.join(PUB,"ten","sfx",name+".mp3"),"-ac","1","-ar","8000","-f","s16le","-"],capture_output=True).stdout
    import array; a = array.array("h", raw); win = 400; best = (0, 0)
    for i in range(0, len(a)-win, 200):
        e = sum(abs(v) for v in a[i:i+win]); best = max(best, (e, i))
    return best[1]/8000
PEAK = {n: peak(n) for n in ("boom","hit","shutter","scratch")}

CLIPDUR = {}
def clipdur(src):
    if src not in CLIPDUR: CLIPDUR[src] = dur(os.path.join(PUB, src))
    return CLIPDUR[src]
USED = {}; LAST = [None]
def claim(src, where):
    if src in USED and LAST[0] != src: raise SystemExit(f"REPEAT {src}: {USED[src]} and {where}")
    USED[src] = where; LAST[0] = src

frame = 0; audio = []; shots = []; music = []; subs = []; lyrics = []; sfx = []; hush = []
def fx(name, at, vol=1.0): sfx.append({"file": f"ten/sfx/{name}.mp3", "at": round(at - PEAK.get(name,0)*FPS), "vol": vol})

def shots_for(tokens, f0, f1, where):
    items = []
    for t in tokens:
        tag = None
        if "#" in t: t, tag = t.split("#",1)
        m = re.search(r"\*(\d+)$", t); w = int(m.group(1)) if m else 1; t = re.sub(r"\*\d+$", "", t)
        kind, _, rest = t.partition(":"); s = {}; cap = None; free = False
        if tag: s["tag"] = tag
        if kind == "v":
            src, _, tr = rest.partition("@"); trim = float(tr) if tr else 0.0
            s.update(t="v", src=src, trim=round(trim*FPS), rate=1.0); cap = clipdur(src) - trim - 0.12
            if src.startswith("g-"): s["re"] = True
        elif kind == "r":
            p = rest.split("|"); src, _, tr = p[0].partition("@")
            s.update(t="v", src=src, trim=round(float(tr)*FPS), rate=0.5, replay=True, lines=p[1:]); free = True
        elif kind == "z":
            p = rest.split("|"); src, _, tr = p[0].partition("@")
            s.update(t="v", src=src, trim=round(float(tr)*FPS), rate=1.0, freeze=True, name=p[1], role=p[2]); free = True
        elif kind in ("p","ps","P","PS"):
            src = pop_photo(rest) if kind in ("P","PS") else rest
            s.update(t=kind.lower(), src=src + ".jpg"); s.update(photo_fit(src + ".jpg"))
        elif kind == "y":
            yr, city = rest.split("|"); s.update(t="city", value=yr, label=city)
            if PHOTOS.get(yr): src = pop_photo(yr); s.update(src=src + ".jpg"); s.update(photo_fit(src + ".jpg"))
        elif kind in ("t","T"):
            if kind == "T":
                if len(TALL.get(rest, [])) < 3: raise SystemExit("out of tall clips for "+rest)
                names = [TALL[rest].pop(0) for _ in range(3)]
            else: names = ["nv/"+x for x in rest.split(",")]
            s.update(t="tri", srcs=[n+".mp4" for n in names]); cap = min(clipdur(n+".mp4") for n in names) - 0.15
        elif kind == "a": s.update(t="a", src=f"ten/{rest}.jpg", re=not rest.startswith("tease"))
        elif kind == "f":
            f,n,role = rest.split("|"); s.update(t="f", src=f"players/{f}", name=n, role=role, **face_fit(f"players/{f}"))
        elif kind == "stat":
            p = (rest.split("|")+["","",""])[:4]; s.update(t="stat", value=p[0], label=p[1], who=p[2])
            if p[3]: s.update(src=f"players/{p[3]}", **face_fit(f"players/{p[3]}", 500, 780))
        elif kind == "c":
            k,ti,sub = (rest.split("|")+["",""])[:3]; s.update(t="c", kicker=k, title=ti, sub=sub)
        elif kind in ("sheet","k"): s.update(t=kind)
        else: raise SystemExit("bad token "+t)
        if not free:
            for src in s.get("srcs", [s.get("src")] if s.get("src") else []): claim(src, where)
        items.append([s, w, cap])
    total = (f1 - f0) / FPS
    if all(c is not None for _,_,c in items) and total > sum(c for _,_,c in items) + 0.15:
        # the footage runs out before the line does: finish on a photo from the same year rather than slow it down
        yrs = re.findall(r"(20\d\d)-", " ".join(tokens)); y = yrs[0] if yrs and PHOTOS.get(yrs[0]) else "*"
        src = pop_photo(y); f = {"t": "p", "src": src + ".jpg"}; f.update(photo_fit(src + ".jpg"))
        claim(f["src"], where); items.append([f, 1, None]); print("filler", f["src"], "at", where)
    lens = [None]*len(items); free = list(range(len(items)))
    while True:
        rest_t = total - sum(l for l in lens if l is not None); ws = sum(items[i][1] for i in free)
        over = [i for i in free if items[i][2] is not None and rest_t*items[i][1]/ws > items[i][2]]
        if not over or len(over) == len(free): break
        for i in over: lens[i] = items[i][2]; free.remove(i)
    rest_t = total - sum(l for l in lens if l is not None); ws = sum(items[i][1] for i in free)
    for i in free: lens[i] = rest_t*items[i][1]/ws
    out = []; cur = f0
    for i,(s,w,cap) in enumerate(items):
        end = f1 if i == len(items)-1 else round(cur + lens[i]*FPS)
        s.update({"from": cur, "len": max(2, end-cur)})
        if cap is not None and s["len"]/FPS > cap + 0.05:
            s["rate"] = round(cap/(s["len"]/FPS), 3)
            if s["rate"] < 0.8: raise SystemExit(f"TOO SHORT {s.get('src') or s.get('srcs')} has {cap:.1f}s, slot {s['len']/FPS:.1f}s at {where}")
        if s["t"] == "stat": fx("hit", s["from"], 0.8)
        out.append(s); cur = end
    return out

def to_beat():
    """Hold the last shot a few frames so the next cut lands on a beat of the cue that is playing."""
    global frame
    if not music or music[-1]["to"] is not None: return
    m = music[-1]; name = os.path.basename(m["file"])[:-4]
    if name not in BEAT: return
    first = m["from"] - m["offset"] + BEAT[name]*FPS; pad = (-(frame - first)) % 15; pad = round(pad) % 15
    if pad and shots: shots[-1]["len"] += pad; frame += pad

GAP_N, GAP_D = 8, 9
for it in SCRIPT:
    k = it[0]; where = f"{k} {it[1] if len(it) > 1 else ''} @{frame/FPS:.0f}s"
    if k == B: to_beat(); continue
    if k == X: fx(it[1], frame + round(it[2]*FPS), it[3]); continue
    if k == L:
        lyrics += [{"text": t, "from": frame + round(a*FPS), "len": round(d*FPS)} for a,d,t in it[1]]; continue
    if k == M:
        if music and music[-1]["to"] is None:
            music[-1]["to"] = frame
            if it[1] is None and it[2] == "cut": music[-1]["cut"] = True
        if it[1]: music.append({"file": f"ten/{it[1]}.mp3", "from": frame, "to": None, "offset": round(it[2]*FPS), "vol": it[3]})
        continue
    if k == V:
        claim(it[1], where)
        n = round(it[3]*FPS); sh = {"from": frame, "len": n, "t": "v", "src": it[1], "trim": round(it[2]*FPS), "rate": 1.0, "vol": it[4]}
        if it[5]: sh["tag"] = it[5]
        shots.append(sh); hush.append([frame, frame+n, it[6] if len(it) > 6 else 0.0]); frame += n; continue
    if k == S:
        n = round(it[1]*FPS); shots += shots_for(it[2], frame, frame+n, where); frame += n; continue
    if k in (C, T):
        if k == T: to_beat(); fx("boom", frame, 0.95)
        n = round(it[1]*FPS); parts = (it[2].split("|")+["","",""])[:3]; LAST[0] = None
        shots.append({"from": frame, "len": n, "t": "title" if k == T else "c", "kicker": parts[0], "title": parts[1], "sub": parts[2]}); frame += n; continue
    path = prep(it[1]); d = dur(path); n = round(d*FPS)
    audio.append({"file": f"ten/vo/{it[1]}.mp3", "at": frame, "len": n, "kind": k})
    if k == I:
        who = it[3].split("|"); s = {"from": frame, "len": n + GAP_D, "t": "iv"}
        if who[0].startswith("a:"): s.update(src=f"ten/{who[0][2:]}.jpg", role=who[1], sub=who[2])
        else: s.update(src=f"players/{who[0]}", name=who[1], role=who[2], **face_fit(f"players/{who[0]}"))
        claim(s["src"], where); shots.append(s)
        subs.append({"text": it[2], "from": frame + 4, "len": n + 2}); frame += n + GAP_D; continue
    if k == D:
        new = shots_for(it[3], frame, frame+n+GAP_D, where)
        shots += new; subs.append({"text": it[2], "from": frame, "len": n+6}); frame += n + GAP_D; continue
    beats = it[2]; sil = silences(path); chars = [len(b[0]) for b in beats]; tot = sum(chars); cuts = [0.0]; acc = 0
    for c in chars[:-1]:
        acc += c; guess = d*acc/tot
        near = [x for x in sil if abs(x-guess) < 1.6 and x > cuts[-1] + 0.4]
        cuts.append(min(near, key=lambda x: abs(x-guess)) if near else guess)
    cuts.append(d + GAP_N/FPS)
    for (text, toks), a, b in zip(beats, cuts, cuts[1:]):
        shots += shots_for(toks, frame+round(a*FPS), frame+round(b*FPS), where)
    frame += n + GAP_N
if music and music[-1]["to"] is None: music[-1]["to"] = frame
total = frame + 30
json.dump({"total": total, "audio": audio, "shots": shots, "music": music, "sfx": sfx, "subs": subs, "lyrics": lyrics, "hush": hush}, open(os.path.join(ROOT,"src","ten-timeline.json"),"w"), indent=1)
print("total frames", total, "=", round(total/FPS/60,2), "min; shots", len(shots), "audio", len(audio), "sfx", len(sfx), "unique sources", len(USED))
for s in shots:
    for p in s.get("srcs", [s.get("src")] if s.get("src") else []):
        if not os.path.exists(os.path.join(PUB,p)): print("MISSING", p)
    if s["t"] in ("v","tri") and s.get("rate",1) < 1 and not s.get("replay"): print("slowed", s.get("src") or s["srcs"], s["rate"])
    if s["len"] > 6.5*FPS and s["t"] not in ("c","title") and not s.get("vol"): print("long", s["t"], s.get("src"), round(s["len"]/FPS,1))
for m in music:
    need = (m["to"]-m["from"]+m["offset"])/FPS; have = dur(os.path.join(PUB,m["file"]))
    print("music", m["file"], round(m["from"]/FPS), "-", round(m["to"]/FPS), "RUNS OUT" if need > have + 0.2 else "")
print("left:", {y: len(v) for y,v in PHOTOS.items()}, {y: len(v) for y,v in TALL.items()})
