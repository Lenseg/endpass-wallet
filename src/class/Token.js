import web3 from 'web3';

export class Token {
  constructor({ address, decimals, logo, name, symbol, balance }) {
    if (!address) {
      throw new Error("Token can't be created without address!");
    }

    this.decimals = parseInt(decimals) || 18;
    this.logo = logo;
    this.name = name;
    this.symbol = symbol ? symbol.toUpperCase() : undefined;
    this.address = web3.utils.toChecksumAddress(address);
    this.balance = balance || '0';
  }
}
