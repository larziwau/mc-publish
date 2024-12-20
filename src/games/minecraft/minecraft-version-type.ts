import { VersionType } from "@/utils/versioning";
import { Enum, EnumOptions } from "@/utils/enum";

enum MinecraftVersionTypeValues {
    RELEASE = "release",
    SNAPSHOT = "snapshot",
    OLD_BETA = "old_beta",
    OLD_ALPHA = "old_alpha",
}

const MinecraftVersionTypeOptions: EnumOptions = {
    ignoreCase: true,
    ignoreNonWordCharacters: true,
};

function toVersionType(type: MinecraftVersionType, version?: string): VersionType {
    switch (type) {
        case MinecraftVersionType.SNAPSHOT:
            return version?.match(/-pre|-rc|-beta|Pre-[Rr]elease|[Rr]elease Candidate/)
                ? VersionType.BETA
                : VersionType.ALPHA;

        case MinecraftVersionType.OLD_BETA:
            return VersionType.BETA;

        case MinecraftVersionType.OLD_ALPHA:
            return VersionType.ALPHA;

        default:
            return VersionType.RELEASE;
    }
}

const MinecraftVersionTypeMethods = {
    toVersionType,
};

export const MinecraftVersionType = Enum.create(
    MinecraftVersionTypeValues,
    MinecraftVersionTypeOptions,
    MinecraftVersionTypeMethods,
);

export type MinecraftVersionType = Enum<typeof MinecraftVersionTypeValues>;
