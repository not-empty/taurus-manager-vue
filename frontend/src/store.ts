import { reactive, readonly } from 'vue';

interface UserState {
  login: string;
  role: string;
}

const userState = reactive<UserState>({
  login: '',
  role: '',
});

export function initializeStore() {
  userState.login = sessionStorage.getItem('user-login') ?? '';
  userState.role = sessionStorage.getItem('user-role') ?? '';
}

export const store = readonly({
  user: userState,
});
