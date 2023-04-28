// import SortedArray from 'sorted-array'

// import { BaseEvent as Message } from '../core/event/Event'

// //maintain a subscribtion of kind-1 events for authors
// export default class Following {
//     messages: SortedArray<Message>
//     lastUpdatedAt = 0
//     followingPubkeysRaw: string[] = []
//     constructor(preload?: Message[], keys?: string[]) {
//         if (preload != null) {
//             this.messages = new SortedArray<Message>(preload, (a: Message, b: Message) => b.created_at - a.created_at)
//             this.lastUpdatedAt = this.messages.array[0].created_at
//         }
//         if (keys != null) this.followingPubkeysRaw = keys
//     }
// }
