const isLoggedIn = state => !!state.email;

const isLoggedOut = state =>
  !state.authorizationStatus &&
  state.authorizationStatus !== state.prevAuthorizationStatus;

export default {
  isLoggedIn,
  isLoggedOut,
};
