// Game State and Configuration
type MiningMode = 'pool' | 'solo';

interface GameState {
    hashes: number; // current hashes accumulated towards a block
    hashesPerBlock: number;
    btcBalance: number;
    dollarBalance: number;
    baseBtcPrice: number; // Base price that trends upwards
    btcPriceInDollars: number; // baseBtcPrice + fluctuation
    previousBtcPriceInDollars: number; // For price change animation
    baseHashesPerClick: number;
    
    soloBlockMineSuccessChance: number; // 0.0 to 1.0 for solo mining
    poolBtcReward: number; // BTC reward for pool mining
    soloBtcReward: number; // BTC reward for solo mining

    autoBuyEnabled: boolean;
    showPopups: boolean; // Toggle for animated pop-up messages
    
    currentAutoHashesPerSecond: number;
    currentTotalHashingPowerBonusPercent: number;

    // Time and Speed
    startDate: Date;
    currentDate: Date;
    gameSpeedMultiplier: number; // e.g., 1, 10, 100
    miningMode: MiningMode;

    // Floating BTC Boost
    isBoostActive: boolean;
    boostMultiplier: number;
    boostEndTime: number; // Timestamp
    nextFloatingBtcSpawnTime: number; // Timestamp
}

interface Building {
    id: string;
    name: string;
    icon: string; // Emoji icon
    level: number;
    baseCost: number;
    costMultiplier: number;
    type: 'auto_hasher' | 'power_booster';
    baseEffectValue: number;
    effectPerLevel: number;
    description: (level: number, currentEffect: number) => string; // Cost removed from params
    maxLevel?: number;
}

const initialGameState: GameState = {
    hashes: 0,
    hashesPerBlock: 1000,
    btcBalance: 0,
    dollarBalance: 100,
    baseBtcPrice: 0.10, // Starting base price Jan 1, 2010
    btcPriceInDollars: 0.10,
    previousBtcPriceInDollars: 0.10,
    baseHashesPerClick: 1,
    
    soloBlockMineSuccessChance: 0.10, // 10% for solo
    poolBtcReward: 0.03, // Smaller, guaranteed reward
    soloBtcReward: 0.1,  // Larger, chance-based reward

    autoBuyEnabled: false,
    showPopups: true, // Pop-up notifications are enabled by default
    currentAutoHashesPerSecond: 0,
    currentTotalHashingPowerBonusPercent: 0,

    startDate: new Date(2010, 0, 1), // Jan 1, 2010 (month is 0-indexed)
    currentDate: new Date(2010, 0, 1),
    gameSpeedMultiplier: 1,
    miningMode: 'solo',

    isBoostActive: false,
    boostMultiplier: 1, // No boost initially
    boostEndTime: 0,
    nextFloatingBtcSpawnTime: Date.now() + (30 + Math.random() * 30) * 1000, // Spawn in 30-60s
};

let gameState: GameState = { ...initialGameState };

