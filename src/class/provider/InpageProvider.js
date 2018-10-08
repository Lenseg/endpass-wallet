import { EventEmitter } from '@/class';
import { INPAGE_EVENT } from '@/constants';

export default class InpageProvider {
  constructor(eventEmitter) {
    if (!eventEmitter instanceof EventEmitter)
      throw new Error("Event emitter isn't provided");
    eventEmitter.on(INPAGE_EVENT.SETTINGS, payload => {
      this.updateSettings(payload);
    });
    eventEmitter.on(INPAGE_EVENT.RESPONSE, payload => {
      this.handleResponse(payload);
    });
    this.eventEmitter = eventEmitter;
    this.pendingRequestsHandlers = {};
    this.settings = {};
  }

  handleResponse({ error, result }) {
    const resultClone = Object.assign({}, result);
    resultClone.id = resultClone.id.replace(/^ep_/, '');
    this.pendingRequestsHandlers[resultClone.id](error, result);
    delete this.pendingRequestsHandlers[resultClone.id];
  }

  updateSettings({ selectedAddress, networkVersion }) {
    if (typeof selectedAddress !== 'undefined') {
      this.settings.selectedAddress = selectedAddress;
    }

    if (typeof networkVersion !== 'undefined') {
      this.settings.networkVersion = networkVersion;
    }
  }

  sendAsync(payload, callback) {
    const payloadClone = Object.assign({}, payload);
    this.pendingRequestsHandlers[payload.id] = callback;
    payloadClone.id = 'ep_' + payload.id;
    this.eventEmitter.emit(INPAGE_EVENT.REQUEST, payloadClone);
  }

  isConnected() {
    return true;
  }

  send(payload) {
    let result = null;
    switch (payload.method) {
      case 'eth_accounts':
        result = this.settings.selectedAddress
          ? [this.settings.selectedAddress]
          : [];
        break;

      case 'eth_coinbase':
        result = this.settings.selectedAddress || null;
        break;

      case 'eth_uninstallFilter':
        this.sendAsync(payload, () => {});
        result = true;
        break;

      case 'net_version':
        result = this.settings.networkVersion || null;
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