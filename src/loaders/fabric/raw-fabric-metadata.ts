import { ACTION_NAME } from "@/action";
import { FabricContactInformation } from "./fabric-contact-information";
import { FabricDependencyList } from "./fabric-dependency";
import { FabricDeveloper } from "./fabric-developer";
import { FabricEnvironmentType } from "./fabric-environment-type";
import { FabricMetadataCustomPayload } from "./fabric-metadata-custom-payload";

export interface RawFabricMetadata {
    schemaVersion: 1;
    id: string;
    version: string;
    provides?: string[];
    environment?: FabricEnvironmentType;
    entrypoints?: {
        main?: string[];
        client?: string[];
        server?: string[];
        [key: string]: string[] | undefined;
    };
    jars?: {
        file: string;
    }[];
    languageAdapters?: Record<string, string>;
    mixins?: (string | { config: string; environment?: FabricEnvironmentType })[];
    depends?: FabricDependencyList;
    recommends?: FabricDependencyList;
    suggests?: FabricDependencyList;
    breaks?: FabricDependencyList;
    conflicts?: FabricDependencyList;
    name?: string;
    description?: string;
    contact?: FabricContactInformation;
    authors?: (string | FabricDeveloper)[];
    contributors?: (string | FabricDeveloper)[];
    license?: string | string[];
    icon?: string | Record<string, string>;
    custom?: {
        [ACTION_NAME]?: FabricMetadataCustomPayload;
        modmanager?: FabricMetadataCustomPayload;
        [key: string]: unknown;
    };
}

export const FABRIC_MOD_JSON = "fabric.mod.json";
