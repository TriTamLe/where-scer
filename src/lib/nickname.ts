const MAX_NICKNAME_WORDS = 10

function nicknameWordCount(nickname: string) {
  const normalized = nickname.trim()
  return normalized ? normalized.split(/\s+/).length : 0
}

function isNicknameWithinWordLimit(nickname: string) {
  return nicknameWordCount(nickname) <= MAX_NICKNAME_WORDS
}

export { isNicknameWithinWordLimit, MAX_NICKNAME_WORDS, nicknameWordCount }
