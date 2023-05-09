import { getOptionalTagValueByName, getRequiredFirstTagValue, TagValue } from 'src/core/utils/Misc'

import { BaseEvent, EventFinalized, KnownEventKind } from '../core/event/Event'

/**
 * Badge Image & Thumb, URL and dimension
 */
export class BadgeImage {
    url: string
    width?: number
    height?: number

    constructor(url: string, width?: number, height?: number) {
        this.url = url
        if (width !== undefined && height !== undefined) {
            this.width = Math.floor(width)
            this.height = Math.floor(height)
        }
    }

    static RegexImageDimension = /^(\d+)x(\d+)$/

    /**
     * parse from `TagValue`
     * @param tagValue note: without the leading tag name
     * @returns BadgeImage on success, otherwise undefined
     */
    static fromTagValue(tagValue: TagValue): BadgeImage | undefined {
        if (tagValue.length < 1) {
            // throw new Error('badge image should at least have one image URL field')
            return undefined
        }
        // NOTE: validate URL? starting with http/https?
        const res: BadgeImage = new BadgeImage(tagValue[0])

        const imageSize = tagValue[1]
        if (typeof imageSize === 'string') {
            const match = imageSize.match(BadgeImage.RegexImageDimension)
            if (match) {
                res.width = parseInt(match[1])
                res.height = parseInt(match[2])
            }
        }
        return res
    }

    /**
     * convert url & w/h to string array according to NIP-58
     * @returns to `TagValue` (`string[]`), only the slice after the tag name
     */
    toTagValue(): TagValue {
        const tag = [this.url]
        if (this.width !== undefined && this.height !== undefined) {
            const w = Math.floor(this.width)
            const h = Math.floor(this.height)
            tag.push(`${w}x${h}`)
        }
        return tag
    }
}

export interface BadgeDefinitionOptionalFields {
    name?: string
    description?: string
    image?: BadgeImage
    thumbList?: BadgeImage[]
}

export class BadgeDefinition {
    id: string
    name?: string
    description?: string
    highResImage?: BadgeImage
    thumbList: BadgeImage[] = []

    static TagRequiredUniqueName = 'd'
    static TagOptionalShortName = 'name'
    static TagOptionalImage = 'image'
    static TagOptionalDescription = 'description'
    static TagOptionalThumb = 'thumb'

    constructor(id: string, options?: BadgeDefinitionOptionalFields) {
        this.id = id
        if (options !== null && options !== undefined) {
            // TODO change to idiomatic style in ts/js
            if (typeof options.name === 'string') {
                this.name = options.name
            }
            if (typeof options.description === 'string') {
                this.description = options.description
            }
            if (options.image !== null && options.image !== undefined) {
                this.highResImage = options.image
            }
            if (options.thumbList !== null && options.thumbList !== undefined) {
                this.thumbList = options.thumbList
            }
        }
    }

    /**
     * parse a badge definition strictly follow the NIP-58
     * @param event nostr event
     * @returns BadgeDefinition if input event confirm spec, otherwise undefined
     */
    static fromEvent(event: EventFinalized): BadgeDefinition | undefined {
        if (event.kind !== KnownEventKind.BADGE_DEFINATION) {
            // throw new Error('[parameter error] expecting event kind BADGE_DEFINATION (30009)')
            return undefined
        }

        try {
            const eventTags = event.tags
            const id = getRequiredFirstTagValue(eventTags, BadgeDefinition.TagRequiredUniqueName)

            const [nameTagValue, descTagValue, imageTagValue, thumbTagValue] = getOptionalTagValueByName(
                eventTags,
                BadgeDefinition.TagOptionalShortName,
                BadgeDefinition.TagOptionalDescription,
                BadgeDefinition.TagOptionalImage,
                BadgeDefinition.TagOptionalThumb,
            )
            const result = new BadgeDefinition(id, {
                thumbList: thumbTagValue
                    .map((tagValue) => BadgeImage.fromTagValue(tagValue))
                    .filter((v): v is BadgeImage => v !== undefined), // type guard in TS
            })
            if (nameTagValue.length > 0) {
                result.name = nameTagValue[0][0]
            }
            if (descTagValue.length > 0) {
                result.description = descTagValue[0][0]
            }
            if (imageTagValue.length > 0) {
                result.highResImage = BadgeImage.fromTagValue(imageTagValue[0])
            }
            return result
        } catch (e) {
            // TODO dvd import zerolog like logging library
            console.warn('badge definition from event error: ', e)
            return undefined
        }
    }

    toEvent(): BaseEvent {
        const event = new BaseEvent()

        event.kind = KnownEventKind.BADGE_DEFINATION

        const eTags = event.tags

        eTags.push([BadgeDefinition.TagRequiredUniqueName, this.id])
        // note: tags are ordered
        if (typeof this.name === 'string') {
            eTags.push([BadgeDefinition.TagOptionalShortName, this.name])
        }
        if (typeof this.description === 'string') {
            eTags.push([BadgeDefinition.TagOptionalDescription, this.description])
        }
        if (this.highResImage !== undefined && typeof this.highResImage.url === 'string') {
            eTags.push([BadgeDefinition.TagOptionalImage, ...this.highResImage.toTagValue()])
        }
        this.thumbList.forEach((value) => {
            eTags.push([BadgeDefinition.TagOptionalThumb, ...value.toTagValue()])
        })

        return event
    }
}

export class BadgeAward {
    // should use a `d` in event, or a object?
    badge: BadgeDefinition

    constructor(badgeDefinition: BadgeDefinition) {
        this.badge = badgeDefinition
    }
}
// export class ProfileBadge {}