const buildingsData: Building[] = [
    // Auto-Hashers (Direct H/s Generation)
    {
        id: 'mining_rig', name: 'Mining Rig', icon: '⛏️', level: 0, baseCost: 50, costMultiplier: 1.2, type: 'auto_hasher',
        baseEffectValue: 0, effectPerLevel: 0.5,
        description: (level, effect) => `Generates ${effect.toFixed(1)} H/s.`,
    },
    {
        id: 'cpu_cluster', name: 'CPU Cluster', icon: '💻', level: 0, baseCost: 300, costMultiplier: 1.25, type: 'auto_hasher',
        baseEffectValue: 0, effectPerLevel: 2.0,
        description: (level, effect) => `Generates ${effect.toFixed(1)} H/s.`,
    },
    {
        id: 'advanced_gpu_rig', name: 'Adv. GPU Rig', icon: '💡', level: 0, baseCost: 1500, costMultiplier: 1.3, type: 'auto_hasher',
        baseEffectValue: 0, effectPerLevel: 10.0,
        description: (level, effect) => `Generates ${effect.toFixed(1)} H/s.`,
    },
    {
        id: 'asic_miner', name: 'ASIC Miner', icon: '🧱', level: 0, baseCost: 2800, costMultiplier: 1.38, type: 'auto_hasher',
        baseEffectValue: 0, effectPerLevel: 18.0, 
        description: (level, effect) => `Generates ${effect.toFixed(1)} H/s.`,
    },
    {
        id: 'fpga_array', name: 'FPGA Array', icon: '💠', level: 0, baseCost: 6000, costMultiplier: 1.4, type: 'auto_hasher',
        baseEffectValue: 0, effectPerLevel: 40.0,
        description: (level, effect) => `Generates ${effect.toFixed(1)} H/s.`,
    },

    // Power Boosters (Percentage based on total H/s from Auto-Hashers)
    {
        id: 'gpu_farm', name: 'GPU Farm', icon: '🎮', level: 0, baseCost: 250, costMultiplier: 1.3, type: 'power_booster',
        baseEffectValue: 0, effectPerLevel: 5,
        description: (level, effect) => `Boosts total H/s by ${effect.toFixed(0)}%.`,
    },
    {
        id: 'network_optimization', name: 'Network Opt.', icon: '🌐', level: 0, baseCost: 750, costMultiplier: 1.22, type: 'power_booster',
        baseEffectValue: 0, effectPerLevel: 4, 
        description: (level, effect) => `Boosts total H/s by ${effect.toFixed(0)}%.`,
    },
    {
        id: 'cooling_system', name: 'Cooling System', icon: '❄️', level: 0, baseCost: 2000, costMultiplier: 1.25, type: 'power_booster',
        baseEffectValue: 0, effectPerLevel: 7,
        description: (level, effect) => `Boosts total H/s by ${effect.toFixed(0)}%.`,
    },
    {
        id: 'algorithm_research', name: 'Algo. Research', icon: '🔬', level: 0, baseCost: 3000, costMultiplier: 1.33, type: 'power_booster',
        baseEffectValue: 0, effectPerLevel: 8,
        description: (level, effect) => `Boosts total H/s by ${effect.toFixed(0)}%.`,
    },
    {
        id: 'data_center', name: 'Data Center', icon: '🏢', level: 0, baseCost: 5500, costMultiplier: 1.4, type: 'power_booster',
        baseEffectValue: 0, effectPerLevel: 15,
        description: (level, effect) => `Boosts total H/s by ${effect.toFixed(0)}%.`,
    },
     {
        id: 'energy_plant', name: 'Energy Plant', icon: '⚡', level: 0, baseCost: 10000, costMultiplier: 1.5, type: 'power_booster',
        baseEffectValue: 0, effectPerLevel: 20,
        description: (level, effect) => `Boosts total H/s by ${effect.toFixed(0)}%.`,
    },
    {
        id: 'satellite_uplink', name: 'Satellite Uplink', icon: '📡', level: 0, baseCost: 15000, costMultiplier: 1.45, type: 'power_booster',
        baseEffectValue: 0, effectPerLevel: 25,
        description: (level, effect) => `Boosts total H/s by ${effect.toFixed(0)}%.`,
    },
    {
        id: 'quantum_processor', name: 'Quantum Proc.', icon: '✨', level: 0, baseCost: 50000, costMultiplier: 1.6, type: 'power_booster',
        baseEffectValue: 0, effectPerLevel: 50,
        description: (level, effect) => `Boosts total H/s by ${effect.toFixed(0)}%.`,
    },
];


// DOM Elements
const currentDateEl = document.getElementById('current-date')!;
const btcBalanceEl = document.getElementById('btc-balance')!;
const dollarBalanceEl = document.getElementById('dollar-balance')!;
const btcPriceEl = document.getElementById('btc-price')!; // Fluctuating price
const baseBtcPriceEl = document.getElementById('base-btc-price')!; // Base price
const marketBtcPriceEl = document.getElementById('market-btc-price')!;
const currentHashesEl = document.getElementById('current-hashes')!;
const totalHashRateEl = document.getElementById('total-hash-rate')!;
const boostIndicatorEl = document.getElementById('boost-indicator')!;
const boostTimerEl = document.getElementById('boost-timer')!;
const clickHashRateEl = document.getElementById('click-hash-rate')!;
const autoHashRateEl = document.getElementById('auto-hash-rate')!;
const clickMineButton = document.getElementById('click-mine-button')!;
const hashesProgressBar = document.getElementById('hashes-progress-bar')!;
const gameMessagesEl = document.getElementById('game-messages')!;
const sellBtcAmountInput = document.getElementById('sell-btc-amount-input') as HTMLInputElement;
const sellBtcButton = document.getElementById('sell-btc-button')!;
const sellAllBtcButton = document.getElementById('sell-all-btc-button')!;
const buildingsContainer = document.getElementById('buildings-container')!;
const toggleAutoBuyButton = document.getElementById('toggle-auto-buy-button')!;
const togglePopupsButton = document.getElementById('toggle-popups-button')!;
const miningModeRadios = document.querySelectorAll('input[name="miningMode"]');
const gameSpeedSelector = document.getElementById('game-speed-selector') as HTMLSelectElement;

