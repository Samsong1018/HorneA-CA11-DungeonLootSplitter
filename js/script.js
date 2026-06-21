// ----- Application State -----
// lootItems is the single source of truth for all loot data.
// It lives at the top of the file, outside any function, so it
// persists across every click instead of being reset.
const lootItems = [];

// ----- DOM References -----
const partySizeInput = document.getElementById('partySize');
const partySizeError = document.getElementById('partySizeError');

const lootNameInput = document.getElementById('lootName');
const lootValueInput = document.getElementById('lootValue');
const lootQuantityInput = document.getElementById('lootQuantity');
const lootError = document.getElementById('lootError');
const addLootBtn = document.getElementById('addLootBtn');

const noLootMessage = document.getElementById('noLootMessage');
const lootRows = document.getElementById('lootRows');
const totalLootEl = document.getElementById('totalLoot');

const splitLootBtn = document.getElementById('splitLootBtn');
const splitError = document.getElementById('splitError');
const resultsArea = document.getElementById('resultsArea');
const splitTotalEl = document.getElementById('splitTotal');
const splitPerMemberEl = document.getElementById('splitPerMember');

// ----- addLoot() -----
// Validates input, then pushes a plain object literal into lootItems.
// Does not calculate or render anything itself — that is updateUI()'s job.
function addLoot() {
    lootError.textContent = '';

    const name = lootNameInput.value.trim();
    const value = parseFloat(lootValueInput.value);
    const quantity = parseInt(lootQuantityInput.value, 10);

    if (name === '') {
        lootError.textContent = 'Please enter a loot item name.';
        lootNameInput.focus();
        return;
    }

    if (isNaN(value) || value < 0) {
        lootError.textContent = 'Please enter a valid, non-negative loot value.';
        lootValueInput.focus();
        return;
    }

    if (isNaN(quantity) || quantity < 1) {
        lootError.textContent = 'Quantity must be 1 or greater.';
        lootQuantityInput.focus();
        return;
    }

    // valid data only — push a plain object literal
    lootItems.push({
        name: name,
        value: value,
        quantity: quantity
    });

    lootNameInput.value = '';
    lootValueInput.value = '';
    lootQuantityInput.value = '';
    lootNameInput.focus();

    updateUI();
}

// ----- removeLoot() -----
// Removes one item from state by index using splice(), then
// hands control back to updateUI() to reflect the new state.
function removeLoot(index) {
    lootItems.splice(index, 1);
    updateUI();
}

// ----- splitLoot() -----
// Intentionally contains no calculation logic of its own.
// It exists only because the assignment calls for a Split button.
// All math happens inside updateUI().
function splitLoot() {
    updateUI();
}

// ----- updateUI() -----
// The only function that calculates totals, renders the loot list,
// and controls which interface elements are visible or enabled.
function updateUI() {

    // 1. Calculate totals (traditional for loop required)
    let total = 0;
    for (let i = 0; i < lootItems.length; i++) {
        total += lootItems[i].value * lootItems[i].quantity;
    }

    // 2. Render loot list
    lootRows.innerHTML = '';

    if (lootItems.length === 0) {
        noLootMessage.classList.remove('hidden');
    } else {
        noLootMessage.classList.add('hidden');

        for (let i = 0; i < lootItems.length; i++) {
            const row = document.createElement('div');
            row.className = 'loot-row';

            const nameCell = document.createElement('div');
            nameCell.className = 'loot-cell';
            nameCell.innerText = lootItems[i].name;

            const valueCell = document.createElement('div');
            valueCell.className = 'loot-cell';
            valueCell.innerText = '$' + lootItems[i].value.toFixed(2);

            const quantityCell = document.createElement('div');
            quantityCell.className = 'loot-cell';
            quantityCell.innerText = lootItems[i].quantity;

            const actionCell = document.createElement('div');
            actionCell.className = 'loot-cell loot-actions';

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerText = 'Remove';
            removeBtn.addEventListener('click', function () {
                removeLoot(i);
            });

            actionCell.appendChild(removeBtn);

            row.appendChild(nameCell);
            row.appendChild(valueCell);
            row.appendChild(quantityCell);
            row.appendChild(actionCell);

            lootRows.appendChild(row);
        }
    }

    totalLootEl.textContent = total.toFixed(2);

    // 3. Validate party size (validation protects state, doesn't mutate it)
    const partySize = parseInt(partySizeInput.value, 10);
    const partySizeValid = !isNaN(partySize) && partySize >= 1;

    partySizeError.textContent = '';
    if (partySizeInput.value !== '' && !partySizeValid) {
        partySizeError.textContent = 'Party size must be a whole number 1 or greater.';
    }

    // 4. Calculate split — only meaningful if state is valid
    const hasLoot = lootItems.length > 0;
    const stateIsValid = hasLoot && partySizeValid;

    if (stateIsValid) {
        const perMember = total / partySize;
        splitTotalEl.textContent = '$' + total.toFixed(2);
        splitPerMemberEl.textContent = '$' + perMember.toFixed(2);
        splitError.textContent = '';
    }

    // 5. Enable/disable Split button based on state validity
    splitLootBtn.disabled = !stateIsValid;

    // 6. Show/hide results — never show stale or invalid numbers
    if (stateIsValid) {
        resultsArea.classList.remove('hidden');
    } else {
        resultsArea.classList.add('hidden');
        if (!hasLoot) {
            splitError.textContent = 'No loot to split! Add some items first.';
        } else if (!partySizeValid) {
            splitError.textContent = 'Enter a valid party size to see the split.';
        }
    }
}

// ----- Event Listeners (all registered here, no inline handlers) -----
addLootBtn.addEventListener('click', addLoot);
splitLootBtn.addEventListener('click', splitLoot);
partySizeInput.addEventListener('input', updateUI);

// initial paint on load so empty state / disabled button reflect immediately
updateUI();