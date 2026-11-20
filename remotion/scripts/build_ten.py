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

N,D,C,S,M,V,L = "N","D","C","S","M","V","L"
F = lambda f,n,s: f"f:{f}|{n}|{s}"
ALSO = [("j-bone.jpg","J-BONE"),("jack.jpg","JACK"),("kerns-cartoon.png","KERNS"),("hummel.jpg","HUMMEL"),("jason.jpg","JASON"),("shaun.jpg","SHAUN"),("brett.jpg","BRETT"),("blonski.jpg","BLONSKI"),("tony-schroe.jpg","TONY SCHROE")]
SCRIPT = [
 # ---- Cold open: the narrator is very serious. Drew is not.
 (M,"mA",0,0.8),
 (S,2.0,["v:g-sunrise.mp4@1"]),
 (N,"n01",[("Throughout history, mankind has been driven by an extraordinary desire to compete.",["v:flyover.mp4","v:g-round.mp4@0.5"]),
           ("To conquer. To achieve greatness.",["v:g-coast.mp4@0.5"]),
           ("Some have climbed Everest. Others have crossed oceans.",["v:r-pan1.mp4","v:dawn.mp4"]),
           ("And in February of 2018...",["v:convoy.mp4"]),
           ("a group of grown men decided to rent a house in Palm Springs, and get absolutely hammered.",["P:2018","P:2018","P:2018"])]),
 (M,None,0,0),
 (L,[(0.8,4.6,"The Strand, the Strand, take me to the Strand")]),
 (V,"ten/drew1.mp4",0,7.0,1.0,"Drew · the first Strand song"),
 (M,"o1",43.8,1.0),
 (C,4.2,"The official unofficial tenth-anniversary film|The Strand Invitational|Ten Years of Questionable Decisions"),
 (S,7.6,["T:2023*2","v:r-laugh.mp4","T:2024*2","v:r-selfie1.mp4","T:2025*2","v:r-cartselfie.mp4"]),
 (M,"bed",0,0.5),
 (N,"a1",[("Ten years. Ten tournaments. Thousands of dollars.",["P:2019","P:2021","P:2022","P:2024"]),
          ("And no evidence that any of them have gotten better at golf.",["t:2024-003,2023-045,2025-099"]),
          ("This is their story. Mostly.",["P:2026"])]),
 # ---- Strand 1.0
 (C,3.0,"Strand 1.0|The Desert Years|2018 – 2022 · Palm Springs to Rams Hill"),
 (N,"n03",[("Every great institution begins with a visionary. Someone willing to sacrifice everything for a dream.",["v:g-freddy.mp4"]),
           ("Time. Money. Sleep.",[F("fred.jpg","FRED GEISINGER","The Commissioner")]),
           ("And in Fred Geisinger's case... approximately four hundred hours negotiating a twelve-dollar discount on a tee time.",["v:g-desk.mp4","P:2021"])]),
 (D,"d02","Boys, I’ve got incredible news. I saved everyone seven dollars and forty-three cents.",["sheet"]),
 (D,"d03","You’re welcome.",["a:burritos"]),
 (N,"n26",[("He planned it on the couch, long after bedtime.",["t:2025-044,2023-122,2025-021"]),
           ("He missed calls from his own boss, to negotiate tee times.",["P:2021"]),
           ("His wife would speak to him over dinner. All he heard was... The Strand. The Strand.",["v:g-dinner.mp4@2","c:What the Commissioner hears||“The Strand. The Strand.”"])]),
 (N,"a2",[("Alongside him stood Matt Lowell. The Golffather.",["a:lowell"]),
          ("The only man in the organization who could actually play.",["v:strike-full.mp4","v:dvid/early-037.mp4"]),
          ("One year, his journey to The Strand went so badly, that Matty O had to rescue him from an airport two hours away.",["v:g-vans.mp4","a:mattyo"]),
          ("He has not been seen since.",["c:Matt Lowell||Last seen: Arrivals"])]),
 (N,"a3",[("Matty O. The Eagle Scout.",[F("matty-o.jpg","MATTY O.","The Eagle Scout")]),
          ("If you are stranded, he will find you.",["v:dvid/2023-214.mp4"]),
          ("If you are hungry, he has already ordered the pizza.",["t:2024-030,2024-080,2023-025"])]),
 (M,"mB",0,0.8),
 (C,2.8,"2019 · Tahquitz Creek · The eighteenth hole||The Bunker Incident"),
 (N,"n07",[("Kevin had sent his golf ball roughly seventy yards beyond the flag. A bold strategic decision. Some might even call it courageous.",[F("kev.jpg","KEV","Seventy yards long"),"v:g-shot.mp4"]),
           ("Wix, demonstrating the generosity that defines The Strand, offered his friend a ride.",[F("wix.jpg","MATT “WIX” WIXTED","Driver"),"P:2019"]),
           ("And then... without warning... the earth simply disappeared.",["v:g-cart.mp4"]),
           ("Five feet. An unmarked drop. One unsuspecting driver.",["v:g-stuck.mp4"]),
           ("And a golf cart that had just discovered the limitations of its suspension.",["p:d/early-012#Actual photograph · 2019"])]),
 (D,"d05","Well... that’s not ideal.",["a:wixcart"]),
 (N,"a4",[("The course owner was furious. The boys were furious.",["a:owner"]),
          ("For the first time in recorded history, both sides blamed the other, for a golf cart at the bottom of a bunker.",["P:2019","a:tractor"])]),
 (D,"d06","Think that’s a free drop?",["a:tractor"]),
 (M,"bed",38,0.5),
 (N,"a5",[("Then, there is Rhett.",[F("rhett.jpg","RHETT","Handicap: under review")]),
          ("He announced he could not break a hundred. He was assigned a twelve.",["a:committee"]),
          ("He won low net. Twice.",["v:cup.mp4"]),
          ("Years later, under the lights on eighteen, he hit the shot that sealed a championship.",["t:2023-081,2023-082,2023-196"]),
          ("He has also fallen over on his first swing, and been given a black eye by a ball washer.",["v:real-swing-a.mp4","c:Injury report||Black eye|Assailant: one ball washer"]),
          ("Greatness is complicated.",["a:club"])]),
 (N,"a6",[("In La Quinta, D'Arcy's cot folded shut, with D'Arcy still inside it.",[F("darcy.jpg","D’ARCY","Folded · La Quinta, 2021")]),
          ("In 2020, a pandemic stopped the world.",["c:2020||The world stopped"]),
          ("It delayed The Strand by four months.",["P:2021","P:2022"])]),
 # ---- Strand 2.0
 (M,None,0,0),
 (V,"ten/drew2.mp4",0,6.0,1.0,"Drew · 2024"),
 (M,"bed",76,0.5),
 (C,2.8,"Strand 2.0|The Expedition Years|2023 – 2025 · St. George · Ojai · Monterey"),
 (N,"a7",[("The Strand left the desert.",["v:r-pan2.mp4","P:2022"]),
          ("Planes. Vans.",["v:r-walk.mp4","v:r-lodge.mp4"]),
          ("Red rock in Utah.",["t:2023-114,2023-215,2023-204"]),
          ("Everything was bigger.",["P:2023"]),
          ("One percent better, every year.",["P:2023"])]),
 (N,"n24",[("The 2023 Strand opened, as tradition demands, with a ceremonial first tee shot. The honor fell to Gord.",["P:2023",F("gord.jpg","GORD","The ceremonial first tee shot")])]),
 (M,None,0,0),
 (V,"ten/gord-tee.mp4",0,12.2,1.0,"Actual footage · St. George, 2023"),
 (N,"n25",[("It travelled five feet. Into a bush.",["c:Official distance||Five feet|Into a bush."])]),
 (M,"bed",100,0.5),
 (N,"a8",[("Hours later, Nick Kane stood on a par four, and hit the shot of his life.",[F("kane.jpg","NICK KANE","A par four. A dream."),"v:dvid/2023-063.mp4"]),
          ("From the tee, it vanished beside the flag.",["v:dvid/2023-079.mp4"]),
          ("A hole-in-one. On a par four.",["a:kanesprint"])]),
 (M,None,0,0),
 (V,"ten/kane1.mp4",0,3.6,1.0,"Actual footage · 2023"),
 (N,"a9",[("He removed his shirt. He rode to the green like a conquering king.",["v:ten/kane2.mp4","v:ten/kane3.mp4"]),
          ("The ball was not in the hole. It was not on the green.",["a:kanecup","a:kanestand"])]),
 (V,"ten/kane4.mp4",0,4.0,1.0,"Actual footage · the green"),
 (D,"d14","You still gotta chip, dude.",["p:d/2023-202"]),
 (C,3.0,"St. George, 2023||It was a par four|It did not go in."),
 (M,"o1",6.0,1.0),
 (L,[(0.7,4.4,"Hey, it’s here, that special time of year"),(5.5,5.0,"Where we golf and drink lots of beer"),(11.0,2.2,"The Strand, the Strand…")]),
 (S,13.2,["v:dvid/2023-032.mp4","T:2023*2","P:2023","v:dvid/2023-203.mp4","T:2023*2","P:2023","v:dvid/2023-058.mp4","T:2023*2","P:2023","v:dvid/2023-024.mp4"]),
 (M,"bed",20,0.5),
 (N,"a10",[("Ojai, 2024.",["v:nv/2024-026.mp4"]),
           ("The first year of captains.",["P:2024","P:2024"]),
           ("The closest Strand ever played.",["v:nv/2024-025.mp4"]),
           ("Twenty-five, to twenty-three.",["c:Ojai 2024 · Final score||25 – 23"])]),
 (M,None,0,0),
 (L,[(0.1,3.0,"Hey… I’m at the Strand, with all of my friends"),(3.1,1.8,"No, I don’t want this night to end"),(5.0,2.5,"’Cause I’m at the Strand, with all of my friends")]),
 (V,"ten/drew2b.mp4",0,7.6,1.0,"Drew · “With the Strand” · 2024"),
 (M,"o2",30.6,1.0),
 (L,[(0.4,1.8,"Now it’s time to play Piper"),(2.2,2.2,"Gotta change a dirty diaper"),(4.4,2.8,"But I don’t care, my ball’s in the air"),(7.2,2.3,"Par five comin’ up next, oh yeah"),(9.5,2.2,"Please hit the green, oh baby"),(11.7,2.3,"And make an eagle putt, just like Freddie")]),
 (S,14.0,["v:dvid/2024-012.mp4","T:2024*2","P:2024","v:nv/2024-018.mp4","v:dvid/2024-002.mp4","P:2024","T:2024*2","v:dvid/2024-051a.mp4","P:2024","v:nv/2024-019.mp4","v:dvid/2024-004.mp4"]),
 (M,"bed",52,0.5),
 (N,"a11",[("Monterey, 2025.",["v:nv/2025-053.mp4"]),
           ("Pasatiempo. The first golf course that was, frankly, too good for them.",["P:2025","v:dvid/2025-041.mp4"]),
           ("A team named itself the Taliban.",["a:tone"]),
           ("It won.",["P:2025"])]),
 (M,None,0,0),
 (L,[(0.4,5.0,"By the bay, in Monterey, it’s the Strand — ay, ay")]),
 (V,"ten/drew3.mp4",0,6.0,1.0,"Drew · “By the Bay” · 2025"),
 (M,"o3",47.6,1.0),
 (L,[(0.6,3.6,"New putter Tone, and Kaners in the zone"),(4.3,2.6,"So tee it high, boys, let it fly"),(6.9,1.6,"I hope I bomb a drive!"),(8.5,2.6,"So tee it high, boys, let it fly"),(11.1,1.3,"I hope I bomb a drive!")]),
 (S,12.4,["v:dvid/2025-043.mp4","T:2025*2","P:2025","v:nv/2025-046.mp4","v:dvid/2025-094.mp4","P:2025","v:dvid/2025-116.mp4","P:2025","v:dvid/2025-039.mp4","v:dvid/2025-047.mp4","P:2025","v:dvid/2025-052.mp4"]),
 # ---- Strand 3.0
 (M,"bed",112,0.5),
 (C,2.8,"Strand 3.0|Destination Resorts|2026 · Gamble Sands, Washington"),
 (N,"a12",[("Then came Gamble Sands.",["v:real-tee.mp4"]),
           ("Three vans. Twenty men.",["P:2026","P:2026"]),
           ("A logistical operation involving airports, tee times,",["v:r-pairings.mp4","v:envelope.mp4"]),
           ("and a remarkable number of adults who could not arrange their own arrival.",["P:2026","v:r-bridge.mp4"])]),
 (M,None,0,0),
 (V,"ten/drew4.mp4",0,7.6,1.0,"Drew · “Ramblin’ Man” · 2026"),
 (M,"o4",25.6,1.0),
 (S,17.0,["v:r-maroon.mp4","P:2026","v:r-pink.mp4","P:2026","v:r-redsun.mp4","P:2026","v:r-swing09.mp4","P:2026","v:r-selfie2.mp4","P:2026","v:r-tee75.mp4","P:2026","v:real-swing-b.mp4","P:2026","v:r-teebox.mp4","P:2026"]),
 # ---- Legends, lightning round
 (M,"bed",8,0.5),
 (N,"a13",[("The archive contains other legends.",["P:2022"]),
           ("Drew paid eighty dollars for two meatballs.",[F("drew.jpg","DREW","Two meatballs. Eighty dollars.")]),
           ("Jerf changed the shaft of his driver in the middle of a round.",["c:Mid-round equipment change||A new driver shaft|— Jerf"]),
           ("Pat conquered a golf course with a five-hybrid.",[F("p-mo.jpg","PAT","One five-hybrid. Entire golf course.")]),
           ("Nick Sprowls made a hole-in-one, at a bachelor party, and The Strand has claimed it ever since.",[F("nick.jpg","NICK SPROWLS","Hole-in-one · location: a bachelor party"),"v:g-party.mp4"]),
           ("And nobody will explain the potato phone.",["a:glass"])]),
 # ---- The sincere bit, over Drew's own chorus
 (M,"o2",38.9,0.95),
 (N,"a14",[("Ten years ago, some of these men were single. Some had no children. Some had considerably more hair.",["PS:2018","PS:2018","PS:2018"]),
           ("Every year, somehow, they find their way back.",["P:2021","P:2023","P:2025"]),
           ("The golf was never the point. It was the excuse.",["v:dvid/2023-203b.mp4","v:dvid/2024-024.mp4"]),
           ("Here's to Fred, who made it happen.",["a:drone"]),
           ("And to every story they haven't told yet.",["P:2026"])]),
 (S,1.6,["v:dvid/early-021.mp4"]),
 (C,4.0,"2018 – 2027|The Strand Invitational|Ten years. One brotherhood."),
 # ---- Year ten
 (M,"mB",20,0.8),
 (N,"a15",[("As for year ten...",["a:tease1"]),("the Commissioner has been making calls.",["a:tease2"])]),
 (C,3.4,"2027||Destination: classified"),
 # ---- Credits over Drew
 (M,"o4",70.2,1.0),
 (S,3.0,["c:All songs written and performed by||Drew"]),
 (S,13.5,[F(f,n,"Also starring") for f,n in ALSO]),
 (S,13.0,["P:*","P:*","v:dvid/2024-022.mp4","P:*","P:*","v:dvid/2024-051b.mp4","P:*","P:*","P:*","P:*"]),
 (C,4.6,"Toeing the line between golf trip and boys trip since 2018||See you in 2027"),
 (M,None,0,0),
 (S,1.6,["k"]),
 (S,2.2,["a:newcart"]),
 (D,"d16","Hey, Wix... you driving?",["a:newcart"]),
 (S,0.9,["a:newcart"]),
 (D,"d17","Fuck you.",["a:newcart"]),
 (C,2.4,"||The End"),
]

