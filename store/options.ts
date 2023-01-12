import { GetterTree, ActionTree, MutationTree } from 'vuex';
import { optionsStore } from '~/types/optionsStore';

export const state = (): optionsStore => {
  const options = localStorage.getItem('pagination');
  if (options) {
    return JSON.parse(options);
  }
  return {
    pagination: 25
  };
};

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  pagination: state => state.pagination
};

export const mutations: MutationTree<RootState> = {
  CHANGE_PAGINATION: (state, pag: number) => (state.pagination = pag)
};

export const actions: ActionTree<RootState, RootState> = {
  setPagination ({ commit }, pagination: number) {
    localStorage.setItem('pagination', JSON.stringify({ pagination }));
    commit('CHANGE_PAGINATION', pagination);
  },
  removeSession ({ commit }) {
    localStorage.removeItem('pagination');
    commit('CHANGE_PAGINATION', 25);
  }
};
