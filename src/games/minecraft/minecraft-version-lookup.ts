import { asArrayLike, isIterable } from "@/utils/collections";
import { VersionRange, noneVersionRange, parseVersionRange } from "@/utils/versioning";
import { MinecraftVersion, MinecraftVersionManifestEntry } from "./minecraft-version";
import { MinecraftVersionType } from "./minecraft-version-type";

const VERSION_PATTERN = (
    "0\\.\\d+(?:\\.\\d+)?a?(?:_\\d+)?|" +
    "\\d+\\.\\d+(?:\\.\\d+)?(?:-pre\\d+| Pre-[Rr]elease \\d+|-rc\\d+| [Rr]elease Candidate \\d+)?|" +
    "\\d+w\\d+(?:[a-z]+|~)|" +
    "[a-c]\\d\\.\\d+(?:\\.\\d+)?[a-z]?(?:_\\d+)?[a-z]?|" +
    "(Alpha|Beta) v?\\d+\\.\\d+(?:\\.\\d+)?[a-z]?(?:_\\d+)?[a-z]?|" +
    "Inf?dev (?:0\\.31 )?\\d+(?:-\\d+)?|" +
    "(?:rd|inf)-\\d+|" +
    "(?:.*[Ee]xperimental [Ss]napshot )(?:\\d+)"
);

const VERSION_REGEX = new RegExp(VERSION_PATTERN);
const RELEASE_REGEX = /\d+\.\d+(\.\d+)?/;
const PRE_RELEASE_REGEX = /.+(?:-pre| Pre-[Rr]elease )(\d+)/;
const RELEASE_CANDIDATE_REGEX = /.+(?:-rc| [Rr]elease Candidate )(\d+)/;
const SNAPSHOT_REGEX = /(?:Snapshot )?(\d+)w0?(0|[1-9]\d*)([a-z])/;
const EXPERIMENTAL_REGEX = /(?:.*[Ee]xperimental [Ss]napshot )(\d+)/;
const BETA_REGEX = /(?:b|Beta v?)1\.(\d+(\.\d+)?[a-z]?(_\d+)?[a-z]?)/;
const ALPHA_REGEX = /(?:a|Alpha v?)[01]\.(\d+(\.\d+)?[a-z]?(_\d+)?[a-z]?)/;
const INDEV_REGEX = /(?:inf-|Inf?dev )(?:0\.31 )?(\d+(-\d+)?)/;

const LEGACY_VERSION_RANGE = parseVersionRange("<=1.16");

const SPECIAL_VERSIONS: ReadonlyMap<string, string> = new Map([
    ["13w12~", "1.5.1-alpha.13.12.a"],
    ["2point0_red", "1.5.2-red"],
    ["2point0_purple", "1.5.2-purple"],
    ["2point0_blue", "1.5.2-blue"],
    ["15w14a", "1.8.4-alpha.15.14.a+loveandhugs"],
    ["1.RV-Pre1", "1.9.2-rv+trendy"],
    ["3D Shareware v1.34", "1.14-alpha.19.13.shareware"],
    ["1.14.3 - Combat Test", "1.14.3-rc.4.combat.1"],
    ["Combat Test 2", "1.14.5-combat.2"],
    ["Combat Test 3", "1.14.5-combat.3"],
    ["Combat Test 4", "1.15-rc.3.combat.4"],
    ["Combat Test 5", "1.15.2-rc.2.combat.5"],
    ["20w14~", "1.16-alpha.20.13.inf"],
    ["20w14infinite", "1.16-alpha.20.13.inf"],
    ["Combat Test 6", "1.16.2-beta.3.combat.6"],
    ["Combat Test 7", "1.16.3-combat.7"],
    ["1.16_combat-2", "1.16.3-combat.7.b"],
    ["1.16_combat-3", "1.16.3-combat.7.c"],
    ["1.16_combat-4", "1.16.3-combat.8"],
    ["1.16_combat-5", "1.16.3-combat.8.b"],
    ["1.16_combat-6", "1.16.3-combat.8.c"],
    ["22w13oneblockatatime", "1.19-alpha.22.13.oneblockatatime"],
    ["23w13a_or_b", "1.20-alpha.23.13.ab"],
]);

export function normalizeMinecraftVersion(version: string, versions?: MinecraftVersionManifestEntry[], index?: number): string {
    const releaseVersion = versions
        ? findNearestReleaseMinecraftVersion(versions, index)
        : version.match(RELEASE_REGEX)?.[0];
    return normalizeUnknownMinecraftVersion(version, releaseVersion);
}

export function normalizeMinecraftVersionRange(
    range: string | Iterable<string> | VersionRange,
    versions: ReadonlyMap<string, MinecraftVersion>,
    versionRegex: RegExp
): VersionRange {
    if (!isIterable(range)) {
        return range;
    }

    const ranges = typeof range === "string" ? [range] : asArrayLike(range);
    const normalizedRanges = ranges.map((r: string) =>
        r.replaceAll(versionRegex, x => {
            const version = versions.get(x);
            if (version) {
                return String(version.version);
            }
            return normalizeMinecraftVersion(x);
        })
    );

    return parseVersionRange(normalizedRanges) || noneVersionRange(normalizedRanges.join(" || "));
}

export function getMinecraftVersionRegExp(versions?: Iterable<string>): RegExp {
    if (!versions) {
        return VERSION_REGEX;
    }

    let pattern = VERSION_PATTERN;
    for (const version of versions) {
        if (version.match(VERSION_REGEX)?.[0] !== version) {
            pattern = `${version.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d")}|${pattern}`;
        }
    }
    return new RegExp(pattern, "gs");
}

