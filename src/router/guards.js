import store from '../store';
import { getInitializedValueFromStore } from '@/utils';

// Has a wallet with a private key capable of sending funds
// Redirects to new wallet page if one does not exist
export async function privateWalletGuard(to, from, next) {
  const { accounts } = store.state;

  await getInitializedValueFromStore(accounts, 'address');

  if (!accounts.wallet) {
    next({ name: 'NewWallet' });
  } else if (accounts.wallet.isPublic) {
    next({ name: 'HomePage' });
  } else {
    next();
  }
}

// Is logged in on the identity server
export async function hasLoginGuard(to, from, next) {
  const redirectUri = {
    path: '/',
    query: {
      redirect_uri: to.fullPath,
    },
  };
  const authorizationStatus = await getInitializedValueFromStore(
    store.state.user,
    'authorizationStatus',
  );

  next(!authorizationStatus ? redirectUri : undefined);
}
