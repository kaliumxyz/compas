import{_ as n,c as s,o as a,a as e}from"./app.d0d65fcc.js";const m='{"title":"Session handling","description":"","frontmatter":{},"headers":[{"level":2,"title":"Session setup","slug":"session-setup"},{"level":2,"title":"keepPublicCookie","slug":"keeppubliccookie"}],"relativePath":"features/session-handling.md","lastUpdated":1635769453832}',t={},o=e(`__VP_STATIC_START__<h1 id="session-handling" tabindex="-1">Session handling <a class="header-anchor" href="#session-handling" aria-hidden="true">#</a></h1><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Requires <code>@compas/store</code> and <code>@compas/server</code> to be installed</p></div><p>Compas comes with cookie based session handling based on @compas/server &amp; @compas/store. Note that you need to use @compas/store based migrations to use the Postgres backed store.</p><h2 id="session-setup" tabindex="-1">Session setup <a class="header-anchor" href="#session-setup" aria-hidden="true">#</a></h2><p>After enabling the migrations, enabling persistent sessions is just a few function calls away. Start by creating a session store:</p><div class="language-js"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> newSessionStore <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/store&quot;</span><span class="token punctuation">;</span>

<span class="token comment">// Pass in a sql connection</span>
<span class="token keyword">const</span> sessionsStore <span class="token operator">=</span> <span class="token function">newSessionStore</span><span class="token punctuation">(</span>sql<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p>The session handler has a number of defaults which we handle later in this document, for now let&#39;s create a Koa middleware to handle the sessions:</p><div class="language-js"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> session<span class="token punctuation">,</span> getApp <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/server&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> app <span class="token operator">=</span> <span class="token function">getApp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> sessionMiddleware <span class="token operator">=</span> <span class="token function">session</span><span class="token punctuation">(</span>app<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  store<span class="token operator">:</span> sessionStore<span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p>And now where ever we need sessions we can add the <code>sessionMiddleware</code> in to our chain.</p><div class="language-js"><pre><code>counterHandlers<span class="token punctuation">.</span>init <span class="token operator">=</span> <span class="token punctuation">[</span>
  sessionMiddleware<span class="token punctuation">,</span>
  <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token parameter">ctx<span class="token punctuation">,</span> next</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    ctx<span class="token punctuation">.</span>session <span class="token operator">=</span> <span class="token punctuation">{</span>
      counter<span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>

    ctx<span class="token punctuation">.</span>body <span class="token operator">=</span> <span class="token punctuation">{</span>
      value<span class="token operator">:</span> ctx<span class="token punctuation">.</span>session<span class="token punctuation">.</span>counter<span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">]</span><span class="token punctuation">;</span>

counterHandlers<span class="token punctuation">.</span>increment <span class="token operator">=</span> <span class="token punctuation">[</span>
  sessionMiddleware<span class="token punctuation">,</span>
  <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token parameter">ctx<span class="token punctuation">,</span> next</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token comment">// Check if a session is new</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ctx<span class="token punctuation">.</span>session<span class="token punctuation">.</span>isNew<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">throw</span> AppError<span class="token punctuation">.</span><span class="token function">validationError</span><span class="token punctuation">(</span><span class="token string">&quot;error.sessionNotInitialized&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
        message<span class="token operator">:</span> <span class="token string">&quot;Please call counterHandlers.init first&quot;</span><span class="token punctuation">,</span>
      <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// Session is our object, so increment the value</span>
    ctx<span class="token punctuation">.</span>session<span class="token punctuation">.</span>counter<span class="token operator">++</span><span class="token punctuation">;</span>

    ctx<span class="token punctuation">.</span>body <span class="token operator">=</span> <span class="token punctuation">{</span>
      value<span class="token operator">:</span> ctx<span class="token punctuation">.</span>session<span class="token punctuation">.</span>counter<span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">]</span><span class="token punctuation">;</span>

counterHandlers<span class="token punctuation">.</span>destroy <span class="token operator">=</span> <span class="token punctuation">[</span>
  sessionMiddleware<span class="token punctuation">,</span>
  <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token parameter">ctx<span class="token punctuation">,</span> next</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token comment">// Destroy the session</span>
    ctx<span class="token punctuation">.</span>session <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

    ctx<span class="token punctuation">.</span>body <span class="token operator">=</span> <span class="token punctuation">{</span> success<span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">]</span><span class="token punctuation">;</span>
</code></pre></div><p>The above code implements a counter per user. The session is persisted in to the database and if the user comes back 5 days later, they still have the same counter.</p><p>Under the hood the session middleware set&#39;s some cookies. To do this a few things are needed:</p><ul><li>CORS handling, automatically done by <a href="/api/server.html#getapp"><code>getApp</code></a> if not disabled.</li><li>The default options in <code>session</code>, overridable by the object passed as the second argument <ul><li>The cookie <code>key</code> is based on the <code>APP_NAME</code> environment variable.</li><li>The <code>maxAge</code> value for the cookie in milliseconds. Defaults to 6 days.</li><li>Automatically <code>renew</code> the cookie if the cookie expires. Defaults to <code>true</code>.</li><li>Use a <code>secure</code> cookie when running in production, based on <a href="/api/stdlib.html#isproduction"><code>isProduction</code></a></li><li>Set the <code>domain</code> based on the <code>COOKIE_URL</code> environment variable.</li><li>Set a <code>sameSite</code> value to &#39;lax&#39; so we can host the api on <code>api.compasjs.com</code> and the frontend on <code>compasjs.com</code>.</li><li>Enable <code>overwrite</code> to just force a cookie on every request, this way the <code>maxAge</code> resets on every request. Defaults to <code>true</code>.</li><li>Making the &#39;real&#39; session cookie <code>httpOnly</code>, defaults to true. So the JavaScript in the browser can&#39;t tempter with it. Defaults to <code>true</code>.</li><li>Making sure the cookie is <code>signed</code>, by using the <code>APP_KEYS</code> environment variables.</li><li>By enabling <code>autoCommit</code> to automatically persist the <code>ctx.session</code> object to the database. Should probably be disabled for high traffic api&#39;s.</li></ul></li></ul><h2 id="keeppubliccookie" tabindex="-1"><code>keepPublicCookie</code> <a class="header-anchor" href="#keeppubliccookie" aria-hidden="true">#</a></h2><p>Another option not mentioned above is the <code>keepPublicCookie</code> option, defaulting to <code>false</code>. This can only be enabled when a <code>store</code> is present like the <a href="/api/store.html#newsessionstore">session store</a>. This option keeps another cookie in sync with the session cookies that is readable by the JavaScript running in the browser. It does not contain any information and to be really sure that a valid session exists you still need to ask your api.</p>__VP_STATIC_END__`,15),p=[o];function c(i,u,l,r,k,d){return a(),s("div",null,p)}var b=n(t,[["render",c]]);export{m as __pageData,b as default};
