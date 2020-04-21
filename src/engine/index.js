const Engine = params => {
  return new Engine_(params)
}

class Engine_ {
  constructor(options) {
    const { players, state, actions, filter, locale } = options
    this.players = players
    this.state = state
    this.actions = actions
    this.locale = locale
    this.getState = function (pid) {
      const player = this.players.find(({ id }) => id === pid)
      return filter(this.state, player, this.players)
    }
  }

  dump() {
    const { state, players, locale } = this
    return JSON.stringify({ state, players, locale })
  }

  run(action, pid, params) {
    const { players, state, actions } = this
    const player = players.find(({ id }) => id === pid)
    const act = actions[action]
    if (act instanceof Function) {
      this.state = act(state, player, params)
      return this.state
    } else {
      throw new Error(`${action} does not exist as a function.`)
    }
  }
}

export { Engine }