const floatingBtcContainer = document.getElementById('floating-btc-container')!;
const clickParticleContainer = document.getElementById('click-particle-container')!;
const popupMessageArea = document.getElementById('popup-message-area')!;


// Helper Functions
function formatNumber(num: number, precision: number = 2): string {
    if (num >= 1e12) return (num / 1e12).toFixed(precision) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(precision) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(precision) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(precision) + 'K';
    return num.toFixed(precision);
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function highlightElement(element: HTMLElement, highlightClass: string, duration: number = 700) {
    element.classList.add(highlightClass);
    setTimeout(() => {
        element.classList.remove(highlightClass);
    }, duration);
}

function showPopupMessage(text: string, type: 'info' | 'success' | 'error' = 'info', anchorElement?: HTMLElement, duration: number = 2000) {
    if (!gameState.showPopups) return; // Do not show popups if disabled

    const popup = document.createElement('div');
    popup.className = `popup-message ${type}`;
    popup.textContent = text;

    if (anchorElement) {
        popup.classList.add('on-card'); // Special styling for on-card popups
        anchorElement.appendChild(popup);
    } else {
        popupMessageArea.appendChild(popup);
    }
    
    setTimeout(() => {
        popup.remove();
    }, duration);
}

// Building Logic
function calculateBuildingCost(building: Building): number {
    return Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.level));
}

function calculateBuildingEffect(building: Building): number {
    return building.baseEffectValue + building.level * building.effectPerLevel;
}

function recalculateGlobalEffects() {
    let autoHashes = 0;
    let powerBonus = 0;
    buildingsData.forEach(b => {
        const effect = calculateBuildingEffect(b);
        if (b.type === 'auto_hasher') {
            autoHashes += effect;
        } else if (b.type === 'power_booster') {
            powerBonus += effect;
        }
    });
    gameState.currentAutoHashesPerSecond = autoHashes;
    gameState.currentTotalHashingPowerBonusPercent = powerBonus;
}

function getEffectiveHashesPerClick(): number {
    const base = gameState.baseHashesPerClick * (1 + gameState.currentTotalHashingPowerBonusPercent / 100);
    return base * (gameState.isBoostActive ? gameState.boostMultiplier : 1);
}

function getEffectiveAutoHashesPerSecond(): number {
    const base = gameState.currentAutoHashesPerSecond * (1 + gameState.currentTotalHashingPowerBonusPercent / 100);
    return base * (gameState.isBoostActive ? gameState.boostMultiplier : 1);
}

// Game Messages
type MessageType = 'info' | 'success' | 'error';
function addMessage(message: string, type: MessageType = 'info') {
    const p = document.createElement('p');
    p.textContent = `[${formatDate(gameState.currentDate)}] ${message}`;
    p.classList.add(type); // For potential future styling of log messages
    gameMessagesEl.prepend(p);
    // Keep only the last 2 messages
    while (gameMessagesEl.children.length > 2) {
        gameMessagesEl.removeChild(gameMessagesEl.lastChild!);
    }
}

