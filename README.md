Way-Grid
==

![title-banner](docs/banner.png)

```
Author : Yugeta.KOji
Date   : 2019.09.22
```


# Summary
Pinterest風のグリッドタイリング表示ライブラリ

# Howto
1. ライブラリのscriptリンクを設置
  <script src="way_grid.js"></script>

2. 親class名の登録
  リスト構造の親要素class名に"way-grid"を付ける。

3. プログラム起動
  new $$way_grid({
    column_count : "auto",
    column_width : 200
  });

※ページが読み込まれたタイミングで、タイリング表示されます。
画面の大きさに応じてレスポンシブ対応されます。
