import AsyncStorage from '@react-native-async-storage/async-storage';

export type Game = {
  id: string;
  name: string;
  logo: string; // emoji or short text
  material: string;
  rules: string;
  exercises: ExerciseItem[];
  createdAt: string; // ISO date string
};

export type ExerciseItem = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
};

const STORAGE_KEY = 'games';
const BALL_ROYAL_FLAG = 'ballRoyalInserted';

type LegacyStoredGames = string[];

function normalizeStoredGames(parsed: unknown): Game[] {
  if (!Array.isArray(parsed)) return [];

  const now = Date.now();

  // Legacy format: ["Chess", "Mario Kart"]
  if (parsed.every((item) => typeof item === 'string')) {
    return (parsed as LegacyStoredGames)
      .map((name, index) => ({
        id: `legacy-${index}-${now}`,
        name,
        logo: '',
        material: '',
        rules: '',
        exercises: [],
        createdAt: new Date(now).toISOString(),
      }))
      .filter((game) => game.name.trim().length > 0);
  }

  // Current format: [{ id, name, createdAt }]
  return (parsed as unknown[])
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item) => item as Partial<Game>)
    .map((game, index) => ({
      id: typeof game.id === 'string' && game.id.trim() ? game.id : `game-${index}-${now}`,
      name: typeof game.name === 'string' ? game.name : '',
      logo: typeof game.logo === 'string' ? game.logo : '',
      material: typeof game.material === 'string' ? game.material : '',
      rules: typeof game.rules === 'string' ? game.rules : '',
      exercises: normalizeExercises(game.exercises, now),
      createdAt: typeof game.createdAt === 'string' ? game.createdAt : new Date(now).toISOString(),
    }))
    .filter((game) => game.name.trim().length > 0);
}

async function readGames(): Promise<Game[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as unknown;
    const normalized = normalizeStoredGames(parsed);
    return await ensureBallRoyalInserted(normalized);
  } catch {
    return [];
  }
}

async function writeGames(games: Game[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export const gamesService = {
  getGames: readGames,

  getGame: async (id: string): Promise<Game | null> => {
    const games = await readGames();
    return games.find((g) => g.id === id) ?? null;
  },

  addGame: async (data: { name: string; logo?: string; material?: string; rules?: string; exercises?: ExerciseItem[] }): Promise<Game> => {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      const games = await readGames();
      return games[games.length - 1];
    }

    const games = await readGames();
    const now = new Date();
    const created: Game = {
      id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      name: trimmedName,
      logo: (data.logo ?? '').trim(),
      material: (data.material ?? '').trim(),
      rules: (data.rules ?? '').trim(),
      exercises: Array.isArray(data.exercises) ? data.exercises : [],
      createdAt: now.toISOString(),
    };
    const next: Game[] = [...games, created];
    await writeGames(next);
    return created;
  },

  deleteGame: async (id: string): Promise<Game[]> => {
    const games = await readGames();
    const next = games.filter((g) => g.id !== id);
    await writeGames(next);
    return next;
  },

  updateGame: async (
    id: string,
    data: { name: string; logo?: string; material?: string; rules?: string; exercises?: ExerciseItem[] }
  ): Promise<Game | null> => {
    const trimmedName = data.name.trim();
    if (!trimmedName) return null;

    const games = await readGames();
    const next = games.map((g) =>
      g.id === id
        ? {
            ...g,
            name: trimmedName,
            logo: (data.logo ?? '').trim(),
            material: (data.material ?? '').trim(),
            rules: (data.rules ?? '').trim(),
            exercises: Array.isArray(data.exercises) ? data.exercises : g.exercises,
          }
        : g
    );
    await writeGames(next);
    return next.find((g) => g.id === id) ?? null;
  },
};

function normalizeExercises(raw: unknown, now: number): ExerciseItem[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => typeof item === 'object' && item !== null)
      .map((item) => item as Partial<ExerciseItem>)
      .map((item, index) => ({
        id: typeof item.id === 'string' && item.id.trim() ? item.id : `ex-${now}-${index}`,
        title: typeof item.title === 'string' ? item.title : '',
        description: typeof item.description === 'string' ? item.description : '',
        durationMinutes: typeof item.durationMinutes === 'number' ? item.durationMinutes : 0,
        completed: typeof item.completed === 'boolean' ? item.completed : false,
      }))
      .filter((item) => item.title.trim().length > 0 || item.description.trim().length > 0);
  }

  if (typeof raw === 'string' && raw.trim()) {
    return [
      {
        id: `ex-${now}-0`,
        title: 'Übung',
        description: raw.trim(),
        durationMinutes: 5,
        completed: false,
      },
    ];
  }

  return [];
}

