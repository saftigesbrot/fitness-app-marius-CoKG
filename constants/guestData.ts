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
        exercises: [
            {
                exercise: DUMMY_EXERCISES[0],
                order: 1,
                sets: [{ set_number: 1, reps: 10, weight: 0 }, { set_number: 2, reps: 10, weight: 0 }, { set_number: 3, reps: 10, weight: 0 }]
            },
            {
                exercise: DUMMY_EXERCISES[2],
                order: 2,
                sets: [{ set_number: 1, reps: 15, weight: 0 }, { set_number: 2, reps: 15, weight: 0 }, { set_number: 3, reps: 15, weight: 0 }]
            },
            {
                exercise: DUMMY_EXERCISES[1],
                order: 3,
                sets: [{ set_number: 1, reps: 8, weight: 0 }, { set_number: 2, reps: 8, weight: 0 }, { set_number: 3, reps: 8, weight: 0 }]
            },
            {
                exercise: DUMMY_EXERCISES[3],
                order: 4,
                sets: [{ set_number: 1, reps: 30, weight: 0, duration: 60 }, { set_number: 2, reps: 30, weight: 0, duration: 60 }]
            }
        ]
    }
];

export const DUMMY_RECOMMENDATIONS = {
    plans: [DUMMY_TRAINING_PLANS[0]],
    exercises: [DUMMY_EXERCISES[0]]
};
