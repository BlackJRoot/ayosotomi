<?xml version="1.0" encoding="utf-8"?>
<!--
  Pretty, human-facing rendering of /rss.xml for people who click the
  feed link in a browser. Feed readers ignore this entirely -- they parse
  the XML; browsers apply this stylesheet and show a friendly page
  explaining what a feed is, in the site's Dawn Light look.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="utf-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            --bg: #FAF6F1; --text: #3D3632; --sec: #9A918A;
            --accent: #C4956A; --link: #B87B6A; --border: #E5DDD4; --code: #F3EDE6;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #1E1B18; --text: #E8E2DB; --sec: #A8A29E;
              --accent: #A67B52; --link: #C4956A; --border: #3D3834; --code: #2A2623;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0; background: var(--bg); color: var(--text);
            font-family: "Inter", system-ui, sans-serif; line-height: 1.6;
          }
          .wrap { max-width: 42rem; margin: 0 auto; padding: 4rem 1.5rem; }
          .badge {
            font-family: ui-monospace, monospace; font-size: .7rem;
            letter-spacing: .15em; text-transform: uppercase; color: var(--accent);
          }
          h1 { font-family: Georgia, "Newsreader", serif; font-weight: 500; font-size: 2.2rem; margin: .4rem 0 0; }
          .desc { color: var(--sec); margin-top: .5rem; }
          .how {
            margin-top: 1.8rem; border: 1px solid var(--border); border-radius: 10px;
            padding: 1rem 1.2rem; font-size: .9rem; color: var(--sec);
          }
          .how code {
            font-family: ui-monospace, monospace; font-size: .85em;
            background: var(--code); border-radius: 5px; padding: .1rem .4rem; color: var(--text);
          }
          .how a { color: var(--link); }
          h2 { font-family: Georgia, "Newsreader", serif; font-weight: 500; font-size: 1.3rem; margin: 2.5rem 0 0; border-bottom: 1px solid var(--border); padding-bottom: .5rem; }
          .item { padding: 1.1rem 0; border-bottom: 1px solid var(--border); }
          .item a { color: var(--text); font-family: Georgia, "Newsreader", serif; font-size: 1.15rem; text-decoration: none; }
          .item a:hover { color: var(--accent); }
          .meta { font-size: .8rem; color: var(--sec); margin-top: .25rem; }
          .item p { margin: .45rem 0 0; font-size: .92rem; color: var(--sec); }
          .foot { margin-top: 2.5rem; font-size: .85rem; color: var(--sec); }
          .foot a { color: var(--link); }
        </style>
      </head>
      <body>
        <div class="wrap">
          <p class="badge">RSS feed</p>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
          <div class="how">
            This is the site's <strong>RSS feed</strong> — a machine-readable
            list of everything published here. It looks like a normal page
            because your browser is styling it, but it's meant for a feed
            reader. To subscribe, copy this page's URL
            (<code><xsl:value-of select="/rss/channel/atom:link/@href"/></code>)
            into a reader like Feedly, NetNewsWire, Miniflux, or FreshRSS,
            and new posts will show up there automatically — full text included.
          </div>
          <h2>Recent posts</h2>
          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <a><xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                <xsl:value-of select="title"/>
              </a>
              <p class="meta">
                <xsl:value-of select="substring(pubDate, 1, 16)"/>
              </p>
              <p><xsl:value-of select="description"/></p>
            </div>
          </xsl:for-each>
          <p class="foot">
            <a><xsl:attribute name="href"><xsl:value-of select="/rss/channel/link"/></xsl:attribute>
              ← Back to the site
            </a>
          </p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
