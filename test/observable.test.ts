import Observable from 'src/core/relay/Observable'

describe('Observable', () => {
    it('should add listener', () => {
        const observable = new Observable()
        const callback = jest.fn()
        observable.on('test', callback)
        expect(observable.listeners).toEqual({ test: [{ callback, once: false }] })
    })

    it('should add listener once', () => {
        const observable = new Observable()
        const callback = jest.fn()
        observable.once('test', callback)
        expect(observable.listeners).toEqual({ test: [{ callback, once: true }] })
    })

    it('should remove listener', () => {
        const observable = new Observable()
        const listener1 = jest.fn()
        const listener2 = jest.fn()
        observable.on('test', listener1)
        observable.on('test', listener2)

        observable.off('test', listener1)

        expect(observable.listeners).toEqual({ test: [{ callback: listener2, once: false }] })
    })

    it('should emit event', () => {
        const observable = new Observable()
        const listener1 = jest.fn()
        const listener2 = jest.fn()
        observable.on('test', listener1)
        observable.on('test', listener2)

        observable.emit('test', 'arg1', 'arg2')

        expect(listener1).toHaveBeenCalledWith('arg1', 'arg2')
        expect(listener2).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should emit event once', () => {
        const observable = new Observable()
        const callback = jest.fn()
        observable.once('test', callback)
        observable.emit('test', 'arg1', 'arg2')
        expect(callback).toHaveBeenCalledWith('arg1', 'arg2')
        expect(observable.listeners).toEqual({ test: [] })
    })

    it('should emit event multiple times', () => {
        const observable = new Observable()
        const callback = jest.fn()
        observable.on('test', callback)
        observable.emit('test', 'arg1', 'arg2')
        observable.emit('test', 'arg1', 'arg2')
        expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should emit event multiple times with once', () => {
        const observable = new Observable()
        const callback = jest.fn()
        observable.once('test', callback)
        observable.emit('test', 'arg1', 'arg2')
        observable.emit('test', 'arg1', 'arg2')
        expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should emit event multiple times with multiple listeners', () => {
        const observable = new Observable()
        const callback1 = jest.fn()
        const callback2 = jest.fn()
        observable.on('test', callback1)
        observable.on('test', callback2)
        observable.emit('test', 'arg1', 'arg2')
        observable.emit('test', 'arg1', 'arg2')
        expect(callback1).toHaveBeenCalledTimes(2)
        expect(callback2).toHaveBeenCalledTimes(2)
    })

    it('should emit event multiple times with multiple listeners and once', () => {
        const observable = new Observable()
        const callback1 = jest.fn()
        const callback2 = jest.fn()
        observable.on('test', callback1)
        observable.once('test', callback2)
        observable.emit('test', 'arg1', 'arg2')
        observable.emit('test', 'arg1', 'arg2')
        expect(callback1).toHaveBeenCalledTimes(2)
        expect(callback2).toHaveBeenCalledTimes(1)
    })
})
