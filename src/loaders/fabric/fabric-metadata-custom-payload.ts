// TODO: Remove deprecated stuff

import { ACTION_NAME } from "@/action";
import { Dependency, createDependency } from "@/dependencies";
import { LoaderType } from "@/loaders/loader-type";
import { PlatformType } from "@/platforms";
import { asString } from "@/utils/string-utils";
import { PartialRecord } from "@/utils/types";
import { deprecate } from "node:util";
import { RawFabricMetadata } from "./raw-fabric-metadata";

export type FabricMetadataCustomPayload = {
    quilt?: boolean;
    loaders?: string[];
    dependencies?: string[];
} & PartialRecord<PlatformType, string>;

export function getFabricMetadataCustomPayload(metadata: RawFabricMetadata): FabricMetadataCustomPayload {
    return containsLegacyCustomPayloadDefinition(metadata)
        ? getLegacyFabricMetadataCustomPayload(metadata)
        : (metadata?.custom?.[ACTION_NAME] || {});
}

function containsLegacyCustomPayloadDefinition(metadata: RawFabricMetadata): boolean {
    return !!metadata?.custom?.modmanager;
}

function _getLegacyFabricMetadataCustomPayload(metadata: RawFabricMetadata): FabricMetadataCustomPayload {
    const modManagerPayload = metadata?.custom?.modmanager;
    const basePayload = metadata?.custom?.[ACTION_NAME];
    return { ...modManagerPayload, ...basePayload };
}

const getLegacyFabricMetadataCustomPayload = deprecate(
    _getLegacyFabricMetadataCustomPayload,
    "Use `mc-publish` field instead of `modmanager` field.",
);

const DEFAULT_LOADERS = [LoaderType.FABRIC] as const;

export function getLoadersFromFabricMetadataCustomPayload(payload: FabricMetadataCustomPayload): string[] {
    if (containsLegacyLoadersDefinition(payload)) {
        return getLegacyLoadersFromFabricMetadataCustomPayload(payload);
    }
    return payload?.loaders || [...DEFAULT_LOADERS];
}

function containsLegacyLoadersDefinition(payload: FabricMetadataCustomPayload): boolean {
    return typeof payload?.quilt === "boolean";
}

function _getLegacyLoadersFromFabricMetadataCustomPayload(payload: FabricMetadataCustomPayload): string[] {
    return payload?.quilt ? [LoaderType.FABRIC, LoaderType.QUILT] : [...DEFAULT_LOADERS];
}

const getLegacyLoadersFromFabricMetadataCustomPayload = deprecate(
    _getLegacyLoadersFromFabricMetadataCustomPayload,
    "Use the universal `\"loaders\": [\"fabric\", \"quilt\"]` field instead of `\"quilt\": true`",
);

export function getDependenciesFromFabricMetadataCustomPayload(payload: FabricMetadataCustomPayload): Dependency[] {
    if (!Array.isArray(payload?.dependencies)) {
        return [];
    }
    return payload?.dependencies?.map(x => createDependency(x)).filter(x => x) || [];
}

export function getProjectIdFromFabricMetadataCustomPayload(payload: FabricMetadataCustomPayload, platform: PlatformType): string | undefined {
    const id = payload?.[platform];
    return id ? asString(id) : undefined;
}
