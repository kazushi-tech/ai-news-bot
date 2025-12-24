# Obsidian 表示が更新されない場合の対処法

## 問題

Daily ファイル（`ai-news/news/*.md`）を再生成したのに、Obsidian で古い表示が残っている。

## 原因

Obsidian がファイルをキャッシュしており、ディスク上の最新版を表示していない。

## 対処法

### 方法 1: Obsidian の再起動（最も確実）

1. Obsidian を完全に終了
   - macOS: `Cmd+Q`
   - Windows: `Alt+F4` または File → Exit
2. Obsidian を再起動
3. 該当ファイルを開く

### 方法 2: キャッシュのクリア

1. Obsidian で Settings（⚙️）を開く
2. "About" タブを選択
3. "Advanced" セクション → **"Clear cache and reload"** をクリック
4. Obsidian が自動的に再起動される

### 方法 3: ソースモードで実体確認

1. 該当ファイル（例: `news/2025-12-22--AI-news.md`）を開く
2. 右上のアイコンで **"Source mode"** に切り替え
3. ファイルの実内容を確認
4. `記事ページへ` `引用元へ` が含まれているか確認

ソースモードで正しく表示されているなら:

- Reading/Live Preview mode での表示バグ
- Community plugin の干渉
- CSS snippet の問題

### 方法 4: Vault の確認

1. Obsidian 左下の **Vault 名**をクリック
2. 現在開いている Vault が `/Users/omats/git-check/myapp/ai-news` か確認
3. 複数の Vault がある場合、正しい Vault に切り替え

### 方法 5: ファイルの touch（最終手段）

Terminal で:

```bash
touch /Users/omats/git-check/myapp/ai-news/news/2025-12-22--AI-news.md
```

ファイルの更新時刻を変更することで、Obsidian に変更を検知させる。

---

## 確認コマンド

ファイルの実体が正しいことを確認:

```bash
# 12/22 Daily の内容を確認
cat /Users/omats/git-check/myapp/ai-news/news/2025-12-22--AI-news.md

# 「記事ページへ」の出現回数（2回のはず）
grep -c "記事ページへ" /Users/omats/git-check/myapp/ai-news/news/2025-12-22--AI-news.md

# 「引用元へ」の出現回数（2回のはず）
grep -c "引用元へ" /Users/omats/git-check/myapp/ai-news/news/2025-12-22--AI-news.md
```

---

## トラブルシューティング

### Q: ソースモードでも古い内容が表示される

**A**: Vault パスが間違っている可能性:

- Settings → Files & Links → "Vault location on disk" を確認
- `/Users/omats/git-check/myapp/ai-news` になっているか確認

### Q: 再起動してもダメ

**A**: 以下を確認:

1. Obsidian が複数起動していないか確認（Activity Monitor / Task Manager）
2. .obsidian/workspace ファイルが壊れていないか確認
3. 最悪の場合、Obsidian を再インストール

### Q: Community plugin が原因かも

**A**: Safe mode で起動:

1. Settings → Community plugins
2. "Turn on Safe mode" をクリック
3. 表示が直るか確認

---

## 参考

- Obsidian Forum: [Cache not updating](https://forum.obsidian.md/t/cache-not-updating)
- Obsidian Help: [Vault](https://help.obsidian.md/User+interface/Vault)
