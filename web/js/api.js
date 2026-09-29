export async function api(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    let message = `请求失败（${response.status}）`;
    let code = '';
    try {
      const body = await response.json();
      message = body.error || message;
      code = body.code || '';
    } catch (_) {}
    // status/code 让调用方区分“词太少”“未登录”等情形，而不是去解析提示文案。
    const error = new Error(message);
    error.status = response.status;
    error.code = code;
    throw error;
  }
  return response.json();
}

export function postJSON(url, data) {
  return api(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
