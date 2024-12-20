import { Version } from "@/utils/versioning";

export interface GameVersion {
    get id(): string;
    get version(): Version;
    get isSnapshot(): boolean;
    get isAlpha(): boolean;
    get isBeta(): boolean;
    get isRelease(): boolean;
}
