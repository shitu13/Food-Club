const KEY = "food-club-token";
let memoryToken = null;

export function getToken() {
  if (memoryToken) return memoryToken;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  memoryToken = token;
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // Storage is blocked: the session lasts until the page is closed.
  }
}

export function clearToken() {
  memoryToken = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing was stored.
  }
}
