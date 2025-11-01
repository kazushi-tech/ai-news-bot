// Usage: npm run send -- https://example.com/a https://example.com/b
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const pat = process.env.GITHUB_PAT;


if (!owner || !repo || !pat) {
console.error('Missing env: GITHUB_OWNER, GITHUB_REPO, GITHUB_PAT');
process.exit(1);
}


const urls = process.argv.slice(2).filter(Boolean);
if (!urls.length) {
console.error('Pass at least one URL');
process.exit(1);
}


async function dispatch(url) {
const endpoint = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
const res = await fetch(endpoint, {
method: 'POST',
headers: {
'Authorization': `Bearer ${pat}`,
'Accept': 'application/vnd.github+json',
'X-GitHub-Api-Version': '2022-11-28',
'Content-Type': 'application/json'
},
body: JSON.stringify({ event_type: 'summarize_url', client_payload: { url } })
});
if (!res.ok) throw new Error(`dispatch failed: ${res.status} ${await res.text()}`);
}


for (const u of urls) {
await dispatch(u);
console.log('dispatched:', u);
}