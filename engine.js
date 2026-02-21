// ═══════════════════════════════════════════════════════
// MADE MAN — GAME ENGINE
// Core loop, save/load, detective, prestige, Portals bridge
// ═══════════════════════════════════════════════════════

const SAVE_KEY = "mademan_v1";
const TICK_MS = 100; // 10 ticks/sec

// ─── State ─────────────────────────────────────────────
function defaultState() {
    return {
        cash: 0,
        totalEarned: 0,
        heat: 0,
        rep: 0,
        cred: 0,                    // prestige currency
        prestigeCount: 0,
        clickPower: 1,
        buildings: {                // counts per building id
            corner: 0, fence: 0, crew: 0, lab: 0, loanshark: 0,
            racket: 0, front: 0, blackmarket: 0, fixer: 0,
            network: 0, cartel: 0, corporation: 0
        },
        purchasedUpgrades: [],
        seenEvents: [],
        triggeredWorldChanges: [],
        achievements: [],
        wings: { cook: false, enforcer: false, ghost: false, don: false },
        detective: { progress: 0, count: 1, name: "Det. Morales", bribes: 0, alive: true },
        detectiveBribes: 0,
        fixerEvents: 0,
        declinedEnding: 0,
        heatPaused: 0,              // seconds remaining
        activeMults: [],            // [{mult, expires}]
        nextRandomEvent: 0,         // timestamp
        randomEventCooldown: 0,
        pendingEvent: null,
        pendingStory: null,
        totalBuildings: 0,
        globalMult: 1,
        permanentMults: [],
    };
}

let G = defaultState();
let tickInterval = null;

// ─── Save / Load ────────────────────────────────────────
function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { }
}

function load() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            G = Object.assign(defaultState(), saved);
        }
    } catch (e) { G = defaultState(); }
}

// ─── Income Calculation ─────────────────────────────────
function getBuildingCps(buildingId) {
    const b = BUILDINGS.find(x => x.id === buildingId);
    if (!b) return 0;
    const count = G.buildings[buildingId] || 0;
    if (count === 0) return 0;

    // Wing gate
    if (b.wing && !G.wings[b.wing]) return 0;
    if (b.unlockCondition === "all_wings" && !allWingsUnlocked()) return 0;

    // Base: each building level scales by 1.15^(count-1) total
    let base = b.baseCps * count * Math.pow(1.15, count - 1);

    // Upgrade bonuses for this building
    let mult = 1;
    for (const uid of G.purchasedUpgrades) {
        const u = UPGRADES.find(x => x.id === uid);
        if (u && u.building === buildingId) mult *= u.cpsBonus;
    }

    return base * mult;
}

function getTotalCps() {
    let cps = 0;
    for (const b of BUILDINGS) cps += getBuildingCps(b.id);

    // Active time-limited mults
    const now = Date.now();
    for (const m of G.activeMults) {
        if (m.expires > now) cps *= m.mult;
    }

    // Global synergy upgrades
    cps *= G.globalMult;

    // Permanent prestige mults
    for (const m of G.permanentMults) cps *= m;

    return cps;
}

// ─── Building Cost ──────────────────────────────────────
function getBuildingCost(buildingId) {
    const b = BUILDINGS.find(x => x.id === buildingId);
    if (!b) return Infinity;
    const count = G.buildings[buildingId] || 0;
    return Math.floor(b.baseCost * Math.pow(1.15, count));
}

// ─── Click ──────────────────────────────────────────────
function doClick() {
    const clickCash = G.clickPower * G.globalMult;
    G.cash += clickCash;
    G.totalEarned += clickCash;
    G.heat = Math.min(100, G.heat + 0.02);
    checkTriggers();
}

// ─── Buy Building ────────────────────────────────────────
function buyBuilding(id, count = 1) {
    const b = BUILDINGS.find(x => x.id === id);
    if (!b) return false;

    // Wing gate
    if (b.wing && !G.wings[b.wing]) return false;
    if (b.unlockCondition === "all_wings" && !allWingsUnlocked()) return false;

    const cost = getBuildingCost(id);
    if (G.cash < cost) return false;

    G.cash -= cost;
    G.buildings[id] = (G.buildings[id] || 0) + 1;
    G.totalBuildings++;
    G.rep += 1;
    G.heat = Math.min(100, G.heat + 0.5);

    checkWingUnlocks();
    checkTriggers();
    checkAchievements();
    save();
    return true;
}

