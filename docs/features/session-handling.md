# Session handling

Since Compas v0.0.172 Compas provides a session store based on JSON Web Tokens
and provides session transport support via both headers as well as server
managed cookies.

## JSON Web Token based

::: tip

Requires `@compas/store` to be installed

:::

Let's see what Compas brings to the table for sessions. Session in Compas allow
you to persist a data object in PostgreSQL so you can for example keep track if
a user is logged in, and add the user id to that object so you can use it when
necessary. Although JWT's are often used in combination with claim's, for
example which permissions a user has and what it's ID is, Compas doesn't support
it this way. The tokens only contain an identifier and expiration time, which
then can be used in the backend to find the underlying session object. This way
you have all the controls on the backend and can create specific routes to
expose things like which permissions the user has.

The tokens are always created in pairs: an access token and refresh token. The
access token is often short-lived, like 10 - 15 minutes stored in memory, and is
used to authenticate with api calls. The refresh token on the other hand has a
longer time to live, often limited based on the expected attack vectors like if
the application is used in public libraries for example, and can be used to
fetch a new token pair.

Let's take a look at the provided utilities by `@compas/store`. Most functions
will return a `Either<X, AppError>`, meaning that callers should handle
`returnValue.error` and handle these appropriately.

### Session store

Let's look at the primitives first. These do not require a specific way of
transporting the JWT's over for example HTTP headers or cookies.

#### `sessionStoreSettings`

Session store settings is an object expected by various functions, containing
the following properties:

- `accessTokenMaxAgeInSeconds` (number): How long access tokens should be valid.
  As mentioned, this should be short like 5 to 15 minutes.
- `refreshTokenMaxAgeInSeconds` (number): How long refresh tokens should be
  valid
- `signingKey` (string,>20 chars): The key used for signing JWT's. By changing
  this value, all sessions will be invalidated. The value should be handled as a
  secret and should be generated in a secure random way.

#### `sessionStoreCreate`

Creates a new session with the provided `sessionData` and returns a token pair.

**Example**:

```js
import { sessionStoreCreate } from "@compas/store";

const settings = {
  accessTokenMaxAgeInSeconds: 5 * 60, // 5 minutes
  refreshTokenMaxAgeInSeconds: 24 * 60 * 60, // 24 hours
  signingKey: "secure key loaded from secure place",
};

const { error, value: tokenPair } = await sessionStoreCreate(
  newEventFromEvent(event),
  sql,
  settings,
  {
    user: ".user.id",
    ...otherProps,
  },
);

if (error) {
  // handle error
} else {
  // send token pair to client
}
```

**Errors**:

- `validator.error` -> thrown when `sessionSettings` has validator errors
- `error.server.internal` -> if for some reason the JWT signing library can't
  create the access or refresh token.

#### `sessionStoreGet`

Get the session object from the `accessTokenString`. Note that this returns the
full database backed object. The `id` is necessary for updating the session
object and `data` contains the saved object for this session.

**Example**:

```js
import { sessionStoreGet } from "@compas/store";

const settings = {
  accessTokenMaxAgeInSeconds: 5 * 60, // 5 minutes
  refreshTokenMaxAgeInSeconds: 24 * 60 * 60, // 24 hours
  signingKey: "secure key loaded from secure place",
};

// Get Authorization header, showing the Koa way.
const header = ctx.get("authorization");
if (!header.startsWith("Bearer")) {
  // throw invalid header
}
const accessTokenString = header.substring("Bearer ".length);

const { error, value } = await sessionStoreGet(
  newEventFromEvent(event),
  sql,
  settings,
  accessTokenString,
);

if (error) {
  // handle error
} else {
  const { id, data } = value.session;
  // id is used for updating the session,
  // data contains your saved session data
}
```

**Errors**:

- `validator.error` -> thrown when `sessionSettings` has validator errors
- `error.server.internal` -> if for some reason the JWT validating library can't
  decode or validate the provided access token.
- `sessionStore.verifyAndDecodeJWT.invalidToken` -> when the token is not issued
  by this backend, or if it is edited by an unauthorized entity.
- `sessionStore.verifyAndDecodeJWT.expiredToken` -> if the `exp` of the token
  before the current time.
- `sessionStore.get.invalidAcessToken` -> when the decoded access token is not
  conforming the expected structure.
- `sessionStore.get.invalidSession` -> when no session can be found by the
  provided access token.
- `sessionStore.get.revokedToken` -> when the token is revoked, via for example
  `sessionStoreInvalidate` or when a new token pair is issued via
  `sessionStoreRefreshTokens`.

#### `sessionStoreUpdate`

Update the data stored for the provided session. This function will check if the
object is changed and only do a database call when that is the case.

