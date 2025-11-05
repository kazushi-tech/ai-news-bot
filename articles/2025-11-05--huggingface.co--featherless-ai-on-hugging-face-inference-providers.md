---
title: "Featherless AI on Hugging Face Inference Providers 🔥"
title_ja: "Featherless AI、Hugging Face推論プロバイダーに登場"
source_url: "https://huggingface.co/blog/inference-providers-featherless"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Featherless AIを新たなInference ProviderとしてHugging Face Hubに統合しました。これにより、ユーザーはDeepSeek、Meta、Google、Qwenなど広範なテキスト・会話モデルを、サーバーレスかつコスト効率の良い方法で直接Hub上やクライアントSDKsから利用できるようになります。

## 重要ポイント
*   **Featherless AIの統合**: Featherless AIがHugging Face HubのInference Providerエコシステムに加わりました。
*   **広範なモデルサポート**: DeepSeek、Meta、Google、Qwenなど、最新のオープンソーステキスト・会話モデルを多数サポートします。
*   **サーバーレス推論**: 独自のモデルロードとGPUオーケストレーションにより、比類ないモデル範囲と多様性をサーバーレス料金で提供します。
*   **シームレスな利用**: Hugging FaceのウェブUIおよびPython/JavaScriptクライアントSDKsから簡単に利用可能です。
*   **柔軟な課金オプション**: ユーザーはFeatherless AIのAPIキーを直接使用するか、Hugging Face経由でルーティングし、Hugging Faceアカウントに課金するかを選択できます。Hugging Face経由の場合、追加マークアップはありません。
*   **PROユーザー特典**: PROユーザーは毎月2ドルの推論クレジットを全プロバイダーで利用可能です。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Featherless AIが、Hugging Face Hubの公式なInference Providerとして追加されました。これにより、Hugging Faceユーザーは、HubのモデルページやクライアントSDKsを通じて、Featherless AIが提供するサーバーレス推論サービスを直接利用できるようになりました。

**背景:**
Featherless AIは、独自のモデルロードとGPUオーケストレーション能力を持つサーバーレスAI推論プロバイダーです。従来の推論サービスが「限られたモデルセットを低コストで提供」するか、「無制限のモデルをユーザーがサーバー管理する」かのいずれかであったのに対し、Featherless AIは「比類ないモデル範囲と多様性をサーバーレス料金で」提供することで、両者の利点を兼ね備えています。この統合により、Hugging Faceはユーザーにさらに多様なモデルと柔軟な推論オプションを提供できるようになります。

**影響:**
*   **ユーザーの利便性向上**: ユーザーはHugging Face Hubから、より広範な最新のオープンソースモデル（DeepSeek、Meta、Google、Qwenなど）をサーバーレスで手軽に利用できるようになります。
*   **開発の柔軟性**: PythonおよびJavaScriptのクライアントSDKsにシームレスに統合されており、開発者は既存のワークフローに容易に組み込めます。
*   **コスト効率**: サーバーレス料金体系により、必要な時に必要なだけリソースを利用でき、運用コストを最適化できます。
*   **課金選択肢**: ユーザーはプロバイダーに直接課金されるか、Hugging Faceアカウントを通じて課金されるかを選択でき、管理が容易になります。

**関係者:**
*   **Hugging Face**: プラットフォーム提供者、Featherless AIをInference Providerエコシステムに統合。
*   **Featherless AI**: 新たなInference Providerとして、サーバーレスAI推論サービスと広範なモデルカタログを提供。

**データ:**

**サポートモデルの例:**
*   DeepSeek
*   Meta
*   Google
*   Qwen
*   その他多数の最新オープンソーステキスト・会話モデル

**利用方法:**
1.  **ウェブUI**: Hugging Faceユーザーアカウント設定で、Featherless AIのAPIキーを設定し、プロバイダーの優先順位を調整。
2.  **クライアントSDKs**:
    *   **Python**: `huggingface_hub` (v0.33.0以上) を使用。
    *   **JavaScript**: `@huggingface/inference` を使用。

**課金モデル:**

| 項目             | カスタムキー (プロバイダー直接) | HF経由ルーティング (Hugging Face経由) |
| :--------------- | :----------------------------- | :------------------------------------ |
| APIキー          | Featherless AIのAPIキー        | Hugging Faceトークン                  |
| 請求元           | Featherless AI                 | Hugging Face                          |
| 料金             | Featherless AIの料金           | プロバイダーの標準API料金（HFマークアップなし） |
| PROユーザー特典  | 対象外                         | 毎月2ドルの推論クレジットが利用可能   |

## 引用（Notable quotes）
*   "Featherless provides the best of both worlds offering unmatched model range and variety but with serverless pricing."
    （Featherlessは、比類ないモデル範囲と多様性をサーバーレス料金で提供し、両方の良いとこ取りを実現します。）
*   "There's no additional markup from us, we just pass through the provider costs directly."
    （私たちからの追加マークアップはなく、プロバイダーのコストを直接パススルーするだけです。）

## リスクと課題
記事中に明示的なリスクや課題の記述はありませんが、ユーザーは以下の点に留意する必要があります。
*   **課金体系の理解**: カスタムキーを使用する場合とHugging Face経由でルーティングする場合で、課金元と請求方法が異なるため、ユーザーは自身の利用状況に合った方法を選択し、料金体系を正確に理解する必要があります。
*   **APIキーの管理**: カスタムキーを使用する場合、Featherless AIのAPIキーを安全に管理することが重要です。

## 今後の見通し/アクション
*   Hugging Faceは、今後プロバイダーパートナーとの間で収益分配契約を確立する可能性を示唆しています。
*   ユーザーは、この新しいプロバイダーを活用して、多様なモデルを用いたAIアプリケーションの開発を進めることが期待されています。
*   Hugging Faceは、ユーザーからのフィードバックを積極的に求めており、指定のHugging Face Spacesディスカッションページ（https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49）で意見を募集しています。
*   より多くの推論クレジットや高度な機能を利用したいユーザーには、Hugging Face PROプランへのアップグレードが推奨されています。

## Source URL
https://huggingface.co/blog/inference-providers-featherless
