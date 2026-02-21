// ═══════════════════════════════════════════════════════
// MADE MAN — UI RENDERER v3
// Event delegation throughout (no onclick-in-innerHTML)
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
    if (_uiFrame % 3 === 0) renderBuildings();
    if (_uiFrame % 4 === 0) renderUpgrades();
    if (_uiFrame % 6 === 0) renderDetective();
    if (_uiFrame % 10 === 0) renderStats();
    handlePendingEvent();
    handlePendingStory();
    renderNotification();
}

// ─── HUD ─────────────────────────────────────────────────
function renderHUD() {
    setText("cash", `$${fmt(G.cash)}`);
    const cps = getTotalCps();
    setText("cps", `$${fmtCps(cps)} per second`);
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
    for (const w of ["cook", "enforcer", "ghost", "don"])
        document.getElementById(`wing-${w}`)?.classList.toggle("active", G.wings[w]);
}

// ─── Buildings — pure HTML, delegation handles clicks ────
function renderBuildings() {
    const panel = document.getElementById("buildings-panel");
    if (!panel) return;
    let html = "";
    for (const b of BUILDINGS) {
        const count = G.buildings[b.id] || 0;
        const cost = getBuildingCost(b.id);
        const cpsB = getBuildingCps(b.id);
        const afford = G.cash >= cost;
        const wingLocked = b.wing && !G.wings[b.wing];
        const allLocked = b.unlockCondition === "all_wings" && !allWingsUnlocked();

        if ((wingLocked || allLocked) && count === 0) {
            const threshold = b.wing ? WING_THRESHOLDS[b.wing]?.cash : null;
            if (!threshold || G.totalEarned < threshold * 0.4) continue;
            html += `<div class="building locked"><div class="b-name">???</div><div class="b-desc">Unlock more empire first.</div></div>`;
            continue;
        }

        const fi = Math.min(Math.floor(count / 5), (b.flavour?.length || 1) - 1);
        const flavour = b.flavour?.[fi] || "";
        const wTag = b.wing ? `<span class="wing-tag wing-${b.wing}">${b.wing}</span>` : "";

        // Contribution line: only shown when owned
        const cpsLine = count > 0
            ? `<div class="b-contribution">Earning: <span class="val">${fmtCps(cpsB)}</span></div>`
            : `<div class="b-contribution hint">Earns: ${fmtCps(b.baseCps * 1)} each</div>`;

        html += `<div class="building ${afford ? "can-afford" : "cant-afford"}" data-buy-building="${b.id}">
      <div class="b-top">
        <span class="b-name">${b.name}${wTag}</span>
        ${count > 0 ? `<span class="b-count">×${count}</span>` : ''}
      </div>
      <div class="b-desc">${b.desc}</div>
      ${flavour ? `<div class="b-flavour">"${flavour}"</div>` : ""}
      ${cpsLine}
      <div class="b-foot">
        <span class="b-cost ${afford ? "" : "over"}">$${fmt(cost)}</span>
        ${!afford && count === 0 ? `<span class="b-need">need $${fmt(cost - G.cash)} more</span>` : ""}
      </div>
    </div>`;
    }
    panel.innerHTML = html;
}

// ─── Upgrades — delegation handles clicks ────────────────
function renderUpgrades() {
    const panel = document.getElementById("upgrades-panel");
    if (!panel) return;
    const avail = UPGRADES.filter(u => isUpgradeAvailable(u));
    if (!avail.length) { panel.innerHTML = '<div class="no-upgrades">// nothing available yet</div>'; return; }
    let html = "";
    for (const u of avail.slice(0, 10)) {
        const cost = u.cost || Math.floor(getBuildingCost(u.building) * u.costMult);
        const can = G.cash >= cost;

        // Clear effect label
        let effectLabel = "";
        if (u.cpsBonus) effectLabel = `+${Math.round((u.cpsBonus - 1) * 100)}% ${u.building} income`;
        if (u.globalMult) effectLabel = `×${u.globalMult} ALL income`;
        if (u.clickBonus) effectLabel = `+${Math.round((u.clickBonus - 1) * 100)}% click power`;

        html += `<div class="upgrade ${can ? "can-afford" : "cant-afford"}" data-buy-upgrade="${u.id}">
      <div class="u-name">${u.name}</div>
      <div class="u-desc">${u.desc}</div>
      ${effectLabel ? `<div class="u-effect">${effectLabel}</div>` : ""}
      <div class="u-cost ${can ? "" : "over"}">$${fmt(cost)}</div>
    </div>`;
    }
    panel.innerHTML = html;
}

