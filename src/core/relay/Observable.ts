namespace Observable {
    export type Callback = (...args: any[]) => void
    export type Listener = { callback: Callback; once: boolean }
    export type Listeners = { [event: string]: Listener[] }
}

class Observable {
    listeners: Observable.Listeners = {}

    on(event: string, callback: Observable.Callback) {
        this.addListener(event, { callback, once: false })
    }

    once(event: string, callback: Observable.Callback) {
        this.addListener(event, { callback, once: true })
    }

    off(event: string, callback: Observable.Callback) {
        const listeners = this.listeners[event]
        if (!listeners) return
        const idx = listeners.findIndex((listener) => listener.callback === callback)
        if (idx >= 0) listeners.splice(idx, 1)
    }

    addListener(event: string, listener: Observable.Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [listener]
        } else {
            this.listeners[event].push(listener)
        }
    }

    emit(event: string, ...args: any[]) {
        const listeners = this.listeners[event]
        if (!listeners) return

        for (const listener of listeners) {
            try {
                listener.callback.apply(null, args)
            } catch (e: any) {
                console.error(`Exception thrown from '${event}' listener: ${e.message || e}`, e)
            }
        }

        this.listeners[event] = listeners.filter((listener) => !listener.once)
    }
}

export default Observable
