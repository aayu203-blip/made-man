// ═══════════════════════════════════════════════════════
// MADE MAN — UI RENDERER v2
// Panel-based events (slide in from sides, game stays visible)
// ═══════════════════════════════════════════════════════

let _uiFrame = 0;

// ─── Headlines ───────────────────────────────────────────
const HEADLINES = [
    ["LOCAL MAN WINS LOTTERY", "Police say it's unrelated to the three missing persons reports."],
    ["CITY BUDGET PASSES 11-0", "Councilman Torres calls it 'a win for the community.'"],
    ["WAREHOUSE FIRE DOWNTOWN", "Arson not suspected. Fire chief unavailable for comment."],
    ["AREA RESTAURANT WINS AWARD", "Best Italian four years running. Health inspection waived."],
    ["FEDERAL INVESTIGATION CLOSED", "Citing 'lack of evidence.' Lead investigator transferred to Alaska."],
    ["MISSING PERSONS UNIT EXPANDED", "City allocates $2M. Origin of funds unclear."],
    ["SENATOR BROOKS RE-ELECTED", "Campaign funded by anonymous donors."],
    ["GARY'S ANTIQUES EXPANDING", "Third location opens. Inventory described as 'eclectic.'"],
    ["CHEMICAL SMELL DOWNTOWN", "Officials say: artisanal kombucha. Residents skeptical."],
    ["BODY FOUND IN HARBOUR", "Strong swimmer who got tired, say police."],
    ["POLICE CHIEF ATTENDS EVENT", "Called it 'wonderful.' Refused to specify whose event."],
    ["CARTEL DISRUPTED IN THREE COUNTRIES", "Subject A believed unaffected."],
    ["MERIDIAN HOLDINGS IPO RAISES $2B", "CEO described as 'self-made.' Reporters nodded."],
];
let _headlineIdx = 0;
function cycleHeadline() {
    const h = HEADLINES[_headlineIdx % HEADLINES.length]; _headlineIdx++;
    const el = document.getElementById("headline");
    if (el) el.innerHTML = `<span class="hl-main">${h[0]}</span><span class="hl-sep"> — </span><span class="hl-sub">${h[1]}</span>`;
}

// ─── Main Render Loop ────────────────────────────────────
function render() {
    _uiFrame++;
    renderHUD();
    if (_uiFrame % 2 === 0) renderBuildings();
    if (_uiFrame % 3 === 0) renderUpgrades();
    if (_uiFrame % 5 === 0) renderDetective();
    if (_uiFrame % 8 === 0) renderStats();
    handlePendingEvent();
    handlePendingStory();
    renderNotification();
}

// ─── HUD ─────────────────────────────────────────────────
function renderHUD() {
    setText("cash", `$${fmt(G.cash)}`);
    setText("cps", `$${fmtCps(getTotalCps())} / sec`);
    setText("heat-val", Math.floor(G.heat));
    setText("heat-pct", Math.floor(G.heat) + "%");
    setText("rep-val", Math.floor(G.rep));
    setText("cred-val", G.cred);

    const fill = document.getElementById("heat-fill");
    if (fill) {
        fill.style.width = G.heat + "%";
        fill.style.background = G.heat > 75
            ? "linear-gradient(90deg,#8b0000,#ff2244)"
            : G.heat > 40
                ? "linear-gradient(90deg,#7a3000,#ff6b1a)"
                : "linear-gradient(90deg,#004422,#22ff66)";
        fill.classList.toggle("critical", G.heat > 90);
    }
    for (const w of ["cook", "enforcer", "ghost", "don"]) {
        document.getElementById(`wing-${w}`)?.classList.toggle("active", G.wings[w]);
    }
}

// ─── Buildings ───────────────────────────────────────────
function renderBuildings() {
    const panel = document.getElementById("buildings-panel");
    if (!panel) return;
    let html = "";
    for (const b of BUILDINGS) {
        const count = G.buildings[b.id] || 0;
        const cost = getBuildingCost(b.id);
        const cps = getBuildingCps(b.id);
        const afford = G.cash >= cost;
        const wingLocked = b.wing && !G.wings[b.wing];
        const allLocked = b.unlockCondition === "all_wings" && !allWingsUnlocked();
        if ((wingLocked || allLocked) && count === 0) {
            const threshold = b.wing ? WING_THRESHOLDS[b.wing]?.cash : null;
            if (!threshold || G.totalEarned < threshold * 0.4) continue;
            html += `<div class="building locked"><div class="b-name">???</div><div class="b-desc">Unlock more of your empire first.</div></div>`;
            continue;
        }
        const fi = Math.min(Math.floor(count / 5), (b.flavour?.length || 1) - 1);
        const flavour = b.flavour?.[fi] || "";
        const wTag = b.wing ? `<span class="wing-tag wing-${b.wing}">${b.wing}</span>` : "";
        html += `<div class="building ${afford ? "can-afford" : "cant-afford"}" onclick="handleBuyBuilding('${b.id}')">
      <div class="b-top"><span class="b-name">${b.name}${wTag}</span><span class="b-count">${count > 0 ? "×" + count : ""}</span></div>
      <div class="b-desc">${b.desc}</div>
      ${flavour ? `<div class="b-flavour">"${flavour}"</div>` : ""}
      <div class="b-foot">
        <span class="b-cost ${afford ? "" : "over"}">$${fmt(cost)}</span>
        ${count > 0 ? `<span class="b-cps">${fmtCps(cps)}</span>` : ""}
      </div>
    </div>`;
    }
    panel.innerHTML = html;
}