# ---- pools: every photo and clip is handed out once
FACES = json.load(open(os.path.join(ROOT,"src","ten-faces.json")))
def year_of(name):
    if not name.startswith("early"): return name[:4]
    n = int(name.split("-")[1])
    if 31 <= n <= 50: return "2018"
    if n in (1,4,9,10,11,12,72): return "2019"
    if n in (14,15,17,18,19,20,22,23,67,68,69): return "2021"
    return "2022"
explicit = set(re.findall(r"(?:p|ps):([\w/-]+)", json.dumps(SCRIPT))) | {"d/"+x for x in []}
for m in re.findall(r"t:([\w,-]+)", json.dumps(SCRIPT)): explicit |= {"nv/"+x for x in m.split(",")}
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
    if k in explicit or ("v:"+k+".mp4") in json.dumps(SCRIPT): continue
    w = subprocess.run(["ffprobe","-v","error","-select_streams","v","-show_entries","stream=width","-of","csv=p=0",os.path.join(PUB,k+".mp4")],capture_output=True,text=True).stdout.strip()
    if w == "600": TALL.setdefault(f[:4], []).append(k)
def pop_photo(y):
    if y == "*":
        for yy in ("2018","2019","2021","2022","2023","2024","2025","2026"):
            if PHOTOS.get(yy): y = yy; break
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
def face_fit(rel):
    """Crop, zoom and nudge a headshot so the face fills the card."""
    name = os.path.basename(rel); f = FACES.get(rel)
    fx, fy, fh = BY_EYE[name] if name in BY_EYE else (f["x"], f["y"], 2.2*(f["y"]-f["top"]))
    w,h = dims(os.path.join(PUB,rel)); pw, ph = 560, 860; sc = max(pw/w, ph/h); W, H = w*sc, h*sc
    ox = 0.5 if W-pw < 1 else min(max((fx*W-pw/2)/(W-pw),0),1); oy = 0.3 if H-ph < 1 else min(max((fy*H-ph*0.42)/(H-ph),0),1)
    px, py = fx*W - ox*(W-pw), fy*H - oy*(H-ph); z = min(max(0.3*ph/(fh*H), 1), 3.2)
    dx = min(max(pw/2 - px, -(z-1)*(pw-px)), (z-1)*px); dy = min(max(ph*0.42 - py, -(z-1)*(ph-py)), (z-1)*py)
    return {"op": f"{round(100*ox)}% {round(100*oy)}%", "zoom": round(z,2), "org": f"{round(px)}px {round(py)}px", "tr": f"{round(dx)}px {round(dy)}px"}