**Example**:

```js
import { sessionStoreUpdate } from "@compas/store";

const { error } = await sessionStoreUpdate(newEventFromEvent(event), sql, {
  id: "my-session-id",
  data: {
    new: {
      data: "object",
    },
  },
});

if (error) {
  // handle error
}
// Session is saved or wasn't changed
```

**Errors**:

`sessionStore.update.invalidSession` -> when the provided session has an invalid
id or if the data is not a plain JS object.

#### `sessionStoreInvalidate`

Revoke all tokens for the provided session.

**Example**:

```js
import { sessionStoreInvalidate } from "@compas/store";

const { error } = await sessionStoreInvalidate(newEventFromEvent(event), sql, {
  id: "my-session-id",
});

if (error) {
  // handle error
}
// Session is completely invalidated
```

**Errors**:

- `sessionStore.invalidate.invalidSession` -> the provided session does not
  contain a valid identifier.

#### `sessionStoreRefreshTokens`

Get a new token pair via the provided refresh token. This invalidates the token
pair that is used. To prevent refresh token stealing, it detects if the refresh
token is already used, and if so does the following two things:

- Invalidates the session
- Creates a `compas.sessionStore.potentialLeakedSession` job, with the digest of
  session duration and tokens used as the job 'data'.

**Example**:

```js
import { sessionStoreRefreshTokens } from "@compas/store";

const settings = {
  accessTokenMaxAgeInSeconds: 5 * 60, // 5 minutes
  refreshTokenMaxAgeInSeconds: 24 * 60 * 60, // 24 hours
  signingKey: "secure key loaded from secure place",
};

const { error, value } = await sessionStoreRefreshTokens(
  newEventFromEvent(event),
  sql,
  settings,
  ctx.validatedBody.refreshToken,
);

if (error) {
  // handle error
} else {
  // return token pair to the caller
}
```

**Errors**:

- `validator.error` -> thrown when `sessionSettings` has validator errors
- `error.server.internal` -> if for some reason the JWT validating and signing
  library can't decode the refresh token, validate the provided refresh token or
  can't sign the new tokens.
- `sessionStore.verifyAndDecodeJWT.invalidToken` -> when the token is not issued
  by this backend, or if it is edited by an unauthorized entity.
- `sessionStore.verifyAndDecodeJWT.expiredToken` -> if the `exp` of the token
  before the current time.
- `sessionStore.refreshTokens.invalidRefreshToken` -> when the decoded refresh
  token is not conforming the expected structure.
- `sessionStore.refreshTokens.invalidSession` -> when no session can be found by
  the provided refresh token.
- `sessionStore.refreshTokens.revokedToken` -> when the token is revoked, via
  for example `sessionStoreInvalidate` or when a new token pair is issued via
  `sessionStoreRefreshTokens`.

#### `sessionStoreCleanupExpiredSessions`

Cleanup tokens that are expired / revoked longer than 'maxRevokedAgeInDays' days
ago. Also removes the session if no tokens exist anymore. Note that when tokens
are removed, Compas can't detect refresh token reuse, which hints on session
stealing. A good default may be 45 days.

### Session transport

Compas also supports ways of transporting the JWT's. For now limited to reading
from the HTTP Authorization header and reading and writing to HTTP cookies.

#### `SessionTransportSettings`

An object that is expected by some session transport functions. Most of the
properties have sensible defaults and are thus optional, but allow overriding.

- `sessionStoreSettings` (`SessionStoreSettings`): Specify the session store
  settings, this is passed to `sessionStoreGet` and helps decoding and verifying
  tokens.

The above properties are all required.

- `enableHeaderTransport` (boolean): Enable or disable using the 'Authorization'
  header for access token transport. Defaults to `true`.
- `enableCookieTransport` (boolean): Enable or disable using HTTP cookies for
  access and refresh token support. Defaults to `true`.

Transports are checked in the above order, and at least a single transport needs
to be enabled.

- `autoRefreshCookies` (boolean): Specifies if the cookie transport should
  automatically try to refresh cookies. Defaults to `true`.
- `headerOptions` (object): A still empty object to configure reading the header
  transport.
- `cookieOptions` (object): An object to configure reading and writing cookies.
  - `cookiePrefix` (string): A prefix to use when formatting cookie names. See
    the 'Cookie names' section below.
  - `sameSite` ("strict"|"lax"): Configure the same site cookie option. Defaults
    to 'lax'.
  - `secure` (boolean): Configure the `Secure` property of cookies. Defaults to
    `isProduction()`.
  - `cookies` (SessionTransportCookieSettings[]): Array with cookies you want to
    set. See ' SessionTransportCookieSettings' below for more information.
    Defaults to `[{ domain: "own" }, { domain: "origin" }]`

