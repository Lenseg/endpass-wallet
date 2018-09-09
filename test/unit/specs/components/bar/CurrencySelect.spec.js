import { shallow, createLocalVue } from '@vue/test-utils';
import { generateStubs } from '@/utils/testUtils';
import { CURRENCIES } from '@/constants';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

import CurrencySelect from '@/components/bar/CurrencySelect';

describe('CurrencySelect', () => {
  let wrapper, actions;
  beforeEach(() => {
    actions = {
      changeCurrency: jest.fn(),
    };
    const store = new Vuex.Store({
      modules: {
        web3: {
          namespaced: true,
          state: {
            activeCurrency: CURRENCIES[0],
          },
          actions,
        },
      },
    });

    wrapper = shallow(CurrencySelect, {
      localVue,
      store,
      stubs: generateStubs(CurrencySelect),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should set correct props for select', () => {
      const multiselect = wrapper.find('vue-multiselect');
      expect(multiselect.attributes().options).toBe(CURRENCIES.toString());
      expect(multiselect.attributes().value).toBe(CURRENCIES[0].toString());
    });
  });
});