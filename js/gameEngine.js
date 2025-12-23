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
     * Assign a random task to a specific person
     * @param {string} person - The person to assign the task to
     * @returns {Object} - {success: boolean, result: string}
     */
    assignTaskToPerson(person) {
        const tasks = DataManager.getSelectedTasks();
        
        if (tasks.length === 0) {
            return { success: false, result: 'No tasks available! Add some tasks first.' };
        }

        const task = DataManager.pickRandom(tasks);
        
        return {
            success: true,
            result: `🎯 ${person} has been assigned a task!\n\n📝 Task: ${task}`,
            game: 'Task Assigned'
        };
    },
    
    /**
     * Assign a random task to a random person
     * @returns {Object} - {success: boolean, result: string}
     */
    assignTaskToRandomPerson() {
        const names = DataManager.getNames();
        
        if (names.length === 0) {
            return { success: false, result: 'No names available! Add some tribe members first.' };
        }
        
        const person = DataManager.pickRandom(names);
        return this.assignTaskToPerson(person);
    },
    
    /**
     * Spotlight appreciation - highlight a random team member with specific appreciation
     * @returns {Object} - {success: boolean, result: string}
     */
    spotlightAppreciation() {
        const names = DataManager.getNames();
        if (names.length === 0) {
            return { success: false, result: 'No names available! Add some tribe members first.' };
        }
        
        const person = DataManager.pickRandom(names);
        const appreciationPrompts = [
            `for helping someone recently when they needed it most`,
            `for consistently going above and beyond`,
            `for that small but important win yesterday`,
            `for bringing such positive energy to the team`,
            `for their creative solution to a tough problem`,
            `for always being willing to lend a hand`,
            `for their attention to detail that never goes unnoticed`,
            `for making the workplace more enjoyable for everyone`,
            `for their patience and guidance when others need help`,
            `for always staying calm under pressure`,
            `for their innovative ideas that push us forward`,
            `for being a great listener and team player`,
            `for their dedication to continuous improvement`,
            `for making complex things seem simple`,
            `for their positive attitude, even on tough days`
        ];
        
        const appreciationTypes = [
            '🌟 SHOUTOUT',
            '👏 RECOGNITION',
            '💫 APPRECIATION',
            '🎉 CELEBRATION',
            '✨ RECOGNITION',
            '🙌 KUDOS',
            '🏆 ACCOLADE',
            '💖 THANK YOU'
        ];
        
        const prompt = DataManager.pickRandom(appreciationPrompts);
        const appreciationType = DataManager.pickRandom(appreciationTypes);
        
        return {
            success: true,
            result: `${appreciationType} SPOTLIGHT!\n\n${person},\n\nWe want to recognize you ${prompt}.\n\nYour contributions make a real difference!`,
            game: 'Spotlight Appreciation'
        };
    },

    /**
     * Standup roulette - pick someone to start standup
     * @returns {Object} - {success: boolean, result: string}
     */
    standupRoulette() {
        const names = DataManager.getNames();
        if (names.length === 0) {
            return { success: false, result: 'No names available! Add some tribe members first.' };
        }
        
        const person = DataManager.pickRandom(names);
        return {
            success: true,
            result: `🎤 STANDUP ROUND-UP!\n\n${person} is up first! Share your updates, then pick the next person!`,
            game: 'Standup Roulette'
        };
    },

    /**
     * Opinion split - force the team to pick a side
     * @returns {Object} - {success: boolean, result: string}
     */
    opinionSplit() {
        const opinions = [
            'Pineapple on pizza: Delicious or crime against humanity?',
            'Tabs vs. Spaces: The eternal debate',
            'Toilet paper: Over or under?',
            'Is a hot dog a sandwich?',
            'Should the toilet seat stay up or down?',
            'Ketchup on eggs: Yes or no?',
            'Is cereal a soup?',
            'Does the toilet paper go over or under?'
        ];
        
        const opinion = DataManager.pickRandom(opinions);
        return {
            success: true,
            result: `🤔 OPINION SPLIT!\n\n${opinion}\n\nTeam, where do you stand?`,
            game: 'Opinion Split'
        };
    },

    /**
     * Time-Box Challenge - Assigns a random task with a time limit
     * @returns {Object} - {success: boolean, result: string}
     */
    timeBoxChallenge() {
        const tasks = DataManager.getSelectedTasks();
        if (tasks.length === 0) {
            return { success: false, result: 'No tasks available! Add some tasks first.' };
        }
        
        const task = DataManager.pickRandom(tasks);
        const times = ['15 minutes', '30 minutes', '45 minutes'];
        const time = DataManager.pickRandom(times);
        
        const challengeEmojis = ['⏱️', '⏳', '⏰', '⌛', '🕒'];
        const emoji = DataManager.pickRandom(challengeEmojis);
        
        return {
            success: true,
            result: `${emoji} TIME-BOX CHALLENGE!\n\n📋 Task: ${task}\n⏱️ Time limit: ${time}\n\nReady... Set... Go!`,
            game: 'Time-Box Challenge'
        };
    },

    /**
     * Buddy Switch - Create random buddy pairs for the day
     * @returns {Object} - {success: boolean, result: string}
     */
    buddySwitch() {
        const names = DataManager.getNames();

        if (names.length < 2) {
            return { success: false, result: 'Need at least 2 people for Buddy Switch!' };
        }

        const shuffled = DataManager.shuffle(names);
        const pairs = [];
        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                pairs.push(`🤝 ${shuffled[i]} ↔ ${shuffled[i + 1]}`);
            } else {
                pairs.push(`🃏 ${shuffled[i]} (Wildcard Buddy)`);
            }
        }

        return {
            success: true,
            result: `🧑‍🤝‍🧑 BUDDY SWITCH (${today})\n\n${pairs.join('\n')}\n\nRule:\nHelp your buddy once today. No lifelong obligations.`,
            game: 'Buddy Switch'
        };
    },

    /**
     * Chaos button - smartly selects and runs a game based on context
     * @returns {Object} - Result of the selected game
     */
    chaosButton() {
        const hour = new Date().getHours();
        const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        // Base games available
        let games = [
            'pickRandomPersonAndTask',
            'shufflePairs',
            'chaosTeams',
            'whosMostLikelyTo',
            'roleRoulette',
            'assignTaskToRandomPerson',
            'secretSanta',
            'spotlightAppreciation',
            'standupRoulette',
            'opinionSplit',
            'timeBoxChallenge',
            'buddySwitch'
        ];

        // Morning games (before 12pm)
        if (hour < 12) {
            games = ['standupRoulette', 'spotlightAppreciation'];
        }
        // Friday games (more team-focused)
        else if (day === 5) { // Friday
            games = ['chaosTeams', 'roleRoulette', 'opinionSplit'];
        }
        
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