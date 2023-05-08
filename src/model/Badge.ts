import { getOptionalTagValueByName, getRequiredFirstTagValue, TagValue } from 'src/core/utils/Misc'

import { EventFinalized, KnownEventKind } from '../core/event/Event'

interface BadgeImageInfo {
    url: string
    width?: number
    height?: number
}

interface BadgeDefinitionInitOptions {
    name?: string
    description?: string
    highResImage?: BadgeImageInfo
    thumbList: BadgeImageInfo[]
}

const RegexImageDimension = /^(\d+)x(\d+)$/

const tagValueToBadgeImageInfo = (tagValue: TagValue): BadgeImageInfo => {
    // image tag whose value is the URL of a high-resolution image representing the badge.
    // The second value optionally specifies the dimensions of the image as widthxheight in pixels.
    // Badge recommended dimensions is 1024x1024 pixels.
    if (tagValue.length < 1) {
        throw new Error('badge image should at least have one image URL field')
    }
    // NOTE: validate URL? starting with http/https?
    const r: BadgeImageInfo = { url: tagValue[0] }
    const imageSize = tagValue[1]
    if (typeof imageSize === 'string') {
        const match = imageSize.match(RegexImageDimension)
        if (match) {
            r.width = parseInt(match[1])
            r.height = parseInt(match[2])
        }
    }
    return r
}
export class BadgeDefinition {
    id: string
    name?: string
    description?: string
    highResImage?: BadgeImageInfo
    thumbList: BadgeImageInfo[] = []

    // TODO add more field like npub?

    static TagRequiredUniqueName = 'd'
    static TagOptionalShortName = 'name'
    static TagOptionalImage = 'image'
    static TagOptionalDescription = 'description'
    static TagOptionalThumb = 'thumb'

    constructor(id: string, options?: BadgeDefinitionInitOptions) {
        this.id = id
        if (options !== null && options !== undefined) {
            // TODO change to idiomatic style in ts/js
            if (typeof options.name === 'string') {
                this.name = options.name
            }
            if (typeof options.description === 'string') {
                this.description = options.description
            }
            if (options.highResImage !== null && options.highResImage !== undefined) {
                this.highResImage = options.highResImage
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
        // TODO parse more loosely?
        if (event.kind !== KnownEventKind.BADGE_DEFINATION) {
            throw new Error('[parameter error] expecting event kind BADGE_DEFINATION (30009)')
        }

        try {
            const eventTags = event.tags
            const id = getRequiredFirstTagValue(eventTags, BadgeDefinition.TagRequiredUniqueName)

            const [name, desc, image, thumb] = getOptionalTagValueByName(
                eventTags,
                BadgeDefinition.TagOptionalShortName,
                BadgeDefinition.TagOptionalDescription,
                BadgeDefinition.TagOptionalImage,
                BadgeDefinition.TagOptionalThumb,
            )
            const result = new BadgeDefinition(id, {
                thumbList: thumb.map((tagValue) => tagValueToBadgeImageInfo(tagValue)),
            })
            if (name.length > 0) {
                result.name = name[0][0]
            }
            if (desc.length > 0) {
                result.description = desc[0][0]
            }
            if (image.length > 0) {
                result.highResImage = tagValueToBadgeImageInfo(image[0])
            }
            return result
        } catch (e) {
            // TODO dvd import zerolog like logging library
            console.warn('badge definition from event error: ', e)
            return undefined
        }
    }
}

// export class BadgeAward { constructor() {} }
// export class ProfileBadge {}
