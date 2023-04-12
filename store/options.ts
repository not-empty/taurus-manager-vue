import { GetterTree, ActionTree, MutationTree } from 'vuex';
import { optionsStore } from '~/types/optionsStore';
import { IStateQueue } from '~/types/queue';

export const state = (): optionsStore => {
  const configDefault = {
    pagination: 25,
    stateQueue: { id: '', name: 'default', groupId: '', state: 'waiting' }
  };
  const options = localStorage.getItem('pagination');
  if (options) {
    configDefault.pagination = JSON.parse(options);
  }
  const optionsState = localStorage.getItem('state');
  if (optionsState) {
    configDefault.stateQueue = JSON.parse(optionsState);
  }
  return configDefault;
};

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  pagination: state => state.pagination,
  stateQueue: function (state) {
    return state.stateQueue;
  }
};

export const mutations: MutationTree<RootState> = {
  CHANGE_PAGINATION: (state, pag: number) => (state.pagination = pag),
  CHANGE_STATE: (state, stateQueueInfo: IStateQueue) => (
    state.stateQueue = stateQueueInfo
  )
};

export const actions: ActionTree<RootState, RootState> = {
  setPagination ({ commit }, pagination: number) {
    localStorage.setItem('pagination', JSON.stringify({ pagination }));
    commit('CHANGE_PAGINATION', pagination);
  },
  setState ({ commit }, stateQueue: IStateQueue) {
    localStorage.setItem('state', JSON.stringify(
      { id: stateQueue.id, state: stateQueue.state }));
    commit('CHANGE_STATE',
      { id: stateQueue.id, state: stateQueue.state });
  },
  removeSession ({ commit }) {
    localStorage.removeItem('pagination');
    commit('CHANGE_PAGINATION', 25);
  }
};
