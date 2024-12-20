import { Enum, EnumOptions } from "@/utils/enum";

enum DependencyTypeValues {
    REQUIRED = "required",
    RECOMMENDED = "recommended",
    EMBEDDED = "embedded",
    OPTIONAL = "optional",
    CONFLICTING = "conflicting",
    INCOMPATIBLE = "incompatible",
}

const DependencyTypeOptions: EnumOptions = {
    ignoreCase: true,
};

export const DependencyType = Enum.create(
    DependencyTypeValues,
    DependencyTypeOptions,
);

export type DependencyType = Enum<typeof DependencyTypeValues>;