// Display Updates
function updateDisplay() {
    currentDateEl.textContent = formatDate(gameState.currentDate);
    btcBalanceEl.textContent = `${gameState.btcBalance.toFixed(4)} BTC`;
    dollarBalanceEl.textContent = `$${formatNumber(gameState.dollarBalance, 0)}`;
    
    baseBtcPriceEl.textContent = `$${formatNumber(gameState.baseBtcPrice, 2)} / BTC`;
    btcPriceEl.textContent = `$${formatNumber(gameState.btcPriceInDollars, 2)} / BTC`;
    marketBtcPriceEl.textContent = `$${formatNumber(gameState.btcPriceInDollars, 2)} / BTC`;

    currentHashesEl.textContent = `${formatNumber(gameState.hashes,0)} / ${formatNumber(gameState.hashesPerBlock,0)} H`;
    
    const effectiveClick = getEffectiveHashesPerClick();
    const effectiveAuto = getEffectiveAutoHashesPerSecond(); // This already includes boost
    clickHashRateEl.textContent = `${formatNumber(effectiveClick, 1)} H/click`;
    
    const boostableBaseAutoHashes = gameState.currentAutoHashesPerSecond * (1 + gameState.currentTotalHashingPowerBonusPercent / 100);
    autoHashRateEl.textContent = `${formatNumber(boostableBaseAutoHashes, 1)} H/s`;
    
    const effectiveAutoScaledByGameSpeed = effectiveAuto * gameState.gameSpeedMultiplier;
    totalHashRateEl.textContent = `${formatNumber(effectiveAutoScaledByGameSpeed, 1)} H/s`;

    if(gameState.isBoostActive) {
        boostIndicatorEl.textContent = "(BOOSTED!)";
        const timeLeft = Math.max(0, Math.ceil((gameState.boostEndTime - Date.now()) / 1000));
        boostTimerEl.textContent = ` ${timeLeft}s`;
        highlightElement(totalHashRateEl.parentElement!, 'highlight-gold', 200); 
    } else {
        boostIndicatorEl.textContent = "";
        boostTimerEl.textContent = "";
    }

    const progressPercent = Math.min((gameState.hashes / gameState.hashesPerBlock) * 100, 100);
    hashesProgressBar.style.width = `${progressPercent}%`;
    hashesProgressBar.textContent = `${progressPercent.toFixed(1)}%`;

    miningModeRadios.forEach(radio => {
        const r = radio as HTMLInputElement;
        if (r.value === gameState.miningMode) {
            r.checked = true;
        }
    });
    gameSpeedSelector.value = gameState.gameSpeedMultiplier.toString();
}

function renderBuildings() {
    buildingsContainer.innerHTML = '';
    buildingsData.forEach(building => {
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building';
        buildingDiv.id = `building-card-${building.id}`;
        buildingDiv.setAttribute('aria-labelledby', `building-title-${building.id}`);
        buildingDiv.setAttribute('aria-describedby', `building-desc-${building.id} building-cost-${building.id}`);

        const title = document.createElement('h3');
        title.id = `building-title-${building.id}`;
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'building-icon';
        iconSpan.textContent = building.icon;
        title.appendChild(iconSpan);
        
        title.appendChild(document.createTextNode(`${building.name} (Lvl ${building.level})`));
        
        const currentEffect = calculateBuildingEffect(building);
        const cost = calculateBuildingCost(building);

        const descriptionP = document.createElement('p');
        descriptionP.id = `building-desc-${building.id}`;
        descriptionP.textContent = building.description(building.level, currentEffect); 

        const costP = document.createElement('p');
        costP.id = `building-cost-${building.id}`;
        costP.className = 'cost';
        costP.textContent = `${building.level === 0 ? 'Purchase' : 'Upgrade'} Cost: $${formatNumber(cost, 0)}`;

        const upgradeButton = document.createElement('button');
        upgradeButton.textContent = building.level === 0 ? 'Purchase' : 'Upgrade';
        upgradeButton.onclick = () => buyBuilding(building.id);
        upgradeButton.disabled = gameState.dollarBalance < cost;
        if (building.maxLevel && building.level >= building.maxLevel) {
            upgradeButton.textContent = 'Max Level';
            upgradeButton.disabled = true;
        }

        buildingDiv.appendChild(title);
        buildingDiv.appendChild(descriptionP);
        buildingDiv.appendChild(costP);
        buildingDiv.appendChild(upgradeButton);
        buildingsContainer.appendChild(buildingDiv);
    });
}

// Animation: Click Particles
function createClickParticle() {
    const particle = document.createElement('div');
    particle.classList.add('click-particle');
    particle.textContent = '#'; 

    const rect = clickMineButton.getBoundingClientRect();
    
    particle.style.left = `${rect.width / 2 - 5}px`; 
    particle.style.top = `${rect.height / 2 - 10}px`; 

    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 30;
    const translateX = Math.cos(angle) * distance;
    const translateY = Math.sin(angle) * distance;

    particle.style.setProperty('--tx', `${translateX}px`);
    particle.style.setProperty('--ty', `${translateY}px`);

    clickParticleContainer.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 600); 
}

