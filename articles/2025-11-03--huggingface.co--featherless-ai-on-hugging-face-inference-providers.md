---
title: "Featherless AI on Hugging Face Inference Providers 🔥"
title_ja: "Featherless AI、Hugging Face推論プロバイダーに参画、多様なモデルをサーバーレスで"
source_url: "https://huggingface.co/blog/inference-providers-featherless"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、Featherless AIを新たな公式推論プロバイダーとしてHugging Face Hubに統合しました。これにより、ユーザーはサーバーレス料金でDeepSeek、Meta、Google、Qwenなどを含む非常に広範なAIモデルに、Hugging FaceのUIやSDKを通じてシームレスにアクセスできるようになります。

## 重要ポイント
*   **新たなプロバイダー統合**: Featherless AIがHugging Face Hubの公式推論プロバイダーとしてサポートされました。
*   **広範なモデルカタログ**: Featherless AIは、DeepSeek、Meta、Google、Qwenなどの最新オープンソースモデルを含む、非常に多様なテキストおよび会話モデルをサーバーレス料金で提供します。
*   **サーバーレスの利点**: サーバー管理の負担なく、広範なモデルに低コストでアクセスできる「両者の良いとこ取り」を実現します。
*   **シームレスな利用**: Hugging FaceのウェブUIおよびPython/JSクライアントSDKから簡単に利用可能です。
*   **柔軟な課金**: 推論リクエストは、プロバイダーのAPIキーを直接使用してプロバイダーから請求されるか、Hugging Faceトークンを使用してHugging Faceアカウントに請求されるかを選択できます（Hugging Face経由の場合も追加マークアップなし）。
*   **PROユーザー特典**: Hugging Face PROユーザーは毎月2ドルの推論クレジットを受け取れます。

## 詳細レポート
### What happened
Hugging Faceは、Featherless AIをHugging Face Hubの公式推論プロバイダーとして追加したことを発表しました。これにより、Featherless AIが提供する広範なAIモデルが、Hugging Faceのプラットフォーム上で直接利用可能になりました。

### 背景
Hugging Faceは、ユーザーが多様なAIモデルを簡単に利用できるよう、推論プロバイダーのエコシステムを拡大しています。Featherless AIは、独自のモデルロードとGPUオーケストレーション能力を持つサーバーレスAI推論プロバイダーであり、通常は「限定モデルと低コスト」または「無制限モデルとサーバー管理」のいずれかである従来のプロバイダーの課題を解決し、サーバーレス料金で無比のモデル範囲と多様性を提供します。この統合により、Hugging Faceユーザーは、インフラ管理の複雑さなしに、より多くのモデルにアクセスできるようになります。

### 影響
*   **モデルアクセスの拡大**: ユーザーはHugging Face Hub上で、DeepSeek、Meta、Google、Qwenなどを含む、より多様なテキストおよび会話モデルにアクセスできるようになります。
*   **運用コストの削減**: サーバーレス料金モデルにより、ユーザーはAIモデルの推論をよりコスト効率良く、インフラ管理の負担なく実行できます。
*   **開発効率の向上**: Hugging FaceのウェブUIやPython/JS SDKにシームレスに統合されるため、既存の開発ワークフローに容易に組み込むことができます。
*   **柔軟な支払いオプション**: ユーザーは、プロバイダーのAPIキーを直接使用してプロバイダーから請求を受けるか、Hugging Faceトークンを使用してHugging Faceアカウントに請求を受けるかを選択でき、Hugging Face経由の場合でも追加料金は発生しません。

### 関係者
*   **Hugging Face**: AIモデルのハブとプラットフォームを提供し、Featherless AIを推論プロバイダーとして統合。
*   **Featherless AI**: サーバーレスAI推論サービスを提供し、Hugging Face Hubを通じてそのモデルカタログを公開。

### データ
*   **対応モデル**: DeepSeek、Meta、Google、Qwenなど、多岐にわたるテキストおよび会話モデル。
*   **SDK要件**: Pythonの`huggingface_hub`はv0.33.0以上、JSの`@huggingface/inference`を使用。
*   **課金モデル**:
    | 請求方法 | APIキー | 請求元 | HFマークアップ |
    | :------- | :----------------- | :--------- | :------------- |
    | 直接リクエスト | プロバイダーのキー | プロバイダー | なし           |
    | ルーティングリクエスト | HFトークン         | Hugging Face | なし           |
*   **PROユーザー特典**: 毎月2ドルの推論クレジット。

## 引用（Notable quotes）
「Featherless provides the best of both worlds offering unmatched model range and variety but with serverless pricing.」
（Featherlessは、比類のないモデル範囲と多様性をサーバーレス料金で提供することで、両方の長所を提供します。）

## リスクと課題
記事には直接的なリスクや課題の記述はありません。

## 今後の見通し/アクション
*   Hugging Faceは、ユーザーがこの新しいプロバイダーでどのようなアプリケーションを構築するかを楽しみにしています。
*   ユーザーからのフィードバックを、Hugging Face Spacesのディスカッションページ（https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49）で積極的に募集しています。
*   将来的には、Hugging Faceとプロバイダーパートナー間でレベニューシェア契約を確立する可能性が示唆されています。

## Source URL
https://huggingface.co/blog/inference-providers-featherless
