// TODO: Remove deprecated stuff

import { ACTION_NAME } from "@/action";
import { Dependency, createDependency } from "@/dependencies";
import { LoaderType } from "@/loaders/loader-type";
import { PlatformType } from "@/platforms";
import { PartialRecord } from "@/utils/types";
import { deprecate } from "node:util";
import { RawForgeMetadata } from "./raw-forge-metadata";
import { asString } from "@/utils/string-utils";

export type ForgeMetadataCustomPayload = {
    loaders?: string[];
    dependencies?: string[];
} & PartialRecord<PlatformType, string>;

export function getForgeMetadataCustomPayload(metadata: RawForgeMetadata): ForgeMetadataCustomPayload {
    return containsLegacyCustomPayloadDefinition(metadata)
        ? getLegacyForgeMetadataCustomPayload(metadata)
        : (metadata?.[ACTION_NAME] || {});
}

function containsLegacyCustomPayloadDefinition(metadata: RawForgeMetadata): boolean {
    return !!metadata?.custom?.[ACTION_NAME] || !!metadata?.custom?.projects || !!metadata?.projects;
}

function _getLegacyForgeMetadataCustomPayload(metadata: RawForgeMetadata): ForgeMetadataCustomPayload {
    const legacyPayload = { ...metadata?.projects, ...metadata?.custom?.projects, ...metadata?.custom?.[ACTION_NAME] };
    const basePayload = metadata?.[ACTION_NAME];
    return { ...legacyPayload, ...basePayload };
}

const getLegacyForgeMetadataCustomPayload = deprecate(
    _getLegacyForgeMetadataCustomPayload,
    "Use top-level `mc-publish` field in your mods.toml.",
);

export function getLoadersFromForgeMetadataCustomPayload(metadata: RawForgeMetadata): string[] {
    const payload = getForgeMetadataCustomPayload(metadata);
    return payload.loaders || [LoaderType.FORGE];
}

export function getDependenciesFromForgeMetadataCustomPayload(payload: ForgeMetadataCustomPayload): Dependency[] {
    if (!Array.isArray(payload?.dependencies)) {
        return [];
    }
    return payload?.dependencies?.map(x => createDependency(x)).filter(x => x) || [];
}

export function getProjectIdFromForgeMetadataCustomPayload(payload: ForgeMetadataCustomPayload, platform: PlatformType): string | undefined {
    const id = payload?.[platform];
    return id ? asString(id) : undefined;
}
