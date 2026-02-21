// ═══════════════════════════════════════════════════════
// MADE MAN — GAME DATA
// Buildings, upgrades, events, story, achievements
// ═══════════════════════════════════════════════════════

const BUILDINGS = [
    {
        id: "corner", name: "Corner",
        desc: "You. A hoodie. A milk crate. The dream.",
        baseCost: 15, baseCps: 0.1,
        wing: null,
        flavour: [
            "It's your corner. Well, technically Carl's corner. Carl had an accident.",
            "You added a second crate. Progress.",
            "Three regulars now. You know their names. This is a mistake.",
            "Business is good. By which you mean: not jail.",
            "The corner has a corner. You have expanded geometrically.",
        ]
    },
    {
        id: "fence", name: "Fence",
        desc: "Stolen goods. 'Antiques.' Same thing, legally speaking.",
        baseCost: 100, baseCps: 0.5,
        wing: null,
        flavour: [
            "Gary doesn't ask where things come from. Gary is your favourite person.",
            "A TV, three laptops, and what appears to be a church organ.",
            "You are now the area's primary electronics supplier. Unofficially.",
            "The police checked Gary's shop. Found nothing. Gary is a professional.",
            "You opened a second location. It is also Gary.",
        ]
    },
    {
        id: "crew", name: "Crew",
        desc: "Kevin and associates. Mostly Kevin.",
        baseCost: 500, baseCps: 4,
        wing: null,
        flavour: [
            "Kevin is enthusiastic. Kevin is bad at this. Kevin is all you have.",
            "Two more Kevins. Different names. Same energy.",
            "Your crew has a group chat. You are not in it. You are scared to ask.",
            "They got matching jackets. You did not authorise the jackets.",
            "Kevin has been here since the beginning. Kevin knows too much.",
        ]
    },
    {
        id: "lab", name: "Lab",
        desc: "Product. The blue kind. Quality assured.",
        baseCost: 2000, baseCps: 20,
        wing: "cook",
        flavour: [
            "A bathtub, some tubing, and a dream. 68% pure. You're improving.",
            "Actual equipment now. The neighbours think you brew kombucha.",
            "94% pure. Your chemist asked for a raise. Your chemist got a raise.",
            "Distribution network established. The kombucha story is holding.",
            "You are now a significant regional supplier. The kombucha story is not holding.",
        ]
    },
    {
        id: "loanshark", name: "Loan Shark",
        desc: "Friendly neighbourhood finance. APR: creative.",
        baseCost: 8000, baseCps: 80,
        wing: "cook",
        flavour: [
            "You lent Dave $500. Dave is learning what 'interest' means.",
            "Dave paid. Dave now recommends you. Dave has complicated feelings about this.",
            "A portfolio of twelve Daves. The market remains strong.",
            "You hired a collector. He is very polite. That's what makes it effective.",
            "You are now a financial institution. Unregulated. Preferred.",
        ]
    },
    {
        id: "racket", name: "Protection Racket",
        desc: "Things happen to unprotected businesses. Terrible things.",
        baseCost: 25000, baseCps: 400,
        wing: "enforcer",
        flavour: [
            "The pizza place pays $200/month. The pizza is also now free. Win-win.",
            "Eight businesses. None of them have had any incidents. So far.",
            "The neighbourhood watch hired you. Technically.",
            "A competitor tried to move in. There was a conversation. He left.",
            "The mayor cut the ribbon on your street's 'Community Safety Initiative.'",
        ]
    },
    {
        id: "front", name: "Front Business",
        desc: "Laundromat. Restaurant. Spa. The money is very clean.",
        baseCost: 80000, baseCps: 1600,
        wing: "enforcer",
        flavour: [
            "The laundromat washes $40K/month. Also clothes.",
            "The restaurant has a Yelp page. Four stars. 'Authentic' atmosphere.",
            "Health inspector visited. Left with a gift basket and a smile.",
            "Three fronts now. Your accountant has two different sets of books. She prefers the fake ones.",
            "The spa has a celebrity client. She doesn't know. You prefer it that way.",
        ]
    },
    {
        id: "blackmarket", name: "Black Market",
        desc: "Import. Export. Mostly export. Don't read the manifests.",
        baseCost: 300000, baseCps: 8000,
        wing: "ghost",
        flavour: [
            "Container 7 contains electronics. Container 8 is labelled 'electronics.'",
            "Your shipping contact is named 'The Pelican.' You've never met The Pelican.",
            "Six routes. Four countries. One very confused customs dog.",
            "The Pelican sent a gift. You will never know what it was. You didn't open it.",
            "You are now a significant trade partner with three nations. None of them know.",
        ]
    },
    {
        id: "fixer", name: "Eduardo",
        desc: "Problems disappear. So do people. Eduardo prefers not to discuss specifics.",
        baseCost: 1000000, baseCps: 40000,
        wing: "ghost",
        flavour: [
            "Eduardo handled the situation. You did not ask how. This is your relationship.",
            "Eduardo has an assistant now. The assistant never speaks. This seems intentional.",
            "A rival's operation went quiet last Tuesday. Eduardo sent flowers.",
            "There is a room in Eduardo's office you have never seen inside. You will not ask.",
            "Eduardo's son joined the business. He is better than Eduardo. You try not to think about what happened to Eduardo.",
        ]
    },
    {
        id: "network", name: "Political Network",
        desc: "Judges. Senators. The chief. Everyone has a price. You have a spreadsheet.",
        baseCost: 5000000, baseCps: 200000,
        wing: "don",
        flavour: [
            "Councilman Torres sends Christmas cards now. You send considerably more.",
            "Three judges on retainer. Justice is not blind. She just has a very nice car.",
            "The police chief is at your daughter's birthday party. She seems nice.",
            "Two senators. One governor. You have a seating chart.",
            "The city budget passed with unusual speed. You had opinions about the city budget.",
        ]
    },
    {
        id: "cartel", name: "The Cartel",
        desc: "You are no longer local. You are international. You have a flag.",
        baseCost: 25000000, baseCps: 1200000,
        wing: "don",
        flavour: [
            "A handshake in a hotel bar. Three countries. You are now in the cartel.",
            "Territory dispute resolved. Diplomatically. Eduardo was in the room.",
            "Your operation is referenced in a federal report. You are referred to as 'Subject B.' Flattering.",
            "You met the other Subject Bs. It was a dinner. It was excellent pasta.",
            "You are Subject A now. The files don't say what happened to the previous Subject A.",
        ]
    },
    {
        id: "corporation", name: "The Corporation",
        desc: "Fully legitimate. Publicly traded. The board doesn't ask questions. You chose the board.",
        baseCost: 200000000, baseCps: 10000000,
        wing: null, // Secret unlock
        unlockCondition: "all_wings",
        flavour: [
            "Meridian Holdings LLC. Clean logo. Clean office. Unclean everything else.",
            "The IPO raised $2B. Your lawyers are very tired. They are very paid.",
            "A profile in Forbes. 'Self-made.' You appreciate the irony.",
            "The Corporation donated to the city's new police headquarters. You cut the ribbon.",
            "You are the largest employer in the city. This was not the goal. It was the result.",
        ]
    }
];

