import { addGroupsToGeneratorInput, addToData } from "../generate.js";
import { js } from "./tag/index.js";

/**
 * If `options.dumpStructure` and/or `options.dumpApiStructure` is true, create a
 * structure.js file with the structure payload
 *
 * @param {import("../generated/common/types").CodeGenContext} context
 */
export function generateStructureFile(context) {
  let structureSource = "";

  structureSource = `export const compasGenerateSettings = ${JSON.stringify(
    context.options,
  )};`;

  if (context.options.dumpStructure) {
    for (const group of Object.keys(context.structure)) {
      // Make it safe to inject in contents
      const string = JSON.stringify(context.structure[group]).replace(
        /(['\\])/gm,
        (v) => `\\${v}`,
      );

      structureSource += js`
        export const ${group}StructureString = '${string}';
        export const ${group}Structure = JSON.parse(${group}StructureString);
      `;
    }

    const groups = Object.keys(context.structure)
      .map((it) => `{ ${it}: ${it}Structure }`)
      .join(", ");

    structureSource += js`
      export const structure = Object.assign({}, ${groups});
      export const structureString = JSON.stringify(structure);
    `;
  }

  if (context.options.dumpApiStructure) {
    /** @type {import("../generated/common/types").CodeGenStructure} */
    const apiStructure = {};
    // Create a new structure object with all routes
    for (const groupValues of Object.values(context.structure)) {
      for (const type of Object.values(groupValues)) {
        if (type.type !== "route") {
          continue;
        }
        addToData(apiStructure, type);
      }
    }

    // Include recursive references that are used in route types
    addGroupsToGeneratorInput(
      apiStructure,
      context.structure,
      Object.keys(apiStructure),
    );

    const string = JSON.stringify(apiStructure).replace(
      /(['\\])/gm,
      (v) => `\\${v}`,
    );

    // We only need a string here at all times, which saves us on some doing a
    // stringify when sending the structure response.
    structureSource += js`
      export const compasApiStructureString = '${string}';
    `;
  }

  if (structureSource.length > 0) {
    context.outputFiles.push({
      contents: js`${structureSource}`,
      relativePath: `./common/structure${context.extension}`,
    });
  }
}