// Core Game Actions
function handleManualHashGeneration() {
    const hashesGenerated = getEffectiveHashesPerClick();
    gameState.hashes += hashesGenerated;
    
    clickMineButton.classList.add('clicked');
    setTimeout(() => clickMineButton.classList.remove('clicked'), 150);

    if(gameState.showPopups) { 
        for (let i = 0; i < 5; i++) { 
            createClickParticle();
        }
    }
    
    checkMineBlockCondition();
    updateDisplay();
}

interface SingleBlockMineResult {
    btcRewarded: number;
    wasSuccess: boolean;
    messageText: string | null; 
    popupText: string | null; 
    messageType: MessageType;
}

function attemptSingleBlockMine(): SingleBlockMineResult {
    let btcRewardForThisBlock = 0;
    let successThisBlock = false;
    let messageText: string | null = null;
    let popupText: string | null = null;
    let messageType: MessageType = 'info';

    if (gameState.miningMode === 'pool') {
        btcRewardForThisBlock = gameState.poolBtcReward;
        messageText = `POOL MINE! Successfully mined ${btcRewardForThisBlock.toFixed(4)} BTC.`;
        popupText = `+${btcRewardForThisBlock.toFixed(4)} BTC!`;
        messageType = 'success';
        successThisBlock = true;
    } else { // Solo mining
        if (Math.random() < gameState.soloBlockMineSuccessChance) {
            btcRewardForThisBlock = gameState.soloBtcReward;
            messageText = `SOLO MINE SUCCESS! Mined ${btcRewardForThisBlock.toFixed(4)} BTC!`;
            popupText = `+${btcRewardForThisBlock.toFixed(4)} BTC!`;
            messageType = 'success';
            successThisBlock = true;
        } else {
            messageText = 'SOLO MINE FAILED. Better luck next time!';
            popupText = 'Mining Failed!';
            messageType = 'error';
        }
    }
    return { btcRewarded: btcRewardForThisBlock, wasSuccess: successThisBlock, messageText, popupText, messageType };
}


function checkMineBlockCondition() {
    let totalBtcRewardedThisTick = 0;
    let blocksSuccessfullyMinedThisTick = 0;
    let attemptedBlocksThisTick = 0;
    let lastSuccessfulPopupText: string | null = null;
    let lastSuccessfulPopupType: MessageType = 'info';
    let firstFailedPopupText: string | null = null;


    while (gameState.hashes >= gameState.hashesPerBlock) {
        gameState.hashes -= gameState.hashesPerBlock;
        attemptedBlocksThisTick++;
        
        const result = attemptSingleBlockMine();

        if (result.btcRewarded > 0) {
            totalBtcRewardedThisTick += result.btcRewarded;
            blocksSuccessfullyMinedThisTick++;
            lastSuccessfulPopupText = result.popupText; 
            lastSuccessfulPopupType = result.messageType;
        } else if (attemptedBlocksThisTick === 1 && !result.wasSuccess){ 
            firstFailedPopupText = result.popupText;
        }
    }

    if (totalBtcRewardedThisTick > 0) {
        const oldBtcBalance = gameState.btcBalance;
        gameState.btcBalance += totalBtcRewardedThisTick;
        if (gameState.btcBalance > oldBtcBalance) {
            highlightElement(btcBalanceEl, 'highlight-green');
        }
    }
    
    if (gameState.hashes < 0) gameState.hashes = 0;

    if (attemptedBlocksThisTick > 0) {
        if (attemptedBlocksThisTick > 3) { 
            if (blocksSuccessfullyMinedThisTick > 0) {
                showPopupMessage(`Mined ${blocksSuccessfullyMinedThisTick} blocks! +${totalBtcRewardedThisTick.toFixed(4)} BTC`, 'success');
                addMessage(`Mined ${blocksSuccessfullyMinedThisTick} blocks out of ${attemptedBlocksThisTick} attempts. Total +${totalBtcRewardedThisTick.toFixed(4)} BTC.`, 'success');
            } else {
                showPopupMessage(`${attemptedBlocksThisTick} attempts, 0 success`, 'error');
                addMessage(`${attemptedBlocksThisTick} mining attempts, 0 successes.`, 'error');
            }
        } else { 
            if (lastSuccessfulPopupText) {
                showPopupMessage(lastSuccessfulPopupText, lastSuccessfulPopupType);
            } else if (firstFailedPopupText) { 
                showPopupMessage(firstFailedPopupText, 'error');
            }
            if (blocksSuccessfullyMinedThisTick > 0) {
                 addMessage(`SUCCESS! +${totalBtcRewardedThisTick.toFixed(4)} BTC from ${blocksSuccessfullyMinedThisTick} block(s).`, 'success');
            } else if(attemptedBlocksThisTick > 0) {
                 addMessage(`${attemptedBlocksThisTick} mining attempt(s) failed.`, 'error');
            }
        }
    }
}


