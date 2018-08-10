const identityAPIUrl = 'https://identity-dev.endpass.com/api/v1';
const tokenInfoAPIUrl = 'https://tokeninfo-dev.endpass.com/api/v1';
const cryptoDataAPIUrl = 'https://cryptodata-dev.endpass.com/api/v1';

const kdfParams = {
  kdf: 'scrypt',
  n: 4,
};

export default {
  identityAPIUrl,
  tokenInfoAPIUrl,
  cryptoDataAPIUrl,
  kdfParams,
};
