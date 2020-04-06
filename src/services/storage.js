import uuid from 'uuid/v4'

const getUid = () => {
  const uid = localStorage.getItem('uid')
  if (uid) {
    return uid
  } else {
    const newId = uuid()
    localStorage.setItem('uid', newId)
    return newId
  }
}

const getUsername = () => {
  return localStorage.getItem('username')
}

const setUsername = username => {
  localStorage.setItem('username', username)
}

export { getUid, getUsername, setUsername }
