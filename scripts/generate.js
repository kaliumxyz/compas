import { mainFn, spawn } from "@compas/stdlib";
import {
  generateCli,
  generateCodeGen,
  generateOpenApiSpec,
  generateRepo,
  generateStore,
  generateTestAndBench,
  generateTypes,
} from "../src/generate.js";

/** @type {CliWatchOptions} */
export const cliWatchOptions = {
  ignoredPatterns: ["generated"],
  extensions: ["tmpl", "js", "json"],
};

mainFn(import.meta, main);

async function main(logger) {
  await generateCli();
  await generateCodeGen();
  await generateStore();
  await generateRepo();
  await generateTestAndBench();
  await generateTypes();
  await generateOpenApiSpec();

  logger.info("Transpiling typescript...");

  await spawn("yarn", ["tsc", "-p", "./tsconfig.client-gen.json"], {
    shell: true,
  });
}
