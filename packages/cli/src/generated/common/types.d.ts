// Generated by @compas/code-gen
/* eslint-disable no-unused-vars */

export type CliCommandDefinition = {
  name: string;
  shortDescription: string;
  longDescription?: undefined | string;
  modifiers: { isDynamic: boolean; isCosmetic: boolean };
  dynamicValidator?:
    | undefined
    | ((
        value: string,
      ) =>
        | { isValid: boolean; error?: { message: string } }
        | Promise<{ isValid: boolean; error?: { message: string } }>);
  subCommands: CliCommandDefinition[];
  flags: CliFlagDefinition[];
  executor?:
    | undefined
    | ((
        logger: import("@compas/stdlib").Logger,
        state: import("../../cli/types").CliExecutorState,
      ) => Promise<import("../../cli/types").CliResult> | CliResult);
};
export type CliFlagDefinition = {
  name: string;
  rawName: string;
  description?: undefined | string;
  modifiers: { isRepeatable: boolean; isRequired: boolean };
  value: {
    specification: "boolean" | "number" | "string" | "booleanOrString";
    validator?:
      | undefined
      | ((
          value: any,
        ) =>
          | { isValid: boolean; error?: { message: string } }
          | Promise<{ isValid: boolean; error?: { message: string } }>);
  };
};
export type CliCommandDefinitionInput = {
  name: string;
  shortDescription: string;
  longDescription?: undefined | string;
  modifiers?:
    | undefined
    | { isDynamic?: undefined | boolean; isCosmetic?: undefined | boolean };
  dynamicValidator?:
    | undefined
    | ((
        value: string,
      ) =>
        | { isValid: boolean; error?: { message: string } }
        | Promise<{ isValid: boolean; error?: { message: string } }>);
  subCommands?:
    | undefined
    | import("./../common/types").CliCommandDefinitionInput[];
  flags?: undefined | import("./../common/types").CliFlagDefinitionInput[];
  executor?:
    | undefined
    | ((
        logger: import("@compas/stdlib").Logger,
        state: import("../../cli/types").CliExecutorState,
      ) => Promise<import("../../cli/types").CliResult> | CliResult);
};
export type CliFlagDefinitionInput = {
  name: string;
  rawName: string;
  description?: undefined | string;
  modifiers?:
    | undefined
    | { isRepeatable?: undefined | boolean; isRequired?: undefined | boolean };
  value?:
    | undefined
    | {
        specification?:
          | undefined
          | "boolean"
          | "number"
          | "string"
          | "booleanOrString";
        validator?:
          | undefined
          | ((
              value: any,
            ) =>
              | { isValid: boolean; error?: { message: string } }
              | Promise<{ isValid: boolean; error?: { message: string } }>);
      };
};
