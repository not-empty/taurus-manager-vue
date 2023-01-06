import { GetterTree, ActionTree, MutationTree } from 'vuex';
import { IGroup, IStateGroup, IState } from '~/types/group';

export const state = (): IState => ({
  groups: []
});

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  groups: (state): IStateGroup[] => state.groups,
  groupById: (state): (id: string) => IStateGroup | undefined => (id) => {
    return state.groups.find(group => group.id === id);
  }
};

export const mutations: MutationTree<RootState> = {
  CHANGE_GROUPS: (state, group: IStateGroup) => {
    const exist = state.groups.findIndex(({ id }) => group.id === id);

    if (exist !== -1) {
      state.groups[exist] = group;
      return;
    }

    state.groups.push(group);
  }
};

export const actions: ActionTree<RootState, RootState> = {
  setGroups ({ commit }, group: IGroup) {
    commit('CHANGE_GROUPS', {
      id: group.id,
      name: group.name
    });
  }
};
