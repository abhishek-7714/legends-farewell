async function request(method, url, body) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error('No internet? The campus Wi-Fi strikes again. Try once more.'), { status: 0 });
  }
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    throw Object.assign(new Error((data && data.error) || `Request failed (${res.status})`), { status: res.status });
  }
  return data;
}

export const api = {
  config: () => request('GET', '/api/config'),
  status: (voter) => request('GET', `/api/status?voter=${encodeURIComponent(voter)}`),
  load: (voter, token) => request('POST', '/api/submission/load', { voter, token }),
  submit: (payload) => request('POST', '/api/submit', payload),
};