const UPGRADES = [
    // CORNER UPGRADES
    { id: "u_corner_1", name: "Better Hoodie", desc: "More pockets. More product.", building: "corner", costMult: 10, cpsBonus: 2, req: { building: "corner", level: 1 } },
    { id: "u_corner_2", name: "Corner Stool", desc: "Ergonomic crime.", building: "corner", costMult: 50, cpsBonus: 3, req: { building: "corner", level: 5 } },
    { id: "u_corner_3", name: "Second Corner", desc: "Mathematical crime expansion.", building: "corner", costMult: 200, cpsBonus: 5, req: { building: "corner", level: 10 } },
    { id: "u_corner_4", name: "Corner Network", desc: "Seven corners. A geometric empire.", building: "corner", costMult: 1000, cpsBonus: 10, req: { building: "corner", level: 25 } },
    // FENCE UPGRADES
    { id: "u_fence_1", name: "Bigger Truck", desc: "More product. Same Gary.", building: "fence", costMult: 10, cpsBonus: 2, req: { building: "fence", level: 1 } },
    { id: "u_fence_2", name: "Storage Unit", desc: "The unit is labelled 'Holiday Decorations'.", building: "fence", costMult: 50, cpsBonus: 3, req: { building: "fence", level: 5 } },
    { id: "u_fence_3", name: "Online Storefront", desc: "eBay. But worse. But better.", building: "fence", costMult: 200, cpsBonus: 5, req: { building: "fence", level: 10 } },
    { id: "u_fence_4", name: "International Gary", desc: "Gary has contacts. Deep, questionable contacts.", building: "fence", costMult: 1000, cpsBonus: 10, req: { building: "fence", level: 25 } },
    // CREW UPGRADES
    { id: "u_crew_1", name: "Kevin 2.0", desc: "Marginally more competent. Perhaps.", building: "crew", costMult: 10, cpsBonus: 2, req: { building: "crew", level: 1 } },
    { id: "u_crew_2", name: "Group Chat", desc: "You are still not in it.", building: "crew", costMult: 50, cpsBonus: 3, req: { building: "crew", level: 5 } },
    { id: "u_crew_3", name: "Matching Jackets", desc: "Intimidating. Cohesive. Inadvisable.", building: "crew", costMult: 200, cpsBonus: 5, req: { building: "crew", level: 10 } },
    { id: "u_crew_4", name: "Loyalty Program", desc: "Nobody talks. This is the program.", building: "crew", costMult: 1000, cpsBonus: 10, req: { building: "crew", level: 25 } },
    // LAB UPGRADES
    { id: "u_lab_1", name: "Better Tubing", desc: "94% pure. From 68%. Progress.", building: "lab", costMult: 10, cpsBonus: 2, req: { wing: "cook", building: "lab", level: 1 } },
    { id: "u_lab_2", name: "Real Equipment", desc: "The neighbours still believe the kombucha story.", building: "lab", costMult: 50, cpsBonus: 3, req: { wing: "cook", building: "lab", level: 5 } },
    { id: "u_lab_3", name: "Second Location", desc: "Two kombucha operations. Very artisanal.", building: "lab", costMult: 200, cpsBonus: 5, req: { wing: "cook", building: "lab", level: 10 } },
    { id: "u_lab_4", name: "Quality Assurance", desc: "Your chemist has opinions. Your chemist is right.", building: "lab", costMult: 1000, cpsBonus: 10, req: { wing: "cook", building: "lab", level: 25 } },
    // RACKET UPGRADES
    { id: "u_racket_1", name: "Bigger Crew", desc: "More presence. More persuasion.", building: "racket", costMult: 10, cpsBonus: 2, req: { wing: "enforcer", building: "racket", level: 1 } },
    { id: "u_racket_2", name: "Payment App", desc: "Venmo. But with consequences.", building: "racket", costMult: 50, cpsBonus: 3, req: { wing: "enforcer", building: "racket", level: 5 } },
    { id: "u_racket_3", name: "Premium Protection", desc: "Two tiers now. Nobody wants to find out about Tier 1.", building: "racket", costMult: 200, cpsBonus: 5, req: { wing: "enforcer", building: "racket", level: 10 } },
    { id: "u_racket_4", name: "Municipal Contract", desc: "They call it 'community safety.' You call it Thursday.", building: "racket", costMult: 1000, cpsBonus: 10, req: { wing: "enforcer", building: "racket", level: 25 } },
    // FRONT UPGRADES
    { id: "u_front_1", name: "Michelin Interest", desc: "The reviewer had a lovely time. No incidents.", building: "front", costMult: 10, cpsBonus: 2, req: { wing: "enforcer", building: "front", level: 1 } },
    { id: "u_front_2", name: "Chain Expansion", desc: "Four locations. The pasta is actually good now.", building: "front", costMult: 50, cpsBonus: 3, req: { wing: "enforcer", building: "front", level: 5 } },
    { id: "u_front_3", name: "Real Estate Arm", desc: "The buildings launder almost as well as the laundromat.", building: "front", costMult: 200, cpsBonus: 5, req: { wing: "enforcer", building: "front", level: 10 } },
    { id: "u_front_4", name: "Franchise", desc: "Someone else's Kevin is running Locations 7-12.", building: "front", costMult: 1000, cpsBonus: 10, req: { wing: "enforcer", building: "front", level: 25 } },
    // BLACK MARKET UPGRADES
    { id: "u_bm_1", name: "New Pelican", desc: "The Pelican has a contact. His name is The Crane.", building: "blackmarket", costMult: 10, cpsBonus: 2, req: { wing: "ghost", building: "blackmarket", level: 1 } },
    { id: "u_bm_2", name: "Encrypted Manifests", desc: "Even your lawyers can't read these. This is legal.", building: "blackmarket", costMult: 50, cpsBonus: 3, req: { wing: "ghost", building: "blackmarket", level: 5 } },
    { id: "u_bm_3", name: "Private Airstrip", desc: "Small. Discreet. The runway is very well maintained.", building: "blackmarket", costMult: 200, cpsBonus: 5, req: { wing: "ghost", building: "blackmarket", level: 10 } },
    { id: "u_bm_4", name: "Maritime Division", desc: "The Pelican now has boats. Many boats.", building: "blackmarket", costMult: 1000, cpsBonus: 10, req: { wing: "ghost", building: "blackmarket", level: 25 } },
    // FIXER UPGRADES
    { id: "u_fixer_1", name: "Upgrade Equipment", desc: "Eduardo requested this. You approved it immediately.", building: "fixer", costMult: 10, cpsBonus: 2, req: { wing: "ghost", building: "fixer", level: 1 } },
    { id: "u_fixer_2", name: "Assistant", desc: "The assistant never speaks. This is a feature.", building: "fixer", costMult: 50, cpsBonus: 3, req: { wing: "ghost", building: "fixer", level: 5 } },
    { id: "u_fixer_3", name: "New Van", desc: "White. No windows. Regulation.", building: "fixer", costMult: 200, cpsBonus: 5, req: { wing: "ghost", building: "fixer", level: 10 } },
    { id: "u_fixer_4", name: "International Division", desc: "Eduardo now travels. He always travels alone.", building: "fixer", costMult: 1000, cpsBonus: 10, req: { wing: "ghost", building: "fixer", level: 25 } },
    // NETWORK UPGRADES
    { id: "u_net_1", name: "Federal Level", desc: "Two senators. They do not know about each other.", building: "network", costMult: 10, cpsBonus: 2, req: { wing: "don", building: "network", level: 1 } },
    { id: "u_net_2", name: "Judicial Package", desc: "The appeals process has become very reliable.", building: "network", costMult: 50, cpsBonus: 3, req: { wing: "don", building: "network", level: 5 } },
    { id: "u_net_3", name: "Governor", desc: "His yacht appeared last week. He is grateful.", building: "network", costMult: 200, cpsBonus: 5, req: { wing: "don", building: "network", level: 10 } },
    { id: "u_net_4", name: "International Relations", desc: "Four ambassadors. You do not have a title. You do not need one.", building: "network", costMult: 1000, cpsBonus: 10, req: { wing: "don", building: "network", level: 25 } },
    // CARTEL UPGRADES
    { id: "u_cartel_1", name: "Territory Expansion", desc: "Three new corridors. Diplomatically negotiated. Mostly.", building: "cartel", costMult: 10, cpsBonus: 2, req: { wing: "don", building: "cartel", level: 1 } },
    { id: "u_cartel_2", name: "Summit Protocol", desc: "The annual summit has catering now. Eduardo handles security.", building: "cartel", costMult: 50, cpsBonus: 3, req: { wing: "don", building: "cartel", level: 5 } },
    { id: "u_cartel_3", name: "Trade Treaty", desc: "Three nations signed it. None of them read it.", building: "cartel", costMult: 200, cpsBonus: 5, req: { wing: "don", building: "cartel", level: 10 } },
    { id: "u_cartel_4", name: "You Are Subject A", desc: "The previous Subject A retired. Eduardo was at the retirement.", building: "cartel", costMult: 1000, cpsBonus: 10, req: { wing: "don", building: "cartel", level: 25 } },
    // GLOBAL SYNERGY UPGRADES
    { id: "u_syn_1", name: "Economies of Scale", desc: "You are too big to be stopped. This is now a legal concept.", building: null, costMult: null, cost: 500000, globalMult: 1.5, req: { totalBuildings: 50 } },
    { id: "u_syn_2", name: "Vertical Integration", desc: "You control production, distribution, and, technically, justice.", building: null, cost: 5000000, globalMult: 2, req: { totalBuildings: 150 } },
    { id: "u_syn_3", name: "The Invisible Hand", desc: "The economy does what you want. You didn't mean for this.", building: null, cost: 100000000, globalMult: 5, req: { totalBuildings: 400 } },
    { id: "u_syn_4", name: "Post-Scarcity Crime", desc: "There is no one left to steal from. You must generate your own victims.", building: null, cost: 10000000000, globalMult: 20, req: { prestige: 1 } },
];

