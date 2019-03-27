import EndpassConnect from '@endpass/connect';

const connect = new EndpassConnect({
  authUrl: process.env.VUE_APP_CONNECT_URL,
  isIdentityMode: true,
});

export default connect;
