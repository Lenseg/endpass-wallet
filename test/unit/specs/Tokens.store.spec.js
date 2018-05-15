import Vue from 'vue'
import testAction from './ActionTestingHelper'
import tokens from '../../../src/store/tokens/tokens'
import axios from 'axios'
import moxios from 'moxios'
import Web3 from 'web3'
import TokenTracker from 'eth-token-tracker'


localStorage.setItem('tokens', JSON.stringify([{
      address: '0x0'
}]));

let stateInstance = tokens.state();

describe('tokens', () => {
  it('it should get tokens from localStorage', () => {
    expect(stateInstance.savedTokens.length).toBe(1);
    expect(stateInstance.savedTokens[0].address).toBe('0x0');
  })
  it('correctly gets tokens to watch', () => {
    stateInstance.activeTokens = [{
      address: '0x1'
    }];
    expect(tokens.getters.tokensToWatch(stateInstance).length).toBe(2);
  })
  it ('saves token to watch storage', () => {
    tokens.mutations.saveTokenToWatchStorage(stateInstance, { address : '0x2'})
    expect(stateInstance.savedTokens.length).toBe(2);
    expect(JSON.parse(localStorage.getItem('tokens')).length).toBe(2);
  })
  it ('saves Tokens', () => {
    tokens.mutations.saveTokens(stateInstance, [1,2,3]);
    expect(stateInstance.activeTokens.length).toBe(3);
  })
  it ('saves Interval' , () => {
    tokens.mutations.saveInterval(stateInstance, 1);
    expect(stateInstance.tokensSubscription).toBe(1);
  });
  it ('saves Subscription' , () => {
    tokens.mutations.saveSubscription(stateInstance, 1);
    expect(stateInstance.tokensSerializeInterval).toBe(1);
  });
  it('adds Token To Subscribtion', () => {
    testAction(tokens.actions.addTokenToSubscribtion, null, {
      rootState: {
        accounts: {
          activeAccount : {
            getAddressString() {
              return '0x0'
            }
          }
        }
      },
      state : {
        savedTokens : stateInstance.savedTokens,
        tokensSubscription: {
          count: 0,
          add () {
            this.count +1;
          }
        }
      }
    }, [
      { type: 'saveTokenToWatchStorage' }
    ],[]);
  })
  it('gets non zero tokens', () => {
    testAction(tokens.actions.getNonZeroTokens, null, {
      rootState: {
        accounts: {
          activeAccount : {
            getAddressString() {
              return '0x0'
            }
          }
        }
      }
    }, [
      { type: 'saveTokens' }
    ],[]);
    moxios.wait(() => {
      let request = moxios.requests.mostRecent()
      request.respondWith({
        status: 200,
        response: [{
          id: '1'
        }, {
          id: '2'
        }]
      })
    })
  })
  it('creates Token Subscribtion', () => {
    const Timeout = setTimeout(function(){}, 0).constructor;
    testAction(tokens.actions.createTokenSubscribtion, null, {
      rootState: {
        accounts: {
          activeAccount : {
            getAddressString() {
              return '0x0'
            }
          }
        },
        web3: {
          web3: new Web3 ('https://mainnet.infura.io/')
        }
      },
      getters: {
        tokensToWatch: []
      },
      state : {
        savedTokens : stateInstance.savedTokens,
        activeTokens : stateInstance.activeTokens,
        tokensSubscription: {
          count: 0,
          add () {
            this.count +1;
          }
        }
      }
    }, [
      { type: 'saveInterval' },
      { type: 'saveSubscription' }
    ],[]);
  })
})