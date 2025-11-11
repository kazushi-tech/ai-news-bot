# AI News — 一覧

```dataviewjs
const DAYS_BACK = 30, MAX_ROWS = 300;
const cutoff = dv.date(Date.now() - DAYS_BACK*24*60*60*1000);
const pages = dv.pages('"articles"')
  .where(p => p.source_url)
  .where(p => (dv.date(p.created) ?? dv.date(p.file.ctime)) >= cutoff)
  .sort(p => dv.date(p.created) ?? dv.date(p.file.ctime), 'desc')
  .limit(MAX_ROWS);

dv.table(['タイトル','記事ページへ','引用元'],
  pages.map(p => [
    p.title ?? p.file.name,
    p.file.link,
    dv.el('a','引用元へ↗',{href:String(p.source_url),target:'_blank',rel:'noopener'})
  ])
);
`````

```dataviewjs
const d = dv.date(this.file.name), start = d, end = d.plus({days:1});
const pages = dv.pages('"articles"')
  .where(p => p.source_url)
  .where(p => { const c = dv.date(p.created) ?? dv.date(p.file.ctime); return c >= start && c < end; })
  .sort(p => dv.date(p.created) ?? dv.date(p.file.ctime), 'desc');

dv.table(['タイトル','記事ページへ','引用元'],
  pages.map(p => [
    p.title ?? p.file.name,
    p.file.link,
    dv.el('a','引用元へ↗',{href:String(p.source_url),target:'_blank',rel:'noopener'})
  ])
);

`````