async function ensureBallRoyalInserted(games: Game[]): Promise<Game[]> {
  const alreadyInserted = await AsyncStorage.getItem(BALL_ROYAL_FLAG);
  if (alreadyInserted) return games;

  const exists = games.some((g) => g.name.trim().toLowerCase() === 'ball royal');
  if (exists) {
    await AsyncStorage.setItem(BALL_ROYAL_FLAG, 'true');
    return games;
  }

  const next = [...games, buildBallRoyalGame()];
  await writeGames(next);
  await AsyncStorage.setItem(BALL_ROYAL_FLAG, 'true');
  return next;
}

function buildBallRoyalGame(): Game {
  const now = new Date().toISOString();
  return {
    id: `ball-royal-${Date.now()}`,
    name: 'Ball Royal',
    logo: '👑',
    material: 'Bälle, Hütchen, Leibchen',
    rules:
      '🎯 Das Ziel\n' +
      'Eliminiere alle Royalen Spieler des gegnerischen Teams, um das Spiel zu gewinnen.\n\n' +
      '👥 Teams & Rollen\n' +
      'Zwei Teams spielen gegeneinander.\n' +
      '👑 Royale Spieler (Geheim!): Eine festgelegte, geheime Anzahl von Spielern pro Team.\n' +
      '🧑 Dorfbewohner: Alle anderen Spieler.\n\n' +
      '📜 Die Regeln für Treffer\n' +
      'Wenn ein Spieler getroffen wird, hängt die Konsequenz von seiner Rolle ab:\n' +
      '👑 Royaler Spieler: RAUS! Der Spieler ist eliminiert. Er macht 15 Hampelmänner und bestimmt heimlich einen neuen Royalen Spieler, bevor er das Feld verlässt.\n' +
      '🧑 Dorfbewohner: STRAFE! Der Spieler geht hinter das Feld, macht 15 Hampelmänner und darf sofort wieder ins Spiel zurückkehren.\n\n' +
      '⚽ Ball-Regeln\n' +
      'Fangen: Ein gefangener Ball zählt nicht als Treffer.\n' +
      'Passpflicht: Nach einem Fang muss der Ball zuerst an einen Mitspieler gepasst werden, bevor auf den Gegner geworfen werden darf.\n' +
      'Bewegung: Der Spieler, der wirft, darf nur einen Ausfallschritt machen.\n\n' +
      '🏃 Bewegung\n' +
      'Pflicht: Alle Spieler, besonders die Royalen Spieler, müssen in Bewegung bleiben, um ihre Identität zu verschleiern. Stehenbleiben ist nicht erlaubt.\n\n' +
      '🏆 Spielende\n' +
      'Das Spiel endet, sobald ein Team alle Royalen Spieler des Gegners eliminiert hat.',
    exercises: [
      {
        id: `ball-royal-ex-1-${Date.now()}`,
        title: 'Dynamisches Dehnen (Mobility)',
        description:
          "Hüftkreisen & \"World's Greatest Stretch\": Große Ausfallschritte mit Ellenbogen-Rotation zum Boden.\n" +
          'Volumen: 5 Wiederholungen pro Seite.\n' +
          'Sprunggelenks-Mobilisation: Im Stehen die Knie aktiv über die Zehenspitzen schieben, Ferse bleibt am Boden.\n' +
          'Volumen: 10 Wiederholungen pro Seite.\n' +
          'Ziel: Dynamisches Dehnen der Hüfte/Sprunggelenke und Vorbereitung auf Ausfallschritte.',
        durationMinutes: 5,
        completed: false,
      },
      {
        id: `ball-royal-ex-2-${Date.now()}`,
        title: 'Tiefe Ausfallschritte (Wurfvorbereitung)',
        description:
          'Volumen: 3 Sätze à 15 Wiederholungen.\n' +
          'Fokus: Oberkörper aufrecht halten. Hinteres Knie geht tief zum Boden.\n' +
          'Zweck: Simulation der stabilen Standphase beim kraftvollen Wurf im Ball Royal.',
        durationMinutes: 6,
        completed: false,
      },
      {
        id: `ball-royal-ex-3-${Date.now()}`,
        title: 'Side-to-Side Squats (Abduktoren)',
        description:
          'Volumen: 2 Sätze à 12 Wiederholungen pro Seite.\n' +
          'Ausführung: Breiter Stand, Gewicht von einer Seite auf die andere verlagern, Gesäß tief nach hinten schieben.\n' +
          'Zweck: Kräftigung für schnelle, laterale Ausweichbewegungen.',
        durationMinutes: 5,
        completed: false,
      },
      {
        id: `ball-royal-ex-4-${Date.now()}`,
        title: 'Hampelmänner (Technik-Check)',
        description:
          'Volumen: 2 Sätze à 15 Wiederholungen.\n' +
          'Fokus: Saubere Ausführung! Hände berühren sich über dem Kopf, Füße springen weit genug auseinander.\n' +
          'Zweck: Einschleifen des Bewegungsmusters, da 15 Wiederholungen im Spiel als Strafe fungieren.',
        durationMinutes: 4,
        completed: false,
      },
    ],
    createdAt: now,
  };
}

