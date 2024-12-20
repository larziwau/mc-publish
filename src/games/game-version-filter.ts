import { Enum, EnumOptions } from "@/utils/enum";
import { stringEquals } from "@/utils/string-utils";
import { deprecate } from "node:util";
import { GameVersion } from "./game-version";

enum GameVersionFilterValues {
    NONE = 0,
    RELEASES = 1,
    BETAS = 2,
    ALPHAS = 4,
    SNAPSHOTS = ALPHAS | BETAS,
    ANY = RELEASES | SNAPSHOTS,
    MIN_PATCH = 8,
    MAX_PATCH = 16,
    MIN_MINOR = 32,
    MAX_MINOR = 64,
    MIN_MAJOR = 128,
    MAX_MAJOR = 256,
    MIN = MIN_MAJOR | MIN_MINOR | MIN_PATCH,
    MAX = MAX_MAJOR | MAX_MINOR | MAX_PATCH,
}

const GameVersionFilterOptions: EnumOptions = {
    hasFlags: true,
    ignoreCase: true,
    ignoreNonWordCharacters: true,
};

function filter<T extends GameVersion>(versions: Iterable<T>, filter: GameVersionFilter): T[] {
    let filtered = [...versions];
    if (filter === GameVersionFilter.NONE || !filter) {
        return filtered;
    }

    filtered = filterVersionType(filtered, filter);
    filtered = applyVersionRange(filtered, x => x.version.major, filter, GameVersionFilter.MIN_MAJOR, GameVersionFilter.MAX_MAJOR);
    filtered = applyVersionRange(filtered, x => x.version.minor, filter, GameVersionFilter.MIN_MINOR, GameVersionFilter.MAX_MINOR);
    filtered = applyVersionRange(filtered, x => x.version.patch, filter, GameVersionFilter.MIN_PATCH, GameVersionFilter.MAX_PATCH);

    return filtered;
}

function filterVersionType<T extends GameVersion>(versions: T[], filter: GameVersionFilter): T[] {
    const allowReleases = GameVersionFilter.hasFlag(filter, GameVersionFilter.RELEASES);
    const allowBetas = GameVersionFilter.hasFlag(filter, GameVersionFilter.BETAS);
    const allowAlphas = GameVersionFilter.hasFlag(filter, GameVersionFilter.ALPHAS);
    const allowAny = (allowReleases && allowBetas && allowAlphas) || !(allowReleases || allowBetas || allowAlphas);

    if (!allowAny) {
        return versions.filter(x => (!x.isRelease || allowReleases) && (!x.isBeta || allowBetas) && (!x.isAlpha || allowAlphas));
    }

    return versions;
}

function applyVersionRange<T extends GameVersion>(versions: T[], selector: (x: T) => number, flags: number, minFlag: number, maxFlag: number): T[] {
    const comparer = GameVersionFilter.hasFlag(flags, minFlag) ? -1 : GameVersionFilter.hasFlag(flags, maxFlag) ? 1 : 0;
    if (!comparer) {
        return versions;
    }

    const target = versions.reduce((current, version) => Math.sign(selector(version) - current) === comparer ? selector(version) : current, comparer === 1 ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
    return versions.filter(x => selector(x) === target);
}

function _fromVersionResolver(versionResolverName: string): GameVersionFilter {
    if (stringEquals(versionResolverName, "exact", { ignoreCase: true })) {
        return GameVersionFilterValues.MIN | GameVersionFilterValues.RELEASES;
    }

    if (stringEquals(versionResolverName, "latest", { ignoreCase: true })) {
        return (
            GameVersionFilterValues.MIN_MAJOR |
            GameVersionFilterValues.MIN_MINOR |
            GameVersionFilterValues.MAX_PATCH |
            GameVersionFilterValues.RELEASES
        );
    }

    if (stringEquals(versionResolverName, "all", { ignoreCase: true })) {
        return GameVersionFilterValues.MIN_MAJOR | GameVersionFilterValues.MIN_MINOR;
    }

    return (
        GameVersionFilterValues.MIN_MAJOR |
        GameVersionFilterValues.MIN_MINOR |
        GameVersionFilterValues.RELEASES
    );
}

const fromVersionResolver = deprecate(
    _fromVersionResolver,
    "Use the new `game-version-filter` input instead of the deprecated `version-resolver` one."
);

const GameVersionFilterMethods = {
    filter,
    fromVersionResolver,
};

export const GameVersionFilter = Enum.create(
    GameVersionFilterValues,
    GameVersionFilterOptions,
    GameVersionFilterMethods,
);

export type GameVersionFilter = Enum<typeof GameVersionFilterValues>;
