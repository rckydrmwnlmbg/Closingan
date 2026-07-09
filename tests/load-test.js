import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
};

const WEBHOOK_URL = __ENV.API_URL || 'http://localhost:3000/webhook/fonnte';
const SIGNATURE = __ENV.SIGNATURE || 'dummy_signature';

export default function () {
  const payload = JSON.stringify({
    device: "081234567890",
    sender: `0819999${__VU % 100}`, // Ensure some sender variation
    message: "Halo, saya tertarik dengan mobil tipe X",
    text: "Halo, saya tertarik dengan mobil tipe X",
    id: `msg_${__VU}_${__ITER}`,
    status: "received"
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'x-fonnte-signature': SIGNATURE,
    },
  };

  const res = http.post(WEBHOOK_URL, payload, params);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
