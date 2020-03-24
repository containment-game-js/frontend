const Engine = params => {
  return new Engine_(params)
}

class Engine_ {
  constructor(options) {
    const { players, state, actions, filter } = options
    this.players = players
    this.state = state
    this.actions = actions
    this.getState = pid => filter(this.state, pid)
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

const engine = new Engine({
  filter: (state, player) => ({ ...state }),
  actions: {
    guess(state, player, params) {},
  },
  state: init(),
  players: [
    {
      id: '56142e68-5e47-4c8e-83dd-4451c08011ae',
      team: 'red',
      spy: true,
    },
    {
      id: '8e87050f-ffa4-4b93-bf55-1bda8de98753',
      team: 'blue',
      spy: true,
    },
    {
      id: '56142e68-5e47-4c8e-83dd-4451c08011ae',
      team: 'red',
      spy: false,
    },
    {
      id: '8e87050f-ffa4-4b93-bf55-1bda8de98753',
      team: 'blue',
      spy: false,
    },
  ],
})
