export const DUMMY_EXERCISE_CATEGORIES = [
    { id: 1, name: 'Brust' },
    { id: 2, name: 'Rücken' },
    { id: 3, name: 'Beine' },
    { id: 4, name: 'Schultern' },
    { id: 5, name: 'Arme' },
    { id: 6, name: 'Core' },
];

export const DUMMY_PLAN_CATEGORIES = [
    { id: 101, name: 'Ganzkörper' },
    { id: 102, name: 'Oberkörper' },
    { id: 103, name: 'Unterkörper' },
    { id: 104, name: 'Push' },
    { id: 105, name: 'Pull' },
];

export const DUMMY_EXERCISES = [
    {
        id: 1,
        name: 'Liegestütze',
        description: 'Ausführung: Hände schulterbreit auf dem Boden platzieren, Körper in einer geraden Linie halten, Brust kontrolliert Richtung Boden senken und wieder hochdrücken.',
        difficulties: {
            leicht: 'Knie-Liegestütze oder erhöhte Hände, 12–15 Wiederholungen – Fokus auf Technik und Grundbelastung der Brustmuskulatur.',
            mittel: 'Klassische Liegestütze mit Körpergewicht, 8–12 Wiederholungen – optimaler Bereich für Muskelwachstum.',
            schwer: 'Füße erhöht oder Zusatzgewicht (5–15 kg), 6–10 Wiederholungen – hohe mechanische Spannung für maximalen Muskelreiz.'
        },
        category: 1,
        category_name: 'Brust',
        category_detail: { id: 1, name: 'Brust' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/liegestuetze.webp'),
    },
    {
        id: 2,
        name: 'Klimmzüge',
        description: 'Ausführung: Stange schulterbreit greifen, Körper kontrolliert hochziehen bis das Kinn über der Stange ist, anschließend langsam wieder absenken.',
        difficulties: {
            leicht: 'Klimmzüge mit Widerstandsband oder negative Wiederholungen, 8–12 Wiederholungen – Grundbelastung für Rücken und Bizeps.',
            mittel: 'Klimmzüge mit eigenem Körpergewicht, 6–10 Wiederholungen – optimal für Muskelaufbau im Rücken.',
            schwer: 'Klimmzüge mit Zusatzgewicht (5–20 kg), 5–8 Wiederholungen – maximale Spannung für breiten Rücken.'
        },
        category: 2,
        category_name: 'Rücken',
        category_detail: { id: 2, name: 'Rücken' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/klimzuege.png'),
    },
    {
        id: 3,
        name: 'Kniebeugen',
        description: 'Ausführung: Füße schulterbreit stellen, Rücken gerade halten, Hüfte nach hinten schieben und Knie beugen bis die Oberschenkel etwa parallel zum Boden sind, anschließend wieder hochdrücken.',
        difficulties: {
            leicht: 'Körpergewicht oder leichtes Zusatzgewicht (5–10 kg), 12–15 Wiederholungen – Grundbelastung für Beine und Gesäß.',
            mittel: 'Zusatzgewicht 12–20 kg, 8–12 Wiederholungen – optimaler Hypertrophiebereich für Beine.',
            schwer: 'Zusatzgewicht 20–40 kg, 6–10 Wiederholungen – hohe mechanische Spannung für maximalen Muskelaufbau.'
        },
        category: 3,
        category_name: 'Beine',
        category_detail: { id: 3, name: 'Beine' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/kniebeuge.jpg'),
    },
    {
        id: 4,
        name: 'Plank',
        description: 'Ausführung: Unterarme auf den Boden setzen, Körper in einer geraden Linie von Kopf bis Fuß halten und Bauch sowie Gesäß anspannen.',
        difficulties: {
            leicht: '30–40 Sekunden halten – Grundspannung im Rumpf aufbauen.',
            mittel: '45–60 Sekunden halten – erhöhter Muskelreiz für Bauchmuskeln.',
            schwer: '60–90 Sekunden halten oder mit Zusatzgewicht (5–10 kg auf dem Rücken) – maximale Spannung für Core-Stabilität und Muskelwachstum.'
        },
        category: 6,
        category_name: 'Core',
        category_detail: { id: 6, name: 'Core' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'time',
        image: require('@/assets/images/exercises/plank.jpg'),
    },
    {
        id: 5,
        name: 'Romanian Deadlifts',
        description: 'Ausführung: Hanteln vor dem Körper, Hüfte nach hinten schieben, Rücken gerade, bis knapp unter Knie senken und wieder hoch.',
        difficulties: {
            leicht: '6–10 kg pro Hand, 12–15 Wiederholungen – Fokus auf Technik und saubere Bewegung.',
            mittel: '10–18 kg pro Hand, 10–12 Wiederholungen – gutes Gewicht für Muskelwachstum.',
            schwer: '18–30 kg pro Hand, 6–10 Wiederholungen – hohe Belastung für maximale Muskelspannung.'
        },
        category: 3,
        category_name: 'Beine',
        category_detail: { id: 3, name: 'Beine' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/deadlift.webp'),
    },
    {
        id: 6,
        name: 'Bulgarian Split Squats',
        description: 'Ausführung: Hinteren Fuß auf Stuhl oder Bank ablegen, vorderes Bein beugen bis ca. 90°, dann wieder hochdrücken.',
        difficulties: {
            leicht: 'Körpergewicht oder 5 kg pro Hand, 12 Wiederholungen – Fokus Balance und Technik.',
            mittel: '8–16 kg pro Hand, 10–12 Wiederholungen – guter Muskelreiz für Beine und Gesäß.',
            schwer: '16–24 kg pro Hand, 6–10 Wiederholungen – intensive Belastung für Kraft und Muskelwachstum.'
        },
        category: 3,
        category_name: 'Beine',
        category_detail: { id: 3, name: 'Beine' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/Bulgarian-Split-Squats.jpg'),
    },
    {
        id: 7,
        name: 'Wadenheben',
        description: 'Ausführung: Auf Zehenspitzen hochdrücken, oben kurz halten und langsam wieder absenken.',
        difficulties: {
            leicht: 'Körpergewicht, 20 Wiederholungen – Grundbelastung der Waden.',
            mittel: '10–20 kg Zusatzgewicht, 15 Wiederholungen – stärkerer Muskelreiz.',
            schwer: '20–40 kg Zusatzgewicht, 10–12 Wiederholungen – hohe Kraftbelastung.'
        },
        category: 3,
        category_name: 'Beine',
        category_detail: { id: 3, name: 'Beine' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/wadenheben-stufen.webp'),
    },
    {
        id: 8,
        name: 'Ausfallschritte',
        description: 'Ausführung: Großen Schritt nach vorne machen, hinteres Knie Richtung Boden senken und wieder hochdrücken.',
        difficulties: {
            leicht: 'Körpergewicht, 12 Wiederholungen pro Bein – Fokus Gleichgewicht und Technik.',
            mittel: '10–16 kg pro Hand, 10–12 Wiederholungen pro Bein – Muskelaufbau Beine.',
            schwer: '18–26 kg pro Hand, 8–10 Wiederholungen pro Bein – hohe Belastung.'
        },
        category: 3,
        category_name: 'Beine',
        category_detail: { id: 3, name: 'Beine' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/ausfallschritt.webp'),
    },
    {
        id: 9,
        name: 'Seitheben',
        description: 'Ausführung: Arme leicht gebeugt seitlich bis Schulterhöhe anheben und langsam absenken.',
        difficulties: {
            leicht: '3–5 kg pro Hand, 15 Wiederholungen – Fokus auf Technik.',
            mittel: '6–8 kg pro Hand, 12 Wiederholungen – guter Muskelreiz für Schultern.',
            schwer: '8–12 kg pro Hand, 8–10 Wiederholungen – hohe Belastung.'
        },
        category: 4,
        category_name: 'Schultern',
        category_detail: { id: 4, name: 'Schultern' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/seitheben.webp'),
    },
    {
        id: 10,
        name: 'Frontheben',
        description: 'Ausführung: Arme gerade nach vorne bis Schulterhöhe anheben und langsam wieder absenken.',
        difficulties: {
            leicht: '3–5 kg pro Hand, 15 Wiederholungen – Fokus Kontrolle.',
            mittel: '6–8 kg pro Hand, 12 Wiederholungen – moderater Muskelreiz.',
            schwer: '8–12 kg pro Hand, 8–10 Wiederholungen – intensive Belastung der vorderen Schulter.'
        },
        category: 4,
        category_name: 'Schultern',
        category_detail: { id: 4, name: 'Schultern' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/frontheben-kurzhanteln.webp'),
    },
    {
        id: 11,
        name: 'Reverse Flys',
        description: 'Ausführung: Oberkörper nach vorne beugen, Arme seitlich nach außen öffnen und Schulterblätter zusammenziehen.',
        difficulties: {
            leicht: '3–5 kg pro Hand, 15 Wiederholungen – Fokus Technik und Haltung.',
            mittel: '6–8 kg pro Hand, 12 Wiederholungen – Muskelaufbau oberer Rücken.',
            schwer: '8–10 kg pro Hand, 10 Wiederholungen – hohe Spannung auf hintere Schulter.'
        },
        category: 4,
        category_name: 'Schultern',
        category_detail: { id: 4, name: 'Schultern' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/kurzhantel-reverse-flys-titel.jpg'),
    },
    {
        id: 12,
        name: 'Schulterdrücken',
        description: 'Ausführung: Hanteln auf Schulterhöhe starten und über den Kopf nach oben drücken.',
        difficulties: {
            leicht: '6–10 kg pro Hand, 12 Wiederholungen – Technik und Stabilität.',
            mittel: '10–18 kg pro Hand, 10 Wiederholungen – Muskelaufbau Schultern.',
            schwer: '18–26 kg pro Hand, 6–8 Wiederholungen – maximale Kraftbelastung.'
        },
        category: 4,
        category_name: 'Schultern',
        category_detail: { id: 4, name: 'Schultern' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/schulterdruecken-kurzhanteln-800x448.webp'),
    },
    {
        id: 13,
        name: 'Bizeps Curls',
        description: 'Ausführung: Arme eng am Körper halten und Hanteln kontrolliert nach oben ziehen.',
        difficulties: {
            leicht: '6–8 kg pro Hand, 15 Wiederholungen – Fokus Technik.',
            mittel: '10–14 kg pro Hand, 10–12 Wiederholungen – Muskelaufbau Bizeps.',
            schwer: '16–22 kg pro Hand, 6–10 Wiederholungen – maximale Muskelspannung.'
        },
        category: 5,
        category_name: 'Arme',
        category_detail: { id: 5, name: 'Arme' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/bizepscurls.webp'),
    },
    {
        id: 14,
        name: 'Crunches',
        description: 'Ausführung: Schultern leicht vom Boden anheben und Bauch anspannen.',
        difficulties: {
            leicht: 'Körpergewicht, 20 Wiederholungen – Grundübung Bauch.',
            mittel: '5–10 kg Zusatzgewicht, 15 Wiederholungen – stärkerer Muskelreiz.',
            schwer: '10–15 kg Zusatzgewicht, 12 Wiederholungen – intensive Belastung.'
        },
        category: 6,
        category_name: 'Core',
        category_detail: { id: 6, name: 'Core' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/crunches-liegend.webp'),
    },
    {
        id: 15,
        name: 'Seitliche Crunches',
        description: 'Ausführung: Oberkörper diagonal zur Seite drehen und Bauch anspannen.',
        difficulties: {
            leicht: 'Körpergewicht, 20 Wiederholungen pro Seite – Technik lernen.',
            mittel: '5 kg Zusatzgewicht, 15 Wiederholungen pro Seite – stärkerer Reiz für schräge Bauchmuskeln.',
            schwer: '8–10 kg Zusatzgewicht, 12 Wiederholungen pro Seite – hohe Spannung.'
        },
        category: 6,
        category_name: 'Core',
        category_detail: { id: 6, name: 'Core' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/seitliche_crunches_zum_fuss.png'),
    },
    {
        id: 16,
        name: 'Sit Ups',
        description: 'Ausführung: Komplett aufsetzen und kontrolliert wieder zurückrollen.',
        difficulties: {
            leicht: 'Körpergewicht, 15 Wiederholungen – Grundübung Bauch.',
            mittel: '5–10 kg Zusatzgewicht, 12 Wiederholungen – Muskelaufbau Bauch.',
            schwer: '10–15 kg Zusatzgewicht, 10 Wiederholungen – hohe Belastung.'
        },
        category: 6,
        category_name: 'Core',
        category_detail: { id: 6, name: 'Core' },
        public: true,
        creator: 'fitnessapp',
        tracking_type: 'reps',
        image: require('@/assets/images/exercises/sit-up.webp'),
    }
];

export const DUMMY_TRAINING_PLANS = [
    {
        id: 1,
        name: 'Ganzkörper Workout',
        description: 'Ein perfekter Einstieg für Gäste, um alle Muskelgruppen zu trainieren.',
        category: 101,
        category_detail: DUMMY_PLAN_CATEGORIES[0],
        creator_name: 'fitnessapp',

        // Reihenfolge der Übungen (IDs)
        order: [3, 5, 2, 1, 12, 13, 4],

        // Übungen
        exercises: [
            DUMMY_EXERCISES[2],  // Kniebeugen
            DUMMY_EXERCISES[4],  // Romanian Deadlifts
            DUMMY_EXERCISES[1],  // Klimmzüge
            DUMMY_EXERCISES[0],  // Liegestütze
            DUMMY_EXERCISES[11], // Schulterdrücken
            DUMMY_EXERCISES[12], // Bizeps Curls
            DUMMY_EXERCISES[3],  // Plank
        ],
    },
    {
        id: 2,
        name: 'Unterkörper Workout',
        description: 'Trainingsplan für Unterkörper und Gesäß. Fokus auf Muskelwachstum in Quadrizeps, hinterer Beinmuskulatur und Waden.',
        category: 103,
        category_detail: DUMMY_PLAN_CATEGORIES[2],
        creator_name: 'fitnessapp',

        // Reihenfolge der Übungen
        order: [3, 5, 6, 8, 7],

        exercises: [
            DUMMY_EXERCISES[2], // Kniebeugen
            DUMMY_EXERCISES[4], // Romanian Deadlifts
            DUMMY_EXERCISES[5], // Bulgarian Split Squats
            DUMMY_EXERCISES[7], // Ausfallschritte
            DUMMY_EXERCISES[6], // Wadenheben
        ]
    },
    {
        id: 3,
        name: 'Oberkörper Workout',
        description:
            'Trainingsplan für Oberkörper. Fokus auf Muskelwachstum in Rücken, Brust, Schultern, Armen und Core-Stabilität.',
        category: 102,
        category_detail: DUMMY_PLAN_CATEGORIES[1],
        creator_name: 'fitnessapp',

        // Reihenfolge der Übungen (IDs)
        order: [2, 1, 12, 11, 13, 4],

        exercises: [
            DUMMY_EXERCISES[1],  // Klimmzüge (Rücken)
            DUMMY_EXERCISES[0],  // Liegestütze (Brust)
            DUMMY_EXERCISES[11], // Schulterdrücken (Schultern)
            DUMMY_EXERCISES[10], // Reverse Flys (oberer Rücken / hintere Schulter)
            DUMMY_EXERCISES[12], // Bizeps Curls (Arme)
            DUMMY_EXERCISES[3],  // Plank (Core / time)
        ],
    },
    {
        id: 4,
        name: 'Push Workout',
        description:
            'Push-Trainingsplan für Brust, Schultern und Trizeps. Fokus auf Muskelwachstum durch Druckbewegungen.',
        category: 104,
        category_detail: DUMMY_PLAN_CATEGORIES[3],
        creator_name: 'fitnessapp',

        // Reihenfolge der Übungen
        order: [1, 12, 9, 10],

        exercises: [
            DUMMY_EXERCISES[0],  // Liegestütze (Brust)
            DUMMY_EXERCISES[11], // Schulterdrücken (Schultern)
            DUMMY_EXERCISES[8],  // Seitheben (Schultern)
            DUMMY_EXERCISES[9],  // Frontheben (vordere Schulter)
        ],
    },
    {
        id: 5,
        name: 'Pull Workout',
        description:
            'Pull-Trainingsplan für Rücken und Bizeps. Fokus auf Muskelwachstum durch Zugbewegungen.',
        category: 105,
        category_detail: DUMMY_PLAN_CATEGORIES[4],
        creator_name: 'fitnessapp',

        // Reihenfolge der Übungen
        order: [2, 11, 13],

        exercises: [
            DUMMY_EXERCISES[1],  // Klimmzüge (Rücken)
            DUMMY_EXERCISES[10], // Reverse Flys (oberer Rücken)
            DUMMY_EXERCISES[12], // Bizeps Curls (Bizeps)
        ],
    }


];