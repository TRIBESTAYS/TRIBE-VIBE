/**
 * uiController.js
 * Handles all DOM manipulation, events, and UI updates
 * NO GAME LOGIC OR STORAGE LOGIC
 */

const UIController = {

    // DOM element cache
    elements: {},

    // Current result data
    currentResult: null,

    // Current game function for re-run
    currentGameFn: null,

    /**
     * Initialize the UI controller
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.loadTheme();
        this.loadSoundState();
        this.renderNamesList();
        this.renderTasks();
        this.renderHistory();
    },

    /**
     * Cache all DOM elements
     */
    cacheElements() {
        this.elements = {
            // Name management
            bulkNames: document.getElementById('bulkNames'),
            singleName: document.getElementById('singleName'),
            birthdate: document.getElementById('birthdate'),
            addBulkBtn: document.getElementById('addBulkBtn'),
            addSingleBtn: document.getElementById('addSingleBtn'),
            namesList: document.getElementById('namesList'),
            saveNamesBtn: document.getElementById('saveNamesBtn'),
            clearNamesBtn: document.getElementById('clearNamesBtn'),

            // Task management
            taskInput: document.getElementById('taskInput'),
            saveTasksBtn: document.getElementById('saveTasksBtn'),
            selectAllTasks: document.getElementById('selectAllTasks'),
            tasksList: document.getElementById('tasksList'),

            // Game buttons
            randomPersonBtn: document.getElementById('randomPersonBtn'),
            shufflePairsBtn: document.getElementById('shufflePairsBtn'),
            chaosTeamsBtn: document.getElementById('chaosTeamsBtn'),
            mostLikelyBtn: document.getElementById('mostLikelyBtn'),
            roleRouletteBtn: document.getElementById('roleRouletteBtn'),
            secretSantaBtn: document.getElementById('secretSantaBtn'),
            birthdayCheckBtn: document.getElementById('birthdayCheckBtn'),
            chaosBtn: document.getElementById('chaosBtn'),

            // Result display
            resultCard: document.getElementById('resultCard'),
            resultContent: document.getElementById('resultContent'),
            rerunBtn: document.getElementById('rerunBtn'),
            copyBtn: document.getElementById('copyBtn'),

            // History
            historyList: document.getElementById('historyList'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),

            // Settings
            themeToggle: document.getElementById('themeToggle'),
            soundToggle: document.getElementById('soundToggle'),

            // Confetti
            confetti: document.getElementById('confetti')
        };
    },

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Name management
        this.elements.addBulkBtn.addEventListener('click', () => this.handleAddBulk());
        this.elements.addSingleBtn.addEventListener('click', () => this.handleAddSingle());
        this.elements.saveNamesBtn.addEventListener('click', () => this.handleSaveNames());
        this.elements.clearNamesBtn.addEventListener('click', () => this.handleClearNames());

        // Task management
        this.elements.saveTasksBtn.addEventListener('click', () => this.handleSaveTasks());
        this.elements.selectAllTasks.addEventListener('change', () => this.handleSelectAllTasks());

        // Game buttons
        this.elements.randomPersonBtn.addEventListener('click', () => this.runGame(() => GameEngine.pickRandomPersonAndTask()));
        this.elements.shufflePairsBtn.addEventListener('click', () => this.runGame(() => GameEngine.shufflePairs()));
        this.elements.chaosTeamsBtn.addEventListener('click', () => this.runGame(() => GameEngine.chaosTeams()));
        this.elements.mostLikelyBtn.addEventListener('click', () => this.runGame(() => GameEngine.whosMostLikelyTo()));
        this.elements.roleRouletteBtn.addEventListener('click', () => this.runGame(() => GameEngine.roleRoulette()));
        this.elements.secretSantaBtn.addEventListener('click', () => this.runGame(() => GameEngine.secretSanta()));
        this.elements.birthdayCheckBtn.addEventListener('click', () => this.runGame(() => GameEngine.checkBirthdays()));
        this.elements.chaosBtn.addEventListener('click', () => this.runGame(() => GameEngine.chaosButton()));

        // Result actions
        this.elements.rerunBtn.addEventListener('click', () => this.handleRerun());
        this.elements.copyBtn.addEventListener('click', () => this.handleCopy());

        // History
        this.elements.clearHistoryBtn.addEventListener('click', () => this.handleClearHistory());

        // Settings
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
    },

    /**
     * Handle adding bulk names
     */
    handleAddBulk() {
        const text = this.elements.bulkNames.value.trim();
        if (!text) return;

        const names = text.split('\n').map(n => n.trim()).filter(n => n);
        const current = DataManager.getNames();
        const newNames = [...current];

        names.forEach(name => {
            if (!newNames.includes(name)) {
                newNames.push(name);
            }
        });

        DataManager.saveNames(newNames);
        this.elements.bulkNames.value = '';
        this.renderNamesList();
        this.showNotification('Names added!');
    },

    /**
     * Handle adding single name with optional birthdate
     */
    handleAddSingle() {
        const name = this.elements.singleName.value.trim();
        const birthdate = this.elements.birthdate.value.trim();

        if (!name) return;

        const added = DataManager.addName(name);
        
        if (birthdate && (/^\d{4}-\d{2}-\d{2}$/.test(birthdate) || /^\d{2}-\d{2}$/.test(birthdate))) {
            DataManager.addBirthdate(name, birthdate);
        }

        if (added) {
            this.elements.singleName.value = '';
            this.elements.birthdate.value = '';
            this.renderNamesList();
            this.showNotification(`${name} added!`);
        } else {
            this.showNotification(`${name} already exists!`);
        }
    },

    /**
     * Handle save names button
     */
    handleSaveNames() {
        this.showNotification('✅ Names saved!');
    },

    /**
     * Handle clear all names
     */
    handleClearNames() {
        if (confirm('Are you sure you want to clear all names?')) {
            DataManager.clearNames();
            this.renderNamesList();
            this.showNotification('All names cleared!');
        }
    },

    /**
     * Handle saving tasks
     */
    handleSaveTasks() {
        const text = this.elements.taskInput.value.trim();
        if (!text) return;

        const tasks = text.split('\n').map(t => t.trim()).filter(t => t);
        DataManager.saveTasks(tasks);
        // Clear selected tasks when tasks are updated
        DataManager.saveSelectedTasks([]);
        this.renderTasks();
        this.showNotification('✅ Tasks saved!');
    },

    /**
     * Run a game and display results
     * @param {Function} gameFn - Game function to execute
     */
    runGame(gameFn) {
        this.currentGameFn = gameFn;
        const result = gameFn();

        if (!result.success) {
            this.showNotification(result.result);
            return;
        }

        this.currentResult = result;
        this.displayResult(result);
        this.triggerConfetti();
        DataManager.addHistory(result);
        this.renderHistory();
    },

    /**
     * Display game result
     * @param {Object} result - Result object from game
     */
    displayResult(result) {
        // Format the result text into organized HTML
        const formattedResult = this.formatResultText(result.result);
        this.elements.resultContent.innerHTML = formattedResult;
        this.elements.resultCard.style.display = 'block';
        this.elements.resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Trigger animation
        this.elements.resultCard.style.animation = 'none';
        setTimeout(() => {
            this.elements.resultCard.style.animation = 'slideIn 0.5s ease-out';
        }, 10);
    },

    /**
     * Format result text into organized HTML
     * @param {String} text - Raw result text
     * @returns {String} - Formatted HTML
     */
    formatResultText(text) {
        // Split by double newlines for sections
        const sections = text.split('\n\n');
        
        return sections.map(section => {
            // Check if section starts with emoji (likely a header)
            if (section.match(/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u)) {
                return `<div class="result-header">${section}</div>`;
            }
            // Check if section contains lists (lines starting with - or numbers)
            else if (section.includes('\n- ') || section.match(/\n\d+\./)) {
                const lines = section.split('\n');
                const header = lines[0];
                const listItems = lines.slice(1).map(line => `<li>${line.replace(/^[-•]\s*/, '')}</li>`).join('');
                return `<div class="result-section"><strong>${header}</strong><ul>${listItems}</ul></div>`;
            }
            // Regular paragraph
            else {
                return `<div class="result-section">${section.replace(/\n/g, '<br>')}</div>`;
            }
        }).join('');
    },

    /**
     * Handle re-run button
     */
    handleRerun() {
        if (this.currentGameFn) {
            this.runGame(this.currentGameFn);
        }
    },

    /**
     * Handle copy to clipboard
     */
    handleCopy() {
        if (this.currentResult) {
            navigator.clipboard.writeText(this.currentResult.result).then(() => {
                this.showNotification('📋 Copied to clipboard!');
            });
        }
    },

    /**
     * Render the names list with delete buttons
     */
    renderNamesList() {
        const names = DataManager.getNames();
        const birthdates = DataManager.getBirthdates();

        if (names.length === 0) {
            this.elements.namesList.innerHTML = '<p style="text-align: center; color: #7F8C8D;">No names yet. Add some!</p>';
            return;
        }

        this.elements.namesList.innerHTML = names.map(name => {
            const bd = birthdates[name] ? ` 🎂 ${birthdates[name]}` : '';
            return `
                <div class="name-item">
                    <span>${name}${bd}</span>
                    <button class="delete-btn" onclick="UIController.deleteName('${name}')">✕</button>
                </div>
            `;
        }).join('');
    },

    /**
     * Delete a name
     * @param {String} name - Name to delete
     */
    deleteName(name) {
        DataManager.removeName(name);
        this.renderNamesList();
        this.showNotification(`${name} removed`);
    },

    /**
     * Render the tasks list with checkboxes
     */
    renderTasks() {
        const tasks = DataManager.getTasks();
        const selectedIndices = DataManager.getSelectedTasksIndices() || [];

        if (tasks.length === 0) {
            this.elements.tasksList.innerHTML = '<p style="text-align: center; color: #7F8C8D;">No tasks yet. Add some!</p>';
            this.elements.selectAllTasks.checked = false;
            this.elements.selectAllTasks.disabled = true;
            return;
        }

        this.elements.selectAllTasks.disabled = false;
        this.elements.selectAllTasks.checked = selectedIndices.length === tasks.length;

        this.elements.tasksList.innerHTML = tasks.map((task, index) => `
            <div class="task-item">
                <label>
                    <input type="checkbox" ${selectedIndices.includes(index) ? 'checked' : ''} onchange="UIController.toggleTaskSelection(${index})">
                    ${task}
                </label>
            </div>
        `).join('');
    },

    /**
     * Toggle selection of a task
     * @param {Number} index - Index of the task
     */
    toggleTaskSelection(index) {
        const selectedIndices = DataManager.getSelectedTasksIndices() || [];
        const isSelected = selectedIndices.includes(index);
        if (isSelected) {
            const newIndices = selectedIndices.filter(i => i !== index);
            DataManager.saveSelectedTasks(newIndices);
        } else {
            selectedIndices.push(index);
            DataManager.saveSelectedTasks(selectedIndices);
        }
        this.renderTasks(); // Re-render to update select all
    },

    /**
     * Handle select all tasks checkbox
     */
    handleSelectAllTasks() {
        const tasks = DataManager.getTasks();
        if (this.elements.selectAllTasks.checked) {
            const allIndices = tasks.map((_, index) => index);
            DataManager.saveSelectedTasks(allIndices);
        } else {
            DataManager.saveSelectedTasks([]);
        }
        this.renderTasks();
    },

    /**
     * Render history list
     */
    renderHistory() {
        const history = DataManager.getHistory();

        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<p style="text-align: center; color: #7F8C8D;">No history yet</p>';
            return;
        }

        this.elements.historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="time">${item.timestamp}</div>
                <strong>${item.game}</strong>
                <div>${item.result.replace(/\n/g, '<br>')}</div>
            </div>
        `).join('');
    },

    /**
     * Handle clear history
     */
    handleClearHistory() {
        DataManager.clearHistory();
        this.renderHistory();
        this.showNotification('History cleared!');
    },

    /**
     * Toggle theme between light and dark
     */
    toggleTheme() {
        const current = DataManager.getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        
        document.body.classList.toggle('dark-mode');
        DataManager.saveTheme(newTheme);
        this.elements.themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    },

    /**
     * Load saved theme
     */
    loadTheme() {
        const theme = DataManager.getTheme();
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.elements.themeToggle.textContent = '☀️';
        }
    },

    /**
     * Toggle sound on/off
     */
    toggleSound() {
        const current = DataManager.getSound();
        const newState = !current;
        DataManager.saveSound(newState);
        this.elements.soundToggle.textContent = newState ? '🔊' : '🔇';
    },

    /**
     * Load saved sound state
     */
    loadSoundState() {
        const enabled = DataManager.getSound();
        this.elements.soundToggle.textContent = enabled ? '🔊' : '🔇';
    },

    /**
     * Trigger confetti animation
     */
    triggerConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];
        const container = this.elements.confetti;

        // Clear existing confetti
        container.innerHTML = '';

        // Create 50 confetti pieces
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 0.5 + 's';
            piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(piece);
        }

        // Remove confetti after animation
        setTimeout(() => {
            container.innerHTML = '';
        }, 4000);
    },

    /**
     * Show a temporary notification
     * @param {String} message - Message to display
     */
    showNotification(message) {
        // Create temporary notification
        const notif = document.createElement('div');
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px var(--shadow);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    DataManager.init();
    UIController.init();
    
    // Load tasks into textarea
    const tasks = DataManager.getTasks();
    document.getElementById('taskInput').value = tasks.join('\n');
});