CLIPDUR = {}
def clipdur(src):
    if src not in CLIPDUR: CLIPDUR[src] = dur(os.path.join(PUB, src))
    return CLIPDUR[src]
USED = {}; LAST = [None]
def claim(src, where):
    if src in USED and LAST[0] != src: raise SystemExit(f"REPEAT {src}: {USED[src]} and {where}")
    USED[src] = where; LAST[0] = src

def shots_for(tokens, f0, f1, where):
    items = []
    for t in tokens:
        tag = None
        if "#" in t: t, tag = t.split("#",1)
        m = re.search(r"\*(\d+)$", t); w = int(m.group(1)) if m else 1; t = re.sub(r"\*\d+$", "", t)
        kind, _, rest = t.partition(":"); s = {}; cap = None
        if tag: s["tag"] = tag
        if kind == "v":
            src, _, tr = rest.partition("@"); trim = float(tr) if tr else 0.0
            s.update(t="v", src=src, trim=round(trim*FPS), rate=1.0); cap = clipdur(src) - trim - 0.12
        elif kind in ("p","ps","P","PS"):
            src = pop_photo(rest) if kind in ("P","PS") else rest
            s.update(t=kind.lower(), src=src + ".jpg"); s.update(photo_fit(src + ".jpg"))
        elif kind in ("t","T"):
            if kind == "T":
                if len(TALL.get(rest, [])) < 3: raise SystemExit("out of tall clips for "+rest)
                names = [TALL[rest].pop(0) for _ in range(3)]
            else: names = ["nv/"+x for x in rest.split(",")]
            s.update(t="tri", srcs=[n+".mp4" for n in names]); cap = min(clipdur(n+".mp4") for n in names) - 0.15
        elif kind == "a": s.update(t="a", src=f"ten/{rest}.jpg")
        elif kind == "f":
            f,n,sub = rest.split("|"); s.update(t="f", src=f"players/{f}", name=n, sub=sub, **face_fit(f"players/{f}"))
        elif kind == "c":
            k,ti,sub = (rest.split("|")+["",""])[:3]; s.update(t="c", kicker=k, title=ti, sub=sub)
        elif kind in ("sheet","k"): s.update(t=kind)
        else: raise SystemExit("bad token "+t)
        for src in s.get("srcs", [s.get("src")] if s.get("src") else []): claim(src, where)
        items.append([s, w, cap])
    # share the time by weight, but never ask a clip for more than it has (no slow motion)
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
        out.append(s); cur = end
    return out

