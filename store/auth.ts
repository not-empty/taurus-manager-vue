import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { authStore } from '~/types/authStore'
import { IUser } from '~/types/user'

export const state = (): authStore => ({
  token: "",
  user: null
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  auth: state => state.token,
  user: state => state.user
}

export const mutations: MutationTree<RootState> = {
  CHANGE_TOKEN: (state, newToken: string) => (state.token = newToken),
  CHANGE_USER: (state, newUser: IUser) => (state.user = newUser),
}

export const actions: ActionTree<RootState, RootState> = {
  setToken({ commit }) {
    commit('CHANGE_NAME', 'Novo nome')
  },
}