const STORY_EVENTS = [
    {
        id: "ev_first_offer", cash: 500, rep: 0,
        title: "The Offer",
        text: "Kevin found a buyer for the bikes. The buyer wants to meet you in person.",
        choices: [
            { label: "Meet the buyer", effect: { unlockBuilding: "fence", cash: 200 }, outcome: "His name is Gary. Gary doesn't ask questions. You think you're going to get along." },
            { label: "Send Kevin alone", effect: { cash: 100, repDelta: -10 }, outcome: "Kevin got robbed. Kevin is fine. He seems almost proud." }
        ]
    },
    {
        id: "ev_first_problem", cash: 50000, rep: 0,
        title: "The First Problem",
        text: "Someone saw something at Gary's warehouse. They're talking to people.",
        choices: [
            { label: "Pay them off — $30K", cost: 30000, effect: { repDelta: 20, heatDelta: -15 }, outcome: "They took the money. They seem satisfied. You feel slightly less so." },
            { label: "Ask Eduardo to handle it", effect: { repDelta: -20, heatDelta: -30, unlockBuilding: "fixer" }, outcome: "Eduardo handled it. You did not ask how. Eduardo seemed pleased to help." }
        ]
    },
    {
        id: "ev_kevin_dead", cash: 25000, rep: 50, buildingReq: { crew: 5 },
        title: "Kevin",
        text: "Kevin was crossing the street while counting your money. The driver stopped. The driver was also counting money. Neither of them were watching the road.",
        choices: [
            { label: "Acknowledge this", effect: {}, outcome: "Kevin is gone. The chalk outline is outside the laundromat. Gary offered condolences. He seemed to mean it, which was unexpected." }
        ],
        worldChange: "kevin_dies"
    },
    {
        id: "ev_daughter", cash: 10000000, rep: 0,
        title: "The Question",
        text: "Your daughter is doing a school project. 'What does your parent do for work?' She's asked you directly. She has a very nice pencil case. You bought it. You remember buying it.",
        choices: [
            { label: "'Import/export, sweetheart'", effect: { repDelta: -5 }, outcome: "She wrote it down. She'll ask again." },
            { label: "Tell her the truth", disabled: true, disabledReason: "(Stage 6 only)", effect: {}, outcome: "" }
        ]
    },
    {
        id: "ev_mirror", cash: 1000000000, rep: 0,
        title: "The Mirror",
        text: "",
        isHtml: true,
        html: "<div class='mirror-event'><p>MORNING HERALD — Local businessman cleared in federal probe.</p><p>Three bodies recovered from industrial site — unidentified.</p><p>City council approves budget amendment 11-0.</p><p>Missing persons report: 847 open cases this year.</p><p>Area restaurant rated Best Italian for fourth consecutive year.</p></div>",
        choices: [
            { label: "Close", effect: {} }
        ],
        autoClose: 8000
    },
    {
        id: "ev_daughter_truth", cash: 100000000000, rep: 500, wingReq: "don",
        title: "She Asked Again",
        text: "She's 16 now. She found something in your office. A number. She knows what the number means. She's sitting across from you. She doesn't look afraid. That's the worst part.",
        choices: [
            { label: "Tell her everything", effect: { repDelta: 100, heatDelta: 20 }, outcome: "She sat with it for a long time. Then: 'Are you going to stop?' You didn't answer. She already knew." },
            { label: "Send her away to school", effect: { cash: -50000000, repDelta: -50 }, outcome: "She went. She sends cards at Christmas. Signed. Not 'Love.' Just her name." }
        ]
    },
    {
        id: "ev_prestige_unlock", cash: 1000000000000, rep: 0,
        title: "The Fall",
        text: "You have $1 trillion. The government has noticed. You have three options. Only one is survivable. All of them cost everything.",
        choices: [
            { label: "Do the time. Come back harder.", effect: { triggerPrestige: true }, outcome: "" }
        ]
    }
];

