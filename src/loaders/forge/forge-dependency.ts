// TODO: Remove deprecated stuff

import { ACTION_NAME } from "@/action";
import { Dependency, DependencyType, createDependency } from "@/dependencies";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { PartialRecord } from "@/utils/types";
import { deprecate } from "node:util";
import { ForgeEnvironmentType } from "./forge-environment-type";
import { RawForgeMetadata } from "./raw-forge-metadata";

export interface ForgeDependency {
    modId: string;
    mandatory: boolean;
    embedded?: boolean;
    incompatible?: boolean;
    versionRange?: string;
    ordering?: "BEFORE" | "AFTER" | "NONE";
    side?: ForgeEnvironmentType;
    [ACTION_NAME]?: ForgeDependencyCustomPayload;
    custom?: { [ACTION_NAME]?: ForgeDependencyCustomPayload };
}

type ForgeDependencyCustomPayload = {
    ignore?: boolean | PlatformType[];
} & PartialRecord<PlatformType, string>;

const IGNORED_DEPENDENCIES: readonly string[] = ["minecraft", "java", "forge"];

export function getForgeDependencies(metadata: RawForgeMetadata): ForgeDependency[] {
    const dependencyMap = $i(Object.values(metadata?.dependencies || {}))
        .filter(x => Array.isArray(x))
        .flatMap(x => x)
        .filter(x => x?.modId)
        .map(x => [x.modId, x] as const)
        .reverse()
        .toMap();
    return [...dependencyMap.values()];
}

export function normalizeForgeDependency(dependency: ForgeDependency): Dependency | undefined {
    const payload = getForgeDependencyCustomPayload(dependency);
    const id = dependency?.modId;
    const versions = dependency?.versionRange;
    const ignore = IGNORED_DEPENDENCIES.includes(dependency?.modId) || 
                   (typeof payload.ignore === "boolean" && payload.ignore);
    const ignoredPlatforms = typeof payload.ignore === "boolean" ? undefined : payload.ignore;
    const aliases = $i(PlatformType.values())
        .map(type => [type, payload[type] ? asString(payload[type]) : undefined] as const)
        .filter(([, id]) => id)
        .toMap();
    const type = (
        dependency?.incompatible && DependencyType.INCOMPATIBLE ||
        dependency?.embedded && DependencyType.EMBEDDED ||
        dependency?.mandatory && DependencyType.REQUIRED ||
        DependencyType.OPTIONAL
    );
    return createDependency({ id, versions, type, ignore, ignoredPlatforms, aliases });
}

function getForgeDependencyCustomPayload(dependency: ForgeDependency): ForgeDependencyCustomPayload {
    return containsLegacyForgeDependencyCustomPayload(dependency)
        ? getLegacyForgeDependencyCustomPayload(dependency)
        : (dependency?.[ACTION_NAME] || {});
}

function containsLegacyForgeDependencyCustomPayload(dependency: ForgeDependency): boolean {
    return !!dependency?.custom?.[ACTION_NAME];
}

function _getLegacyForgeDependencyCustomPayload(dependency: ForgeDependency): ForgeDependencyCustomPayload {
    const legacyPayload = dependency?.custom?.[ACTION_NAME];
    const basePayload = dependency?.[ACTION_NAME];
    return { ...legacyPayload, ...basePayload };
}

const getLegacyForgeDependencyCustomPayload = deprecate(
    _getLegacyForgeDependencyCustomPayload,
    "Define `mc-publish` property directly on your Forge dependency object instead of using nested `custom.mc-publish`."
);
