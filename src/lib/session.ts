const SESSION_KEY = 'where-scer-account-code'

function getSessionCode() {
  return typeof window === 'undefined'
    ? null
    : localStorage.getItem(SESSION_KEY)
}

function setSessionCode(code: string) {
  localStorage.setItem(SESSION_KEY, code)
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export { clearSession, getSessionCode, setSessionCode }
