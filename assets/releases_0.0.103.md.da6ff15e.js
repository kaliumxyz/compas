import{_ as e,c as a,o as n,a as s}from"./app.d0d65fcc.js";const f='{"title":"Release notes v0.0.103","description":"","frontmatter":{},"headers":[{"level":3,"title":"In closing","slug":"in-closing"}],"relativePath":"releases/0.0.103.md","lastUpdated":1635769453832}',t={},o=s(`<h1 id="release-notes-v0-0-103" tabindex="-1">Release notes v0.0.103 <a class="header-anchor" href="#release-notes-v0-0-103" aria-hidden="true">#</a></h1><p>Another big release, another set of release notes. Usually that means there are some breaking changes, as is the case with v0.0.103. This release notes are a bit different tho, we renamed to Compas! Due to that we have a bit more breaking changes than planned. Find a migration guide near the bottom of this doc. Buckle up, and let&#39;s get started.</p><h5 id="tl-dr" tabindex="-1">TL;DR <a class="header-anchor" href="#tl-dr" aria-hidden="true">#</a></h5><p>First time this is needed, let&#39;s go:</p><ul><li>Stable generated validators</li><li>Any type custom validators</li><li>Default validator errors, removed <code>validatorSetError</code></li><li>Add <code>dumpApiStructure</code></li><li>Generate sql query builders</li></ul><h5 id="lint-config-changes" tabindex="-1">Lint config changes <a class="header-anchor" href="#lint-config-changes" aria-hidden="true">#</a></h5><p>We did some version bumps on the dependencies of @compas/lint-config. This brought a new ESLint rule <a href="https://eslint.org/docs/rules/no-unsafe-optional-chaining" target="_blank" rel="noopener noreferrer">no-unsafe-optional-chaining</a>. This is now enabled by default.</p><h5 id="stable-validator-output" tabindex="-1">Stable validator output <a class="header-anchor" href="#stable-validator-output" aria-hidden="true">#</a></h5><p>Previously, if you introduced a new type somewhere, all anonymous validators would get a different name. This was simply based on an increasing number, where a unique type would get a new number and thus created function names like <code>anonymousValidator3</code>. The new anonymous validator names will look something like <code>anonymousValidator781180217</code>. These names are based on a hash generated from te type. This results in git diffs being easier to read.</p><h5 id="any-validators" tabindex="-1">Any Validators <a class="header-anchor" href="#any-validators" aria-hidden="true">#</a></h5><p>We now have support for custom validators for <code>T.any()</code> types. These should return a boolean value, and don&#39;t have to worry about nullability. A simple example:</p><div class="language-js"><pre><code><span class="token comment">// generate.js</span>

<span class="token keyword">const</span> <span class="token constant">T</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TypeCreator</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
app<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>
  <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">any</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">raw</span><span class="token punctuation">(</span><span class="token string">&quot;{ myType: true }&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">validator</span><span class="token punctuation">(</span><span class="token string">&quot;myValidator&quot;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    javaScript<span class="token operator">:</span> <span class="token string">&#39;import { myValidator } from &quot;./dist/custom-validators.js&quot;;&#39;</span><span class="token punctuation">,</span>
    typeScript<span class="token operator">:</span> <span class="token string">&#39;import { myValidator } from &quot;./src/custom-validators.ts&quot;;&#39;</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><div class="language-ts"><pre><code><span class="token comment">// src/custom-validator.js</span>

<span class="token keyword">type</span> <span class="token class-name">MyType</span> <span class="token operator">=</span> <span class="token punctuation">{</span> myType<span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">function</span> <span class="token function">isMyType</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span><span class="token operator">:</span> value <span class="token keyword">is</span> MyType <span class="token punctuation">{</span>
  <span class="token keyword">return</span> value<span class="token operator">?.</span>myType <span class="token operator">===</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>This way you can even reuse you custom validator as a TypeScript type-guard.</p><h5 id="inline-validators" tabindex="-1">Inline validators <a class="header-anchor" href="#inline-validators" aria-hidden="true">#</a></h5><p>To improve performance and reduce call stacks, we introduce inline validators. This is a fully backwards compatible change. For now only a few cases will be inlined, for example any types, booleans, string oneOf and references. There is a trade-off here between re-usability and decreasing callstacks. So we are not sure yet how far this will go and if we should find a better way of doing it.</p><h5 id="simplified-strict-object-validation" tabindex="-1">Simplified strict object validation <a class="header-anchor" href="#simplified-strict-object-validation" aria-hidden="true">#</a></h5><p>In your anonymous-validator file, you will now find all static keys of the objects that are validated in strict mode. Instead of allocating a Set every validation call, we now reuse this set, and do the strict check first. This is inspired by the key checks done in the generated <code>UPDATE</code> and <code>INSERT</code> query partials.</p><h5 id="simplified-validation-errors" tabindex="-1">Simplified validation errors <a class="header-anchor" href="#simplified-validation-errors" aria-hidden="true">#</a></h5><p>We do not generate <code>validationSetError</code> any more. Instead we have defaults depending on the <code>throwingValidators</code> option. When true, as is the default for <code>isNodeServer</code>, this will throw via <code>AppError.validationError</code> and thus result in a <code>400</code> status code in a HTTP request context. When <code>throwingValidators</code> is false, the default for <code>isNode</code> and <code>isBrowser</code>, The returned errors array, will contain plain JavaScript objects.</p><h5 id="removed-default-of-unsafe-dumpstructure-option" tabindex="-1">Removed default of unsafe <code>dumpStructure</code> option <a class="header-anchor" href="#removed-default-of-unsafe-dumpstructure-option" aria-hidden="true">#</a></h5><p>Dump structure served us well as the only way of exposing a structure to the outside world. However, it has some downsides. The outside world does not need to know what the object relations are, or other internal types. So we added <code>dumpApiStructure</code>. This only exposes the routes and types referenced by the routes. As a side effect, this breaks for generated api clients that depend on these types.</p><p>When <code>isNodeServer</code> is true, this new settings are in effect as defaults. For package maintainers, you would need to add <code>dumpStructure</code> to the generator options, if it is part of your api surface.</p><h5 id="sql-query-builders" tabindex="-1">SQL Query builders <a class="header-anchor" href="#sql-query-builders" aria-hidden="true">#</a></h5><p>The biggest feature of this release is nested sql query builders. It solves a few things in one go:</p><ul><li>Get nested results from Postgres</li><li>Transform results in usable JavaScript objects, converting Dates back and removing nulls</li><li>Includes the old traverse builder</li></ul><p>There are still lots of missing features and some limitations:</p><ul><li>Offset and limit are not supported in nested builders yet</li><li>Generated transformers don&#39;t work with self referencing types, either direct or indirect.</li><li>Transformers only work correctly nested with a valid builder object. This will most likely always be the case.</li></ul><p>Note that we have enabled the transformers for the basic queries as well, and thus you&#39;d be able to directly benefit from it without having to use a nested query.</p><h5 id="sql-where-and-query-builder-argument-validation" tabindex="-1">SQL Where and query builder argument validation <a class="header-anchor" href="#sql-where-and-query-builder-argument-validation" aria-hidden="true">#</a></h5><p>We have removed the custom key check from generated Where partials, and now use full validator features. This may not be completely obvious, but as noted above will result in a <code>AppError.validationError</code>.</p><h5 id="sql-where-or-support" tabindex="-1">SQL Where or support <a class="header-anchor" href="#sql-where-or-support" aria-hidden="true">#</a></h5><p>The last small, but darn useful feature is <code>OR</code> support in the generated Where partials. The new where-objects now accept an <code>$or</code> key with an array of nested where-objects. This allows for any recursing <code>OR</code> and <code>AND</code> combination necessary.</p><h5 id="migration-guide" tabindex="-1">Migration guide <a class="header-anchor" href="#migration-guide" aria-hidden="true">#</a></h5><p>This will be a collection of steps and settings to overcome the breaking changes. Make sure to update the dependencies, that depend on Compas, first. So first any packages, then private services and then the final project that depends on these packages and services. Projects that only use the api client generators, should wait on the respective api&#39;s to update.</p><p>The first thing is to clean up the current installation:</p><div class="language-shell"><pre><code><span class="token function">yarn</span> lbu docker clean
</code></pre></div><p>This will remove the Docker containers and volumes created by LBU. Next install the new packages, by replacing <code>@lbu</code> with <code>@compas</code> and changing the versions to <code>0.0.103</code>. At this point it is a good time tho rename all your imports and script references. For imports, the following replace may work:</p><ul><li>Replace search: <code>&quot;@lbu/([\\w-]+)&quot;</code></li><li>Replace value: <code>&quot;@compas/$1&quot;</code></li></ul><p>There are no default generate settings for packages anymore. A good starting point is:</p><div class="language-js"><pre><code><span class="token comment">/** @type {GenerateOpts} */</span>
<span class="token keyword">const</span> generateOpts <span class="token operator">=</span> <span class="token punctuation">{</span>
  enabledGroups<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;store&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  enabledGenerators<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;type&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;sql&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;validator&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  throwingValidators<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  isNode<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  dumpStructure<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  dumpPostgres<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre></div><p>For projects already running in production (not advisable...), recurring jobs should be automatically upgraded. This will be removed in the next feature release. Migrations are a bit trickier and require a manual query:</p><div class="language-sql"><pre><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>
<span class="token keyword">UPDATE</span> <span class="token string">&quot;migration&quot;</span>
<span class="token keyword">SET</span>
  namespace <span class="token operator">=</span> <span class="token string">&#39;@compas/store&#39;</span>
<span class="token keyword">WHERE</span>
  namespace <span class="token operator">=</span> <span class="token string">&#39;@lbu/store&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">COMMIT</span><span class="token punctuation">;</span>
</code></pre></div><p>Other than the breaking changes mentioned earlier in this doc, this should be it.</p><h3 id="in-closing" tabindex="-1">In closing <a class="header-anchor" href="#in-closing" aria-hidden="true">#</a></h3><p>A big release since a while. This was mostly due to time, features piling up and renaming to Compas. One of the last ones before a v0.1.0. Much work is still needed on writing the docs. And prefer to have this release tested in the wild, before going in beta.</p>`,46),r=[o];function i(p,l,c,d,u,h){return n(),a("div",null,r)}var m=e(t,[["render",i]]);export{f as __pageData,m as default};
