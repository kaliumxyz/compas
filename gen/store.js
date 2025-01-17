import { TypeCreator } from "@compas/code-gen";

/**
 * @param app
 */
export function applyStoreStructure(app) {
  const T = new TypeCreator("store");

  app.add(
    T.object("imageTransformOptions")
      .docs(
        `Set as '.query(T.reference("store", "imageTransformOptions"))' of routes that use 'sendTransformedImage'.`,
      )
      .keys({
        q: T.number().min(1).max(100).convert().default(75),
        w: T.number().min(1).max(99999).convert(),
      })
      .loose(),

    T.object("jobInterval")
      .docs(`Interval specification of 'addRecurringJobToQueue'.`)
      .keys({
        years: T.number().optional(),
        months: T.number().optional(),
        days: T.number().optional(),
        hours: T.number().optional(),
        minutes: T.number().optional(),
        seconds: T.number().optional(),
      }),

    T.object("file")
      .docs(`Postgres based file storage.`)
      .keys({
        bucketName: T.string().searchable(),
        contentLength: T.number(),
        contentType: T.string(),
        name: T.string(),
        meta: T.object("fileMeta")
          .keys({
            transforms: T.any().optional(),
            transformedFromOriginal: T.string().optional(),
          })
          .default("{}")
          .docs("User definable, optional object to store whatever you want"),
      })
      .enableQueries({ withSoftDeletes: true })
      .relations(),

    T.object("fileGroup")
      .docs(
        `Create a 'folder' like structure referencing to 'file', with custom ordering support.`,
      )
      .keys({
        name: T.string().optional(),

        // Hack to get an increasing integer by default.
        order: T.number()
          .searchable()
          .default("Math.floor(Date.now() / 1000000)"),
        meta: T.object("fileGroupMeta")
          .keys({})
          .default("{}")
          .docs("User definable, optional object to store whatever you want"),
      })
      .enableQueries({ withSoftDeletes: true })
      .relations(
        T.oneToOne("file", T.reference("store", "file"), "group").optional(),
        T.manyToOne(
          "parent",
          T.reference("store", "fileGroup"),
          "children",
        ).optional(),
        T.oneToMany("children", T.reference("store", "fileGroup")),
      ),

    T.object("sessionStore")
      .docs(`Session data store, used by 'sessionStore*' functions.`)
      .keys({
        data: T.any().default("{}"),
        checksum: T.string(),
        revokedAt: T.date().optional(),
      })
      .relations(
        T.oneToMany("accessTokens", T.reference("store", "sessionStoreToken")),
      )
      .enableQueries({
        withDates: true,
      }),

    T.object("sessionStoreToken")
      .docs(`Store all tokens that belong to a session.`)
      .keys({
        expiresAt: T.date().searchable(),
        revokedAt: T.date().optional().searchable(),
        createdAt: T.date(),
      })
      .relations(
        T.manyToOne(
          "session",
          T.reference("store", "sessionStore"),
          "accessTokens",
        ),
        T.oneToOne(
          "refreshToken",
          T.reference("store", "sessionStoreToken"),
          "accessToken",
        ).optional(),
      )
      .enableQueries({}),

    T.object("job")
      .docs(
        `
      Postgres based job queue.
      Use {@link addEventToQueue}, {@link addRecurringJobToQueue} and {@link addJobWithCustomTimeoutToQueue}
      to insert new jobs in to the queue.
      Use {@link JobQueueWorker} as a way to pick up jobs.
      `,
      )
      .keys({
        id: T.number().primary(),
        isComplete: T.bool().default("false").searchable(),
        priority: T.number().default("0").min(0),
        scheduledAt: T.date().defaultToNow().searchable(),
        name: T.string().searchable(),
        data: T.any().default("{}"),
        retryCount: T.number().default(0),
        handlerTimeout: T.number().min(1000).optional(),
      })
      .enableQueries({ withDates: true }),
  );
}
