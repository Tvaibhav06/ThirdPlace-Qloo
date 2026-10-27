// scripts/phase0-thirdplace-probe.mjs
// Phase 0 probe script for live Qloo API verification, candidate host evaluation,
// 5 media seed domain tests, and 20 Chicago third-place venue nominee resolution.

import fs from 'node:fs';

const CANDIDATE_HOSTS = [
  'https://hackathon.api.qloo.com',
  'https://api.qloo.com'
];

const SEED_DOMAINS = [
  { domain: 'book', query: 'Dune', type: 'urn:entity:book' },
  { domain: 'videogame', query: 'Baldur\'s Gate 3', type: 'urn:entity:videogame' },
  { domain: 'artist', query: 'Alvvays', type: 'urn:entity:artist' },
  { domain: 'movie', query: 'Past Lives', type: 'urn:entity:movie' },
  { domain: 'tv_show', query: 'The Bear', type: 'urn:entity:tv_show' }
];

const NOMINEE_VENUES = [
  { name: 'Reckless Records', neighborhood: 'wicker_park', subtype: 'record_store' },
  { name: 'Myopic Books', neighborhood: 'wicker_park', subtype: 'bookstore' },
  { name: 'The Wormhole Coffee', neighborhood: 'wicker_park', subtype: 'cafe' },
  { name: 'Snakes & Lattes Chicago', neighborhood: 'logan_square', subtype: 'board_game_cafe' },
  { name: 'City Lit Books', neighborhood: 'logan_square', subtype: 'bookstore' },
  { name: 'Logan Theatre', neighborhood: 'logan_square', subtype: 'cinema' },
  { name: 'Cafe Mustache', neighborhood: 'logan_square', subtype: 'cafe' },
  { name: 'Thalia Hall', neighborhood: 'pilsen', subtype: 'community_space' },
  { name: 'Pilsen Community Books', neighborhood: 'pilsen', subtype: 'bookstore' },
  { name: 'Kristoffer\'s Cakes', neighborhood: 'pilsen', subtype: 'cafe' },
  { name: '57th Street Books', neighborhood: 'hyde_park', subtype: 'bookstore' },
  { name: 'Seminary Co-op Bookstore', neighborhood: 'hyde_park', subtype: 'bookstore' },
  { name: 'Medici on 57th', neighborhood: 'hyde_park', subtype: 'cafe' },
  { name: 'Unabridged Bookstore', neighborhood: 'lakeview', subtype: 'bookstore' },
  { name: 'Music Box Theatre', neighborhood: 'lakeview', subtype: 'cinema' },
  { name: 'Dime Stories', neighborhood: 'west_loop', subtype: 'bookstore' },
  { name: 'Sawada Coffee', neighborhood: 'west_loop', subtype: 'cafe' },
  { name: 'Chinatown Public Library', neighborhood: 'chinatown', subtype: 'community_space' },
  { name: 'Ping Tom Memorial Park', neighborhood: 'chinatown', subtype: 'park' },
  { name: 'Lincoln Park Conservatory', neighborhood: 'lincoln_park', subtype: 'park' }
];

async function probeHost(host, apiKey) {
  process.stdout.write(`Testing candidate host: ${host}... `);
  try {
    const res = await fetch(`${host}/search?query=Dune&types=urn:entity:book&take=1`, {
      headers: { 'X-Api-Key': apiKey, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      console.log(`[PASS] (Status: ${res.status})`);
      return true;
    }
    console.log(`[FAIL] (Status: ${res.status})`);
    return false;
  } catch (err) {
    console.log(`[ERROR] (${err.message})`);
    return false;
  }
}

async function runPhase0Probe() {
  console.log('================================================================');
  console.log('ThirdPlace Squad: Phase 0 Qloo Access & Coverage Probe (Gate G0)');
  console.log('================================================================');

  const apiKey = process.env.QLOO_API_KEY;
  if (!apiKey) {
    console.warn('[NOTICE] QLOO_API_KEY is not set in environment.');
    console.log('To execute against live Qloo, export QLOO_API_KEY or configure .env.local.');
    console.log('Evaluating simulated pass/narrow/stop gates based on nominee checklist:');
    console.log(`Nominee venues: ${NOMINEE_VENUES.length} spanning 8 Chicago neighborhoods.`);
    console.log('Media domains ready: book, videogame, artist, movie, tv_show.');
    console.log('================================================================');
    return;
  }

  let activeHost = null;
  for (const host of CANDIDATE_HOSTS) {
    const success = await probeHost(host, apiKey);
    if (success && !activeHost) activeHost = host;
  }

  if (!activeHost) {
    console.error('[CRITICAL] Neither host responded successfully with the current QLOO_API_KEY.');
    console.error('Stop condition triggered: Check forum discussions for key delivery or key mismatch.');
    return;
  }

  console.log(`\nActive Qloo Host Confirmed: ${activeHost}`);
  console.log('\n--- Probing 5 Media Seed Domains ---');
  for (const item of SEED_DOMAINS) {
    try {
      const url = `${activeHost}/search?query=${encodeURIComponent(item.query)}&types=${item.type}&take=1`;
      const res = await fetch(url, { headers: { 'X-Api-Key': apiKey, 'Accept': 'application/json' } });
      const data = await res.json();
      const first = data.results?.[0];
      console.log(`[DOMAIN ${item.domain}] "${item.query}" -> ${first ? `${first.name} (UUID: ${first.id || first.entity_id})` : 'UNRESOLVED'}`);
    } catch (e) {
      console.log(`[DOMAIN ${item.domain}] Error: ${e.message}`);
    }
  }

  console.log('\n--- Probing 20 Chicago Third-Place Venue Nominees ---');
  let resolvedCount = 0;
  const neighborhoods = new Set();
  const subtypes = new Set();

  for (const venue of NOMINEE_VENUES) {
    try {
      const url = `${activeHost}/search?query=${encodeURIComponent(venue.name)}&types=urn:entity:place&take=1`;
      const res = await fetch(url, { headers: { 'X-Api-Key': apiKey, 'Accept': 'application/json' } });
      const data = await res.json();
      const first = data.results?.[0];
      if (first) {
        resolvedCount++;
        neighborhoods.add(venue.neighborhood);
        subtypes.add(venue.subtype);
        console.log(`[RESOLVED] ${venue.name} (${venue.neighborhood}) -> UUID: ${first.id || first.entity_id}`);
      } else {
        console.log(`[UNRESOLVED] ${venue.name} (${venue.neighborhood})`);
      }
    } catch (e) {
      console.log(`[ERROR] ${venue.name}: ${e.message}`);
    }
  }

  console.log('\n================================================================');
  console.log('GATE G0 VERIFICATION SUMMARY:');
  console.log(`Resolved Venues: ${resolvedCount} / ${NOMINEE_VENUES.length}`);
  console.log(`Neighborhoods: ${neighborhoods.size} / 8`);
  console.log(`Subtypes: ${subtypes.size}`);

  if (resolvedCount >= 18 && neighborhoods.size >= 4 && subtypes.size >= 3) {
    console.log('VERDICT: PROCEED (Gate G0 Passed)');
  } else if (resolvedCount >= 12) {
    console.log('VERDICT: NARROW (Gate G0 Narrowed to best-covered neighborhoods)');
  } else {
    console.log('VERDICT: STOP (Gate G0 Failed - Insufficient place coverage)');
  }
  console.log('================================================================');
}

runPhase0Probe();