const RANDOM_EVENTS = [
    { id: "re_lucky", name: "🎰 Lucky Score", desc: "Streets are paying tonight.", effect: { cashMult: 3, duration: 30 }, weight: 20 },
    { id: "re_witness", name: "👻 Witness Issue", desc: "Gone. Let's not dwell.", effect: { heatDelta: -30 }, weight: 15 },
    { id: "re_rival", name: "⚡ Rival Slips Up", desc: "Take their income. 60 seconds.", effect: { cpsMult: 2, duration: 60 }, weight: 12 },
    { id: "re_blackout", name: "📰 News Blackout", desc: "Heat gain paused. 90 seconds.", effect: { heatPause: 90 }, weight: 18 },
    { id: "re_cop", name: "🤝 Dirty Cop", desc: "€50K gets you a friend on the force.", cost: 50000, effect: { heatMult: 0.5, permanent: true }, weight: 10 },
    { id: "re_shipment", name: "📦 Hot Shipment", desc: "Income ×5 for 45 seconds.", effect: { cpsMult: 5, duration: 45 }, weight: 8 },
    { id: "re_the_call", name: "📞 The Call", desc: "Eduardo has work. Take it or pass.", choices: ["Take it", "Pass it"], effect: { accept: { cash: 500000 }, decline: { repDelta: 10 } }, weight: 10 },
    { id: "re_problem", name: "💣 The Problem", desc: "15 seconds. Choose now.", timer: 15, effect: { succeed: { heatDelta: -20 }, fail: { heatDelta: 40, cashPct: -0.05 } }, weight: 7 },
];

