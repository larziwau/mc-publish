import { PlatformType } from "@/platforms/platform-type";
import { $i, isIterable } from "@/utils/collections";
import { VersionRange, anyVersionRange } from "@/utils/versioning";
import { DependencyType } from "./dependency-type";
import { isLegacyDependencyFormat, parseLegacyDependencyFormat } from "./dependency.legacy";

export interface Dependency {
    get id(): string;
    get type(): DependencyType;
    get versions(): string[];
    isIgnored(platform?: PlatformType): boolean;
    getProjectId(platform: PlatformType): string;
}

export interface DependencyInfo {
    id: string;
    type?: string | DependencyType;
    versions?: string | string[] | VersionRange;
    ignore?: boolean;
    ignoredPlatforms?: Iterable<string | PlatformType>;
    aliases?: Iterable<readonly [string | PlatformType, string]>;
}

export type DependencyLike = Dependency | DependencyInfo | string;

export function parseDependency(dependency: string): Dependency | undefined {
    const dependencyInfo = isLegacyDependencyFormat(dependency)
        ? parseLegacyDependencyFormat(dependency)
        : parseDependencyFormat(dependency);
    return dependencyInfo && createDependency(dependencyInfo);
}

const DEPENDENCY_REGEX = /^\s*(?<id>[^@{(#]+)(@(?<versionRange>[^@{(#]*))?(?:\((?<type>[^@{(#]*)\))?(?<aliases>(?:\{[^:=]+(?:=|:)[^}]*\})+)?(?<ignore>#\(ignore(?::(?<ignoredPlatforms>[^)]*))?\))?\s*$/;
const DEPENDENCY_ALIASES_REGEX = /\{(?<platform>[^:=]+)(?:=|:)(?<id>[^}]*)\}/g;

function parseDependencyFormat(dependencyFormat: string): DependencyInfo | undefined {
    const match = dependencyFormat?.match(DEPENDENCY_REGEX);
    if (!match) {
        return undefined;
    }

    const id = match.groups.id.trim();
    const versions = match.groups.versionRange?.trim();
    const type = match.groups.type?.trim();
    const aliases = $i(match.groups.aliases?.matchAll(DEPENDENCY_ALIASES_REGEX) || []).map(x => [x.groups.platform.trim(), x.groups.id.trim()] as const);
    const ignoredPlatforms = match.groups.ignoredPlatforms?.split(",").map(x => x.trim());
    const ignore = ignoredPlatforms?.length ? undefined : !!match.groups.ignore;

    return { id, versions, type, aliases, ignore, ignoredPlatforms };
}

export function createDependency(dependency: DependencyLike): Dependency | undefined {
    if (typeof dependency === "string") {
        return parseDependency(dependency);
    }

    if (isDependency(dependency)) {
        return dependency;
    }

    if (!dependency?.id) {
        return undefined;
    }

    const id = dependency.id || "";
    const type = dependency.type && DependencyType.parse(dependency.type) || DependencyType.REQUIRED;

    const versionRanges = typeof dependency.versions === "string"
        ? [dependency.versions]
        : isIterable(dependency.versions)
            ? [...dependency.versions]
            : [(dependency.versions || anyVersionRange()).toString()];

    const versions = versionRanges.filter(x => x && x !== anyVersionRange().toString());
    if (!versions.length) {
        versions.push(anyVersionRange().toString());
    }

    const ignoredPlatforms = $i(dependency.ignoredPlatforms || []).map(x => PlatformType.parse(x)).filter(x => x).toSet();
    const isIgnored = dependency.ignore
        ? () => true
        : (p: PlatformType) => p ? ignoredPlatforms.has(p) : ignoredPlatforms.size === PlatformType.size;

    const aliases = $i(dependency.aliases || []).map(([key, value]) => [PlatformType.parse(key), value] as const).filter(([key]) => key).toMap();
    const getProjectId = (p: PlatformType) => aliases.get(p) ?? id;

    return { id, versions, type, isIgnored, getProjectId };
}

export function formatDependency(dependency: Dependency): string {
    if (!dependency) {
        return "";
    }

    const versionRange = dependency.versions.join(" || ");
    const version = versionRange && versionRange !== anyVersionRange().toString() ? `@${versionRange}` : "";

    const ignoredBy = $i(PlatformType.values()).filter(x => dependency.isIgnored(x)).join(",");
    const ignore = ignoredBy && `#(ignore:${ignoredBy})`;

    const aliases = $i(PlatformType.values()).filter(x => dependency.getProjectId(x) !== dependency.id).map(x => `{${x}:${dependency.getProjectId(x)}}`).join("");

    return `${dependency.id}${version}(${dependency.type})${aliases}${ignore}`;
}

export function isDependency(dependency: unknown): dependency is Dependency {
    const d = dependency as Dependency;
    return (
        typeof d?.id === "string" &&
        typeof d.type === DependencyType.underlyingType &&
        Array.isArray(d.versions) &&
        typeof d.getProjectId === "function" &&
        typeof d.isIgnored === "function"
    );
}
