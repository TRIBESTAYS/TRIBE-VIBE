/**
 * gameEngine.js
 * Handles all game logic and algorithms
 * NO DOM MANIPULATION - only returns results
 */

const GameEngine = {

    // Track last game played for chaos button
    lastGame: null,

    /**
     * Pick a random person from the list
     * @returns {Object} - {success: boolean, result: string, person: string}
     */
    pickRandomPerson() {
        const names = DataManager.getNames();
        if (names.length === 0) {
            return { success: false, result: 'No names available! Add some tribe members first.' };
        }
        const person = DataManager.pickRandom(names);
        return {
            success: true,
            result: `🎯 ${person}`,
            person: person,
            game: 'Random Person'
        };
    },

    /**
     * Pick a random person AND a random task
     * Gives birthday bonus if applicable
     * @returns {Object} - {success: boolean, result: string}
     */
    pickRandomPersonAndTask() {
        const names = DataManager.getNames();
        const tasks = DataManager.getSelectedTasks();

        if (names.length === 0) {
            return { success: false, result: 'No names available! Add some tribe members first.' };
        }
        if (tasks.length === 0) {
            return { success: false, result: 'No tasks available! Add some tasks first.' };
        }

        const person = DataManager.pickRandom(names);
        const task = DataManager.pickRandom(tasks);
        const birthdayPeople = DataManager.getTodaysBirthdays();
        
        let result = `🎯 ${person}\n\n📝 Task: ${task}`;

        // Birthday power-up
        if (birthdayPeople.includes(person)) {
            result += `\n\n🎂 BIRTHDAY POWER-UP! ${person} can pass this task to someone else!`;
        }

        return {
            success: true,
            result: result,
            game: 'Random Person & Task'
        };
    },

    /**
     * Create random pairs from the list
     * @returns {Object} - {success: boolean, result: string}
     */
    shufflePairs() {
        const names = DataManager.getNames();
        
        if (names.length < 2) {
            return { success: false, result: 'Need at least 2 people to make pairs!' };
        }

        const shuffled = DataManager.shuffle(names);
        const pairs = [];

        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                pairs.push(`${shuffled[i]} 🤝 ${shuffled[i + 1]}`);
            } else {
                pairs.push(`${shuffled[i]} (solo - wildcard!)`);
            }
        }

        return {
            success: true,
            result: `👥 Pairs:\n\n${pairs.join('\n')}`,
            game: 'Shuffle Pairs'
        };
    },

    /**
     * Create random teams (2-3 teams)
     * @returns {Object} - {success: boolean, result: string}
     */
    chaosTeams() {
        const names = DataManager.getNames();

        if (names.length < 4) {
            return { success: false, result: 'Need at least 4 people to make teams!' };
        }

        const shuffled = DataManager.shuffle(names);
        const numTeams = names.length < 6 ? 2 : 3;
        const teams = Array.from({ length: numTeams }, () => []);

        shuffled.forEach((name, idx) => {
            teams[idx % numTeams].push(name);
        });

        const teamEmojis = ['🔴', '🔵', '🟢'];
        const teamResults = teams.map((team, idx) => {
            return `${teamEmojis[idx]} Team ${idx + 1}:\n${team.join(', ')}`;
        }).join('\n\n');

        return {
            success: true,
            result: `🔀 Chaos Teams:\n\n${teamResults}`,
            game: 'Chaos Teams'
        };
    },

    /**
     * Generate a "Who's Most Likely To" prompt with random person
     * @returns {Object} - {success: boolean, result: string}
     */
    whosMostLikelyTo() {
        const names = DataManager.getNames();
        const prompts = [
            'fall asleep during a meeting',
            'become a millionaire',
            'win a dance-off',
            'survive a zombie apocalypse',
            'become famous',
            'forget their own birthday',
            'win a cooking show',
            'get lost in their own neighborhood',
            'start a cult accidentally',
            'become a meme',
            'adopt 10 cats',
            'invent something ridiculous but useful'
        ];

        if (names.length === 0) {
            return { success: false, result: 'No names available! Add some tribe members first.' };
        }

        const person = DataManager.pickRandom(names);
        const prompt = DataManager.pickRandom(prompts);

        return {
            success: true,
            result: `🤔 Who's most likely to ${prompt}?\n\n💡 The tribe has spoken: ${person}!`,
            game: 'Most Likely To'
        };
    },

    /**
     * Assign random roles to everyone
     * @returns {Object} - {success: boolean, result: string}
     */
    roleRoulette() {
        const names = DataManager.getNames();
        const roles = [
            '👑 Leader',
            '🎨 Creative Director',
            '🤡 Chaos Agent',
            '🧠 Strategist',
            '😎 Vibe Curator',
            '📢 Hype Person',
            '🕵️ Secret Agent',
            '🎭 Drama Queen/King',
            '🎯 Task Master',
            '💡 Idea Generator'
        ];

        if (names.length === 0) {
            return { success: false, result: 'No names available! Add some tribe members first.' };
        }

        const shuffledRoles = DataManager.shuffle(roles);
        const assignments = names.map((name, idx) => {
            const role = shuffledRoles[idx % shuffledRoles.length];
            return `${name} → ${role}`;
        });

        return {
            success: true,
            result: `🎭 Role Roulette:\n\n${assignments.join('\n')}`,
            game: 'Role Roulette'
        };
    },

    /**
     * Generate Secret Santa pairs (no self-assignment)
     * @returns {Object} - {success: boolean, result: string}
     */
    secretSanta() {
        const names = DataManager.getNames();

        if (names.length < 3) {
            return { success: false, result: 'Need at least 3 people for Secret Santa!' };
        }

        let givers = [...names];
        let receivers = [...names];
        let valid = false;
        let assignments = [];

        // Try to create valid assignments (max 50 attempts)
        for (let attempt = 0; attempt < 50; attempt++) {
            receivers = DataManager.shuffle(receivers);
            valid = true;

            for (let i = 0; i < givers.length; i++) {
                if (givers[i] === receivers[i]) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                assignments = givers.map((giver, idx) => {
                    return `${giver} 🎁 → ${receivers[idx]}`;
                });
                break;
            }
        }

        if (!valid) {
            return { success: false, result: 'Could not generate valid Secret Santa pairs. Try again!' };
        }

        return {
            success: true,
            result: `🎅 Secret Santa Assignments:\n\n${assignments.join('\n')}\n\n(Screenshot individually - keep it secret!)`,
            game: 'Secret Santa'
        };
    },

    /**
     * Check who has birthdays today
     * @returns {Object} - {success: boolean, result: string}
     */
    checkBirthdays() {
        const birthdays = DataManager.getTodaysBirthdays();

        if (birthdays.length === 0) {
            return {
                success: true,
                result: '🎂 No birthdays today!\n\n(Add birthdates in the management section)',
                game: 'Birthday Check'
            };
        }

        const names = birthdays.join(', ');
        return {
            success: true,
            result: `🎉🎂 HAPPY BIRTHDAY! 🎂🎉\n\n${names}\n\nLet's celebrate!`,
            game: 'Birthday Check'
        };
    },

    /**
     * CHAOS BUTTON - runs a random game
     * Ensures variety by not repeating last game
     * @returns {Object} - Result from random game
     */
    chaosButton() {
        const games = [
            'pickRandomPersonAndTask',
            'shufflePairs',
            'chaosTeams',
            'whosMostLikelyTo',
            'roleRoulette'
        ];

        // Filter out last game if possible
        const availableGames = games.filter(g => g !== this.lastGame);
        const gameToPlay = availableGames.length > 0 
            ? DataManager.pickRandom(availableGames)
            : DataManager.pickRandom(games);

        this.lastGame = gameToPlay;
        const result = this[gameToPlay]();
        
        return {
            ...result,
            game: `💥 CHAOS: ${result.game}`
        };
    }
};