**Cookie names**

Cookies always come in triples, `accessToken`, `refreshToken` and `public`. The
`public` cookie is the only non-`httpOnly` cookie and is thus readable (and
writeable, but not advisable) by client side JavaScript. These names can
automatically be prefixed by specifying one of the following:

- `options.cookieOptions.cookiePrefix` -> `$prefix$.accessToken`
- `environment.APP_NAME` -> `$environment.APP_NAME$.accessToken`

**SessionTransportCookieSettings**

An object defining domains on which cookies need to be set. All properties
except of `domain` default to the `cookieOptions.xxx` defined above. The cookie
expiration is taken from the JWT's and the `public` cookie uses the same
expiration from the refresh token.

- `domain` ("own"|"origin"|string): The domain on which the cookie triplet is
  set. 'Origin' reads the request origin header, and 'own' does not specify a
  domain when setting the cookies.
- `sameSite` ("strict"|"lax"): Set the 'SameSite' behaviour, defaults to
  `cookieOptions.sameSite`.
- `secure` (boolean): Set the `Secure` behaviour, defaults to
  `cookieOptions.secure`.

Some examples of which cookies are set based on the `cookies` array:

- `[]` -> no cookies are sent
- `[{ domain: "origin" }]` -> Three cookies (accessToken, refreshToken and
  public) are set for the request origin domain.
- `[{ domain: "own" }]` -> The cookie triplet is set without a domain, and thus
  on the domain where the api lives.
- `[{ domain: "api.example.com" }, { domain: "own" }]` -> Set's the triplet both
  on `api.exmaple.com` as well as on the domain where the api is hosted on.

#### `sessionTransportLoadFromContext`

Tries to load the session based on the provided context and options.

If `enableHeaderTransport` is set, the `Authorization` header is read first. The
value is expected to be in the `Bearer $accessToken` format. When a token is
found in the header, it is passed to [`sessionStoreGet`](#sessionstoreget) and
the result is returned. If no access token is found, the following steps are
taken.

If `enableCookieTransport` is set, it will try to load a session from the
cookies. When there is only an 'refreshToken' found, it will automatically
refresh the tokens and set new cookies. For more information about setting the
cookies, see
[`sessionTransportAddAsCookiesToContext`](#sessiontransportaddascookiestocontext)

**Example**:

```js
import { sessionTransportLoadFromContext } from "@compas/store";
import { getApp } from "@compas/server";

const sessionStoreSettings = {
  accessTokenMaxAgeInSeconds: 5 * 60, // 5 minutes
  refreshTokenMaxAgeInSeconds: 24 * 60 * 60, // 24 hours
  signingKey: "secure key loaded from secure place",
};

const sessionTransportSettings = {
  sessionStoreSettings, // use defaults
};

const app = getApp();
app.use(async (ctx, next) => {
  const { error, value: session } = await sessionTransportLoadFromContext(
    newEventFromEvent(ctx.event),
    sql,
    ctx,
    sessionTransportSettings,
  );

  if (error) {
    // handle error
  } else {
    // return token pair to the caller
  }
});
```

**Errors**:

- Infers all errors from [`sessionStoreGet`](#sessionstoreget)
- `error.server.internal` -> if the provided `SessionTransportSettings` are
  invalid.

#### `sessionTransportAddAsCookiesToContext`

Set new cookies based on the provided `tokenPair` and supports invalidating the
cookies when no `tokenPair` is provided. See [`SessionTransportSettings`] for
more information about how cookies are set.

**Example**:

```js
import {
  sessionTransportAddAsCookiesToContext,
  sessionStoreCreate,
} from "@compas/store";
import { getApp } from "@compas/server";

const sessionStoreSettings = {
  accessTokenMaxAgeInSeconds: 5 * 60, // 5 minutes
  refreshTokenMaxAgeInSeconds: 24 * 60 * 60, // 24 hours
  signingKey: "secure key loaded from secure place",
};

const sessionTransportSettings = {
  sessionStoreSettings, // use defaults
};

const app = getApp();
app.use(async (ctx, next) => {
  const tokenPair = await sessionStoreCreate(
    newEventFromEvent(ctx.event),
    sql,
    sessionStoreSettings,
    {},
  );
  if (tokenPair.error) {
    // handle error
  }

  await sessionTransportAddAsCookiesToContext(
    newEventFromEvent(ctx.event),
    ctx,
    tokenPair.value,
    sessionTransportSettings,
  );
});
```

**Errors**:

- Infers all errors from [`sessionStoreGet`](#sessionstoreget)
- `error.server.internal` -> if the provided `SessionTransportSettings` are
  invalid.
