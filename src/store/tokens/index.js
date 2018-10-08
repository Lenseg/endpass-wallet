import actions from './actions';
import getters from './getters';
import mutations from './mutations';

export const state = {
  networkTokens: {},
  userTokens: {},
  prices: {},
  tokensByAddress: {},
  balancesByAddress: {},
  isLoading: false,
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
