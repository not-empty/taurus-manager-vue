import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { IStateQueue, IState } from "~/types/queue"

export const state = (): IState => ({
  queues: [],
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  queues: (state): IStateQueue[] => state.queues,
  queueById: (state): (id: string) => IStateQueue | undefined => (id) => {
    return state.queues.find((queue) => queue.id === id);
  }
}

export const mutations: MutationTree<RootState> = {
  CHANGE_QUEUES: (state, queue: IStateQueue) => {
    const exist = state.queues.findIndex(({ id }) => queue.id === id);

    if (exist !== -1) {
      state.queues[exist] = queue;
      return;
    }

    state.queues.push(queue);
  },
}

export const actions: ActionTree<RootState, RootState> = {
  setQueue({ commit }, queue: IStateQueue) {
    commit('CHANGE_QUEUES', {
      id: queue.id,
      name: queue.name,
      groupId: queue.groupId,
    })
  },
}
