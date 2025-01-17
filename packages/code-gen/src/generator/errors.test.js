import { mainTestFn, test } from "@compas/cli";
import { codeGenToTemporaryDirectory } from "../../test/utils.test.js";
import { TypeCreator } from "../builders/TypeCreator.js";

mainTestFn(import.meta);

test("code-gen/errors", (t) => {
  t.test("structureReservedGroupName", async (t) => {
    const T = new TypeCreator("static");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [T.object("foo").keys({}).enableQueries()],
      {
        enabledGenerators: ["type"],
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("Group 'static' is a JavaScript or TypeScript"));
  });

  t.test("structureUnknownOrEmptyGroup", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [T.object("foo").keys({}).enableQueries()],
      {
        enabledGenerators: ["type"],
        enabledGroups: ["foo", "bar"],
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("Group 'foo' is provided in"));
    t.ok(stdout.includes("Group 'bar' is provided in"));
  });

  t.test("sqlEnableValidator", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [T.object("foo").keys({}).enableQueries()],
      {
        enabledGenerators: ["sql"],
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("Validator generator not enabled"));
  });

  t.test("sqlMissingPrimaryKey", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [
        T.object("foo").keys({}).enableQueries({
          withPrimaryKey: false,
        }),
      ],
      {
        isNodeServer: true,
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("Type 'foo' is missing a primary key"));
  });

  t.test(
    "sqlMissingPrimaryKey - via reference that has no queries enabled",
    async (t) => {
      const T = new TypeCreator("app");
      const { stdout, exitCode } = await codeGenToTemporaryDirectory(
        [
          T.object("foo")
            .keys({})
            .enableQueries({})
            .relations(T.oneToOne("bar", T.reference("app", "bar"), "foo")),

          T.object("bar").keys({}),
        ],
        {
          isNodeServer: true,
        },
      );

      t.equal(exitCode, 1);
      t.ok(stdout.includes("Type 'bar' is missing a primary key"));
    },
  );

  t.test("sqlForgotEnableQueries", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [
        T.object("foo")
          .keys({})
          .enableQueries({})
          .relations(T.oneToOne("bar", T.reference("app", "bar"), "foo")),

        // Needs a primary key, else a missing primary key error will be thrown
        T.object("bar").keys({
          id: T.uuid().primary(),
        }),
      ],
      {
        isNodeServer: true,
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("Type 'bar' did not call 'enableQueries'"));
  });

  t.test("sqlDuplicateRelationOwnKey", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [
        T.object("foo")
          .keys({})
          .enableQueries({})
          .relations(
            T.manyToOne("baz", T.reference("app", "bar"), "baz"),
            T.oneToOne("baz", T.reference("app", "bar"), "baz"),
          ),

        T.object("bar")
          .keys({})
          .enableQueries({})
          .relations(T.oneToMany("baz", T.reference("app", "foo"))),
      ],
      {
        isNodeServer: true,
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("multiple relations with the same own key 'baz'"));
  });

  t.test("sqlDuplicateRelationReferencedKey", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [
        T.object("foo")
          .keys({})
          .enableQueries({})
          .relations(
            T.manyToOne("baz", T.reference("app", "bar"), "baz"),
            T.oneToOne("baz", T.reference("app", "bar"), "baz"),
          ),

        T.object("bar")
          .keys({})
          .enableQueries({})
          .relations(T.oneToMany("baz", T.reference("app", "foo"))),
      ],
      {
        isNodeServer: true,
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("multiple relations to 'AppBar'.'baz'"));
  });

  t.test("sqlMissingOneToMany", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [
        T.object("foo")
          .keys({})
          .enableQueries({})
          .relations(T.manyToOne("bar", T.reference("app", "bar"), "foo")),

        T.object("bar").keys({}).enableQueries(),
      ],
      {
        isNodeServer: true,
      },
    );

    t.equal(exitCode, 1);
    t.ok(
      stdout.includes(
        "Relation from 'foo' is missing the inverse 'T.oneToMany()'",
      ),
    );
  });

  t.test("sqlUnusedOneToMany", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [
        T.object("foo").keys({}).enableQueries({}),

        T.object("bar")
          .keys({})
          .enableQueries()
          .relations(T.oneToMany("foo", T.reference("app", "foo"))),
      ],
      {
        isNodeServer: true,
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("Relation defined for 'bar', referencing 'foo'"));
  });

  t.test("sqlDuplicateShortName", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [
        T.object("foo").keys({}).enableQueries({}).shortName("test"),

        T.object("bar").keys({}).enableQueries().shortName("test"),
      ],
      {
        isNodeServer: true,
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("Short name 'test' is used by both"));
  });

  t.test("sqlReservedRelationKey", async (t) => {
    const T = new TypeCreator("app");
    const { stdout, exitCode } = await codeGenToTemporaryDirectory(
      [
        T.object("foo")
          .keys({})
          .enableQueries({})
          .relations(
            T.oneToOne("select", T.reference("app", "bar"), "orderBy"),
          ),

        T.object("bar").keys({}).enableQueries(),
      ],
      {
        isNodeServer: true,
      },
    );

    t.equal(exitCode, 1);
    t.ok(stdout.includes("Relation name 'select' from type 'foo'"));
    t.ok(stdout.includes("Relation name 'orderBy' from type 'bar'"));
  });
});
