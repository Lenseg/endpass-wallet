<template>
  <div
    v-if="address"
    class="app-page receive-page"
  >
    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h2 class="card-header-title">Receive ETH</h2>
          </div>
          <div
            class="card-content"
            data-test="current-account"
          >
            <p>Your Active Address:</p>
            <account
              v-if="address"
              :currency="activeCurrency.name"
              :address="address"
              :balance="balance"
            />
            <token-list/>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div
          v-for="(wallet, walletAddress) in wallets"
          v-if="walletAddress !== address"
          :key="walletAddress"
          class="card app-card"
        >
          <div class="card-header">
            <h2 class="card-header-title">Receive ETH</h2>
          </div>
          <div
            class="card-content"
            data-test="account"
          >
            <account
              :currency="activeCurrency.name"
              :address="walletAddress"
              :balance="balances[walletAddress]"
            />
            <v-button
              v-if="!wallet.isPublic"
              type="button"
              name="button"
              data-test="send-button"
              @click="clickSendButton(walletAddress)"
            >
              Send ethereum
            </v-button>
            <div class="token-list-container">
              <token-list
                v-if="tokens[walletAddress]"
                :tokens="tokens[walletAddress]"
              />
              <v-spinner
                v-else-if="!isTokensLoaded(walletAddress)"
                :is-loading="!isTokensLoaded(walletAddress)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="container">
        <div class="card app-card">
          <div class="card-header">
            <h2 class="card-header-title">Incoming Payment History</h2>
          </div>
          <div class="card-content">
            <ul
              v-if="incomingTransactions.length"
              class="transactions"
            >
              <li
                v-for="transaction in incomingTransactions"
                :key="transaction.hash"
              >
                <app-transaction :transaction="transaction" />
              </li>
            </ul>
            <v-spinner
              v-else-if="isLoading"
              :is-loading="isLoading"
            />
            <p v-else>This account has no transactions.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import web3 from '@/utils/web3';
import { Token, ERC20Token } from '@/class';
import TokenList from '@/components/TokenList';
import VButton from '@/components/ui/form/VButton';
import AppTransaction from '@/components/Transaction';
import Account from '@/components/Account';
import VSpinner from '@/components/ui/VSpinner';

export default {
  name: 'ReceivePage',
  data() {
    return {
      isLoading: true,
      balances: {},
      tokens: {},
    };
  },
  computed: {
    ...mapState({
      activeCurrency: state => state.web3.activeCurrency,
      address: state =>
        state.accounts.address &&
        state.accounts.address.getChecksumAddressString(),
      wallets: state => state.accounts.wallets,
      wallet: state => state.accounts.wallet,
      activeNetId: state => state.web3.activeNet.id,
    }),
    ...mapGetters('accounts', {
      balance: 'balance',
    }),
    ...mapGetters('transactions', ['incomingTransactions']),
  },
  watch: {
    address: {
      handler: 'getHistory',
      immediate: true,
    },
    wallets: {
      handler() {
        this.getTokensLists();
        this.getBalances();
      },
      immediate: true,
    },
    wallet: {
      handler() {
        this.updateTransactionHistory();
      },
      immediate: true,
    },
    activeNetId: {
      handler: 'getBalances',
      immediate: true,
    },
  },
  methods: {
    ...mapActions('transactions', ['updateTransactionHistory']),
    ...mapActions('tokens', [
      'getTokensWithBalanceByAddress',
      'getTokensBalancesByAddress',
    ]),
    ...mapActions('accounts', ['selectWallet']),
    async clickSendButton(address) {
      this.selectWallet(address);
      this.$router.push('/send');
    },
    isTokensLoaded(address) {
      return typeof this.tokens[address] !== 'undefined';
    },
    async getHistory() {
      if (!this.address) {
        this.isLoading = false;
        return;
      }
      this.isLoading = true;
      await this.updateTransactionHistory();
      this.isLoading = false;
    },
    getBalances() {
      Object.keys(this.wallets).forEach(async address => {
        const balance = await web3.eth.getBalance(address);
        this.$set(this.balances, address, web3.utils.fromWei(balance));
      });
    },
    getTokensLists() {
      Object.keys(this.wallets).forEach(this.getTokensList);
    },
    async getTokensList(address) {
      const tokens = await this.getTokensWithBalanceByAddress({ address });

      const balances = await this.getTokensBalancesByAddress({
        tokens: tokens.map(token => new ERC20Token(token.address)),
        address,
      });
      this.$set(
        this.tokens,
        address,
        tokens.map(token => {
          const tokenInstance = new Token(token);
          tokenInstance.balance = balances[token.address];
          return tokenInstance;
        }),
      );
    },
  },
  created() {},
  components: {
    Account,
    AppTransaction,
    VSpinner,
    TokenList,
    VButton,
  },
};
</script>

<style lang="scss">
.transactions {
  max-width: 700px;
}
.token-list-container {
  min-height: 30px;
  position: relative;
}
</style>
