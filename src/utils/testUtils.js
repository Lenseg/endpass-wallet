import { toKebab } from '@/utils/strings';

function convertDirectivesToAttrs(directives) {
  const attrs = {};

  if (directives) {
    directives.forEach(({ rawName, expression }) => {
      attrs[rawName] = expression;
    });
  }

  return attrs;
}

function convertListenersToAttrs(listeners) {
  const attrs = {};

  if (listeners) {
    Object.keys(listeners).forEach(key => {
      let handlers = listeners[key];

      if (!(handlers instanceof Array)) {
        handlers = [handlers];
      }

      const handler = handlers.find(
        h => h && (h.fns || h).name.includes('bound '),
      );

      if (handler) {
        attrs[`v-on:${key}`] = (handler.fns || handler).name;
      }
    });
  }

  return attrs;
}

function convertModelToAttrs(model) {
  return model ? { 'v-model': model.expression } : {};
}

function convertSlotToAttrs(slot) {
  return slot ? { slot } : {};
}

function generateElement(createElement, vnode) {
  const generateFunc = vnode.componentOptions
    ? generateElementFromComponent
    : generateElementFromHTML;

  return generateFunc(createElement, vnode);
}

function getChildrenElements(createElement, children) {
  return children
    ? children.map(child => generateElement(createElement, child))
    : undefined;
}

function generateElementFromComponent(
  createElement,
  { data, componentOptions },
) {
  const { attrs, directives, model } = data;
  const { tag, listeners, children } = componentOptions;
  const componentData = {
    ...data,
    attrs: {
      ...attrs,
      ...convertDirectivesToAttrs(directives),
      ...convertListenersToAttrs(listeners),
      ...convertModelToAttrs(model),
      class: data.staticClass,
    },
    hook: undefined,
    staticClass: undefined,
  };

  if (listeners) {
    componentData.on = Object.assign({}, listeners);
  }

  return createElement(
    tag,
    componentData,
    getChildrenElements(createElement, children),
  );
}

function generateElementFromHTML(createElement, vnode) {
  if (!vnode.data) {
    return vnode;
  }

  const { tag, data, children } = vnode;
  const { directives, on, model, attrs = {}, slot } = data;

  return createElement(
    tag,
    {
      ...data,
      attrs: {
        ...attrs,
        ...convertDirectivesToAttrs(directives),
        ...convertListenersToAttrs(on),
        ...convertModelToAttrs(model),
        ...convertSlotToAttrs(slot),
      },
    },
    getChildrenElements(createElement, children),
  );
}

export function generateStubs(Component) {
  return Object.values(Component.components).reduce((stubs, stubComponent) => {
    let elementName;

    if (stubComponent.name) {
      elementName = toKebab(stubComponent.name);
    }

    return Object.assign(stubs, {
      [elementName]: {
        render(createElement) {
          return generateElementFromComponent(createElement, this.$vnode);
        },
      },
    });
  }, {});
}
