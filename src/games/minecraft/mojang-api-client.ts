import { Fetch, createFetch, throwOnError } from "@/utils/net";
import { VersionRange, parseVersion } from "@/utils/versioning";
import { $i } from "@/utils/collections";
import { MinecraftVersion, MinecraftVersionManifest, getMinecraftVersionManifestEntries } from "./minecraft-version";
import { getMinecraftVersionRegExp, normalizeMinecraftVersion, normalizeMinecraftVersionRange } from "./minecraft-version-lookup";

export const MOJANG_API_URL = "https://piston-meta.mojang.com/mc";

export interface MojangApiOptions {
    fetch?: Fetch;
    baseUrl?: string | URL;
}

export class MojangApiClient {
    private readonly _fetch: Fetch;
    private _versions?: ReadonlyMap<string, MinecraftVersion>;
    private _versionRegExp?: RegExp;

    constructor(options?: MojangApiOptions) {
        this._fetch = createFetch({
            handler: options?.fetch,
            baseUrl: options?.baseUrl || options?.fetch?.["baseUrl"] || MOJANG_API_URL,
        })
        .use(throwOnError());
    }

    async getMinecraftVersion(id: string): Promise<MinecraftVersion | undefined> {
        const versions = await this.getAllMinecraftVersions();
        const version = versions.get(id);
        if (version) {
            return version;
        }

        const versionRange = await this.getMinecraftVersions(id);
        return versionRange[0];
    }

    async getMinecraftVersions(range: string | Iterable<string> | VersionRange): Promise<MinecraftVersion[]> {
        const versions = await this.getAllMinecraftVersions();
        const regex = await this.getMinecraftVersionRegExp();
        const normalizedRange = normalizeMinecraftVersionRange(range, versions, regex);

        return $i(versions.values()).filter(x => normalizedRange.includes(x.version)).toArray();
    }

    private async getAllMinecraftVersions(): Promise<ReadonlyMap<string, MinecraftVersion>> {
        if (this._versions) {
            return this._versions;
        }

        const response = await this._fetch("/game/version_manifest_v2.json");
        const manifest = await response.json<MinecraftVersionManifest>();
        const manifestEntries = getMinecraftVersionManifestEntries(manifest);

        const versions = manifestEntries.map((entry, i, self) => {
            const normalizedVersion = normalizeMinecraftVersion(entry.id, self, i);
            const version = parseVersion(normalizedVersion);
            return new MinecraftVersion(entry.id, version, entry.type, entry.url, entry.releaseDate);
        });

        this._versions = new Map(versions.map(x => [x.id, x]));
        return this._versions;
    }

    private async getMinecraftVersionRegExp(): Promise<RegExp> {
        if (this._versionRegExp) {
            return this._versionRegExp;
        }

        const versions = await this.getAllMinecraftVersions();
        this._versionRegExp = getMinecraftVersionRegExp(versions.keys());
        return this._versionRegExp;
    }
}
