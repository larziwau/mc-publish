import { GameVersion } from "@/games/game-version";
import { Version, VersionType } from "@/utils/versioning";
import { MinecraftVersionType } from "./minecraft-version-type";

export class MinecraftVersion implements GameVersion {
    private readonly _id: string;
    private readonly _version: Version;
    private readonly _mcType: MinecraftVersionType;
    private readonly _type: VersionType;
    private readonly _url: string;
    private readonly _releaseDate: Date;

    constructor(id: string, version: Version, type: MinecraftVersionType, url: string, releaseDate: Date) {
        this._id = id;
        this._version = version;
        this._mcType = type;
        this._type = MinecraftVersionType.toVersionType(type, String(version));
        this._url = url;
        this._releaseDate = releaseDate;
    }

    get id(): string {
        return this._id;
    }

    get version(): Version {
        return this._version;
    }

    get type(): VersionType {
        return this._type;
    }

    get url(): string {
        return this._url;
    }

    get releaseDate(): Date {
        return this._releaseDate;
    }

    get isAlpha(): boolean {
        return this._type === VersionType.ALPHA;
    }

    get isBeta(): boolean {
        return this._type === VersionType.BETA;
    }

    get isSnapshot(): boolean {
        return !this.isRelease;
    }

    get isRelease(): boolean {
        return this._type === VersionType.RELEASE;
    }

    get isOldAlpha(): boolean {
        return this._mcType === MinecraftVersionType.OLD_ALPHA;
    }

    get isOldBeta(): boolean {
        return this._mcType === MinecraftVersionType.OLD_BETA;
    }

    toString(): string {
        return this._id;
    }
}

export interface MinecraftVersionManifest {
    latest: {
        release: string;
        snapshot: string;
    };
    versions: RawMinecraftVersionManifestEntry[];
}

interface RawMinecraftVersionManifestEntry {
    id: string;
    type: MinecraftVersionType;
    url: string;
    time: string;
    releaseTime: string;
    sha1: string;
    complianceLevel: number;
}

export interface MinecraftVersionManifestEntry extends RawMinecraftVersionManifestEntry {
    releaseDate: Date;
}

export function getMinecraftVersionManifestEntries(manifest: MinecraftVersionManifest): MinecraftVersionManifestEntry[] {
    return manifest.versions
        .map(x => ({ ...x, releaseDate: new Date(x.releaseTime) }))
        .sort((a, b) => b.releaseDate.valueOf() - a.releaseDate.valueOf());
}