// ─── Detective — simplified ───────────────────────────────
function renderDetective() {
    const panel = document.getElementById("detective-panel");
    if (!panel) return;
    const d = G.detective, prog = Math.floor(d.progress);

    // Simple threat level language
    const threat = prog < 20 ? { label: "Not watching you", color: "#22ff66" } :
        prog < 45 ? { label: "Sniffing around", color: "#ff6b1a" } :
            prog < 70 ? { label: "Building a case", color: "#ff6b1a" } :
                prog < 90 ? { label: "⚠ About to move", color: "#ff2244" } :
                    { label: "🚨 RAID COMING", color: "#ff2244" };

    const bribeCost = getBribeCost();
    const canBribe = G.cash >= bribeCost;

    panel.innerHTML = `
    <div class="det-head">⬡ The Cop</div>
    <div class="det-namerow">
      <span class="det-name">${d.name}</span>
      <span class="det-num" style="color:${threat.color}">${threat.label}</span>
    </div>
    <div class="det-track-bg">
      <div class="det-track-fill" style="width:${prog}%;background:${threat.color}"></div>
    </div>
    <div class="det-hint">
      ${prog < 20 ? "High heat fills this bar. Keep heat low." : prog < 70 ? "Pay him off or lay low." : "Act now or face a raid."}
    </div>
    <div class="det-actions">
      <button data-action="bribe" class="${canBribe ? "" : "disabled-btn"}" title="${canBribe ? "" : "Not enough cash"}">
        Pay off — $${fmt(bribeCost)}${!canBribe ? " ✗" : ""}
      </button>
      <button data-action="kill" class="elim">Eduardo handles it (+heat)</button>
    </div>`;
}

// ─── Stats ───────────────────────────────────────────────
function renderStats() {
    const el = document.getElementById("stats");
    if (!el) return;
    const cps = getTotalCps();
    const rows = [
        ["Total Earned", `$${fmt(G.totalEarned)}`, "green"],
        ["Per Second", fmtCps(cps), cps > 0 ? "green" : ""],
        ["Buildings", G.totalBuildings, ""],
        ["Upgrades", G.purchasedUpgrades.length, ""],
        ["Achievements", `${G.achievements.length}/${ACHIEVEMENTS.length}`, "purple"],
        ["Heat", Math.floor(G.heat) + "%", G.heat > 60 ? "red" : ""],
        ["Prestige", G.prestigeCount, G.prestigeCount > 0 ? "orange" : ""],
        ["Cred", G.cred, G.cred > 0 ? "orange" : ""],
    ];
    el.innerHTML = rows.map(([l, v, cls]) =>
        `<div class="stat-row"><span class="s-label">${l}</span><span class="s-val ${cls}">${v}</span></div>`
    ).join("") + (canPrestige() ? `<button id="prestige-btn" class="prestige-btn">TAKE THE FALL</button>` : "");

    // Re-attach prestige button via delegation (same mechanism)
    document.getElementById("prestige-btn")?.addEventListener("click", handlePrestige, { once: true });
}

// ─── EVENT DELEGATION — all panel clicks handled here ────
function initDelegation() {
    // Buildings panel
    document.getElementById("buildings-panel")?.addEventListener("click", e => {
        const card = e.target.closest("[data-buy-building]");
        if (card) buyBuilding(card.dataset.buyBuilding);
    });

    // Upgrades panel
    document.getElementById("upgrades-panel")?.addEventListener("click", e => {
        const card = e.target.closest("[data-buy-upgrade]");
        if (card) buyUpgrade(card.dataset.buyUpgrade);
    });

    // Detective panel (re-delegate since it re-renders)
    document.getElementById("detective-panel")?.addEventListener("click", e => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        if (btn.dataset.action === "bribe") handleBribeDetective();
        if (btn.dataset.action === "kill") handleKillDetective();
    });
}

