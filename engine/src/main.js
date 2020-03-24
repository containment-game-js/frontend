// - Moteur de jeu (pure js)
// - Un front (vue.js)
// - Un serveur qui synchronise socket.io p2p (broker)
// - Un client crée la partie
//
// # Moteur
//
// - Récolte les évènements
//     - Chaque joueur autorisé qui joue ce tour-ci envoie sa requête dans le temps imparti
//     - Si il envoit pas, coup par défaut (à définir)
// - Résout les évènements
//     - Pour chaque évènement, run dans un ordre précis
//     - Broadcast nouvel état

// front
// const render : substate => html

// Moteur
// const stateToUserState: (uid, state) => JSON(subState)
class Engine {
  constructor(options) {
    const { players, state, actions } = options
    this.players = players
    this.state = state
    this.actions = actions
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

class CodeNamesEngine extends Engine {
  constructor() {
    this.state = {}
  }

  actions: {}
}

const engine = new CodeNamesEngine({
  actions: {
    guess(state, player, params) {},
  },

  players: [
    {
      id: '56142e68-5e47-4c8e-83dd-4451c08011ae',
      team: 'red',
      speaker: true,
    },
    {
      id: '8e87050f-ffa4-4b93-bf55-1bda8de98753',
      team: 'blue',
      speaker: true,
    },
    {
      id: '56142e68-5e47-4c8e-83dd-4451c08011ae',
      team: 'red',
      speaker: false,
    },
    {
      id: '8e87050f-ffa4-4b93-bf55-1bda8de98753',
      team: 'blue',
      speaker: false,
    },
  ],

  getState(state, player) {
    return { ...state }
  },
})
