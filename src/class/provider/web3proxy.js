export class ProxyProvider {
  constructor(sendAsync, stateProvider) {
    this.configProvider = configProvider;
    this.sendAsync = sendAsync;
  }

  send(payload) {
    let result = null;
    switch (payload.method) {
      case 'eth_accounts':
        // read from localStorage
        selectedAddress = this.stateProvider.getState().selectedAddress;
        result = selectedAddress ? [selectedAddress] : [];
        break;

      case 'eth_coinbase':
        // read from localStorage
        selectedAddress = this.stateProvider.getState().selectedAddress;
        result = selectedAddress || null;
        break;

      case 'eth_uninstallFilter':
        self.sendAsync(payload, noop);
        result = true;
        break;

      case 'net_version':
        const networkVersion = this.stateProvider.getState().networkVersion;
        result = networkVersion || null;
        break;
    }

    // return the result
    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result: result,
    };
  }
}