// ─── Event Panel ─────────────────────────────────────────
let _eventOpen = false;
function handlePendingEvent() {
    const panel = document.getElementById("event-panel");
    const ev = G.pendingEvent;

    if (!ev && _eventOpen) { panel.classList.remove("open"); _eventOpen = false; return; }
    if (!ev) return;
    if (!_eventOpen) { panel.classList.add("open"); _eventOpen = true; }

    setText("event-type-tag", ev.isRandom ? ev.name?.toUpperCase() || "EVENT" : "SITUATION");
    setText("event-title", ev.title || ev.name || "");

    const body = document.getElementById("event-body");
    if (body) body.innerHTML = `<p>${ev.text || ev.desc || ""}</p>`;

    const btns = document.getElementById("event-buttons");
    if (!btns) return;
    btns.innerHTML = "";

    if (ev.isRandom && !ev.choices) {
        btns.appendChild(makeBtn("Take it", false, () => { applyRandomEventEffect(ev); G.pendingEvent = null; }));
    } else if (ev.choices) {
        ev.choices.forEach((ch, i) => {
            const label = ch.label || ch;
            const isDanger = label.includes("Eduardo") || label.includes("Kill") || label.includes("elim");
            btns.appendChild(makeBtn(label, isDanger, () => {
                if (ev.isRandom) applyRandomEventEffect(ev, i);
                else resolveHeatEvent(ev, i);
                G.pendingEvent = null;
            }));
        });
    }
}

// ─── Story Panel ─────────────────────────────────────────
let _storyOpen = false;
function handlePendingStory() {
    const panel = document.getElementById("story-panel");
    const ev = G.pendingStory;

    if (!ev && _storyOpen) { panel.classList.remove("open"); _storyOpen = false; return; }
    if (!ev) return;
    if (!_storyOpen) { panel.classList.add("open"); _storyOpen = true; }

    setText("story-tag", "SITUATION");
    setText("story-title", ev.title);
    const body = document.getElementById("story-body");
    if (body) body.innerHTML = `<p>${ev.text}</p>`;

    const btns = document.getElementById("story-buttons");
    if (!btns) return;
    btns.innerHTML = "";

    ev.choices.forEach((ch, i) => {
        const canUse = !ch.disabled;
        const b = makeBtn(ch.label, false, () => {
            resolveStory(ev, i);
            if (ch.outcome) showOutcome(ch.outcome);
        });
        b.disabled = !canUse;
        if (!canUse) b.title = ch.disabledReason || "Not available";
        btns.appendChild(b);
    });
}

function makeBtn(label, danger, onClick) {
    const b = document.createElement("button");
    b.textContent = label;
    if (danger) b.className = "danger-choice";
    b.addEventListener("click", onClick);
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
    if (ef.darkMode) G.heatPaused = ef.darkMode;
    // Bribe cost events
    if (ef.cost === "15pct") {
        const cost = G.cash * 0.15;
        G.cash = Math.max(0, G.cash - cost);
    }
}

// ─── Notification toast ──────────────────────────────────
let _notifVisible = false;
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

// ─── Action handlers ─────────────────────────────────────
function handleBribeDetective() {
    if (G.cash < getBribeCost()) {
        showOutcome("Not enough cash to pay him off.");
        return;
    }
    bribeDetective();
}
function handleKillDetective() { killDetective(); }
function handlePrestige() {
    if (!canPrestige()) return;
    const bonus = triggerPrestige();
    showOutcome("Prison Reset done. Perk unlocked: " + bonus);
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
    initDelegation();

    const wrap = document.getElementById("clicker-wrap");
    wrap?.addEventListener("click", e => {
        doClick();
        wrap.classList.add("clicked");
        setTimeout(() => wrap.classList.remove("clicked"), 120);
        const rect = wrap.getBoundingClientRect();
        spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
}
