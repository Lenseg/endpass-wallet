import LedgerTransport from '@ledgerhq/hw-transport-u2f'; // for browser
import Eth from '@ledgerhq/hw-app-eth';
import Tx from 'ethereumjs-tx';
import { NotificationError } from '@/class';
import { HARDWARE_DERIVIATION_PATH } from '@/constants';
import web3 from '@/utils/web3';

const { sha3, toHex } = web3.utils;

export default class LedgerWallet {
  static async getNextWallets({ offset = 0, limit = 10 }) {
    let transport;

    try {
      transport = await LedgerTransport.create();
      const eth = new Eth(transport);

      const addressesPromises = [...Array(limit)]
        .map((_, i) => `${HARDWARE_DERIVIATION_PATH}${offset + i}`)
        .map(path => eth.getAddress(path, false, false));

      const payload = await Promise.all(addressesPromises);

      return payload.map(({ address }) => address);
    } catch (error) {
      console.log(error);
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    } finally {
      if (transport && transport.close) {
        await transport.close().catch(console.log);
      }
    }
  }

  static async sign(message, index) {
    let transport;

    try {
      transport = await LedgerTransport.create();
      const eth = new Eth(transport);

      const prefixedMessage = `\x19Ethereum Signed Message:\n${
        message.length
      }${message}`;
      const messageHash = sha3(prefixedMessage);

      const { r, s, v: vInt } = await eth.signPersonalMessage(
        `${HARDWARE_DERIVIATION_PATH}${index}`,
        Buffer.from(message).toString('hex'),
      );

      let vRaw = (vInt - 27).toString(16);

      if (vRaw.length < 2) {
        vRaw = `0${vRaw}`;
      }

      const v = vRaw === 27 || vRaw === 28 ? toHex(vInt) : toHex(vInt + 27);

      const signature = `0x${r}${s}${vRaw}`;

      return {
        message,
        messageHash,
        signature,
        r: `0x${r}`,
        s: `0x${s}`,
        v: `0x${v}`,
      };
    } catch (error) {
      console.log(error);
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    } finally {
      if (transport && transport.close) {
        await transport.close().catch(console.log);
      }
    }
  }

  static async signTransaction(transaction, index) {
    let transport;

    try {
      transport = await LedgerTransport.create();
      const eth = new Eth(transport);
      const tempTx = new Tx(transaction);

      const payload = await eth.signTransaction(
        `${HARDWARE_DERIVIATION_PATH}${index}`,
        `${tempTx.serialize().toString('hex')}`,
      );

      if (!payload) {
        throw new Error('Bad Trezor response');
      }

      const sign = {
        r: payload.r,
        s: payload.s,
        v: payload.v,
      };
      const tx = new Tx({ ...transaction, ...sign });

      return `0x${tx.serialize().toString('hex')}`;
    } catch (error) {
      console.log(error);
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    } finally {
      if (transport && transport.close) {
        await transport.close().catch(console.log);
      }
    }
  }
}
