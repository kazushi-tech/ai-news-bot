/* Obsidian Publish: サイトロゴ/ブランディング域を非表示 */

.publish-sidebar .site-logo,

.publish-sidebar .site-branding,

.publish-header .site-logo,

.publish-header .site-branding,

.site-header .site-logo,

.site-header .site-branding { display: none !important; }

  

/* 左の“ホームカード”を消したい場合（任意） */

.publish-sidebar .nav-home { display: none !important; }

  

/* frontmatter Propertiesの非表示（記事ページをスッキリ） */

.metadata-container,

.metadata-container .metadata-properties,

.cm-s-obsidian .metadata-container { display: none !important; }

  

/* 引用元リンクの軽い装飾（任意） */

.markdown-preview-view h2 + p a[href^="http"]{

display:inline-block;padding:10px 12px;border:1px solid var(--background-modifier-border);border-radius:8px;

}