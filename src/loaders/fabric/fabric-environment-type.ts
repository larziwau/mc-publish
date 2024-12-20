import { Enum, EnumOptions } from "@/utils/enum";

enum FabricEnvironmentTypeValues {
    CLIENT = "client",
    SERVER = "server",
    BOTH = "*",
}

const FabricEnvironmentTypeOptions: EnumOptions = {
    ignoreCase: true,
};

export const FabricEnvironmentType = Enum.create(
    FabricEnvironmentTypeValues,
    FabricEnvironmentTypeOptions,
);

export type FabricEnvironmentType = Enum<typeof FabricEnvironmentTypeValues>;