function buyBuilding(buildingId: string) {
    const building = buildingsData.find(b => b.id === buildingId);
    if (!building) return;

    const buildingCardEl = document.getElementById(`building-card-${building.id}`);

    if (building.maxLevel && building.level >= building.maxLevel) {
        addMessage(`${building.name} is already at max level.`, 'info');
        if (buildingCardEl) showPopupMessage('Max Level!', 'info', buildingCardEl);
        return;
    }

    const cost = calculateBuildingCost(building);
    if (gameState.dollarBalance >= cost) {
        const oldDollarBalance = gameState.dollarBalance;
        gameState.dollarBalance -= cost;
        if (gameState.dollarBalance < oldDollarBalance) {
            highlightElement(dollarBalanceEl, 'highlight-red');
        }

        const message = building.level === 0 ? 'Purchased!' : 'Lvl Up!';
        if (buildingCardEl) {
            showPopupMessage(message, 'success', buildingCardEl);
            highlightElement(buildingCardEl, 'flash-gold', 700);
        }
        
        building.level++;
        recalculateGlobalEffects();
        addMessage(`${building.icon} ${building.name} ${building.level === 1 ? 'purchased' : 'upgraded to Lvl ' + building.level}!`, 'success');
        updateDisplay();
        renderBuildings(); 
    } else {
        addMessage(`Not enough $ to upgrade ${building.name}. Need $${formatNumber(cost,0)}.`, 'error');
        if (buildingCardEl) showPopupMessage('No Funds!', 'error', buildingCardEl);
    }
}

function sellBtc() {
    const amountToSell = parseFloat(sellBtcAmountInput.value);
    if (isNaN(amountToSell) || amountToSell <= 0) {
        addMessage('Please enter a valid positive amount of BTC to sell.', 'error');
        showPopupMessage('Invalid Amount', 'error');
        return;
    }
    if (amountToSell > gameState.btcBalance) {
        addMessage('Not enough BTC to sell.', 'error');
        showPopupMessage('Not Enough BTC', 'error');
        return;
    }

    const dollarsEarned = amountToSell * gameState.btcPriceInDollars;
    const oldBtc = gameState.btcBalance;
    const oldDollars = gameState.dollarBalance;

    gameState.btcBalance -= amountToSell;
    gameState.dollarBalance += dollarsEarned;

    if (gameState.btcBalance < oldBtc) highlightElement(btcBalanceEl, 'highlight-red');
    if (gameState.dollarBalance > oldDollars) highlightElement(dollarBalanceEl, 'highlight-green');
    
    addMessage(`Sold ${amountToSell.toFixed(4)} BTC for $${formatNumber(dollarsEarned,0)}.`, 'success');
    showPopupMessage(`Sold BTC for $${formatNumber(dollarsEarned,0)}`, 'success');
    
    sellBtcAmountInput.value = '';
    updateDisplay();
    renderBuildings(); 
}

function sellAllBtc() {
    if (gameState.btcBalance <= 0) {
        addMessage('No BTC to sell.', 'info');
        showPopupMessage('No BTC to Sell', 'info');
        return;
    }
    const amountToSell = gameState.btcBalance;
    const dollarsEarned = amountToSell * gameState.btcPriceInDollars;

    const oldBtc = gameState.btcBalance;
    const oldDollars = gameState.dollarBalance;

    gameState.btcBalance = 0;
    gameState.dollarBalance += dollarsEarned;

    if (gameState.btcBalance < oldBtc) highlightElement(btcBalanceEl, 'highlight-red');
    if (gameState.dollarBalance > oldDollars) highlightElement(dollarBalanceEl, 'highlight-green');

    addMessage(`Sold all ${amountToSell.toFixed(4)} BTC for $${formatNumber(dollarsEarned, 0)}.`, 'success');
    showPopupMessage(`Sold All BTC for $${formatNumber(dollarsEarned,0)}`, 'success');
    
    sellBtcAmountInput.value = '';
    updateDisplay();
    renderBuildings();
}

