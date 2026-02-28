export const DUMMY_CATEGORIES = [
    { id: 1, name: 'Brust' },
    { id: 2, name: 'Rücken' },
    { id: 3, name: 'Beine' },
    { id: 4, name: 'Schultern' },
    { id: 5, name: 'Arme' },
    { id: 6, name: 'Core' },
];

export const DUMMY_EXERCISES = [
    {
        id: 1,
        name: 'Liegestütze',
        description: 'Der Klassiker für Brust, Schultern und Trizeps.',
        category: 1,
        category_name: 'Brust',
        public: true,
        creator: 'fitnessapp',
        image: null,
    },
    {
        id: 2,
        name: 'Klimmzüge',
        description: 'Die beste Übung für einen breiten Rücken.',
        category: 2,
        category_name: 'Rücken',
        public: true,
        creator: 'fitnessapp',
        image: null,
    },
    {
        id: 3,
        name: 'Kniebeugen',
        description: 'Grundübung für starke Beine und Po.',
        category: 3,
        category_name: 'Beine',
        public: true,
        creator: 'fitnessapp',
        image: null,
    },
    {
        id: 4,
        name: 'Plank',
        description: 'Statische Halteübung für eine starke Rumpfmuskulatur.',
        category: 6,
        category_name: 'Core',
        public: true,
        creator: 'fitnessapp',
        image: null,
    }
];

export const DUMMY_TRAINING_PLANS = [
    {
        id: 1,
        name: 'Ganzkörper Workout',
        description: 'Ein perfekter Einstieg für Gäste, um alle Muskelgruppen zu trainieren.',
        creator_name: 'fitnessapp',
        order: [1, 3, 2, 4],
        exercises: [DUMMY_EXERCISES[0], DUMMY_EXERCISES[2], DUMMY_EXERCISES[1], DUMMY_EXERCISES[3]]
    }
];

export const DUMMY_RECOMMENDATIONS = {
    plans: [DUMMY_TRAINING_PLANS[0]],
    exercises: [DUMMY_EXERCISES[0]]
};
