import Vue from 'vue';
import Intercom from 'vue-intercom';
import VueAnalytics from 'vue-analytics';
import Notifications from 'vue-notification';

import router from './router';
import store from './store';
import App from './App';
import './validation';
import './directives';

const isProduction = NODE_ENV === 'production';

Vue.config.productionTip = false;
Vue.config.performance = true;

Vue.use(Notifications);

Vue.use(VueAnalytics, {
  id: env.googleAnalyticsId,
  router,
  debug: {
    sendHitTask: isProduction,
  },
});

Vue.use(Intercom, { appId: env.intercomAppId });

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});

if (NODE_ENV !== 'production') {
  window.app = app;
}

export default app;