// Time-dependent updates (BTC Price)
function updateBtcPriceAndDateDependencies() {
    gameState.previousBtcPriceInDollars = gameState.btcPriceInDollars;

    const daysSinceStart = (gameState.currentDate.getTime() - gameState.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const yearsPassed = daysSinceStart / 365.25;

    let newBasePrice = initialGameState.baseBtcPrice; 
    
    if (yearsPassed < 1) newBasePrice = 0.1 + yearsPassed * (5 - 0.1); 
    else if (yearsPassed < 2) newBasePrice = 5 + (yearsPassed - 1) * (15 - 5);       
    else if (yearsPassed < 3) newBasePrice = 15 + (yearsPassed - 2) * (100 - 15);    
    else if (yearsPassed < 4) newBasePrice = 100 + (yearsPassed - 3) * (500 - 100);  
    else if (yearsPassed < 5) newBasePrice = 500 + (yearsPassed - 4) * (300 - 500);  
    else if (yearsPassed < 7) newBasePrice = 300 + (yearsPassed - 5) * (2000 - 300) / 2; 
    else if (yearsPassed < 8) newBasePrice = 2000 + (yearsPassed - 7) * (19000 - 2000); 
    else if (yearsPassed < 11) newBasePrice = 8000 + (yearsPassed - 8) * (25000 - 8000) / 3; 
    else if (yearsPassed < 12) newBasePrice = 25000 + (yearsPassed - 11) * (65000 - 25000); 
    else newBasePrice = 65000 + (yearsPassed - 12) * 5000; 

    gameState.baseBtcPrice = Math.max(0.01, newBasePrice); 

    const fluctuation = gameState.baseBtcPrice * (Math.random() * 0.2 - 0.1); 
    gameState.btcPriceInDollars = Math.max(0.01, gameState.baseBtcPrice + fluctuation);

    if (gameState.btcPriceInDollars > gameState.previousBtcPriceInDollars) {
        highlightElement(btcPriceEl, 'highlight-green');
        highlightElement(marketBtcPriceEl, 'highlight-green');
    } else if (gameState.btcPriceInDollars < gameState.previousBtcPriceInDollars) {
        highlightElement(btcPriceEl, 'highlight-red');
        highlightElement(marketBtcPriceEl, 'highlight-red');
    }
}

// Floating BTC Boost Logic
function spawnFloatingBtc() {
    if (document.querySelector('.floating-btc')) return; 

    const btc = document.createElement('div');
    btc.classList.add('floating-btc');
    btc.textContent = '💰'; 

    btc.style.top = `${Math.random() * (floatingBtcContainer.clientHeight - 40)}px`; 
    btc.style.left = '-50px'; 

    const duration = 8 + Math.random() * 4; 
    btc.style.animationDuration = `${duration}s, ${duration}s`;


    btc.onclick = () => handleFloatingBtcClick(btc);
    floatingBtcContainer.appendChild(btc);

    setTimeout(() => {
        if (btc && !btc.classList.contains('collected')) {
            btc.remove();
        }
    }, duration * 1000);

    gameState.nextFloatingBtcSpawnTime = Date.now() + (30 + Math.random() * 30) * 1000; 
}

function handleFloatingBtcClick(btcElement: HTMLElement) {
    if (gameState.isBoostActive) { 
      showPopupMessage("Boost Refreshed!", "info");
    } else {
      showPopupMessage("Mining Boost Active! +100% H/s", "success");
    }
    
    gameState.isBoostActive = true;
    gameState.boostMultiplier = 2; 
    gameState.boostEndTime = Date.now() + 20000; 

    btcElement.classList.add('collected');
    setTimeout(() => btcElement.remove(), 500); 

    recalculateGlobalEffects(); 
    updateDisplay();
}

function updateBoostTimer() {
    if (gameState.isBoostActive) {
        if (Date.now() >= gameState.boostEndTime) {
            deactivateBoost();
        }
    }
}

function deactivateBoost() {
    gameState.isBoostActive = false;
    gameState.boostMultiplier = 1;
    gameState.boostEndTime = 0;
    showPopupMessage("Mining Boost Ended.", "info");
    recalculateGlobalEffects();
    updateDisplay();
}

// Auto-Buy and Settings
function updateAutoBuyButtonText() {
    toggleAutoBuyButton.textContent = gameState.autoBuyEnabled ? 'Disable Auto-Buy Upgrades' : 'Enable Auto-Buy Upgrades';
    toggleAutoBuyButton.classList.toggle('active', gameState.autoBuyEnabled);
}

function toggleAutoBuy() {
    gameState.autoBuyEnabled = !gameState.autoBuyEnabled;
    updateAutoBuyButtonText();
    addMessage(`Auto-buy upgrades ${gameState.autoBuyEnabled ? 'enabled' : 'disabled'}.`, 'info');
}

function updatePopupsButtonText() {
    togglePopupsButton.textContent = gameState.showPopups ? 'Disable Pop-up Notifications' : 'Enable Pop-up Notifications';
    togglePopupsButton.classList.toggle('active', gameState.showPopups);
}

function togglePopups() {
    gameState.showPopups = !gameState.showPopups;
    updatePopupsButtonText();
    addMessage(`Pop-up notifications ${gameState.showPopups ? 'enabled' : 'disabled'}.`, 'info');
}


function attemptAutoBuyUpgrade() {
    if (!gameState.autoBuyEnabled || gameState.dollarBalance <= 0) {
        return;
    }

    let bestBuildingToUpgrade: Building | null = null;
    let minCost = Infinity;

    for (const building of buildingsData) {
        if (building.maxLevel && building.level >= building.maxLevel) {
            continue;
        }
        const cost = calculateBuildingCost(building);
        if (gameState.dollarBalance >= cost && cost < minCost) {
            minCost = cost;
            bestBuildingToUpgrade = building;
        }
    }

    if (bestBuildingToUpgrade) {
        buyBuilding(bestBuildingToUpgrade.id); 
    }
}

function handleMiningModeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    gameState.miningMode = target.value as MiningMode;
    addMessage(`Mining mode changed to: ${gameState.miningMode === 'pool' ? 'Pool (Guaranteed)' : 'Solo (Chance)'}.`, 'info');
    updateDisplay();
}

function handleGameSpeedChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    gameState.gameSpeedMultiplier = parseInt(target.value, 10);
    addMessage(`Game speed set to ${target.options[target.selectedIndex].text}.`, 'info'); 
    updateDisplay();
}

// Game Loop
function gameLoop() {
    const now = Date.now();
    const millisecondsPassedInGame = 100 * gameState.gameSpeedMultiplier; 
    gameState.currentDate = new Date(gameState.currentDate.getTime() + millisecondsPassedInGame);

    const gameSecondsPassedThisTick = millisecondsPassedInGame / 1000.0;
    const autoHashesThisTick = getEffectiveAutoHashesPerSecond() * gameSecondsPassedThisTick;
    gameState.hashes += autoHashesThisTick;
    
    if (gameState.autoBuyEnabled) {
        attemptAutoBuyUpgrade();
    }

    if (now >= gameState.nextFloatingBtcSpawnTime) {
        spawnFloatingBtc();
    }
    updateBoostTimer();

    checkMineBlockCondition(); 
    updateDisplay(); 
}

// Initialization
function main() {
    clickMineButton.addEventListener('click', handleManualHashGeneration);
    sellBtcButton.addEventListener('click', sellBtc);
    sellAllBtcButton.addEventListener('click', sellAllBtc);
    toggleAutoBuyButton.addEventListener('click', toggleAutoBuy);
    togglePopupsButton.addEventListener('click', togglePopups);
    
    miningModeRadios.forEach(radio => radio.addEventListener('change', handleMiningModeChange));
    gameSpeedSelector.addEventListener('change', handleGameSpeedChange);

    recalculateGlobalEffects();
    updateAutoBuyButtonText();
    updatePopupsButtonText(); 
    updateBtcPriceAndDateDependencies(); 
    renderBuildings(); 
    updateDisplay(); 

    setInterval(gameLoop, 100); 
    setInterval(() => {
        updateBtcPriceAndDateDependencies();
    }, 5000); 
    
    addMessage("Welcome to Bitcoin Miner Tycoon! Click the button to start mining.", 'info');
    addMessage(`Game starts on ${formatDate(gameState.startDate)}. Current mining mode: Solo. Game Speed: 1x.`, 'info');
}

main();