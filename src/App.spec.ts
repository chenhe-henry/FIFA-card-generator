import { mount } from '@vue/test-utils'

// element-plus ships ESM that Jest can't transform from node_modules; App.vue
// only needs ElMessageBox for founder mode, so stub the module.
jest.mock('element-plus', () => ({ ElMessageBox: { prompt: jest.fn() } }))

import App from './App.vue'

describe('App', () => {
  it('renders the title', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('fifa-card-generator')
  })
})
