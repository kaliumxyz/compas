import { eventStart, eventStop, newEventFromEvent } from "@compas/stdlib";
import {
  cliParserGetKnownFlags,
  cliParserParseCommand,
  cliParserSplitArgs,
} from "./parser.js";

/**
 * Init help command and flags. Note that we are after the validators. So be good about
 * things.
 * The help command adds all other commands as their sub commands, this way we can auto
 * complete for sub commands.
 * Also registers both `-h` and `--help`. The `-h` is officially not allowed, but works
 * after the validators.
 *
 * @param {import("./types").CliResolved} cli
 */
export function cliHelpInit(cli) {
  cli.subCommands.push({
    name: "help",
    subCommands: cli.subCommands,
    flags: [],
    shortDescription: "Display help text",
    longDescription: "// TODO",
    modifiers: {
      isCosmetic: false,
      isDynamic: false,
    },
    executor: () => {
      throw new Error(
        `This should never happen, please report this to the maintainers of this cli.`,
      );
    },
    parent: cli,
  });

  cli.flags.push(
    {
      name: "help",
      rawName: "-h",
      modifiers: {
        isRepeatable: false,
        isRequired: false,
      },
      description: "Display help text",
      value: {
        specification: "boolean",
      },
    },
    {
      name: "help",
      rawName: "--help",
      modifiers: {
        isRepeatable: false,
        isRequired: false,
      },
      description: "Display help text",
      value: {
        specification: "boolean",
      },
    },
  );
}

/**
 *
 * @param {string[]} commandArgs
 * @param {string[]} flagArgs
 * @returns {boolean}
 */
export function cliHelpShouldRun(commandArgs, flagArgs) {
  return (
    commandArgs[0] === "help" ||
    flagArgs.includes("-h") ||
    flagArgs.includes("--help")
  );
}

/**
 * Print help message for the specified command
 *
 * @param {import("@compas/stdlib").InsightEvent} event
 * @param {import("./types").CliResolved} cli
 * @param {string[]} userInput
 * @returns {Promise<import("@compas/stdlib").Either<string, { message: string }>>}
 */
export async function cliHelpGetMessage(event, cli, userInput) {
  eventStart(event, "cliHelp.getMessage");

  // Filter out help, so we can use the input again to determine the command that we need
  // to print help for.
  const userInputWithoutHelp = userInput.filter(
    (it, idx) =>
      it !== "-h" &&
      it !== "--help" &&
      ((idx === 0 && it !== "help") || idx !== 0),
  );

  const { commandArgs } = cliParserSplitArgs(userInputWithoutHelp);

  // Use parse directly, since cliCommandDetermine, would recursively select the help
  // command in case of for example a `modifiers.isCosmetic` command
  const command = await cliParserParseCommand(
    newEventFromEvent(event),
    cli,
    commandArgs,
  );

  if (command.error) {
    return command;
  }

  const knownFlags = [...cliParserGetKnownFlags(command.value).values()]
    .filter((it) => it.rawName !== "-h" && it.rawName !== "--help")
    .sort((a, b) => a.rawName.localeCompare(b.rawName));
  const subCommands = command.value.subCommands
    .filter((it) => !it.modifiers.isDynamic)
    .sort((a, b) => a.name.localeCompare(b.name));
  const dynamicSubCommand = command.value.subCommands.find(
    (it) => it.modifiers.isDynamic,
  );

  let synopsis = `${cli.name} ${commandArgs.join(" ")}`.trim();

  if (subCommands.length && command.value.modifiers.isCosmetic) {
    synopsis += " COMMAND";
  } else if (subCommands.length) {
    synopsis += " [COMMAND]";
  } else if (dynamicSubCommand) {
    synopsis += ` {${dynamicSubCommand.name}}`;
  }

  const value = `

Usage: ${synopsis}

${command.value.shortDescription}
${
  command.value.longDescription
    ? `\n\n${command.value.longDescription}\n\n`
    : "\n"
}
Commands:
${formatTable(
  subCommands.map((it) => {
    return {
      key: `${it.modifiers.isDynamic ? "{" : ""}${it.name}${
        it.modifiers.isDynamic ? "}" : ""
      }`,
      value: it.shortDescription ?? "",
    };
  }),
)}

Flags:
${formatTable(
  knownFlags.map((it) => {
    return {
      key: it.rawName,
      value: `${it.description ?? ""} (${it.modifiers.isRequired ? "!" : ""}${
        it.value.specification
      }${it.modifiers.isRepeatable ? "[]" : ""})`.trim(),
    };
  }),
)}
`;

  eventStop(event);
  return {
    value,
  };
}

function formatTable(input) {
  let longestKey = 0;

  for (const item of input) {
    longestKey = Math.max(longestKey, item.key.length);
  }

  // Add spacing between columns
  longestKey += 4;

  // Make sure we don't go over interactive terminal width. Also subtracts some to get
  // some margin
  const maxWidth = (process.stdout.columns ?? Number.MAX_SAFE_INTEGER) - 2;

  for (const item of input) {
    item.key = `  ${item.key.padEnd(longestKey, " ")}`;

    let value = "";

    let column = item.key.length;
    for (const word of item.value.split(" ")) {
      if (column + word.length >= maxWidth) {
        column = item.key.length;
        value += `\n   ${"".padEnd(longestKey, " ")}`;
      } else {
        value += " ";
        column += 1;
      }

      value += word;
      column += word.length;
    }

    item.value = value;
  }

  return input.map((it) => `${it.key}${it.value}`).join("\n");
}
