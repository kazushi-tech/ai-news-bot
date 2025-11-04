---
title: "Featherless AI on Hugging Face Inference Providers 🔥"
title_ja: ""
source_url: "https://huggingface.co/blog/inference-providers-featherless"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、サーバーレスAI推論プロバイダーであるFeatherless AIをHugging Face Hubの公式推論プロバイダーとして統合しました。これにより、ユーザーはDeepSeek、Meta、Google、Qwenなどの最新のオープンソースモデルを含む、非常に広範なテキストおよび会話モデルを、サーバー管理なしで、コスト効率良く利用できるようになります。

## 重要ポイント
*   **Featherless AIの統合**: Featherless AIがHugging Face Hubの新たな推論プロバイダーとして加わりました。
*   **広範なモデルサポート**: DeepSeek、Meta、Google、Qwenなど、多様なテキストおよび会話モデルをサーバーレスで提供します。
*   **ユニークな価値提案**: サーバーレス料金で、比類のないモデル範囲と多様性を提供し、低コストとモデル選択の自由を両立させます。
*   **シームレスな利用**: Hugging FaceのウェブUIおよびPython/JSクライアントSDKsから簡単に利用可能です。
*   **柔軟な課金オプション**: プロバイダーのAPIキーを直接使用する「カスタムキー」モードと、Hugging Face経由で認証・課金される「ルーティング」モードがあります。
*   **PROユーザー特典**: Hugging Face PROユーザーは毎月2ドルの推論クレジットを全プロバイダーで利用できます。

## 詳細レポート
### What happened
Hugging Faceは、Featherless AIをHugging Face Hub上の公式な推論プロバイダーとして追加したことを発表しました。これにより、Featherless AIが提供する広範なモデルカタログが、Hugging Faceのプラットフォーム上で直接利用可能になります。

### 背景
Hugging Faceは、モデルページ上でサーバーレス推論の幅と能力を強化するため、推論プロバイダーのエコシステムを拡大しています。Featherless AIは、独自のモデルロードとGPUオーケストレーション能力を持つサーバーレスAI推論プロバイダーであり、通常は限定的なモデルセットに低コストでアクセスするか、無制限のモデル範囲のためにサーバー管理と関連コストをユーザーが負担するかの二択であった市場において、「サーバーレス料金で比類のないモデル範囲と多様性」という両方の利点を提供します。

### 影響
*   **ユーザー体験の向上**: ユーザーはHugging Face Hub上で、より多様な最新のオープンソースモデル（DeepSeek, Meta, Google, Qwenなど）を、サーバー管理の複雑さなしに、コスト効率良く利用できるようになります。
*   **開発の簡素化**: 開発者はPythonおよびJavaScriptのクライアントSDKを通じて、Featherless AIを簡単に統合し、モデル推論を実行できます。
*   **柔軟な課金**: ユーザーは、Featherless AIのAPIキーを直接使用してプロバイダーから請求を受けるか、Hugging Faceトークンを使用してHugging Faceアカウント経由で請求を受けるかを選択できます。Hugging Face経由の場合、追加のマークアップなしでプロバイダーの標準API料金が適用されます。

### 関係者
*   **Hugging Face**: プラットフォーム提供者、推論プロバイダーエコシステムの管理者。
*   **Featherless AI**: 新たに統合されたサーバーレスAI推論プロバイダー。

### データ
**利用モードと課金体系**

| 項目             | カスタムキー利用時                                | Hugging Face経由利用時                               |
| :--------------- | :------------------------------------------------ | :--------------------------------------------------- |
| **APIキー**      | Featherless AIのAPIキーを直接設定                 | Hugging Faceトークンを使用                           |
| **請求元**       | Featherless AIアカウント                            | Hugging Faceアカウント                               |
| **料金**         | Featherless AIの料金体系に準拠                    | プロバイダーの標準API料金（Hugging Faceのマークアップなし） |
| **PROユーザー特典** | 直接プロバイダーに支払うため適用外                | 毎月2ドルの推論クレジット利用可能                      |

*   **サポートモデル**: DeepSeek, Meta, Google, Qwenなど、多数のテキストおよび会話モデル。
*   **Hugging Face PROユーザー**: 毎月2ドルの推論クレジットが付与され、全プロバイダーで利用可能です。無料ユーザーにも小規模なクォータで無料推論が提供されます。

## 引用（Notable quotes）
*   "Featherless provides the best of both worlds offering unmatched model range and variety but with serverless pricing."
*   "There's no additional markup from us, we just pass through the provider costs directly."

## リスクと課題
記事中には明示的なリスクや課題の記述はありません。

## 今後の見通し/アクション
*   Hugging Faceは、Featherless AIを活用してユーザーがどのような新しいアプリケーションを構築するかを楽しみにしています。
*   ユーザーからのフィードバックをHugging Faceのディスカッションスペースで募集しています。
*   将来的には、Hugging Faceがプロバイダーパートナーとの間で収益分配契約を確立する可能性も示唆されています。

## Source URL
https://huggingface.co/blog/inference-providers-featherless
