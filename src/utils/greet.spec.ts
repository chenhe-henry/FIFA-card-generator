import { greet } from './greet'

describe('greet', () => {
  it('greets by name', () => {
    expect(greet('gitfifa')).toBe('Hello, gitfifa!')
  })
})
