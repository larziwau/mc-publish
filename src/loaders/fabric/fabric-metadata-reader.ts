import { PathLike } from "node:fs";
import { readAllZippedText } from "@/utils/io/file-info";
import { LoaderMetadataReader } from "../loader-metadata-reader";
import { FabricMetadata } from "./fabric-metadata";
import { FABRIC_MOD_JSON } from "./raw-fabric-metadata";

export class FabricMetadataReader implements LoaderMetadataReader<FabricMetadata> {
    async readMetadataFile(path: PathLike): Promise<FabricMetadata> {
        const metadataText = await readAllZippedText(path, FABRIC_MOD_JSON);
        return FabricMetadata.from(JSON.parse(metadataText));
    }
}
