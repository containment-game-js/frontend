let players = []

socket.on('connect', ({ id }) => {
  players.push(id)
})

const gatherActions = (actions) => {
  actions.forEach(({ action, ...params }) => {
    engine.run(action, pid, params)
    players.forEach(id => {
      const state = engine.getState(id)
      broadcast(id, { state })
    })
  })
}
