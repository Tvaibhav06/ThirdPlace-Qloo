// lib/presets.ts
// Three 1-click Chicago presets for judge testing with zero login or setup.

export const DEFAULT_PRESETS = [
  {
    id: 'preset_a',
    name: 'Preset A: New in Logan Square',
    mode: 'solo' as const,
    description: 'Solo newcomer building a 3-slot weekly third-place routine under a $35 weekly cap, benchmarked against BLS $58.17/week spending.',
    data: {
      origin: 'logan_square',
      weeklyCapCents: 3500,
      maxOneWayMinutes: 25,
      preferredMode: 'bike',
      slots: [
        { day: 'tue', start: '18:00', end: '20:00' },
        { day: 'thu', start: '18:30', end: '21:00' },
        { day: 'sat', start: '14:00', end: '17:00' }
      ],
      seeds: [
        { text: 'Dune', domain: 'book' },
        { text: 'Baldur\'s Gate 3', domain: 'videogame' },
        { text: 'Alvvays', domain: 'artist' }
      ],
      vibes: ['cozy', 'indie']
    }
  },
  {
    id: 'preset_b',
    name: 'Preset B: Three friends, three budgets',
    mode: 'squad' as const,
    description: 'Squad of 3 friends with asymmetrical budget caps ($35, $25, $18). Exercises budget cap breach, P0 Blind Cap masking, and 2-stop micro-combo replanning.',
    data: {
      window: { day: 'tue', start: '18:30', end: '21:30' },
      maxOneWayMinutes: 30,
      options: { blindCapMode: true, scenario: 'base', contingencyBp: 1000 },
      members: [
        {
          alias: 'M1',
          label: 'Alex (Wicker Park)',
          origin: 'wicker_park',
          mode: 'cta_rail',
          capCents: 3500,
          filters: [],
          seeds: [
            { text: 'Dune', domain: 'book' },
            { text: 'Baldur\'s Gate 3', domain: 'videogame' }
          ]
        },
        {
          alias: 'M2',
          label: 'Taylor (Logan Square)',
          origin: 'logan_square',
          mode: 'bike',
          capCents: 2500,
          filters: [],
          seeds: [
            { text: 'Alvvays', domain: 'artist' },
            { text: 'Past Lives', domain: 'movie' }
          ]
        },
        {
          alias: 'M3',
          label: 'Jordan (West Loop)',
          origin: 'west_loop',
          mode: 'walk',
          capCents: 1800,
          filters: ['wheelchair_accessible'],
          seeds: [
            { text: 'The Bear', domain: 'tv_show' },
            { text: 'Kendrick Lamar', domain: 'artist' }
          ]
        }
      ]
    }
  },
  {
    id: 'preset_c',
    name: 'Preset C: Far apart',
    mode: 'squad' as const,
    description: 'Geographically spread squad (Hyde Park, Logan Square, Pilsen) with 30m travel limit. Exercises commute fairness breach and neighborhood shift.',
    data: {
      window: { day: 'sat', start: '13:00', end: '16:00' },
      maxOneWayMinutes: 30,
      options: { blindCapMode: true, scenario: 'base', contingencyBp: 1000 },
      members: [
        {
          alias: 'M1',
          label: 'Sam (Hyde Park)',
          origin: 'hyde_park',
          mode: 'cta_rail',
          capCents: 2800,
          filters: [],
          seeds: [{ text: 'Severance', domain: 'tv_show' }]
        },
        {
          alias: 'M2',
          label: 'Casey (Logan Square)',
          origin: 'logan_square',
          mode: 'bike',
          capCents: 2800,
          filters: [],
          seeds: [{ text: 'Radiohead', domain: 'artist' }]
        },
        {
          alias: 'M3',
          label: 'Morgan (Pilsen)',
          origin: 'pilsen',
          mode: 'walk',
          capCents: 2800,
          filters: [],
          seeds: [{ text: 'Pachinko', domain: 'book' }]
        }
      ]
    }
  }
];
