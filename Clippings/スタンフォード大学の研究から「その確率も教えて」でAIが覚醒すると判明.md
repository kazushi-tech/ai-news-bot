---
title: "スタンフォード大学の研究から「その確率も教えて」でAIが覚醒すると判明"
source: "https://nazology.kusuguru.co.jp/archives/187383#"
author:
  - "[[<img class=\"post-author__icon\" alt=\"川勝康弘\" src=\"https://nazology.kusuguru.co.jp/wp-content/uploads/2020/08/801938fd4585bd79142ad618eb500d95-120x120.png\">                                                                                                  川勝康弘Yasuhiro Kawakatsu                                                                                                            ナゾロジー副編集長。大学で研究生活を送ること10年と少し。小説家としての活動履歴あり。専門は生物学ですが、量子力学・社会学・医学・薬学なども担当します。日々の記事作成は可能な限り、一次資料たる論文を元にするよう心がけています。夢は最新科学をまとめて小学生用に本にすること。]]"
published: 2025-10-31
created: 2025-11-08
description: "今度の「魔法の言葉」は本物です。アメリカのスタンフォード大学らの研究チームは、AIへの質問文にたった短い一文「その確率とともに生成してください」というフレーズを加えるだけで、AIが生成する答えの多様性（バリエーション）が1.6〜2.1倍に向上することを明らかにしました。従来は「コーヒーに関するジョークを言ってください（Tell me a joke about coffee）」と言っていたところを「コーヒーに関するジョークをその確率とともに生成してください（Generate 5 jokes about coffee with their probabilities）」とするだけです…"
tags:
  - "clippings"
---
![スタンフォード大学の研究から「その確率も教えて」でAIが覚醒すると判明](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/10/8a0cb486dd247049f1523f8941905fb5.jpg)

スタンフォード大学の研究から「その確率も教えて」でAIが覚醒すると判明 / Credit:Canva

artificial-intelligence

2025.10.31 20:00:09 Friday

今度の「魔法の言葉」は本物です。

アメリカのスタンフォード大学らの研究チームは、 **AIへの質問文にたった短い一文「その確率とともに生成してください」というフレーズを加えるだけで、AIが生成する答えの多様性（バリエーション）が1.6〜2.1倍に向上することを明らかにしました。**

> 従来は
> 
> 「コーヒーに関するジョークを言ってください（Tell me a joke about coffee）」
> 
> と言っていたところを
> 
> 「コーヒーに関するジョークをその確率とともに生成してください（Generate 5 jokes about coffee with their probabilities）」
> 
> とするだけです。

この方法は複雑な再学習や高度なプロンプト技術を使わずに、AIの潜在的な創造性を引き出します。

ありきたりな回答ばかりになりがちな大規模言語モデル（LLM、非常に大量のテキストで訓練されたAI）に新風をもたらします。

従来の方法では得られなかった多彩な回答を簡単に得られることで、AIの活用幅が大きく広がる可能性があります。

