import { Enum, EnumOptions } from "@/utils/enum";

enum ForgeEnvironmentTypeValues {
    CLIENT = "CLIENT",
    SERVER = "SERVER",
    BOTH = "BOTH",
}

const ForgeEnvironmentTypeOptions: EnumOptions = {
    ignoreCase: true,
};

export const ForgeEnvironmentType = Enum.create(
    ForgeEnvironmentTypeValues,
    ForgeEnvironmentTypeOptions,
);

export type ForgeEnvironmentType = Enum<typeof ForgeEnvironmentTypeValues>;