// ─── Buy Upgrade ────────────────────────────────────────
function buyUpgrade(id) {
    if (G.purchasedUpgrades.includes(id)) return false;
    const u = UPGRADES.find(x => x.id === id);
    if (!u) return false;
    if (!isUpgradeAvailable(u)) return false;

    const cost = u.cost || (getBuildingCost(u.building) * u.costMult);
    if (G.cash < cost) return false;

    G.cash -= cost;
    G.purchasedUpgrades.push(id);

    if (u.globalMult) G.globalMult *= u.globalMult;
    checkAchievements();
    save();
    return true;
}

function isUpgradeAvailable(u) {
    if (G.purchasedUpgrades.includes(u.id)) return false;
    if (!u.req) return true;
    if (u.req.wing && !G.wings[u.req.wing]) return false;
    if (u.req.building && (G.buildings[u.req.building] || 0) < u.req.level) return false;
    if (u.req.totalBuildings && G.totalBuildings < u.req.totalBuildings) return false;
    if (u.req.prestige && G.prestigeCount < u.req.prestige) return false;
    return true;
}

// ─── Wing Unlocks ────────────────────────────────────────
function checkWingUnlocks() {
    for (const [wing, threshold] of Object.entries(WING_THRESHOLDS)) {
        if (!G.wings[wing] && G.totalEarned >= threshold.cash) {
            G.wings[wing] = true;
            triggerWorldChange("wing_" + wing);
            queueNotification("EMPIRE EXPANDED", threshold.name + "\n" + threshold.desc, "wing");
        }
    }
    if (allWingsUnlocked() && G.buildings.corporation === 0) {
        // Corporation becomes available
    }
}

function allWingsUnlocked() {
    return G.wings.cook && G.wings.enforcer && G.wings.ghost && G.wings.don;
}

// ─── Heat System ─────────────────────────────────────────
function tickHeat(dt) {
    if (G.heatPaused > 0) {
        G.heatPaused -= dt;
        return;
    }
    // Heat decays slowly when low, faster when high
    const decay = 0.02 + (G.heat / 100) * 0.03;
    G.heat = Math.max(0, G.heat - decay * dt);

    // Prestige perk: faster decay
    if (G.prestigeCount >= 3) G.heat = Math.max(0, G.heat - 0.02 * dt);

    checkHeatEvents();
}

function checkHeatEvents() {
    if (G.heat >= 100 && G.pendingEvent?.id !== "heat_critical") {
        G.pendingEvent = {
            id: "heat_critical",
            title: "🚨 HEAT CRITICAL",
            text: "Someone's about to make a call. You have options. None of them are good.",
            choices: [
                { label: `Bribe — $${fmt(G.cash * 0.15)}`, cost: "15pct", effect: { heatDelta: -60 } },
                { label: "Go dark (60s pause income)", effect: { darkMode: 60 } },
                { label: "Eduardo handles it", effect: { heatDelta: -80, fixerEvent: true, repDelta: -10 } },
            ]
        };
        triggerWorldChange("heat_critical");
    }
}

// ─── Detective ───────────────────────────────────────────
function tickDetective(dt) {
    if (!G.detective.alive) return;
    const heatFactor = G.heat / 100;
    G.detective.progress = Math.min(100, G.detective.progress + heatFactor * 0.1 * dt);
    if (G.detective.progress >= 50) triggerWorldChange("detective_patrol");
    if (G.detective.progress >= 100) triggerRaid();
}

function triggerRaid() {
    G.pendingEvent = {
        id: "raid",
        title: "🚔 RAID",
        text: `${G.detective.name} came through the door this morning with warrants. Your income is down 40% until this resolves.`,
        choices: [
            { label: `Bribe — $${fmt(getBribeCost())}`, effect: { heatDelta: -80, detectiveReset: true } },
            { label: "Kill him", effect: { heatDelta: 20, detectiveKill: true } },
            { label: "Plant evidence on rival", effect: { repDelta: -30, detectiveReset: true } },
        ]
    };
}