const ACHIEVEMENTS = [
    { id: "ach_first_click", name: "The Beginning", desc: "Make your first dollar.", check: g => g.totalEarned >= 1 },
    { id: "ach_100", name: "Three Digits", desc: "$100. You're basically a corporation.", check: g => g.totalEarned >= 100 },
    { id: "ach_1k", name: "Four Digits", desc: "You have opinions about hundreds now.", check: g => g.totalEarned >= 1000 },
    { id: "ach_first_hire", name: "Employer of the Year", desc: "Hire your first building.", check: g => g.totalBuildings >= 1 },
    { id: "ach_kevin", name: "Poor Kevin", desc: "Unlock the Crew.", check: g => g.buildings.crew > 0 },
    { id: "ach_first_heat", name: "Someone Noticed", desc: "Reach 30 heat.", check: g => g.heat >= 30 },
    { id: "ach_gary", name: "Gary, My Friend", desc: "Unlock the Fence.", check: g => g.buildings.fence > 0 },
    { id: "ach_1m", name: "Your First Million", desc: "$1,000,000. Not bad for someone who started on a milk crate.", check: g => g.cash >= 1000000 },
    { id: "ach_cook_wing", name: "Blue Dream", desc: "Unlock The Cook wing.", check: g => g.wings.cook },
    { id: "ach_enforcer_wing", name: "Persuasion Expert", desc: "Unlock The Enforcer wing.", check: g => g.wings.enforcer },
    { id: "ach_ghost_wing", name: "You Were Never Here", desc: "Unlock The Ghost wing.", check: g => g.wings.ghost },
    { id: "ach_don_wing", name: "The Don", desc: "Unlock The Don wing.", check: g => g.wings.don },
    { id: "ach_all_wings", name: "The Empire", desc: "All four wings operational. God help us.", check: g => g.wings.cook && g.wings.enforcer && g.wings.ghost && g.wings.don },
    { id: "ach_corporation", name: "Going Legit", desc: "Unlock The Corporation. Laughs from the back.", check: g => g.buildings.corporation > 0 },
    { id: "ach_1b", name: "Billion Dollar Criminal", desc: "Forbes would be proud. Forbes must never know.", check: g => g.cash >= 1000000000 },
    { id: "ach_prestige", name: "The Fall, Part One", desc: "Do your first Prison Reset.", check: g => g.prestigeCount >= 1 },
    { id: "ach_prestige_5", name: "Recidivism", desc: "Five Prison Resets.", check: g => g.prestigeCount >= 5 },
    { id: "ach_prestige_10", name: "Institutionalised", desc: "Ten Prison Resets. You know the cafeteria staff by name.", check: g => g.prestigeCount >= 10 },
    { id: "ach_1t", name: "The Number That Stops Making Sense", desc: "$1 trillion. At this point it's just a number.", check: g => g.totalEarned >= 1000000000000 },
    { id: "ach_bribe_10", name: "The White Whale", desc: "Bribe the same detective 10 times. He knows. You know he knows. He knows you know he knows.", check: g => g.detectiveBribes >= 10, secret: true },
    { id: "ach_hot_heat", name: "Situation Critical", desc: "Reach maximum heat.", check: g => g.heat >= 100 },
    { id: "ach_eduardo_max", name: "The Room", desc: "Max out Eduardo (Fixer level 25).", check: g => g.buildings.fixer >= 25 },
    { id: "ach_all_buildings", name: "Full Portfolio", desc: "Own at least one of every building.", check: g => Object.values(g.buildings).every(v => v > 0) },
    { id: "ach_widow", name: "Widower", desc: "???", check: g => g.fixerEvents >= 1000, secret: true },
    { id: "ach_abdication", name: "There Is No Ending", desc: "???", check: g => g.declinedEnding >= 3, secret: true },
];

const WING_THRESHOLDS = {
    cook: { cash: 25000, name: "🧪 The Cook", desc: "The lab is open. Product is moving. The neighbours are asking about the smell." },
    enforcer: { cash: 500000, name: "🔨 The Enforcer", desc: "Protection, persuasion, and the occasional problem that requires Eduardo's friends." },
    ghost: { cash: 10000000, name: "🎭 The Ghost", desc: "You move product, people, and information. Mostly you are not there." },
    don: { cash: 100000000, name: "🤝 The Don", desc: "You own the city. You just haven't told it yet." },
};

const PRESTIGE_BONUSES = [
    "Income ×1.5 permanently",
    "Start with Crew unlocked",
    "Heat decays 20% faster",
    "Random events are 30% more favourable",
    "Detective progress 25% slower",
    "All wing unlocks cost 50% less",
    "Upgrade costs reduced 20% permanently",
    "Start with $10,000",
    "Golden Crime events fire 40% more often",
    "All buildings start with +2 levels",
];
