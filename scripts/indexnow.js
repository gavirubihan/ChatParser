import https from 'https';

const HOST = 'https://chatparser.online';
const KEY = 'f74e809b40d04cc598be65123c1404ee';
const KEY_URL = `${HOST}/${KEY}.txt`;

// Endpoints for IndexNow
const ENDPOINTS = [
  'api.indexnow.org',
  'www.bing.com',
  'search.yandex.ru'
];

async function pingIndexNow(endpoint) {
  const url = `https://${endpoint}/indexnow?url=${encodeURIComponent(HOST)}&key=${KEY}&keyLocation=${encodeURIComponent(KEY_URL)}`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode === 202) {
        console.log(`\x1b[32m✓\x1b[0m Successfully notified ${endpoint}`);
        resolve(true);
      } else {
        console.warn(`\x1b[33m!\x1b[0m Failed to notify ${endpoint} (Status: ${res.statusCode})`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`\x1b[31m✗\x1b[0m Error notifying ${endpoint}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log(`\x1b[36mℹ\x1b[0m Notifying search engines via IndexNow...`);
  const promises = ENDPOINTS.map(endpoint => pingIndexNow(endpoint));
  await Promise.all(promises);
}

run().catch(err => {
  console.error('IndexNow notification failed:', err);
});
