// api/_firestoreRest.js
// Shared helper for the serverless share-preview pages (crew-page.js,
// invite-page.js) and OG-image routes (og/crew.jsx, og/game.jsx).
//
// Leading underscore keeps Vercel from treating this as its own route.
//
// Reads Firestore over its plain REST API — no service account, no
// firebase-admin (which needs the Node runtime; these functions run on the
// Edge runtime for fast cold starts). Unauthenticated REST reads are
// governed by the exact same firestore.rules as an app client would get:
// a public crew/any game returns data, a private crew returns 403. That
// 403 is itself meaningful (see fetchPublicDoc's `private` status) — it
// means the id is real but the rules correctly refused it, not that the
// link is broken.
const PROJECT_ID = 'field-heatmap';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function unwrapValue(value) {
  if (value == null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue, 10);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(unwrapValue);
  if ('mapValue' in value) return unwrapFields(value.mapValue.fields || {});
  return null;
}

function unwrapFields(fields) {
  const out = {};
  for (const key of Object.keys(fields || {})) {
    out[key] = unwrapValue(fields[key]);
  }
  return out;
}

/**
 * Fetch one Firestore document via the public REST API.
 * @returns {Promise<{status:'ok', data:object}|{status:'not_found'|'private'|'error'}>}
 */
export async function fetchPublicDoc(collectionPath, docId) {
  if (!docId) return { status: 'not_found' };
  try {
    const res = await fetch(`${BASE}/${collectionPath}/${encodeURIComponent(docId)}`);
    if (res.status === 200) {
      const json = await res.json();
      return { status: 'ok', data: { id: docId, ...unwrapFields(json.fields || {}) } };
    }
    if (res.status === 404) return { status: 'not_found' };
    if (res.status === 403) return { status: 'private' };
    return { status: 'error' };
  } catch (e) {
    console.error('fetchPublicDoc error:', collectionPath, docId, e);
    return { status: 'error' };
  }
}

/**
 * Run a simple structured query (single equality filter, ordered, limited)
 * via Firestore's REST API — used for the field-photos lookup a game's
 * share preview needs (the games doc rarely carries its own imageUrl).
 * @returns {Promise<object|null>} the first matching document's fields, or null
 */
export async function queryFirstMatch(collectionPath, whereField, whereValue, orderByField) {
  try {
    const body = {
      structuredQuery: {
        from: [{ collectionId: collectionPath }],
        where: {
          fieldFilter: {
            field: { fieldPath: whereField },
            op: 'EQUAL',
            value: { stringValue: whereValue },
          },
        },
        orderBy: orderByField ? [{ field: { fieldPath: orderByField }, direction: 'DESCENDING' }] : undefined,
        limit: 1,
      },
    };
    const res = await fetch(`${BASE}:runQuery`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const first = Array.isArray(json) ? json.find((r) => r.document) : null;
    if (!first?.document) return null;
    return unwrapFields(first.document.fields || {});
  } catch (e) {
    console.error('queryFirstMatch error:', collectionPath, whereField, whereValue, e);
    return null;
  }
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