// ─── Upgrades ────────────────────────────────────────────
function renderUpgrades() {
    const panel = document.getElementById("upgrades-panel");
    if (!panel) return;
    const avail = UPGRADES.filter(u => isUpgradeAvailable(u));
    if (!avail.length) { panel.innerHTML = '<div class="no-upgrades">// nothing available yet</div>'; return; }
    let html = "";
    for (const u of avail.slice(0, 10)) {
        const cost = u.cost || Math.floor(getBuildingCost(u.building) * u.costMult);
        const can = G.cash >= cost;
        html += `<div class="upgrade ${can ? "can-afford" : "cant-afford"}" onclick="handleBuyUpgrade('${u.id}')">
      <div class="u-name">${u.name}</div>
      <div class="u-desc">${u.desc}</div>
      <div class="u-cost ${can ? "" : "over"}">$${fmt(cost)}</div>
    </div>`;
    }
    panel.innerHTML = html;
}

// ─── Detective ───────────────────────────────────────────
function renderDetective() {
    const panel = document.getElementById("detective-panel");
    if (!panel) return;
    const d = G.detective, prog = Math.floor(d.progress);
    const status = prog < 25 ? "Chasing cold leads." :
        prog < 50 ? "Getting warm. You feel it." :
            prog < 75 ? "He's in the neighbourhood." :
                prog < 100 ? "Active investigation. Very close." : "RAID IMMINENT";
    panel.innerHTML = `
    <div class="det-head">⬡ Law Enforcement</div>
    <div class="det-namerow"><span class="det-name">${d.name}</span><span class="det-num">#${d.count}</span></div>
    <div class="det-track-bg"><div class="det-track-fill" style="width:${prog}%"></div></div>
    <div class="det-status">${status}</div>
    <div class="det-actions">
      <button onclick="handleBribeDetective()">Bribe — $${fmt(getBribeCost())}</button>
      <button class="elim" onclick="handleKillDetective()">Eduardo handles it</button>
    </div>`;
}

// ─── Stats ───────────────────────────────────────────────
function renderStats() {
    const el = document.getElementById("stats");
    if (!el) return;
    const rows = [
        ["Total Earned", `$${fmt(G.totalEarned)}`, "green"],
        ["Income", fmtCps(getTotalCps()), ""],
        ["Buildings", G.totalBuildings, ""],
        ["Upgrades", G.purchasedUpgrades.length, ""],
        ["Achievements", `${G.achievements.length}/${ACHIEVEMENTS.length}`, "purple"],
        ["Heat", Math.floor(G.heat) + "%", G.heat > 60 ? "red" : ""],
        ["Prestige", G.prestigeCount, G.prestigeCount > 0 ? "orange" : ""],
        ["Cred", G.cred, G.cred > 0 ? "orange" : ""],
    ];
    el.innerHTML = rows.map(([l, v, cls]) =>
        `<div class="stat-row"><span class="s-label">${l}</span><span class="s-val ${cls}">${v}</span></div>`
    ).join("") + (canPrestige() ? `<button class="prestige-btn" onclick="handlePrestige()">TAKE THE FALL</button>` : "");
}

// ─── Event Panel (right side) ────────────────────────────
let _eventOpen = false;
function handlePendingEvent() {
    const panel = document.getElementById("event-panel");
    const ev = G.pendingEvent;

    if (!ev && _eventOpen) {
        panel.classList.remove("open");
        _eventOpen = false;
        return;
    }
    if (!ev) return;

    if (!_eventOpen) {
        panel.classList.add("open");
        _eventOpen = true;
    }

    setText("event-type-tag", ev.isRandom ? "INCOMING — " + (ev.name || "EVENT") : "SITUATION");
    setText("event-title", ev.title || ev.name || "");

    const body = document.getElementById("event-body");
    if (body) body.innerHTML = ev.isHtml ? ev.html : `<p>${ev.text || ev.desc || ""}</p>`;

    const btns = document.getElementById("event-buttons");
    if (!btns) return;
    btns.innerHTML = "";

    if (ev.isRandom && !ev.choices) {
        const b = makeBtn("Take it", false, () => { applyRandomEventEffect(ev); G.pendingEvent = null; });
        btns.appendChild(b);
    } else if (ev.choices) {
        ev.choices.forEach((ch, i) => {
            const label = ch.label || ch;
            const isDanger = typeof label === "string" && (label.includes("Eduardo") || label.includes("Kill") || label.includes("elim"));
            const b = makeBtn(label, isDanger, () => {
                if (ev.isRandom) applyRandomEventEffect(ev, i);
                else if (ev.id === "raid" || ev.id === "heat_critical") resolveHeatEvent(ev, i);
                G.pendingEvent = null;
            });
            btns.appendChild(b);
        });
    }

    if (ev.autoClose) setTimeout(() => { if (G.pendingEvent?.id === ev.id) G.pendingEvent = null; }, ev.autoClose);
}

