import { Dependency, createDependency } from "@/dependencies";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { FabricDependencyType } from "./fabric-dependency-type";
import { RawFabricMetadata } from "./raw-fabric-metadata";

export interface FabricDependency {
    id: string;
    version: string | string[];
    type: FabricDependencyType;
}

export interface FabricDependencyList {
    [id: string]: string | string[] | undefined;
}

const IGNORED_DEPENDENCIES: readonly string[] = [
    "minecraft",
    "java",
    "fabricloader",
];

const DEPENDENCY_ALIASES: ReadonlyMap<string, ReadonlyMap<PlatformType, string>> = new Map([
    ["fabric", "fabric-api"],
].map(([k, v]) =>
    [k, typeof v === "string" ? $i(PlatformType.values()).map(x => [x, v] as const).toMap() : v],
));

export function getFabricDependencies(metadata: RawFabricMetadata): FabricDependency[] {
    return $i(FabricDependencyType.values()).flatMap(type => toFabricDependencyArray(metadata?.[type], type)).toArray();
}

export function toFabricDependencyArray(list: FabricDependencyList, type: FabricDependencyType): FabricDependency[] {
    return Object.entries(list || {}).map(([id, version]) => ({ id, version, type }));
}

export function normalizeFabricDependency(dependency: FabricDependency): Dependency | undefined {
    return createDependency({
        id: dependency?.id,
        versions: dependency?.version,
        type: FabricDependencyType.toDependencyType(dependency?.type || FabricDependencyType.DEPENDS),
        ignore: IGNORED_DEPENDENCIES.includes(dependency?.id),
        aliases: DEPENDENCY_ALIASES.get(dependency?.id),
    });
}
