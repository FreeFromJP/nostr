import Greeter from 'src/index'

test('Greeter says hello to Alice', () => {
  expect(Greeter('Alice')).toBe('Hello Alice')
})
