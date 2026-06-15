// keeps all loot items between button clicks
const lootItems = [];

// rarity multiplies the base value before storing
const RARITY_MULTIPLIERS = {
    common:   1.0,
    uncommon: 1.5,
    rare:     2.0,
    epic:     3.0
};

function addLoot() {
    const nameInput = document.getElementById('lootName');
    const valueInput = document.getElementById('lootValue');
    const rarityInput = document.getElementById('lootRarity');
    const errorEl = document.getElementById('lootError');

    errorEl.textContent = '';

    const name = nameInput.value.trim();
    const rarity = rarityInput.value;
    const rawValue = parseFloat(valueInput.value);

    if (name === '') {
        errorEl.textContent = 'Please enter a loot item name.';
        nameInput.focus();
        return;
    }

    if (isNaN(rawValue)) {
        errorEl.textContent = 'Please enter a valid loot value.';
        valueInput.focus();
        return;
    }

    if (rawValue < 0) {
        errorEl.textContent = 'Loot value cannot be negative.';
        valueInput.focus();
        return;
    }

    const multiplier = RARITY_MULTIPLIERS[rarity] || 1.0;
    const finalValue = rawValue * multiplier;

    lootItems.push({
        name: name,
        baseValue: rawValue,
        value: finalValue,
        rarity: rarity
    });

    nameInput.value = '';
    valueInput.value = '';
    rarityInput.value = 'common';
    nameInput.focus();

    renderLoot();
    autoSplit();
}

function renderLoot() {
    const listEl = document.getElementById('lootList');
    const emptyMsg = document.getElementById('emptyMsg');
    const totalEl = document.getElementById('runningTotal');

    listEl.innerHTML = '';

    if (lootItems.length === 0) {
        emptyMsg.style.display = 'block';
        totalEl.textContent = '$0.00';
        return;
    }

    emptyMsg.style.display = 'none';

    let total = 0;

    for (let i = 0; i < lootItems.length; i++) {
        total += lootItems[i].value;

        const li = document.createElement('li');
        li.className = 'loot-item rarity-' + lootItems[i].rarity;

        const infoSpan = document.createElement('span');
        infoSpan.className = 'loot-item-info';
        infoSpan.textContent = lootItems[i].name + ' (' + capitalizeFirst(lootItems[i].rarity) + ')';

        const valueSpan = document.createElement('span');
        valueSpan.className = 'loot-item-value';
        valueSpan.textContent = '$' + lootItems[i].value.toFixed(2);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '✕';
        removeBtn.setAttribute('data-index', i);
        removeBtn.addEventListener('click', function() {
            removeLoot(parseInt(this.getAttribute('data-index'), 10));
        });

        li.appendChild(infoSpan);
        li.appendChild(valueSpan);
        li.appendChild(removeBtn);
        listEl.appendChild(li);
    }

    totalEl.textContent = '$' + total.toFixed(2);
}

function removeLoot(index) {
    lootItems.splice(index, 1);
    renderLoot();
    autoSplit();
}

function splitLoot() {
    const partySizeInput = document.getElementById('partySize');
    const partyErrorEl = document.getElementById('partySizeError');
    const splitErrorEl = document.getElementById('splitError');
    const splitTotalEl = document.getElementById('splitTotal');
    const splitPerEl = document.getElementById('splitPerMember');
    const resultsArea = document.getElementById('resultsArea');

    partyErrorEl.textContent = '';
    splitErrorEl.textContent = '';

    const partySize = parseInt(partySizeInput.value, 10);

    if (isNaN(partySize) || partySize < 1) {
        partyErrorEl.textContent = 'Please enter a party size of 1 or greater.';
        partySizeInput.focus();
        return;
    }

    if (lootItems.length === 0) {
        splitErrorEl.textContent = 'No loot to split! Add some items first.';
        return;
    }

    let total = 0;
    for (let i = 0; i < lootItems.length; i++) {
        total += lootItems[i].value;
    }

    const perMember = total / partySize;

    splitTotalEl.textContent = '$' + total.toFixed(2);
    splitPerEl.textContent = '$' + perMember.toFixed(2);

    resultsArea.classList.add('has-results');
}

// re-runs the split automatically if a valid party size is already set
function autoSplit() {
    const partySize = parseInt(document.getElementById('partySize').value, 10);

    if (!isNaN(partySize) && partySize >= 1 && lootItems.length > 0) {
        splitLoot();
    } else if (lootItems.length === 0) {
        document.getElementById('splitTotal').textContent = '—';
        document.getElementById('splitPerMember').textContent = '—';
        document.getElementById('resultsArea').classList.remove('has-results');
    }
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

document.getElementById('addLootBtn').addEventListener('click', addLoot);
document.getElementById('splitLootBtn').addEventListener('click', splitLoot);