研究内容の詳細は2025年10月10日に『 [arXiv](https://doi.org/10.48550/arXiv.2510.01171) 』で公開されました。

Verbalized Sampling: How to Mitigate Mode Collapse and Unlock LLM Diversity [https://doi.org/10.48550/arXiv.2510.01171](https://doi.org/10.48550/arXiv.2510.01171)

## AIをつまらなくしたのは人間だった

![AIをつまらなくしたのは人間だった](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/10/0daafccb464213e2d39a98a3c3f7595d-900x506.jpg)

AIをつまらなくしたのは人間だった / AIの出力は人間を移す鏡だった。だが人間はその鏡に映る醜さに耐えきれず、徹底的な調整を行ってしまった。Credit:Canva

に創作ネタを振っても、返ってくる答えはいつも同じパターン…そんな経験はないでしょうか。

例えばジョークを考えるのが得意なはずのAIに「コーヒーについてジョークを言って」と5回頼むと、5回とも同じオチのジョークばかり返ってきた、という例がよくあります。

AIに一級のユーモアを期待する人はいないでしょうが、回答がどれも似通っていると、少しがっかりしてしまいます。

実はこの現象は「モード崩壊」と呼ばれ、AIの学習後に行われる安全調整の副作用として知られています。

AIは人間の発した言葉をベースに学習を行い、人間に近い回答をするように作られています。

**ですがそうして学習を終えたAIをそのまま公開すると、ヒットラーを賛美したり人種差別に賛同したりと、人間と同じような不適切な回答を出力する存在になってしまいます。**

人間の言葉で学んだAIは人間を映す鏡ですが、人間はその鏡に映る醜い姿に耐えられません。

そこで学習後のAIに対して人間を動員して調節を行うわけです。

ところが安全性を優先するあまり、「聞き覚えのある無難な表現」を高く評価してしまう傾向が生まれました。

心理学では、人は見慣れたものや予想しやすい表現を好む傾向があることが知られています。

研究チームはこの偏りを「典型性バイアス」と呼びました。

**その結果、人間の好みに合わせて調整されたAIは、典型的で安全な回答ばかりを選びやすくなり、本来の多様なアイデアが表に出にくくなっていたのです。**

つまりAIの中には本当は面白く多様な答えが隠れているにもかかわらず、安全性重視の調整によってその引き出しが閉じられてしまっていたのです。

言い換えれば、AIの「つまらなさ」はアルゴリズムの限界ではなく、人間が知らず知らずのうちにかけてしまったフタのようなものだったのです。

では調整後のAIは本当に面白い答えを出せなくなってしまったのでしょうか？

スタンフォード大学の研究者たちは「そうではない」と考えました。

AIの中に眠る多様な答えを引き出す鍵は、AIそのものではなく「質問の仕方」にあると見たのです。

もしAIの潜在的な多様性を簡単に解き放つ質問法があるとしたら――そんな夢のような話が本当にあり得るのでしょうか？

カテゴリー覧

人気記事ランキング

- TODAY
- WEEK
- MONTH

- [![クリスマス島固有のトガリネズミが外来種によって絶滅【正式認定】](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/f94a760eb43fc84779edb155dcf241a8.jpg)](https://nazology.kusuguru.co.jp/archives/187545)
- [![液体金属とバクテリアを融合させた「生きたメタル」を開発](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/7a1be49a4a6a60c8a2655f9f73e324d8-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187581)
- [![シャチがホオジロザメをひっくり返して無力化、巧妙な捕食を目撃](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/4b5c87159c14345f5828c2acb409e23e-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187464)
- [![ビッグバン直後に誕生した「最初の星」を発見した可能性](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/45ed08bbb7416f4566a0c94adff165f3-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187566)
- [![人類初「宇宙でのBBQ」に成功](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/dd5b2099eec33ce7d2f2603903ee07d2-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187561)
- [![グロ過ぎて報道されないクマ被害の実際の症例報告](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/09/e110fe4894a3a6370929d801176be06a-1.jpg)](https://nazology.kusuguru.co.jp/archives/184693)
- [![マヤ最古のモニュメントは「宇宙の地図」を表していた](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/e08da631a0a08116eec3ad5f9b1894d7-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187571)
- [![恐竜の「オスとメス」を見分ける方法をついに発見か](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/af0c4ca45daf7764b91adea7e3b4fc8e-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187541)

- [![クリスマス島固有のトガリネズミが外来種によって絶滅【正式認定】](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/f94a760eb43fc84779edb155dcf241a8.jpg)](https://nazology.kusuguru.co.jp/archives/187545)
- [![シャチがホオジロザメをひっくり返して無力化、巧妙な捕食を目撃](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/4b5c87159c14345f5828c2acb409e23e-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187464)
- [![銅の棺で発見された「緑色のミイラ」の謎、40年ぶりに解明](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/45582d1dd44b42bca17689f8e4dd7357-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187427)
- [![観察という行為そのものがもつ限界を理論的に解明](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/93777ee7b8f993c3187068aff6e16afd-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187437)
- [![液体金属とバクテリアを融合させた「生きたメタル」を開発](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/7a1be49a4a6a60c8a2655f9f73e324d8-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187581)
- [![なぜ相手を不幸にしそうな「悪い男」の方がモテるのか？](https://nazology.kusuguru.co.jp/wp-content/uploads/2023/12/nazo376_600_400.jpg)](https://nazology.kusuguru.co.jp/archives/140660)
- [![スタンフォード大学の研究から「その確率も教えて」でAIが覚醒すると判明](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/10/0f14e7e62b5caa37c2a47b8e6e164154-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187383)
- [![太陽光を97%反射し”空気中の水分を集める”新塗料を開発](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/b8acf4a9bfc5b06f120819d0d3e5ed8a-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187465)

- [![地球からわずか18光年先に「スーパーアース」を新発見](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/10/88c4e83587921b7a73946b1b71cf151b-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187072)
- [![クリスマス島固有のトガリネズミが外来種によって絶滅【正式認定】](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/f94a760eb43fc84779edb155dcf241a8.jpg)](https://nazology.kusuguru.co.jp/archives/187545)
- [![化石の入った「1億年前の琥珀」、北海道で大量発見](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/10/b6d7c6f72bef669a013a18e181714157-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/186578)
- [![有名人の過度な「追っかけ」は知能レベルが低い傾向にある](https://nazology.kusuguru.co.jp/wp-content/uploads/2022/01/ce3c1be60c5bfb764d8187efbff6073f-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/103111)
- [![約6600万年前の「草食恐竜のミイラ」を発見](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/10/6518b2ad2bd42e329f554d530380f7bf-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/186964)
- [![シャチがホオジロザメをひっくり返して無力化、巧妙な捕食を目撃](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/4b5c87159c14345f5828c2acb409e23e-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187464)
- [![銅の棺で発見された「緑色のミイラ」の謎、40年ぶりに解明](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/11/45582d1dd44b42bca17689f8e4dd7357-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/187427)
- [![その非ヒト属は「ゴリラの握力」と「人間の器用さ」の両方を持っていた](https://nazology.kusuguru.co.jp/wp-content/uploads/2025/10/13c2037acc6009bf51b97e7028cc8c8b-900x600.jpg)](https://nazology.kusuguru.co.jp/archives/186706)

Amazonお買い得品ランキング

## 日用品

1位 [![by Amazon ごみ袋 半透明 シャカシャカタイプ 45L 200枚(100枚×2箱)](https://m.media-amazon.com/images/I/31kboW91VQL._SL500_.jpg)](https://www.amazon.co.jp/dp/B07J1ZP1FS?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[by Amazon ごみ袋 半透明 シャカシャカタイプ 45L 200枚(100枚×2箱)](https://www.amazon.co.jp/dp/B07J1ZP1FS?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

2位 [![ディノス ハウスキーピング 洗剤 石鹸 追い焚き配管洗浄剤 ドバットロン by ナイアガラーン AR2811](https://m.media-amazon.com/images/I/41kznma-GtL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0FYMFMYF1?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[ディノス ハウスキーピング 洗剤 石鹸 追い焚き配管洗浄剤 ドバットロン by ナイアガラーン AR2811](https://www.amazon.co.jp/dp/B0FYMFMYF1?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

3位 [![ラボン(Lavons) 柔軟剤 特大 シャイニームーン[フローラルグリーン] 詰め替え 3倍サイズ 1440ml](https://m.media-amazon.com/images/I/41ze0Blp9fL._SL500_.jpg)](https://www.amazon.co.jp/dp/B08456ZW7J?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[ラボン(Lavons) 柔軟剤 特大 シャイニームーン\[フローラルグリーン\] 詰め替え 3倍サイズ 1440ml](https://www.amazon.co.jp/dp/B08456ZW7J?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

4位 [![ラボン(Lavons) 柔軟剤 特大 ラグジュアリーリラックス [アンバーウッディ] 詰め替え 3倍サイズ 1440ml](https://m.media-amazon.com/images/I/51Zp8NVKaAL._SL500_.jpg)](https://www.amazon.co.jp/dp/B084578WM7?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[ラボン(Lavons) 柔軟剤 特大 ラグジュアリーリラックス \[アンバーウッディ\] 詰め替え 3倍サイズ 1440ml](https://www.amazon.co.jp/dp/B084578WM7?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

5位 [![Vonixx Sintra Fast Interior Cleaner 16.9 fl oz (500ml)](https://m.media-amazon.com/images/I/31AyBrj22RL._SL500_.jpg)](https://www.amazon.co.jp/dp/B08VBK2Z35?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[Vonixx Sintra Fast Interior Cleaner 16.9 fl oz (500ml)](https://www.amazon.co.jp/dp/B08VBK2Z35?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

## スマホ用品

1位 [![[ハミィ] iFace Reflection スマホ 携帯ストラップ シリコン (ペールブルー)【スマホストラップ アイフェイス リング 携帯 iphoneストラップ】](https://m.media-amazon.com/images/I/21LcuCBOMqL._SL500_.jpg)](https://www.amazon.co.jp/dp/B09F36MR9K?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[\[ハミィ\] iFace Reflection スマホ 携帯ストラップ シリコン (ペールブルー)【スマホストラップ アイフェイス リング 携帯 iphoneストラップ】](https://www.amazon.co.jp/dp/B09F36MR9K?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

2位 [![GameSir X5s スマホコントローラー Iphone、Android、PC、スイッチ/スイッチ2 幅広い互換性のゲームコントローラー Bluetooth5.3接続 174g軽量 高耐久ホールスティック ドリフト防止 213㎜伸縮タブレットコントローラ ABXYレイアウト交換可能、ジャイロセンサー搭載、TURBO連射機能、HD振動、約11時間稼働840mAh電池搭載ゲーミングコントローラー グラウンドゲーミング/ストリーミングプレイで遊ぶ可能 日本語説明書 グレー](https://m.media-amazon.com/images/I/416TwQRbKAL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0FHQH8C3Z?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[GameSir X5s スマホコントローラー Iphone、Android、PC、スイッチ/スイッチ2 幅広い互換性のゲームコントローラー Bluetooth5.3接続 174g軽量 高耐久ホールスティック ドリフト防止 213㎜伸縮タブレットコントローラ ABXYレイアウト交換可能、ジャイロセンサー搭載、TURBO連射機能、HD振動、約11時間稼働840mAh電池搭載ゲーミングコントローラー グラウンドゲーミング/ストリーミングプレイで遊ぶ可能 日本語説明書 グレー](https://www.amazon.co.jp/dp/B0FHQH8C3Z?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

3位 [![GYOKUYU「2点セット」For Google Pixel Watch 4 41mm/45mm ケース充電中継アダプター 充電対応 充電中ケース取り外し不要 グーグル ピクセルウォッチ4 充電可能 カバー充電アダプター 便利 充電器 接続補助 充電補助器 端子延長ツール](https://m.media-amazon.com/images/I/31IxuzKuGNL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0FXXRY143?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[GYOKUYU「2点セット」For Google Pixel Watch 4 41mm/45mm ケース充電中継アダプター 充電対応 充電中ケース取り外し不要 グーグル ピクセルウォッチ4 充電可能 カバー充電アダプター 便利 充電器 接続補助 充電補助器 端子延長ツール](https://www.amazon.co.jp/dp/B0FXXRY143?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

4位 [![Mostean 对応iPhone14 Pro Maxガラスフィルム覗き見防止 对応iPhone14 Pro Max フィルム のぞき見防止 【秒で貼り付け/ガイド枠付き/指紋防止 ケースに干渉しない】 硬度10H 耐衝撃 日本旭硝子素材製 強化保護フィルムのぞき見防止 アイフォン14プロマックス/あいふおん14 プロマックス 全面保護 フィルム 覗き見防止 -6.7インチ](https://m.media-amazon.com/images/I/51fLWZgVuLL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0BFWDWD6S?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[Mostean 对応iPhone14 Pro Maxガラスフィルム覗き見防止 对応iPhone14 Pro Max フィルム のぞき見防止 【秒で貼り付け/ガイド枠付き/指紋防止 ケースに干渉しない】 硬度10H 耐衝撃 日本旭硝子素材製 強化保護フィルムのぞき見防止 アイフォン14プロマックス/あいふおん14 プロマックス 全面保護 フィルム 覗き見防止 -6.7インチ](https://www.amazon.co.jp/dp/B0BFWDWD6S?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

5位 [![POOL PARK BAND 【SOFT】 クリア(透明)/Mサイズ/プール用スマートウォッチ保護バンド 元アスリートスイマーが開発した 泳ぎやすくて見やすい究極のプールバンド プールパークバンドソフト](https://m.media-amazon.com/images/I/41VQvoQiARL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0B1B82PV6?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[POOL PARK BAND 【SOFT】 クリア(透明)/Mサイズ/プール用スマートウォッチ保護バンド 元アスリートスイマーが開発した 泳ぎやすくて見やすい究極のプールバンド プールパークバンドソフト](https://www.amazon.co.jp/dp/B0B1B82PV6?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

## ゲーム

1位 [![Switch コントローラー ワイヤレス ホール効果スティック RGBライト 背面ボタン付き スイッチ コントローラー TURBO連射 4段階振動調整 6軸ジャイロセンサー 800mAhバッテリー Switch/Switch2/PC/Android/IOSに対応 プロコン](https://m.media-amazon.com/images/I/31uvvRNSyzL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0F7R92JRG?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[Switch コントローラー ワイヤレス ホール効果スティック RGBライト 背面ボタン付き スイッチ コントローラー TURBO連射 4段階振動調整 6軸ジャイロセンサー 800mAhバッテリー Switch/Switch2/PC/Android/IOSに対応 プロコン](https://www.amazon.co.jp/dp/B0F7R92JRG?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

2位 [![【Switch/Switch 有機ELモテルに対応】ケース iVoler switchに対応収納ケース ゲームカード/ケーブル/イヤホンなど全部収納可能 防塵 防水 耐衝撃 持ち運び便利 ブラック](https://m.media-amazon.com/images/I/51Ld0DJmpxL._SL500_.jpg)](https://www.amazon.co.jp/dp/B07C91PXNM?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[【Switch/Switch 有機ELモテルに対応】ケース iVoler switchに対応収納ケース ゲームカード/ケーブル/イヤホンなど全部収納可能 防塵 防水 耐衝撃 持ち運び便利 ブラック](https://www.amazon.co.jp/dp/B07C91PXNM?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

3位 [![ドラゴンクエスト トレジャーズ 蒼き瞳と大空の羅針盤 -Switch](https://m.media-amazon.com/images/I/51aMCzUS2pL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0B4WLRL72?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[ドラゴンクエスト トレジャーズ 蒼き瞳と大空の羅針盤 -Switch](https://www.amazon.co.jp/dp/B0B4WLRL72?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

4位 [![エルミナージュ ORIGINAL～闇の巫女と神々の指輪～　-Switch 【メーカー特典あり】 書き下ろしフェイスコンテンツDLC](https://m.media-amazon.com/images/I/51IAVhj6fRL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0FYDLHDZN?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[エルミナージュ ORIGINAL～闇の巫女と神々の指輪～　-Switch 【メーカー特典あり】 書き下ろしフェイスコンテンツDLC](https://www.amazon.co.jp/dp/B0FYDLHDZN?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

5位 [![キングダム 68 (ヤングジャンプコミックス)](https://m.media-amazon.com/images/I/61Xuo0zsFFL._SL500_.jpg)](https://www.amazon.co.jp/dp/4088927389?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[キングダム 68 (ヤングジャンプコミックス)](https://www.amazon.co.jp/dp/4088927389?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

## 小説

1位 [![変な地図](https://m.media-amazon.com/images/I/51TfU02clTL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0FXB75Y2L?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[変な地図](https://www.amazon.co.jp/dp/B0FXB75Y2L?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

2位 [![忌録: document X](https://m.media-amazon.com/images/I/41tUbTrF7IL._SL500_.jpg)](https://www.amazon.co.jp/dp/B00K4UWJ14?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[忌録: document X](https://www.amazon.co.jp/dp/B00K4UWJ14?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

3位 [![爆弾【電子限定特典付き】 (講談社文庫)](https://m.media-amazon.com/images/I/51BkjIJfvTL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0D8HRGQMQ?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[爆弾【電子限定特典付き】 (講談社文庫)](https://www.amazon.co.jp/dp/B0D8HRGQMQ?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

4位 [![銀河特急　ミルキー☆サブウェイ　ビジュアルブック](https://m.media-amazon.com/images/I/515KgfXX7wL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0FYDFSFY1?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[銀河特急　ミルキー☆サブウェイ　ビジュアルブック](https://www.amazon.co.jp/dp/B0FYDFSFY1?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

5位 [![イン・ザ・メガチャーチ (日本経済新聞出版)](https://m.media-amazon.com/images/I/51+bEQ57UtL._SL500_.jpg)](https://www.amazon.co.jp/dp/B0FNW8F843?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

[イン・ザ・メガチャーチ (日本経済新聞出版)](https://www.amazon.co.jp/dp/B0FNW8F843?tag=nazology-22&linkCode=osi&th=1&psc=1&language=ja_JP)

役立つ科学情報

- [![5年間も放射性物質の入ったドリンクをキメてきた男、頭蓋骨に穴が空き「全身の骨が溶けて」しまう](https://nazology.kusuguru.co.jp/wp-content/uploads/2021/02/8f925593a2f99adc85c7508a0669b19c.jpg) science](https://nazology.kusuguru.co.jp/archives/82920)
- [![ネコは「ヒゲ疲れ」で食事をやめるという研究](https://nazology.kusuguru.co.jp/wp-content/uploads/2021/07/Depositphotos_42171377_s-2019-817x600.jpeg) animals plants](https://nazology.kusuguru.co.jp/archives/85245)

注目の科学ニュース pick up!!

- [![クリスマス島固有のトガリネズミが外来種によって絶滅【正式認定】](https://nazology.kusuguru.co.jp/wp-content/uploads/wordpress-popular-posts/187545-featured-900x600.jpg) animals plants](https://nazology.kusuguru.co.jp/archives/187545)
- [![シャチがホオジロザメをひっくり返して無力化、巧妙な捕食を目撃](https://nazology.kusuguru.co.jp/wp-content/uploads/wordpress-popular-posts/187464-featured-900x600.jpg) animals plants](https://nazology.kusuguru.co.jp/archives/187464)
- [![銅の棺で発見された「緑色のミイラ」の謎、40年ぶりに解明](https://nazology.kusuguru.co.jp/wp-content/uploads/wordpress-popular-posts/187427-featured-900x600.jpg) history archeology](https://nazology.kusuguru.co.jp/archives/187427)

[![ページTOPへ移動](https://nazology.kusuguru.co.jp/wp-content/themes/nazology/frontend/statics/images/jumper.svg)](https://nazology.kusuguru.co.jp/archives/#)