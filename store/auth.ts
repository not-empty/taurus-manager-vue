import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { authStore } from '~/types/authStore'
import { ISession } from '~/types/session'
import { IUser } from '~/types/user'

export const state = (): authStore => {
  const session = localStorage.getItem('session')
  if (session) {
    return JSON.parse(session)
  }
  return {
    token: "",
    user: null
  }
}

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
  setSession({ commit }, session: ISession) {
    localStorage.setItem('session', JSON.stringify(session));
    commit('CHANGE_TOKEN', session.token)
    commit('CHANGE_USER', session.user)
  },
  removeSession({commit}) {
    commit('CHANGE_TOKEN', "")
    commit('CHANGE_USER', null)
  }
}