function normalizeUnknownMinecraftVersion(version: string, releaseVersion?: string): string {
    if (SPECIAL_VERSIONS.has(version)) {
        return SPECIAL_VERSIONS.get(version)!;
    }

    if (!releaseVersion || version === releaseVersion || version.substring(1).startsWith(releaseVersion)) {
        return normalizeOldMinecraftVersion(version);
    }

    let match: RegExpMatchArray | null;
    if ((match = version.match(EXPERIMENTAL_REGEX))) {
        return `${releaseVersion}-Experimental.${match[1]}`;
    }

    if (version.startsWith(releaseVersion)) {
        if ((match = version.match(RELEASE_CANDIDATE_REGEX))) {
            const rcBuild = releaseVersion === "1.16" ? String(8 + (+match[1])) : match[1];
            version = `rc.${rcBuild}`;
        } else if ((match = version.match(PRE_RELEASE_REGEX))) {
            const isLegacy = isLegacyMinecraftVersion(releaseVersion);
            version = `${isLegacy ? "rc" : "beta"}.${match[1]}`;
        }
    } else if ((match = version.match(SNAPSHOT_REGEX))) {
        version = `alpha.${match[1]}.${match[2]}.${match[3]}`;
    } else {
        version = normalizeOldMinecraftVersion(version);
    }

    return version.startsWith(`${releaseVersion}-`) ? version : `${releaseVersion}-${version}`;
}

function normalizeOldMinecraftVersion(version: string): string {
    let matcher: RegExpMatchArray | null;
    if ((matcher = version.match(BETA_REGEX))) {
        version = `1.0.0-beta.${matcher[1]}`;
    } else if ((matcher = version.match(ALPHA_REGEX))) {
        version = `1.0.0-alpha.${matcher[1]}`;
    } else if ((matcher = version.match(INDEV_REGEX))) {
        version = `0.31.${matcher[1]}`;
    } else if (version.startsWith("c0.")) {
        version = version.substring(1);
    } else if (version.startsWith("rd-")) {
        version = version.substring(3);
        if (version === "20090515") {
            version = "150000";
        }
        version = `0.0.0-rd.${version}`;
    }

    return cleanupVersionString(version);
}

function cleanupVersionString(version: string): string {
    let normalized = "";
    let wasDigit = false;
    let wasLeadingZero = false;
    let wasSeparator = false;
    let hasHyphen = false;

    for (let i = 0; i < version.length; ++i) {
        let c = version.charAt(i);

        if (c >= "0" && c <= "9") {
            if (i > 0 && !wasDigit && !wasSeparator) {
                normalized += ".";
            } else if (wasDigit && wasLeadingZero) {
                normalized = normalized.slice(0, -1);
            }
            wasLeadingZero = c === "0" && (!wasDigit || wasLeadingZero);
            wasSeparator = false;
            wasDigit = true;
        } else if (c === "." || c === "-") {
            if (wasSeparator) {
                continue;
            }
            wasSeparator = true;
            wasDigit = false;
        } else if ((c < "A" || c > "Z") && (c < "a" || c > "z")) {
            if (wasSeparator) {
                continue;
            }
            c = ".";
            wasSeparator = true;
            wasDigit = false;
        } else {
            if (wasDigit) {
                normalized += hasHyphen ? "." : "-";
                hasHyphen = true;
            }
            wasSeparator = false;
            wasDigit = false;
        }

        if (c === "-") {
            hasHyphen = true;
        }
        normalized += c;
    }

    return normalized.replace(/^\.*/g, "").replace(/\.*$/g, "");
}

function findNearestReleaseMinecraftVersion(
    versions: MinecraftVersionManifestEntry[],
    index: number
): string | undefined {
    if (versions[index].type === MinecraftVersionType.RELEASE) {
        return versions[index].id;
    }

    if (versions[index].type !== MinecraftVersionType.SNAPSHOT) {
        return undefined;
    }

    const match = versions[index].id.match(RELEASE_REGEX);
    if (match) {
        return match[0];
    }

    const snapshot = versions[index].id.match(SNAPSHOT_REGEX);
    if (snapshot) {
        const year = +snapshot[1];
        const week = +snapshot[2];
        const hardcodedSnapshotVersion = findNearestReleaseMinecraftVersionBySnapshotDate(year, week);
        if (hardcodedSnapshotVersion) {
            return hardcodedSnapshotVersion;
        }
    }

    for (let i = index - 1; i >= 0; --i) {
        if (versions[i].type === MinecraftVersionType.RELEASE) {
            return versions[i].id;
        }
    }

    for (let i = index + 1; i < versions.length; ++i) {
        if (versions[i].type === MinecraftVersionType.RELEASE) {
            const match = versions[i].id.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
            if (match) {
                return `${match[1]}.${match[2]}.${(+match[3] || 0) + 1}`;
            }
        }
    }

    return undefined;
}

function findNearestReleaseMinecraftVersionBySnapshotDate(year: number, week: number): string | undefined {
    if (year === 23 && week >= 12) return "1.20";
    if (year === 20 && week >= 45 || year === 21 && week <= 20) return "1.17";
    if (year === 15 && week >= 31 || year === 16 && week <= 7) return "1.9";
    if (year === 14 && week >= 2 && week <= 34) return "1.8";
    if (year === 13 && week >= 47 && week <= 49) return "1.7.4";
    if (year === 13 && week >= 36 && week <= 43) return "1.7.2";
    if (year === 13 && week >= 16 && week <= 26) return "1.6";
    return undefined;
}

function isLegacyMinecraftVersion(version: string): boolean {
    return LEGACY_VERSION_RANGE.includes(version);
}
