import https from 'https';

const HOST = 'chatparser.online';
const BASE_URL = `https://${HOST}`;
const KEY = 'f74e809b40d04cc598be65123c1404ee';
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`;

// IndexNow standard recommends using one principal endpoint.
// Others (Bing, Yandex, etc.) will receive the data automatically.
const ENDPOINT = 'api.indexnow.org';

const data = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: [
    `${BASE_URL}/`,
    `${BASE_URL}/about`,
    `${BASE_URL}/privacy`,
    `${BASE_URL}/chat`
  ]
});

const options = {
  hostname: ENDPOINT,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data)
  }
};

function submitIndexNow() {
  console.log(`\x1b[36mℹ\x1b[0m Notifying search engines via IndexNow (Batch POST)...`);
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`\x1b[32m✓\x1b[0m Successfully notified ${ENDPOINT} (Status: ${res.statusCode})`);
          resolve(true);
        } else {
          console.warn(`\x1b[33m!\x1b[0m Failed to notify ${ENDPOINT} (Status: ${res.statusCode})`);
          console.warn(`  Response: ${responseBody}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`\x1b[31m✗\x1b[0m Error notifying ${ENDPOINT}:`, err.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

submitIndexNow().catch(err => {
  console.error('IndexNow notification failed:', err);
});
