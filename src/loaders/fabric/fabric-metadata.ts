import { Dependency } from "@/dependencies";
import { MINECRAFT } from "@/games/minecraft";
import { LoaderMetadata } from "@/loaders/loader-metadata";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { getFabricDependencies, normalizeFabricDependency } from "./fabric-dependency";
import { FabricMetadataCustomPayload, getDependenciesFromFabricMetadataCustomPayload, getFabricMetadataCustomPayload, getLoadersFromFabricMetadataCustomPayload, getProjectIdFromFabricMetadataCustomPayload } from "./fabric-metadata-custom-payload";
import { RawFabricMetadata } from "./raw-fabric-metadata";

export class FabricMetadata implements LoaderMetadata {
    private readonly _raw: RawFabricMetadata;

    private constructor(raw: RawFabricMetadata) {
        this._raw = raw || {} as RawFabricMetadata;
    }

    static from(raw: RawFabricMetadata): FabricMetadata {
        return new FabricMetadata(raw);
    }

    get id(): string {
        return asString(this._raw.id || "");
    }

    get name(): string {
        return asString(this._raw.name || this._raw.id || "");
    }

    get version(): string {
        return asString(this._raw.version || "*");
    }

    get loaders(): string[] {
        return getLoadersFromFabricMetadataCustomPayload(this.customPayload);
    }

    get gameName(): string {
        return MINECRAFT;
    }

    get gameVersions(): string[] {
        return [...(this.dependencies.find(x => x.id === this.gameName)?.versions || [])];
    }

    get dependencies(): Dependency[] {
        const baseDependencies = getFabricDependencies(this._raw).map(normalizeFabricDependency).filter(x => x);
        const payloadDependencies = getDependenciesFromFabricMetadataCustomPayload(this.customPayload);
        const dependencyMap = $i(baseDependencies).concat(payloadDependencies).filter(x => x).map(x => [x.id, x] as const).toMap();
        return [...dependencyMap.values()];
    }

    get raw(): RawFabricMetadata {
        return this._raw;
    }

    get customPayload(): FabricMetadataCustomPayload {
        return getFabricMetadataCustomPayload(this._raw);
    }

    getProjectId(platform: PlatformType): string {
        return getProjectIdFromFabricMetadataCustomPayload(this.customPayload, platform) || this.id;
    }
}
