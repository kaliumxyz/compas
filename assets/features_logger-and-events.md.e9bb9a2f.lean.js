import{_ as n,c as s,o as a,a as e}from"./app.d0d65fcc.js";const g='{"title":"Logger & events","description":"","frontmatter":{},"headers":[{"level":2,"title":"Logger","slug":"logger"},{"level":3,"title":"API","slug":"api"},{"level":3,"title":"On log levels and processing","slug":"on-log-levels-and-processing"},{"level":2,"title":"Events","slug":"events"}],"relativePath":"features/logger-and-events.md","lastUpdated":1635769453832}',t={},o=e(`__VP_STATIC_START__<h1 id="logger-events" tabindex="-1">Logger &amp; events <a class="header-anchor" href="#logger-events" aria-hidden="true">#</a></h1><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Requires <code>@compas/stdlib</code> to be installed</p></div><h2 id="logger" tabindex="-1">Logger <a class="header-anchor" href="#logger" aria-hidden="true">#</a></h2><p>Although the stdlib package exports more than just a logger, this document will focus on the logger.</p><h3 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-hidden="true">#</a></h3><p>Provided by <code>@compas/stdlib</code></p><h4 id="newlogger" tabindex="-1">newLogger <a class="header-anchor" href="#newlogger" aria-hidden="true">#</a></h4><p>This function constructs a new logger. The logger supports a log context and pretty printing when asked.</p><p>Parameters:</p><ul><li><code>options</code>: <ul><li><code>disableInfoLogger</code> (boolean): Replaces <a href="http://log.info" target="_blank" rel="noopener noreferrer">log.info</a> with a &#39;noop&#39;. Defaults to &#39;false&#39;.</li><li><code>disableErrorLogger</code> (boolean): Replaces log.error with a &#39;noop&#39;. Defaults to &#39;false&#39;.</li><li><code>printer</code> (<code>&quot;pretty&quot;|&quot;ndjson&quot;|&quot;github-actions&quot;|undefined</code>): The log printer to use. Automatically inferred from the env variables.</li><li><code>stream</code> (Stream): The stream to write to, defaults to <code>process.stdout</code>. This is the intended use case. Although streams to files may work, this is not supported. This option is ignored if the printer is <code>ndjson</code>.</li><li><code>pinoOptions</code>: Specify a custom Pino transport or destination. See the <a href="https://getpino.io" target="_blank" rel="noopener noreferrer">Pino docs</a> for more information. This field is only used if the printer is <code>ndjson</code>.</li><li><code>ctx</code> (object): Any context to add to log lines. This value is copied immediately on logger creation, so changes made via a reference, will not be reflected.</li></ul></li></ul><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>Make sure to have a <code>.env</code> file with <code>NODE_ENV=development</code> in it for local development so log lines are readable.</p></div><p>A logger is a plain JavaScript object with 3 functions:</p><p><strong>info</strong> and <strong>error</strong>:</p><p>The info and error function accept a single argument that is logged. This happens in a single <code>write</code> call when pretty printing or not.</p><h3 id="on-log-levels-and-processing" tabindex="-1">On log levels and processing <a class="header-anchor" href="#on-log-levels-and-processing" aria-hidden="true">#</a></h3><p>Log levels are used to get some ranking based on importance in your log lines. Compas only knows 2 log levels: info and error. A log line is either important enough to warn you, or it is not. By simplifying this decision, you can spend a bit more time deciding if you really need to log that information or not.</p><p>There is much more information in logs than just the contrasting error- and info-&#39;level&#39;, however this always requires further processing. Compas prefers that this happens outside the current process. That is why by default we write everything to <code>stdout</code>. To accommodate processing, every log line is a valid JSON string, also called newline delimited JSON or NDJSON for short. The log line is structured as follows:</p><div class="language-json5"><pre><code><span class="token comment">// Created with \`log.info({ hello: &quot;world&quot; });\`</span>
<span class="token punctuation">{</span>
  <span class="token comment">// The log level, either &#39;info&#39; or &#39;error&#39;</span>
  <span class="token property unquoted">level</span><span class="token operator">:</span> <span class="token string">&quot;info&quot;</span><span class="token punctuation">,</span>
  <span class="token comment">// Milliseconds since the unix epoch</span>
  <span class="token property unquoted">time</span><span class="token operator">:</span> <span class="token number">1634375371114</span><span class="token punctuation">,</span>
  <span class="token comment">// The \`ctx\` that is passed in \`newLogger\`</span>
  <span class="token comment">// In this case the default by \`mainFn\` from \`@compas/stdlib\`</span>
  <span class="token property unquoted">context</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token comment">// File name without extension</span>
    <span class="token property unquoted">type</span><span class="token operator">:</span> <span class="token string">&quot;api&quot;</span><span class="token punctuation">,</span>
    <span class="token comment">// Value of process.<wbr>env.APP_NAME, see environment variable docs</span>
    <span class="token property unquoted">application</span><span class="token operator">:</span> <span class="token string">&quot;compas&quot;</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token comment">// The value passed in to the log function</span>
  <span class="token comment">// So can be an object, array, string, boolean, ...</span>
  <span class="token property unquoted">message</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property unquoted">hello</span><span class="token operator">:</span> <span class="token string">&quot;world&quot;</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
</code></pre></div><p>The log-processor can take these lines and do whatever is needed to check on &#39;indirect&#39; errors like a spike of unauthorized requests.</p><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-hidden="true">#</a></h2><p>Events are used for manually tracing call stacks. This way you can check how long your async functions took to run or analyze how often some route is called.</p><p>Events are created with <code>newEvent(logger)</code>, most of the time you are not constructing that event or logger your self, but use some of the provided events:</p><ul><li><code>newTestEvent(t)</code> in tests</li><li><code>ctx.event</code> in server middleware</li><li><code>event</code> as the first argument passed in to queue functions</li></ul><p>Let&#39;s check an example of a function that expects an event:</p><div class="language-js"><pre><code><span class="token comment">/**
 * Add a &amp; b, but before returning wait for a random amount of time
 *
 * @param {InsightEvent} event
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */</span>
<span class="token keyword">async</span> <span class="token keyword">function</span> <span class="token function">addWithWait</span><span class="token punctuation">(</span><span class="token parameter">event<span class="token punctuation">,</span> a<span class="token punctuation">,</span> b</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token function">eventStart</span><span class="token punctuation">(</span>event<span class="token punctuation">,</span> <span class="token string">&quot;add&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> result <span class="token operator">=</span> a <span class="token operator">+</span> b<span class="token punctuation">;</span>
  <span class="token keyword">await</span> <span class="token function">asyncSleep</span><span class="token punctuation">(</span>Math<span class="token punctuation">.</span><span class="token function">random</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// Wait between 0 &amp; 100 milliseconds</span>

  <span class="token comment">// Always the last statement before the return statement</span>
  <span class="token function">eventStop</span><span class="token punctuation">(</span>event<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> result<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>As you can see we can use <code>eventStart</code> and <code>eventStop</code> to wrap our function body. We can also create &#39;sub-events&#39; to follow the nested callstack. It looks something like:</p><div class="language-js"><pre><code><span class="token keyword">function</span> <span class="token function">fooAdd</span><span class="token punctuation">(</span><span class="token parameter">event<span class="token punctuation">,</span> a<span class="token punctuation">,</span> b</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token function">eventStart</span><span class="token punctuation">(</span>event<span class="token punctuation">,</span> <span class="token string">&quot;foo.add&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> result <span class="token operator">=</span> <span class="token function">fooAddAll</span><span class="token punctuation">(</span><span class="token function">newEventFromEvent</span><span class="token punctuation">(</span>event<span class="token punctuation">)</span><span class="token punctuation">,</span> a<span class="token punctuation">,</span> b<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token function">eventStop</span><span class="token punctuation">(</span>event<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> result<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">function</span> <span class="token function">fooAddAll</span><span class="token punctuation">(</span><span class="token parameter">event<span class="token punctuation">,</span> <span class="token operator">...</span>args</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token function">eventStart</span><span class="token punctuation">(</span>event<span class="token punctuation">,</span> <span class="token string">&quot;foo.addAll&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> result <span class="token operator">=</span> args<span class="token punctuation">.</span><span class="token function">reduce</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">sum<span class="token punctuation">,</span> next</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> sum <span class="token operator">+</span> next<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token function">eventStop</span><span class="token punctuation">(</span>event<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> result<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>When <code>eventStop</code> is called on the &#39;root-event&#39; i.e the event created by <code>newEvent</code>, it will automatically log the callstack via its logger. That will look something like:</p><div class="language-text"><pre><code>11:11:13.390 info[script_name] {
  type: &#39;event_callstack&#39;,
  aborted: false,
  callStack: [
    {
      type: &#39;start&#39;,
      name: &#39;foo.add&#39;,
      time: 1630401073390,
      duration: 0
    },
    [
      {
        type: &#39;start&#39;,
        name: &#39;foo.addAll&#39;,
        time: 1630401073390,
        duration: 0
      },
      { type: &#39;stop&#39;, name: &#39;foo.addAll&#39;, time: 1630401073390 }
    ],
    { type: &#39;stop&#39;, name: &#39;foo.add&#39;, time: 1630401073390 }
  ]
}
</code></pre></div><p>As you can see, both <code>foo.add</code> and <code>foo.addAll</code> events took 0 milliseconds. This is why we recommend only using events with async functions, as these most likely contain some network / database calls.</p>__VP_STATIC_END__`,30),p=[o];function c(l,i,r,u,d,k){return a(),s("div",null,p)}var m=n(t,[["render",c]]);export{g as __pageData,m as default};