frame = 0; audio = []; shots = []; music = []; subs = []; lyrics = []
GAP_N, GAP_D = 8, 10
for it in SCRIPT:
    k = it[0]; where = f"{k} {it[1]} @{frame/FPS:.0f}s"
    if k == L:
        lyrics += [{"text": t, "from": frame + round(a*FPS), "len": round(d*FPS)} for a,d,t in it[1]]; continue
    if k == M:
        if music and music[-1]["to"] is None: music[-1]["to"] = frame
        if it[1]: music.append({"file": f"ten/{it[1]}.mp3", "from": frame, "to": None, "offset": round(it[2]*FPS), "vol": it[3]})
        continue
    if k == V:
        claim(it[1], where)
        n = round(it[3]*FPS); sh = {"from": frame, "len": n, "t": "v", "src": it[1], "trim": round(it[2]*FPS), "rate": 1.0, "vol": it[4]}
        if it[5]: sh["tag"] = it[5]
        shots.append(sh); frame += n; continue
    if k == S:
        n = round(it[1]*FPS); shots += shots_for(it[2], frame, frame+n, where); frame += n; continue
    if k == C:
        n = round(it[1]*FPS); parts = (it[2].split("|")+["","","",""])[:4]; LAST[0] = None
        shots.append({"from": frame, "len": n, "t": "c", "kicker": parts[0], "title": parts[1], "sub": parts[2], "foot": parts[3]}); frame += n; continue
    path = prep(it[1]); d = dur(path); n = round(d*FPS)
    audio.append({"file": f"ten/vo/{it[1]}.mp3", "at": frame, "len": n, "kind": k})
    if k == D:
        new = shots_for(it[3], frame, frame+n+GAP_D, where)
        for s in new: s["drama"] = True
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
json.dump({"total": total, "audio": audio, "shots": shots, "music": music, "subs": subs, "lyrics": lyrics}, open(os.path.join(ROOT,"src","ten-timeline.json"),"w"), indent=1)
print("total frames", total, "=", round(total/FPS/60,2), "min; shots", len(shots), "audio", len(audio), "unique sources", len(USED))
for s in shots:
    for p in s.get("srcs", [s.get("src")] if s.get("src") else []):
        if not os.path.exists(os.path.join(PUB,p)): print("MISSING", p)
    if s["t"] in ("v","tri") and s.get("rate",1) < 1: print("slowed", s.get("src") or s["srcs"], s["rate"])
    if s["len"] > 6.5*FPS and s["t"] not in ("c",) and not s.get("vol"): print("long", s["t"], s.get("src"), round(s["len"]/FPS,1))
for m in music:
    need = (m["to"]-m["from"]+m["offset"])/FPS; have = dur(os.path.join(PUB,m["file"]))
    if need > have + 0.2: print("MUSIC RUNS OUT", m["file"], round(need,1), ">", round(have,1))
print("left:", {y: len(v) for y,v in PHOTOS.items()}, {y: len(v) for y,v in TALL.items()})
