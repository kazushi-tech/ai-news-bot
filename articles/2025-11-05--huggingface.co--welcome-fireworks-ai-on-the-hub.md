---
title: "Welcome Fireworks.ai on the Hub 🎆"
title_ja: "Fireworks.ai、HF Hubに登場！高速推論を提供開始"
source_url: "https://huggingface.co/blog/fireworks-ai"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Face Hubは、高速なサーバーレス推論を提供するFireworks.aiを新たな公式推論プロバイダーとしてサポートを開始しました。これにより、ユーザーはHugging Faceのモデルページやエコシステム全体で、DeepSeek、Mistral、Qwen、Llamaなどの人気モデルに対し、Fireworks.ai経由で手軽かつ高速に推論を実行できるようになります。

## 重要ポイント

*   **Fireworks.aiの統合:** Hugging Face Hubの公式推論プロバイダーとしてFireworks.aiが追加されました。
*   **高速サーバーレス推論:** Fireworks.aiは「blazing-fast」なサーバーレス推論をHugging Faceエコシステム全体で提供します。
*   **広範なモデルサポート:** DeepSeek-R1/V3、Mistral-Small-24B-Instruct、Qwen2.5-Coder-32B-Instruct、Llama-3.2-90B-Vision-Instructなど、多数の主要モデルが対応しています。
*   **多様な利用方法:** Web UI、Python/JS SDK (huggingface_hub/@huggingface/inference)、HTTP API (cURL) を通じてアクセス可能です。
*   **透明な課金体系:** Fireworks.aiキーを使用する場合は直接課金、Hugging Face認証経由の場合はFireworks.aiの標準APIレートがそのまま適用され、Hugging Faceからの追加マークアップはありません。
*   **PROユーザー特典:** Hugging Face PROユーザーは毎月2ドル相当の推論クレジットを受け取ることができ、複数のプロバイダーで利用可能です。

## 詳細レポート

**What happened:**
Hugging Faceは、AIモデルの推論サービスを提供するFireworks.aiを、Hugging Face Hubの新たな公式推論プロバイダーとして発表しました。これにより、Hugging Faceのエコシステム内でFireworks.aiの高速なサーバーレス推論サービスが利用可能になりました。

**背景:**
この発表は、Hugging Faceが最近行った「Inference Providers on the Hub」の発表に続くもので、ユーザーが好みのモデルで推論をより簡単かつ効率的に実行できるようにすることを目的としています。Fireworks.aiの統合は、Hugging Faceが提供する推論オプションを拡大し、開発者により多くの選択肢とパフォーマンスを提供するための戦略の一環です。

**影響:**
*   **ユーザー体験の向上:** ユーザーはHugging Faceのモデルページから直接、またはPython/JSライブラリ、HTTPリクエストを通じて、Fireworks.aiの高速推論を簡単に利用できるようになります。
*   **開発効率の向上:** サーバーレス推論により、インフラ管理の手間なく、迅速なプロトタイピングやアプリケーション開発が可能になります。
*   **モデルアクセスの拡大:** 以下の主要な大規模言語モデル（LLM）を含む、多数のモデルがFireworks.ai経由でサポートされます。

| モデル名                                   | プロバイダー |
| :----------------------------------------- | :----------- |
| deepseek-ai/DeepSeek-R1                    | Fireworks.ai |
| deepseek-ai/DeepSeek-V3                    | Fireworks.ai |
| mistralai/Mistral-Small-24B-Instruct-2501  | Fireworks.ai |
| Qwen/Qwen2.5-Coder-32B-Instruct            | Fireworks.ai |
| meta-llama/Llama-3.2-90B-Vision-Instruct   | Fireworks.ai |
| *(その他多数)*                             |              |

**関係者:**
*   **Hugging Face:** プラットフォーム提供者、エコシステムの管理者。
*   **Fireworks.ai:** 新たな推論プロバイダー、高速サーバーレス推論サービスの提供者。
*   **モデル開発者:** DeepSeek AI、Mistral AI、Qwen、Meta Llamaなど、Hugging Face Hubにモデルを公開している企業や研究機関。
*   **Hugging Faceユーザー/開発者:** Fireworks.aiの推論サービスを利用するエンドユーザー。

**データ:**
*   Hugging Face PROユーザーは毎月2ドル相当の推論クレジットが付与されます。
*   課金はFireworks.aiの標準APIレートに基づき、Hugging Faceによる追加マークアップはありません。

## 引用（Notable quotes）

*   "Fireworks.ai delivers blazing-fast serverless inference directly on model pages, as well as throughout the whole HF ecosystem of libraries and tools, making it easier than ever to run inference on your favorite models."
*   "There's no additional markup from us, we just pass through the provider costs directly."

## リスクと課題

*   **プロバイダー依存性:** 特定の推論プロバイダーに依存することで、そのサービスの可用性や価格変動がユーザーに影響を与える可能性があります。
*   **課金体系の理解:** Fireworks.aiキーを使用する場合とHugging Face認証を使用する場合で課金元が異なるため、ユーザーは自身の課金状況を正確に理解する必要があります。
*   **将来的な変更:** Hugging Faceが将来的にプロバイダーパートナーとの収益分配契約を確立する可能性が示唆されており、これにより課金体系やサービス内容が変更される可能性があります。

## 今後の見通し/アクション

*   Hugging Faceは今後も推論プロバイダーのラインナップを拡充し、ユーザーに多様な選択肢と最適なパフォーマンスを提供していくと見られます。
*   ユーザーはFireworks.aiを活用し、プロジェクトに高速なAI推論機能を統合することが推奨されます。
*   Hugging Face PROプランの加入者は、毎月の推論クレジットを有効活用し、様々なプロバイダーのサービスを試すことができます。
*   Hugging Faceは、プロバイダーとの連携を深め、エコシステム全体の価値向上を目指すでしょう。

## Source URL
https://huggingface.co/blog/fireworks-ai
