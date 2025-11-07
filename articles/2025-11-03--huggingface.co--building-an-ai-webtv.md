---
title: Building an AI WebTV
title_ja: ''
source_url: 'https://huggingface.co/blog/ai-webtv'
date: '2025-11-03'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/ai-webtv'
summarized_at: '2025-11-05T11:00:17.323Z'
tldr: '# Building an AI WebTV'
key_points:
  - '- ## TL;DR'
  - >-
    - - AI
    WebTVは、ZeroscopeやMusicGenなどのオープンソースAIモデルで生成されたビデオと音楽をデモする実験的なプロジェクトです。
  - >-
    - - テキストプロンプトからLLMで詳細なビデオプロンプトを生成し、Zeroscope
    V2でビデオを作成、FILMでフレーム補間、MusicGenで音楽を追加するパイプラインを構築しています。
  - >-
    - - Hugging Face
    Spaces上でホストされたモデルを利用し、NodeJSとTypeScriptで実装され、FFmpegを用いてリアルタイムストリーム配信されます。
  - >-
    - - Zeroscope
    XLによるアップスケールとフレーム補間が生成品質を向上させる一方で、動きの方向間違いやプロンプト要素の意図しない視覚的混入などの課題も確認されています。
---
# Building an AI WebTV

## TL;DR
- AI WebTVは、ZeroscopeやMusicGenなどのオープンソースAIモデルで生成されたビデオと音楽をデモする実験的なプロジェクトです。
- テキストプロンプトからLLMで詳細なビデオプロンプトを生成し、Zeroscope V2でビデオを作成、FILMでフレーム補間、MusicGenで音楽を追加するパイプラインを構築しています。
- Hugging Face Spaces上でホストされたモデルを利用し、NodeJSとTypeScriptで実装され、FFmpegを用いてリアルタイムストリーム配信されます。
- Zeroscope XLによるアップスケールとフレーム補間が生成品質を向上させる一方で、動きの方向間違いやプロンプト要素の意図しない視覚的混入などの課題も確認されています。
- ビデオ特有のプロンプトキーワードの活用、シーン間の一貫性維持、フレーム補間の利用が、生成コンテンツの品質と表現力を高める上で重要だと推奨されています。

## 重要ポイント
- **AI WebTVの目的と利用モデル:** AI WebTVは、Zeroscope (テキスト-トゥ-ビデオ) とMusicGen (音楽生成) といったオープンソースAIモデルの最新の進歩を、エンターテイメント性を持たせてデモするためのショーケースです。
- **アーキテクチャとパイプライン:** 人間が記述したベースのテーマとアイデアをLLM（ChatGPT）に通して多様なビデオクリッププロンプトを生成し、それをZeroscope V2 (生成とアップスケール) に渡してビデオを作成します。
- **後処理の強化:** 生成されたビデオクリップは、FILM (Frame Interpolation for Large Motion) によるフレーム補間とMusicGenで生成された音楽の追加という後処理を経て、滑らかさと表現力が向上します。
- **ストリーミング配信技術:** 完成したビデオはFFmpegを使用してmp4/m4aファイルのプレイリストにまとめられ、FLV形式でRTMPサーバーにリアルタイムでストリーム配信されます。
- **生成における課題と改善策:** AIモデルは動きの方向間違いやプロンプト内のテキスト・オブジェクトの意図しない挿入といった失敗ケースを示しますが、これに対し、ビデオに特化した詳細なプロンプトの記述、複数シーン間の一貫性維持、フレーム補間の積極的な活用が品質改善のために推奨されています。

## 概要
AI WebTVは、ZeroscopeやMusicGenといったオープンソースのテキスト-トゥ-ビデオおよび音楽生成AIモデルを活用した実験的なデモプロジェクトです。LLMで拡張されたテキストプロンプトに基づきビデオを生成し、FILMによるフレーム補間やMusicGenによる音楽追加の後処理を施した後、FFmpegを通じてリアルタイムでストリーム配信します。Hugging Face Spaces上のモデルとNodeJS/TypeScriptで構築されたこのシステムは、AIによる自動ビデオ生成の可能性を示す一方、動きの正確性やプロンプト解釈における課題も提示しており、より詳細なプロンプトやフレーム補間が品質向上に不可欠であることを示唆しています。
