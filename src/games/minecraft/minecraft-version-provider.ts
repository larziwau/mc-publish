import { GameVersionProvider } from "@/games/game-version-provider";
import { MojangApiClient } from "./mojang-api-client";

export const MINECRAFT_VERSION_PROVIDER: GameVersionProvider = MojangApiClient.prototype.getMinecraftVersions.bind(new MojangApiClient());
