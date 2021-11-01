import{_ as n,c as s,o as a,a as e}from"./app.d0d65fcc.js";const g='{"title":"Postgres and Minio","description":"","frontmatter":{},"headers":[{"level":2,"title":"Starting PostgreSQL","slug":"starting-postgresql"},{"level":2,"title":"Setup @compas/store","slug":"setup-compas-store"},{"level":2,"title":"Connecting","slug":"connecting"}],"relativePath":"features/postgres-and-minio.md","lastUpdated":1635769453832}',t={},o=e(`<h1 id="postgres-and-minio" tabindex="-1">Postgres and Minio <a class="header-anchor" href="#postgres-and-minio" aria-hidden="true">#</a></h1><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Requires <code>@compas/store</code> to be installed</p></div><p>Most projects also require some way of persisting data. Compas aides in providing a PostgreSQL client and some utilities around setting up a database.</p><h2 id="starting-postgresql" tabindex="-1">Starting PostgreSQL <a class="header-anchor" href="#starting-postgresql" aria-hidden="true">#</a></h2><p>First that we need to make sure we have a running PostgreSQL instance. Compas helps here, by managing a Docker based PostgreSQL server. Previously you have already installed <code>@compas/cli</code>, which contains the necessary commands.</p><div class="language-shell"><pre><code><span class="token function">yarn</span> compas docker up
</code></pre></div><p>As you may have seen in the output, it does not only start a PostgreSQL container, but also a Minio container. Minio is a S3 compatible document store, which can be used for saving files.</p><p>Some other docker commands provided by <code>@compas/cli</code>:</p><div class="language-shell"><pre><code><span class="token comment"># Stop the running containers</span>
<span class="token function">yarn</span> compas docker down
<span class="token comment"># Remove all created Docker containers and volumes</span>
<span class="token function">yarn</span> compas docker clean
</code></pre></div><h2 id="setup-compas-store" tabindex="-1">Setup @compas/store <a class="header-anchor" href="#setup-compas-store" aria-hidden="true">#</a></h2><p>The <code>@compas/store</code> packages provides a few abstractions over PostgreSQL and Minio:</p><ul><li>Schema migration runner</li><li>Persistent file storage</li><li>Cache files on local disk</li><li>Job queue implementation, supporting priority, recurring jobs, scheduled jobs and multiple workers</li><li>Session store compatible with the <code>session</code> middleware exported by <code>@compas/server</code>.</li><li>Test databases for integration testing</li></ul><p>These features are mostly powered by a set of environment variables. Add the following to you <code>.env</code> file:</p><div class="language-txt"><pre><code>APP_NAME=compastodo
# Postgres
POSTGRES_HOST=localhost:5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
# Minio
MINIO_URI=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
</code></pre></div><p>Let&#39;s break it down a bit. <code>APP_NAME</code> is used in various places, but most importantly it is the default name for your database, file bucket and logs. Then we have some PostgreSQL connection configuration, kept as simple as possible, and the same for Minio.</p><p>And lastly we need to install <code>@compas/store</code>:</p><div class="language-shell"><pre><code><span class="token function">yarn</span> <span class="token function">add</span> @compas/store --exact
</code></pre></div><h2 id="connecting" tabindex="-1">Connecting <a class="header-anchor" href="#connecting" aria-hidden="true">#</a></h2><p>Now that we have everything setup, let&#39;s see if we can make a connection to PostgreSQL. Create a file at <code>scripts/database.js</code> with the following contents:</p><div class="language-js"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> mainFn <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/stdlib&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> newPostgresConnection <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/store&quot;</span><span class="token punctuation">;</span>

<span class="token comment">// Remember, mainFn reads our \`.env\` file automatically</span>
<span class="token function">mainFn</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">,</span> main<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token parameter">logger</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> sql <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">newPostgresConnection</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    createIfNotExists<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span> <span class="token comment">// Create a new database if \`compastodo\` is not found</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  logger<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    result<span class="token operator">:</span> <span class="token keyword">await</span> sql<span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">SELECT 1 + 1 as &quot;sum&quot;</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// Close the connection</span>
  <span class="token keyword">await</span> sql<span class="token punctuation">.</span><span class="token function">end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>This ties in various parts of your local environment. We don&#39;t have any tables yet in our database, so we execute a &#39; simple&#39; sum query and log the result. So let&#39;s run it:</p><div class="language-shell"><pre><code><span class="token function">yarn</span> compas database
<span class="token comment"># or</span>
node ./scripts/database.js
</code></pre></div>`,22),p=[o];function c(i,r,l,u,d,k){return a(),s("div",null,p)}var h=n(t,[["render",c]]);export{g as __pageData,h as default};