// ─── Story Panel (left side) ────────────────────────────
let _storyOpen = false;
function handlePendingStory() {
    const panel = document.getElementById("story-panel");
    const ev = G.pendingStory;

    if (!ev && _storyOpen) {
        panel.classList.remove("open");
        _storyOpen = false;
        return;
    }
    if (!ev) return;

    if (!_storyOpen) { panel.classList.add("open"); _storyOpen = true; }

    setText("story-tag", "SITUATION");
    setText("story-title", ev.title);
    const body = document.getElementById("story-body");
    if (body) body.innerHTML = ev.isHtml ? ev.html : `<p>${ev.text}</p>`;

    const btns = document.getElementById("story-buttons");
    if (!btns) return;
    btns.innerHTML = "";

    ev.choices.forEach((ch, i) => {
        const canUse = !ch.disabled || (ch.disabledReason?.includes("Stage 6") && G.wings.don);
        const b = makeBtn(ch.label, false, () => {
            const outcome = ch.outcome;
            resolveStory(ev, i);
            if (outcome) showOutcome(outcome);
        });
        b.disabled = !canUse;
        if (ch.disabled && !canUse) b.title = ch.disabledReason || "";
        btns.appendChild(b);
    });
}

function makeBtn(label, danger, onClick) {
    const b = document.createElement("button");
    b.textContent = label;
    if (danger) b.className = "danger-choice";
    b.onclick = onClick;
    return b;
}

function showOutcome(text) {
    const el = document.getElementById("outcome-strip");
    if (!el) return;
    el.textContent = "↳ " + text;
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; }, 5000);
}

function resolveHeatEvent(ev, idx) {
    const ch = ev.choices[idx];
    const ef = ch?.effect || {};
    if (ef.heatDelta) G.heat = Math.max(0, Math.min(100, G.heat + ef.heatDelta));
    if (ef.detectiveReset) G.detective.progress = 20;
    if (ef.detectiveKill) killDetective();
    if (ef.fixerEvent) G.fixerEvents++;
    if (ef.repDelta) G.rep += ef.repDelta;
}

// ─── Notification toast ──────────────────────────────────
let _notifVisible = false;
const _notifQueue2 = [];

function renderNotification() {
    if (_notifVisible) return;
    const n = popNotification();
    if (!n) return;
    const el = document.getElementById("notif-toast");
    if (!el) return;
    el.className = "notif-toast " + (n.type || "");
    el.innerHTML = `<div class="n-title">${n.title}</div><div class="n-body">${n.body}</div>`;
    el.style.display = "block";
    _notifVisible = true;
    setTimeout(() => { el.style.display = "none"; _notifVisible = false; }, 3500);
}

// ─── Wing unlock banner ──────────────────────────────────
// Override the engine's queueNotification for wing type to use banner
const _origQueueNotif = queueNotification;

// ─── Click handlers ──────────────────────────────────────
function handleBuyBuilding(id) { buyBuilding(id); }
function handleBuyUpgrade(id) { buyUpgrade(id); }
function handleBribeDetective() { bribeDetective(); }
function handleKillDetective() { killDetective(); }
function handlePrestige() {
    if (!canPrestige()) return;
    const bonus = triggerPrestige();
    showOutcome("Prison Reset complete. Perk: " + bonus);
}

// ─── Cash particle ───────────────────────────────────────
function spawnParticles(x, y) {
    for (let i = 0; i < 2; i++) {
        const p = document.createElement("div");
        p.className = "cash-particle";
        const xOff = (Math.random() - 0.5) * 50;
        p.style.setProperty("--x", xOff + "px");
        p.style.setProperty("--x2", ((Math.random() - 0.5) * 30 + xOff) + "px");
        p.style.left = (x + (Math.random() - 0.5) * 20) + "px";
        p.style.top = (y - 10) + "px";
        p.textContent = "+$" + fmt(G.clickPower * G.globalMult);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

// ─── Helpers ─────────────────────────────────────────────
function setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function setHTML(id, val) { const e = document.getElementById(id); if (e) e.innerHTML = val; }

// ─── Init ────────────────────────────────────────────────
function initUI() {
    setInterval(render, 100);
    setInterval(cycleHeadline, 8000);
    cycleHeadline();

    const wrap = document.getElementById("clicker-wrap");
    wrap?.addEventListener("click", (e) => {
        doClick();
        wrap.classList.add("clicked");
        setTimeout(() => wrap.classList.remove("clicked"), 120);
        const rect = wrap.getBoundingClientRect();
        spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
}
