import { Enum, EnumOptions } from "@/utils/enum";
import { DependencyType } from "@/dependencies";

enum FabricDependencyTypeValues {
    DEPENDS = "depends",
    RECOMMENDS = "recommends",
    INCLUDES = "includes",
    SUGGESTS = "suggests",
    BREAKS = "breaks",
    CONFLICTS = "conflicts",
}

const FabricDependencyTypeOptions: EnumOptions = {
    ignoreCase: true,
};

function toDependencyType(type: FabricDependencyType): DependencyType | undefined {
    switch (type) {
        case FabricDependencyType.DEPENDS:
            return DependencyType.REQUIRED;
        case FabricDependencyType.RECOMMENDS:
            return DependencyType.RECOMMENDED;
        case FabricDependencyType.INCLUDES:
            return DependencyType.EMBEDDED;
        case FabricDependencyType.SUGGESTS:
            return DependencyType.OPTIONAL;
        case FabricDependencyType.BREAKS:
            return DependencyType.INCOMPATIBLE;
        case FabricDependencyType.CONFLICTS:
            return DependencyType.CONFLICTING;
        default:
            return undefined;
    }
}

function fromDependencyType(type: DependencyType): FabricDependencyType | undefined {
    switch (type) {
        case DependencyType.REQUIRED:
            return FabricDependencyType.DEPENDS;
        case DependencyType.RECOMMENDED:
            return FabricDependencyType.RECOMMENDS;
        case DependencyType.EMBEDDED:
            return FabricDependencyType.INCLUDES;
        case DependencyType.OPTIONAL:
            return FabricDependencyType.SUGGESTS;
        case DependencyType.CONFLICTING:
            return FabricDependencyType.CONFLICTS;
        case DependencyType.INCOMPATIBLE:
            return FabricDependencyType.BREAKS;
        default:
            return undefined;
    }
}

const FabricDependencyTypeMethods = {
    toDependencyType,
    fromDependencyType,
};

export const FabricDependencyType = Enum.create(
    FabricDependencyTypeValues,
    FabricDependencyTypeOptions,
    FabricDependencyTypeMethods,
);

export type FabricDependencyType = Enum<typeof FabricDependencyTypeValues>;
