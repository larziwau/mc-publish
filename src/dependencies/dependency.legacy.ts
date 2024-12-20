// TODO: Drop support for legacy

import { FabricDependencyType } from "@/loaders/fabric/fabric-dependency-type";
import { deprecate } from "node:util";
import { DependencyInfo } from "./dependency";

export function isLegacyDependencyFormat(dependency: string): boolean {
    return !!dependency?.includes("|") && !dependency.includes("@");
}

function _parseLegacyDependencyFormat(dependencyFormat: string): DependencyInfo {
    const [id, fabricType, versions] = dependencyFormat.split("|").map(x => x.trim());
    const type = fabricType && FabricDependencyType.toDependencyType(FabricDependencyType.parse(fabricType));
    return { id, type, versions };
}

export const parseLegacyDependencyFormat = deprecate(
    _parseLegacyDependencyFormat,
    "The old dependency string format is deprecated. " +
    "Please use the new format. " +
    "Example: foo@1.0.0-2.0.0(required){modrinth:foo-fabric}#(ignore:curseforge)",
);