function getBribeCost() {
    return Math.floor(G.cash * 0.25 + G.detective.bribes * 50000);
}

function bribeDetective() {
    const cost = getBribeCost();
    if (G.cash < cost) return false;
    G.cash -= cost;
    G.detective.progress = 40;
    G.detective.bribes++;
    G.detectiveBribes++;
    G.heat = Math.max(0, G.heat - 20);
    triggerWorldChange("detective_bribed");
    checkAchievements();
    return true;
}

function killDetective() {
    G.detective.alive = false;
    G.detective.count++;
    G.fixerEvents++;
    G.heat = Math.min(100, G.heat + 30);
    triggerWorldChange("detective_killed");
    // New detective spawns, smarter
    setTimeout(() => {
        const names = ["Det. Park", "Det. Okafor", "Det. Reyes", "Det. Chen", "Det. Nakamura"];
        G.detective = {
            progress: 30,
            count: G.detective.count,
            name: names[G.detective.count % names.length],
            bribes: 0,
            alive: true
        };
        queueNotification("NEW DETECTIVE", `${G.detective.name} has taken the case. They have the previous detective's notes.`, "warning");
        save();
    }, 3000);
}

// ─── Random Events ────────────────────────────────────────
const NOTIFICATIONS = [];

function tickRandomEvents() {
    const now = Date.now();
    if (now < G.nextRandomEvent || G.pendingEvent || G.pendingStory) return;
    const minMs = 30000, maxMs = 180000;
    G.nextRandomEvent = now + minMs + Math.random() * (maxMs - minMs);

    // Prestige perk: more frequent events
    if (G.prestigeCount >= 9) G.nextRandomEvent -= 40000;

    const total = RANDOM_EVENTS.reduce((a, e) => a + e.weight, 0);
    let r = Math.random() * total;
    for (const ev of RANDOM_EVENTS) {
        r -= ev.weight;
        if (r <= 0) { fireRandomEvent(ev); break; }
    }
}

function fireRandomEvent(ev) {
    G.pendingEvent = { ...ev, isRandom: true };
}

function applyRandomEventEffect(ev, choiceIndex = 0) {
    const ef = ev.choices ? (choiceIndex === 0 ? ev.effect.accept : ev.effect.decline) : ev.effect;
    if (!ef) return;

    const now = Date.now();
    if (ef.cashMult) G.activeMults.push({ mult: ef.cashMult, expires: now + ef.duration * 1000 });
    if (ef.cpsMult) G.activeMults.push({ mult: ef.cpsMult, expires: now + ef.duration * 1000 });
    if (ef.heatDelta) G.heat = Math.max(0, Math.min(100, G.heat + ef.heatDelta));
    if (ef.heatPause) G.heatPaused = ef.heatPause;
    if (ef.cash) { G.cash += ef.cash; G.totalEarned += ef.cash; }
    if (ef.repDelta) G.rep += ef.repDelta;
    if (ef.heatMult && ef.permanent) G.permanentMults.push(ef.heatMult);
    if (ef.cashPct) G.cash = Math.max(0, G.cash + G.cash * ef.cashPct);
    if (ef.fixerEvent) G.fixerEvents++;
}

// ─── Story Events ────────────────────────────────────────
function checkStoryEvents() {
    for (const ev of STORY_EVENTS) {
        if (G.seenEvents.includes(ev.id)) continue;
        if (ev.cash && G.totalEarned < ev.cash) continue;
        if (ev.rep && G.rep < ev.rep) continue;
        if (ev.wingReq && !G.wings[ev.wingReq]) continue;
        if (ev.buildingReq) {
            let pass = true;
            for (const [k, v] of Object.entries(ev.buildingReq)) {
                if ((G.buildings[k] || 0) < v) { pass = false; break; }
            }
            if (!pass) continue;
        }
        G.seenEvents.push(ev.id);
        G.pendingStory = ev;
        return;
    }
}

function resolveStory(ev, choiceIdx) {
    const ch = ev.choices[choiceIdx];
    if (ch.disabled) return;
    if (!ch.effect) return;

    const ef = ch.effect;
    if (ef.cash) { G.cash += ef.cash; G.totalEarned += ef.cash; }
    if (ef.repDelta) G.rep += ef.repDelta;
    if (ef.heatDelta) G.heat = Math.max(0, Math.min(100, G.heat + ef.heatDelta));
    if (ef.unlockBuilding) { } // UI handles showing it
    if (ef.triggerPrestige) triggerPrestige();
    if (ev.worldChange) triggerWorldChange(ev.worldChange);

    G.pendingStory = null;
    save();
}

