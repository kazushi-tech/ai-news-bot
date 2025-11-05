---
title: "Introducing NPC-Playground, a 3D playground to interact with LLM-powered NPCs"
title_ja: "LLM搭載NPCと遊ぶ3D空間「NPC-Playground」公開"
source_url: "https://huggingface.co/blog/npc-gigax-cubzh"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、CubzhとGigaxが共同開発したLLM搭載NPCとインタラクトできる3Dプレイグラウンド「NPC-Playground」を発表しました。このブラウザベースのデモでは、ユーザーはLuaスクリプトを使ってNPCに新しいスキルを教え、AI-NPCの未来を体験できます。

## 重要ポイント

*   **LLMによるNPCの進化:** 大規模言語モデル（LLM）の活用により、ゲーム内のNPCはリアルな会話、複雑な行動、指示への追従が可能になり、プレイヤー体験を劇的に向上させます。
*   **NPC-Playgroundの発表:** Cubzh（クロスプラットフォームUGCゲームエンジン）とGigax（LLM-powered NPCエンジン）が共同で開発した3Dデモで、Hugging Face Spaces上で公開されています。
*   **主要技術スタック:**
    *   **Cubzh:** Robloxのオープンソース代替を目指すUGCゲームエンジン。
    *   **Gigax:** LLM搭載NPCを大規模に実行するためのプラットフォーム。関数呼び出し原理でLLMをファインチューニングし、Phi-3およびMistral-7Bのファインチューニングモデルをオープンソース化しています。
    *   **Hugging Face Spaces:** ゲームコンセプトのホスティングとイテレーション環境。
*   **カスタマイズ性:** ユーザーはデモをクローンし、Luaスクリプトを数行記述するだけでNPCに新しいスキルを教えることができます。
*   **オープンソース:** Gigaxは推論スタックとファインチューニングモデルをオープンソース化しており、Hugging Face Hubからダウンロード可能です。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
CubzhとGigaxは、LLMを搭載したNPCとインタラクトできる3Dプレイグラウンド「NPC-Playground」を共同で開発し、Hugging Face Spaces上でデモを公開しました。このデモはブラウザから直接アクセスでき、ユーザーはNPCと会話したり、Luaスクリプトで新しいスキルを教えたりできます。

**背景:**
LLMの登場は、ゲームにおけるNPCの設計に大きなブレークスルーをもたらしました。従来のルールベースやヒューリスティクスシステムでは難しかった、より人間らしい会話や複雑な行動、指示への柔軟な対応が可能になり、プレイヤーの没入感と体験を大幅に向上させる可能性を秘めています。NPC-Playgroundは、このAI-NPCの未来を具体的に示すものです。

**影響:**
*   **プレイヤー体験の向上:** より魅力的でリアルなNPCとのインタラクションを通じて、ゲーム体験が豊かになります。
*   **開発者への機会:** 開発者は提供されたツールとオープンソースリソースを活用し、独自のAI-NPC体験を容易に構築・カスタマイズできます。
*   **AIゲーム開発の加速:** CubzhとGigaxのコラボレーションは、高度なAIがNPCインタラクションをどのように変革できるかを示し、AIを活用したゲーム開発の新たな方向性を示唆します。

**関係者:**
*   **Cubzh:** クロスプラットフォームのUGCゲームエンジン。Robloxのオープンソース代替を目指し、ユーザーが独自のゲーム体験を作成し、LuaスクリプトAPIでゲームをコーディングできる環境を提供します。現在パブリックアルファ版で、Steam、Epic Game Store、Apple App Store、Google Play Store、ブラウザから利用可能です。
*   **Gigax:** LLM搭載NPCを大規模に実行するためのプラットフォーム。関数呼び出しの原理を用いてNPCインタラクション用にLLMをファインチューニングしており、Phi-3およびMistral-7BのファインチューニングモデルをHugging Face Hubで公開しています。推論スタックもGitHubでオープンソース化されています。
*   **Hugging Face Spaces:** オープンソースでゲームコンセプトをホストし、反復開発を行うためのオンライン環境。

**データ:**
*   Cubzhのライブラリには25,000以上のコミュニティ製ボクセルアイテムが存在します。
*   GigaxはPhi-3およびMistral-7Bのファインチューニングモデルを提供しています。

## 引用（Notable quotes）

*   「AI-powered NPCs (Non-Playable Characters) are one of the most important breakthroughs brought about by the use of LLMs in games.」
*   「The collaboration between Cubzh and Gigax has demonstrated how advanced AI can transform NPC interactions, making them more engaging and lifelike.」

## リスクと課題

記事本文には直接的なリスクや課題の記述はありません。

## 今後の見通し/アクション

*   **デモの体験:** ユーザーはHugging Face Spaces上のデモにアクセスし、LLM搭載NPCとのインタラクションを体験できます。
*   **カスタマイズと開発:** デモのリポジトリをクローンし、`cubzh.lua`ファイルを編集することで、Luaスクリプトを用いてNPCに新しいスキルを教えたり、挙動を調整したりできます。
*   **学習リソース:** 独自のデモ作成のための包括的な「ML for Games Course」チュートリアルと、NPCの挙動調整に関するドキュメントが提供されています。
*   **コミュニティ参加と共有:** 作成したデモはLinkedInやXで共有し、@cubzh_ @gigax @huggingface をタグ付けすることが推奨されています。また、Cubzh、Gigax、Hugging FaceのDiscordコミュニティへの参加が促されています。

## Source URL
https://huggingface.co/blog/npc-gigax-cubzh
