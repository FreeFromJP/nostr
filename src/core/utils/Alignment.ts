import { BaseEvent } from '../event/Event'

type Order = 'asc' | 'desc'

export function sortByCreatedAt(events: BaseEvent[], order: Order) {
    if (order == 'asc') {
        return events.sort((a, b) => a.created_at - b.created_at)
    } else {
        return events.sort((a, b) => b.created_at - a.created_at)
    }
}
