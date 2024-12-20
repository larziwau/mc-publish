import { Awaitable } from "@/utils/types";
import { GameVersion } from "./game-version";
import { MINECRAFT, MINECRAFT_VERSION_PROVIDER } from "./minecraft";

export interface GameVersionProvider {
    (versions: string[]): Awaitable<GameVersion[]>;
}

const GAME_VERSION_PROVIDERS: ReadonlyMap<string, GameVersionProvider> = new Map([
    [MINECRAFT, MINECRAFT_VERSION_PROVIDER],
]);

export function getGameVersionProviderByName(name: string): GameVersionProvider | undefined {
    return GAME_VERSION_PROVIDERS.get(name);
}
