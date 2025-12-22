/**
 * dataManager.js
 * Handles all data storage and retrieval operations
 * Uses localStorage for persistence
 * NO DOM MANIPULATION
 */

// Polyfill for String.padStart for older browsers
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length >= targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

const DataManager = {
    
    // Storage keys
    KEYS: {
        NAMES: 'tribe_vibe_names',
        BIRTHDATES: 'tribe_vibe_birthdates',
        TASKS: 'tribe_vibe_tasks',
        SELECTED_TASKS: 'tribe_vibe_selected_tasks',
        HISTORY: 'tribe_vibe_history',
        THEME: 'tribe_vibe_theme',
        SOUND: 'tribe_vibe_sound'
    },

    /**
     * Initialize default data if none exists
     */
    init() {
        if (!this.getNames().length) {
            this.saveNames(['Rohan', 'Priya', 'Karan', 'Neha', 'Alex']);
        }
        if (!this.getTasks().length || this.getTasks().length === 5) {
            this.saveTasks([
                // 🎭 Light & Silly (Zero Pressure)
                'Do a 10-second dance to imaginary music',
                'Share your most used emoji and why',
                'Speak only in movie dialogues for 30 seconds',
                'Show the last photo you took (no explanations allowed)',
                'Do your best animal impression',
                'Pretend you\'re a news anchor and report today\'s "breaking news"',
                'Describe your day using only 3 words',
                'Clap for yourself like you just won an award',
                'Say your name with a dramatic pause and accent',
                'Make a fake product pitch for a common object nearby',
                // 😄 Social & Wholesome (Safe for Everyone)
                'Compliment the person to your left',
                'Thank someone in the room for something small',
                'Share one habit you\'re proud of',
                'Name one thing you like about TribeStays',
                'Share one food you\'ll never get tired of',
                'Recommend a movie or show everyone should watch',
                'Share one thing that made you smile this week',
                'Appreciate yourself out loud (yes, it\'s allowed)',
                'Tell the group one thing you\'re grateful for today',
                'Share one fun fact about yourself',
                // 🧠 Quick Thinkers (Fun, Not Stressful)
                'Answer a random question in 5 seconds',
                'Describe your job using only emojis',
                'Explain a complex thing like you\'re talking to a 5-year-old',
                'Name 3 things you\'d take to a deserted island',
                'If you had a superpower for a day, what would it be',
                'Invent a new festival and explain it in one sentence',
                'Rename your job title to something fun',
                'Describe your mood using a weather forecast',
                'Sell your favorite food like it\'s a startup',
                'Finish the sentence: "If today was a movie, it would be called…"',
                // 🔀 Group Interaction (Creates Energy)
                'Pick someone and swap roles for the next 10 minutes',
                'Choose today\'s background music for everyone',
                'Decide the next group activity or break',
                'Start a slow clap for the group',
                'Pick the next game mode',
                'Choose a fun rule everyone follows for the next 15 minutes',
                'Pair two people and make them a team name',
                'Nominate the next person to play',
                'Create a group chant (one line only, don\'t go cultish)',
                'End the round with a group cheer'
            ]);
        }
    },

    /**
     * Save names array to localStorage
     * @param {Array} names - Array of name strings
     */
    saveNames(names) {
        localStorage.setItem(this.KEYS.NAMES, JSON.stringify(names));
    },

    /**
     * Get names array from localStorage
     * @returns {Array} - Array of names
     */
    getNames() {
        const data = localStorage.getItem(this.KEYS.NAMES);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Add a single name if it doesn't exist
     * @param {String} name - Name to add
     * @returns {Boolean} - Success status
     */
    addName(name) {
        const names = this.getNames();
        if (!names.includes(name)) {
            names.push(name);
            this.saveNames(names);
            return true;
        }
        return false;
    },

    /**
     * Remove a name from the list
     * @param {String} name - Name to remove
     */
    removeName(name) {
        const names = this.getNames().filter(n => n !== name);
        this.saveNames(names);
        // Also remove their birthdate if exists
        const birthdates = this.getBirthdates();
        delete birthdates[name];
        this.saveBirthdates(birthdates);
    },

    /**
     * Clear all names
     */
    clearNames() {
        localStorage.removeItem(this.KEYS.NAMES);
        localStorage.removeItem(this.KEYS.BIRTHDATES);
    },

    /**
     * Save birthdates object to localStorage
     * @param {Object} birthdates - Object with name: date pairs
     */
    saveBirthdates(birthdates) {
        localStorage.setItem(this.KEYS.BIRTHDATES, JSON.stringify(birthdates));
    },

    /**
     * Get birthdates object from localStorage
     * @returns {Object} - Object with name: date pairs
     */
    getBirthdates() {
        const data = localStorage.getItem(this.KEYS.BIRTHDATES);
        return data ? JSON.parse(data) : {};
    },

    /**
     * Add or update a birthdate for a person
     * @param {String} name - Person's name
     * @param {String} date - Date in DD-MM format
     */
    addBirthdate(name, date) {
        const birthdates = this.getBirthdates();
        birthdates[name] = date;
        this.saveBirthdates(birthdates);
    },

    /**
     * Get today's birthdays
     * @returns {Array} - Array of names with birthdays today
     */
    getTodaysBirthdays() {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        
        // Format with leading zeros manually (instead of padStart)
        const dayStr = day < 10 ? '0' + day : '' + day;
        const monthStr = month < 10 ? '0' + month : '' + month;
        const todayStr = `${dayStr}-${monthStr}`;
        
        const birthdates = this.getBirthdates();
        return Object.keys(birthdates).filter(name => {
            const bd = birthdates[name];
            if (!bd) return false;
            
            if (bd.length === 10) { // YYYY-MM-DD format
                const parts = bd.split('-');
                const bdDay = parts[2];
                const bdMonth = parts[1];
                return `${bdDay}-${bdMonth}` === todayStr;
            } else if (bd.length === 5) { // DD-MM format
                return bd === todayStr;
            }
            return false;
        });
    },

    /**
     * Save tasks array to localStorage
     * @param {Array} tasks - Array of task strings
     */
    saveTasks(tasks) {
        localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    },

    /**
     * Get tasks array from localStorage
     * @returns {Array} - Array of tasks
     */
    getTasks() {
        const data = localStorage.getItem(this.KEYS.TASKS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Save selected tasks indices to localStorage
     * @param {Array} indices - Array of selected task indices
     */
    saveSelectedTasks(indices) {
        localStorage.setItem(this.KEYS.SELECTED_TASKS, JSON.stringify(indices));
    },

    /**
     * Get selected tasks indices from localStorage
     * @returns {Array} - Array of selected indices, or null if none selected
     */
    getSelectedTasksIndices() {
        const data = localStorage.getItem(this.KEYS.SELECTED_TASKS);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Get the list of selected tasks, or all tasks if none selected
     * @returns {Array} - Array of selected task strings
     */
    getSelectedTasks() {
        const tasks = this.getTasks();
        const indices = this.getSelectedTasksIndices();
        if (indices && indices.length > 0) {
            return indices.map(i => tasks[i]).filter(t => t);
        }
        return tasks; // If no selection, return all
    },

    /**
     * Save history to localStorage (max 5 items)
     * @param {Object} entry - History entry with game, result, timestamp
     */
    addHistory(entry) {
        const history = this.getHistory();
        history.unshift({
            ...entry,
            timestamp: new Date().toLocaleString()
        });
        // Keep only last 5
        const trimmed = history.slice(0, 5);
        localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(trimmed));
    },

    /**
     * Get history from localStorage
     * @returns {Array} - Array of history entries
     */
    getHistory() {
        const data = localStorage.getItem(this.KEYS.HISTORY);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Clear history
     */
    clearHistory() {
        localStorage.removeItem(this.KEYS.HISTORY);
    },

    /**
     * Save theme preference
     * @param {String} theme - 'light' or 'dark'
     */
    saveTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },

    /**
     * Get theme preference
     * @returns {String} - Theme name
     */
    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'light';
    },

    /**
     * Save sound preference
     * @param {Boolean} enabled - Sound enabled status
     */
    saveSound(enabled) {
        localStorage.setItem(this.KEYS.SOUND, enabled);
    },

    /**
     * Get sound preference
     * @returns {Boolean} - Sound enabled status
     */
    getSound() {
        const data = localStorage.getItem(this.KEYS.SOUND);
        return data === null ? true : data === 'true';
    },

    /**
     * Utility: Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} - Shuffled copy of array
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Utility: Pick a random item from array
     * @param {Array} array - Array to pick from
     * @returns {*} - Random item
     */
    pickRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

// Initialize data on load
DataManager.init();
