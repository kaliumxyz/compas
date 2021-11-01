import{_ as n,c as a,o as s,a as t}from"./app.d0d65fcc.js";const h='{"title":"Code generators","description":"","frontmatter":{},"headers":[{"level":2,"title":"Setup","slug":"setup"},{"level":2,"title":"Adding types","slug":"adding-types"},{"level":2,"title":"Validators","slug":"validators"},{"level":2,"title":"More types and validators","slug":"more-types-and-validators"}],"relativePath":"features/code-gen-validators.md","lastUpdated":1635769453832}',o={},e=t(`<h1 id="code-generators" tabindex="-1">Code generators <a class="header-anchor" href="#code-generators" aria-hidden="true">#</a></h1><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Requires <code>@compas/cli</code>, <code>@compas/stdlib</code> and <code>@compas/code-gen</code> to be installed</p></div><p>Compas provides various code generators solving two main things:</p><ul><li>Provide a contract between backend and frontends</li><li>Generate typed backend basics like routers, validators and CRUD queries</li></ul><p>This document contains the setup and looks at the different types and generated validators while the next documents are diving in for example the router and api clients.</p><h2 id="setup" tabindex="-1">Setup <a class="header-anchor" href="#setup" aria-hidden="true">#</a></h2><p>Let&#39;s start by creating a new script in <code>scripts/generate.js</code> with the following contents:</p><div class="language-js"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> mainFn <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/stdlib&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> App <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/code-gen&quot;</span><span class="token punctuation">;</span>

<span class="token function">mainFn</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">,</span> main<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> app <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">App</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">await</span> app<span class="token punctuation">.</span><span class="token function">generate</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    outputDirectory<span class="token operator">:</span> <span class="token string">&quot;./src/generated&quot;</span><span class="token punctuation">,</span>
    isNodeServer<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    enabledGenerators<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;type&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    dumpStructure<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>It creates a new <code>App</code> instance which is the code generator entrypoint. After that we directly call <code>app.generate</code>, this is where the magic happens, and the output files are written. If you execute <code>yarn compas generate</code> a few files should have been created in <code>src/generated</code>:</p><ul><li><code>common/structure.js</code>: All information known to the code generators serialized. This way you can for example regenerate without knowing the original input. This file is controlled by the <code>dumpStructure</code> and <code>dumpApiStructure</code> options.</li><li><code>common/types.d.ts</code>: This file will contain the generated types that we need, is controlled by <code>enabledGenerators: [&quot;type&quot;]</code>.</li></ul><h2 id="adding-types" tabindex="-1">Adding types <a class="header-anchor" href="#adding-types" aria-hidden="true">#</a></h2><p>Since our setup works now, we can add some types. For this we need to import the <code>TypeCreator</code> from <code>@compas/code-gen</code> and create an instance: <code>const T = new TypeCreator(&quot;todo&quot;)</code>. We pass in <code>&quot;todo&quot;</code> as an argument to the <code>TypeCreator</code> to name our collection of types. Each item or type in the code generators has a &#39;group&#39;, in this case <code>&quot;todo&quot;</code> and a name, which we will come by shortly. The default &#39;group&#39; name, if not specified, is <code>&quot;app&quot;</code>. We also use <code>T</code> as the variable name as a short abbreviation, and would be recommended to keep as a convention in your projects.</p><p>Know that we have a <code>TypeCreator</code> we can create some types.</p><div class="language-js"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> mainFn <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/stdlib&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> App<span class="token punctuation">,</span> TypeCreator <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/code-gen&quot;</span><span class="token punctuation">;</span>

<span class="token function">mainFn</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">,</span> main<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> app <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">App</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token constant">T</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TypeCreator</span><span class="token punctuation">(</span><span class="token string">&quot;todo&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  app<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>
    <span class="token comment">// \`&quot;item&quot;\` is the type &#39;name&#39;, all types added to \`app\` should have a name.</span>
    <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">object</span><span class="token punctuation">(</span><span class="token string">&quot;item&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      id<span class="token operator">:</span> <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">uuid</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      title<span class="token operator">:</span> <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">string</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      createdAt<span class="token operator">:</span> <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      isFinished<span class="token operator">:</span> <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">bool</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">optional</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">await</span> app<span class="token punctuation">.</span><span class="token function">generate</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    outputDirectory<span class="token operator">:</span> <span class="token string">&quot;./src/generated&quot;</span><span class="token punctuation">,</span>
    isNodeServer<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    enabledGenerators<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;type&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    dumpStructure<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>On the <code>T</code> (<code>TypeCreator</code>) we have a bunch of &#39;type&#39; methods. These mostly correspond to the equivalent JavaScript and TypeScript types. Let&#39;s check that out, but first regenerate with <code>yarn compas generate</code>.</p><p>Our <code>common/types.d.ts</code> now contains some relevant types for us, a <code>TodoItem</code> (consisting of the group name (<code>todo</code>) and the type name (<code>item</code>) as the unique name <code>TodoItem</code>):</p><div class="language-typescript"><pre><code><span class="token keyword">type</span> <span class="token class-name">TodoItem</span> <span class="token operator">=</span> <span class="token punctuation">{</span>
  id<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
  title<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
  createdAt<span class="token operator">:</span> Date<span class="token punctuation">;</span>
  isFinished<span class="token operator">?</span><span class="token operator">:</span> <span class="token keyword">undefined</span> <span class="token operator">|</span> <span class="token builtin">boolean</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre></div><h2 id="validators" tabindex="-1">Validators <a class="header-anchor" href="#validators" aria-hidden="true">#</a></h2><p>Well you say: &#39;This ain&#39;t fancy, I need to learn a specific DSL just to generate some TypeScript types that I can write by hand.&#39;. And you would be right if types where the only things Compas could generate for you. So let&#39;s do something more useful and add validators in to the mix. We can enable validators by adding <code>validator</code> to our <code>enabledGenerators</code> option like so:</p><div class="language-js"><pre><code><span class="token keyword">await</span> app<span class="token punctuation">.</span><span class="token function">generate</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  outputDirectory<span class="token operator">:</span> <span class="token string">&quot;./src/generated&quot;</span><span class="token punctuation">,</span>
  isNodeServer<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  enabledGenerators<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;type&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;validator&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  dumpStructure<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p>And let&#39;s generate again with <code>yarn compas generate</code>. This added a few more files:</p><ul><li><code>common/anonymous-validators.js</code>: pure JavaScript validator code internally used for all validators in you project, this file can get huge if your project grows.</li><li><code>todo/validators.js</code>: The generated <code>validateTodoItem</code> function. It used the anonymous validators from <code>common/anonymous-validators.js</code> to check the input.</li></ul><p>Let&#39;s do a quick check if our validators are up to something:</p><div class="language-js"><pre><code><span class="token comment">// scripts/validator-test.js</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> validateTodoItem <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;../src/generated/todo/validators.js&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> mainFn<span class="token punctuation">,</span> uuid <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/stdlib&quot;</span><span class="token punctuation">;</span>

<span class="token function">mainFn</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">,</span> main<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">function</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token parameter">logger</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token comment">// A success result</span>
  logger<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span>
    <span class="token function">validateTodoItem</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      id<span class="token operator">:</span> <span class="token function">uuid</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      title<span class="token operator">:</span> <span class="token string">&quot;Finish reading Compas documentation&quot;</span><span class="token punctuation">,</span>
      createdAt<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      <span class="token comment">// We can leave out &#39;isFinished&#39; since it is \`.optional()\`</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// And a validation error</span>
  logger<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span>
    <span class="token function">validateTodoItem</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      title<span class="token operator">:</span> <span class="token string">&quot;Finish reading Compas documentation&quot;</span><span class="token punctuation">,</span>
      createdAt<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      isFinished<span class="token operator">:</span> <span class="token string">&quot;true&quot;</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>And check if the validators are doing what they should with <code>yarn compas validator-test</code>. Which should output something like:</p><div class="language-text"><pre><code>/* ... */ {
  value: [Object: null prototype] {
    id: &#39;114531fb-810d-45cf-819a-856892972acd&#39;,
    title: &#39;Finish reading Compas documentation&#39;,
    createdAt: 2021-09-19T09:32:11.359Z,
    isFinished: undefined
  }
}
/* ... */ {
  error: {
    key: &#39;validator.error&#39;,
    status: 400,
    info: {
      &#39;$.id&#39;: {
        propertyPath: &#39;$.id&#39;,
        key: &#39;validator.uuid.undefined&#39;,
        info: {}
      },
      &#39;$.isFinished&#39;: {
        propertyPath: &#39;$.isFinished&#39;,
        key: &#39;validator.boolean.type&#39;,
        info: {}
      }
    },
    stack: [
      /** ... */
    ],
  }
}
</code></pre></div><p>As you can see, the validators either return a <code>{ value: ... }</code> or <code>{ error: ... }</code> object. The first being a <code>{ value: ... }</code> since the input object complied with our structure. The second result is more interesting, as it is an <code>{ error: ... }</code> result. It tells us that something is wrong in the validators (<code>key: &quot;validator.error&quot;</code>) and tells us the two places where our input is incorrect:</p><ul><li><code>$.id</code>: From the input root (<code>$</code>), pick the <code>id</code> property. We expect an uuid (the first part of our key <code>validator.uuid</code>), but it is undefined.</li><li><code>$.isFinished</code>: From the input root, pick the <code>isFinished</code> property. We expect a boolean (<code>validator.boolean</code>), but we got the incorrect type (in this case a string).</li></ul><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Make sure to have a <code>.env</code> file with <code>NODE_ENV=development</code> in it for local development so log lines are readable.</p></div><p>We can also add some type specific validators in to the mix, for example our &#39;TodoItem&#39; title should be at least 10 characters, and the <code>isFinished</code> property should also accept <code>&quot;true&quot;,&quot;false&quot;</code> strings as well as <code>true</code> and <code>false</code> booleans.</p><div class="language-js"><pre><code><span class="token comment">// In scripts/generate.js</span>
app<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>
  <span class="token comment">// \`&quot;item&quot;\` is the type &#39;name&#39;, all types added to \`app\` should have a name.</span>
  <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">object</span><span class="token punctuation">(</span><span class="token string">&quot;item&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">keys</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    id<span class="token operator">:</span> <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">uuid</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    title<span class="token operator">:</span> <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">string</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">min</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    createdAt<span class="token operator">:</span> <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    isFinished<span class="token operator">:</span> <span class="token constant">T</span><span class="token punctuation">.</span><span class="token function">bool</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">optional</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">convert</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p>And to check our outputs replace <code>scripts/validator-test.js</code> with the following:</p><div class="language-js"><pre><code><span class="token comment">// scripts/validator-test.js</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> validateTodoItem <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;../src/generated/todo/validators.js&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> mainFn<span class="token punctuation">,</span> uuid <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@compas/stdlib&quot;</span><span class="token punctuation">;</span>

<span class="token function">mainFn</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">,</span> main<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">function</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token parameter">logger</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token comment">// A success result</span>
  logger<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span>
    <span class="token function">validateTodoItem</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      id<span class="token operator">:</span> <span class="token function">uuid</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      title<span class="token operator">:</span> <span class="token string">&quot;Finish reading Compas documentation&quot;</span><span class="token punctuation">,</span>
      createdAt<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      isFinished<span class="token operator">:</span> <span class="token string">&quot;false&quot;</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// And a validation error</span>
  logger<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span>
    <span class="token function">validateTodoItem</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      id<span class="token operator">:</span> <span class="token function">uuid</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      title<span class="token operator">:</span> <span class="token string">&quot;Too short&quot;</span><span class="token punctuation">,</span> <span class="token comment">// 9 characters</span>
      createdAt<span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>Regenerate with <code>yarn compas generate</code> and run the validators with <code>yarn compas validator-test</code>, which yields the following:</p><div class="language-text"><pre><code>/* ... */ {
  value: [Object: null prototype] {
    id: &#39;5f1d04c9-2e20-4b76-9720-b699b543978e&#39;,
    title: &#39;Finish reading Compas documentation&#39;,
    createdAt: 2021-09-19T09:55:37.073Z,
    isFinished: false
  }
}
/* ... */ {
  error: {
    key: &#39;validator.error&#39;,
    status: 400,
    info: {
      &#39;$.title&#39;: {
        propertyPath: &#39;$.title&#39;,
        key: &#39;validator.string.min&#39;,
        info: { min: 10 }
      }
    },
    stack: [
      /* ... */
    ],
  }
}
</code></pre></div><p>As you can see, the <code>isFinshed</code> property of the first validator call is accepted and converted to the <code>false</code> value. And the error from the second validate call now contains our new validator:</p><ul><li><code>$.title</code>: The title property does not confirm the <code>validator.string.min</code> validator. And it also returns what the minimum length is via <code>info-&gt;min</code>.</li></ul><h2 id="more-types-and-validators" tabindex="-1">More types and validators <a class="header-anchor" href="#more-types-and-validators" aria-hidden="true">#</a></h2><p>Compas code generators include a bunch more types and type specific validators. The following list is not completely exhaustive but should give a general idea about what to expect. Note that all validators can be combined, eg <code>T.number().convert().optional().min(3).max(10)</code>, which optionally accepts an integer between 3 and 10 as either a number literal or a string that can be converted to an integer between 3 and 10\`</p><p><strong>boolean</strong>:</p><table><thead><tr><th>Type</th><th>Input</th><th>Output</th></tr></thead><tbody><tr><td>T.bool()</td><td>true/false</td><td>true/false</td></tr><tr><td>T.bool().oneOf(true)</td><td>true</td><td>true</td></tr><tr><td>T.bool().oneOf(true)</td><td>false</td><td>validator.bool.oneOf</td></tr><tr><td>T.bool().convert()</td><td>&quot;true&quot;/0/false</td><td>true/false/false</td></tr></tbody></table><p><strong>number</strong>:</p><table><thead><tr><th>Type</th><th>Input</th><th>Output</th></tr></thead><tbody><tr><td>T.number()</td><td>34</td><td>34</td></tr><tr><td>T.number()</td><td>34.15</td><td>validator.number.integer</td></tr><tr><td>T.number().float()</td><td>34.15</td><td>34.15</td></tr><tr><td>T.number().convert()</td><td>&quot;15&quot;</td><td>15</td></tr><tr><td>T.number().min(5)</td><td>2</td><td>validator.number.min</td></tr><tr><td>T.number().oneOf(30, 50, 100)</td><td>30</td><td>30</td></tr><tr><td>T.number().oneOf(30, 50, 100)</td><td>60</td><td>validator.number.oneOf</td></tr></tbody></table><p><strong>string</strong>:</p><table><thead><tr><th>Type</th><th>Input</th><th>Output</th></tr></thead><tbody><tr><td>T.string()</td><td>&quot;foo&quot;</td><td>&quot;foo&quot;</td></tr><tr><td>T.string()</td><td>undefined</td><td>validator.string.undefined</td></tr><tr><td>T.string()</td><td>null</td><td>validator.string.undefined</td></tr><tr><td>T.string().optional()</td><td>undefined</td><td>undefined</td></tr><tr><td>T.string().optional()</td><td>null</td><td>undefined</td></tr><tr><td>T.string().allowNull()</td><td>undefined</td><td>undefined</td></tr><tr><td>T.string().allowNull()</td><td>null</td><td>null</td></tr><tr><td>T.string().max(3)</td><td>&quot;Yess!&quot;</td><td>validator.string.max</td></tr><tr><td>T.string().upperCase()</td><td>&quot;Ja&quot;</td><td>&quot;JA&quot;</td></tr><tr><td>T.string().oneOf(&quot;NORTH&quot;, &quot;SOUTH&quot;)</td><td>&quot;NORTH&quot;</td><td>&quot;NORTH&quot;</td></tr><tr><td>T.string().oneOf(&quot;NORTH&quot;, &quot;SOUTH&quot;)</td><td>&quot;WEST&quot;</td><td>validator.string.oneOf</td></tr><tr><td>T.string().pattern(/\\d+/g)</td><td>&quot;foo&quot;</td><td>validator.string.pattern</td></tr></tbody></table>`,45),p=[e];function c(u,i,l,r,d,k){return s(),a("div",null,p)}var g=n(o,[["render",c]]);export{h as __pageData,g as default};
