export declare function now(): number;
export type TagValue = readonly string[];
export declare function getOptionalTagValueByName<T extends readonly string[]>(eventTags: readonly string[][], ...tagNameList: T): {
    [K in keyof T]: TagValue[];
};
export declare function getTagValueByName(eventTags: readonly string[][], tagName: string): TagValue[] | undefined;
export declare function getRequiredTagValueByName(eventTags: readonly string[][], tagName: string): TagValue[];
export declare function getRequiredFirstTagValue(eventTags: readonly string[][], tagName: string): string;