// ─── Prestige ────────────────────────────────────────────
function canPrestige() {
    return G.totalEarned >= 1000000000000;
}

function triggerPrestige() {
    const newCred = Math.floor(Math.log10(Math.max(1, G.totalEarned)));
    G.cred += newCred;
    G.prestigeCount++;

    // Pick a bonus
    const bonusIdx = (G.prestigeCount - 1) % PRESTIGE_BONUSES.length;
    const bonus = PRESTIGE_BONUSES[bonusIdx];

    // Apply prestige perks
    if (G.prestigeCount === 1) G.permanentMults.push(1.5);
    if (G.prestigeCount === 2) G.permanentMults.push(1.3);
    if (G.prestigeCount >= 5) G.clickPower *= 2;

    // Reset
    const keep = {
        cred: G.cred, prestigeCount: G.prestigeCount,
        achievements: G.achievements, detectiveBribes: G.detectiveBribes,
        fixerEvents: G.fixerEvents, declinedEnding: G.declinedEnding,
        permanentMults: G.permanentMults, clickPower: G.clickPower,
    };
    G = Object.assign(defaultState(), keep);
    G.globalMult = 1;
    save();

    triggerWorldChange("prestige");
    return bonus;
}

// ─── Triggers & Achievements ─────────────────────────────
function checkTriggers() {
    checkWingUnlocks();
    checkStoryEvents();
}

function checkAchievements() {
    for (const ach of ACHIEVEMENTS) {
        if (G.achievements.includes(ach.id)) continue;
        if (ach.check(G)) {
            G.achievements.push(ach.id);
            queueNotification("ACHIEVEMENT", ach.name + ": " + ach.desc, "achievement");
        }
    }
}

// ─── World Changes (Portals Bridge) ──────────────────────
function triggerWorldChange(key) {
    if (G.triggeredWorldChanges.includes(key)) return;
    G.triggeredWorldChanges.push(key);
    sendToPortals(key);
}

function sendToPortals(key) {
    try {
        if (typeof PortalsSdk === "undefined") return;
        // Each world change maps to a quest name in the Portals room
        PortalsSdk.sendMessageToUnity(JSON.stringify({
            TaskName: "world_" + key,
            TaskTargetState: "SetActiveToCompleted"
        }));
    } catch (e) { }
}

// ─── Notifications Queue ─────────────────────────────────
const _notifQueue = [];
function queueNotification(title, body, type = "info") {
    _notifQueue.push({ title, body, type, time: Date.now() });
}
function popNotification() {
    return _notifQueue.shift() || null;
}

// ─── Tick ────────────────────────────────────────────────
let lastTick = Date.now();
function tick() {
    const now = Date.now();
    const dt = (now - lastTick) / 1000; // seconds
    lastTick = now;

    // Passive income
    const cps = getTotalCps();
    const income = cps * dt;
    G.cash += income;
    G.totalEarned += income;

    // Heat
    if (G.heat < 100) G.heat = Math.min(100, G.heat + cps * 0.000001 * dt);
    tickHeat(dt);
    tickDetective(dt);
    tickRandomEvents();
    checkTriggers();
    checkAchievements();

    // Clean up expired mults
    G.activeMults = G.activeMults.filter(m => m.expires > now);

    if (Math.floor(now / 5000) !== Math.floor((now - dt * 1000) / 5000)) save();
}

// ─── Format Helpers ──────────────────────────────────────
function fmt(n) {
    if (!isFinite(n) || isNaN(n)) return "0";
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    let i = 0;
    while (n >= 1000 && i < suffixes.length - 1) { n /= 1000; i++; }
    return (i === 0 ? Math.floor(n) : n.toFixed(2)) + suffixes[i];
}

function fmtCps(n) { return fmt(n) + "/s"; }

// ─── Init ────────────────────────────────────────────────
function initEngine() {
    load();
    lastTick = Date.now();
    tickInterval = setInterval(tick, TICK_MS);
}
