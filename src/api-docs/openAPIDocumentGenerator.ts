import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { helpersRegistry } from "@/api/helpers/helpersRouter";
import { nominationsRegistry } from "@/api/nominations/nominationsRouter";
import { roundsRegistry } from "@/api/rounds/roundsRouter";
import { historyRegistry } from "@/api/history/historyRoute";
import { signersRegistry } from "@/api/signers/signersRoute";
import { votesRegistry } from "@/api/votes/votesRouter";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    helpersRegistry,
    nominationsRegistry,
    roundsRegistry,
    historyRegistry,
    signersRegistry,
    votesRegistry,
  ]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
  });
}