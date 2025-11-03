---
title: "Public AI on Hugging Face Inference Providers 🔥"
title_ja: "Public AI、Hugging Face推論プロバイダーに登場"
source_url: "https://huggingface.co/blog/inference-providers-publicai"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、非営利のオープンソースプロジェクトであるPublic AIを新たな推論プロバイダーとして追加しました。これにより、Swiss AI InitiativeやAI Singaporeなどの公共・主権モデルへのアクセスがHugging Face Hubから直接、かつ容易になります。Public AIは分散型インフラ上で動作し、現状は無料で利用可能ですが、将来的な安定性は国家・機関からの貢献に依存します。

## 重要ポイント
*   **新規プロバイダー追加**: Public AIがHugging Face Inference Providersのエコシステムに加わりました。
*   **公共・主権モデルへのアクセス**: Swiss AI InitiativeやAI Singaporeといった機関のモデルにHugging Faceから直接アクセス可能になります。
*   **非営利・オープンソース**: Public AI Inference Utilityは非営利のオープンソースプロジェクトです。
*   **分散型インフラ**: vLLMバックエンドと、国家・産業パートナーからの寄付GPUによる分散型インフラで運用されます。
*   **無料提供**: 現状、Hugging Face経由でのPublic AIの利用は無料です（寄付GPUと広告補助による）。
*   **利用方法**: Hugging FaceのウェブUIおよびPython/JSのクライアントSDKから簡単に利用できます。
*   **請求オプション**: ユーザーは自身のPublic AI APIキーを使用するか、Hugging Face経由で請求を受けるかを選択できます。

## 詳細レポート（What happened/背景/影響/関係者/データ）

### What happened
Hugging Faceは、Public AIを公式な推論プロバイダーとしてHugging Face Hubに統合しました。これにより、ユーザーはHugging Faceのプラットフォーム上でPublic AIを通じてモデル推論を実行できるようになります。

### 背景
Hugging Faceは、推論プロバイダーのエコシステムを拡大し、特に公共機関や主権国家が開発したAIモデルへのアクセスを容易にすることを目指しています。Public AIは、このような公共AIモデルの構築者を支援する非営利団体であり、そのインフラをHugging Face Hubに統合することで、この目標が達成されます。

### 影響
*   **ユーザー**: Hugging Face HubのモデルページやクライアントSDKから、Public AIが提供する公共・主権モデルを簡単に利用できるようになります。現状は無料で利用可能です。
*   **開発者**: PythonおよびJavaScriptのHugging Face SDKを通じて、Public AIを推論プロバイダーとして指定し、モデルを呼び出すことが可能になります。
*   **公共AIモデル**: Swiss AI InitiativeやAI Singaporeなどの公共AIモデルは、より広範なユーザーベースにリーチできるようになります。

### 関係者
*   **Hugging Face**: プラットフォーム提供者、Public AIを推論プロバイダーとして統合。
*   **Public AI**: 新規推論プロバイダー、非営利のオープンソースプロジェクト、公共AIモデルの構築を支援。
*   **Swiss AI Initiative, AI Singapore**: Public AIが支援する公共AIモデル開発機関。
*   **国家・産業パートナー**: Public AIの分散型インフラにGPU時間を提供。

### データ
*   **Public AI組織ページ**: https://huggingface.co/publicai
*   **Public AI対応モデルページ**: https://huggingface.co/models?inference_provider=publicai&sort=trending
*   **Public AIプラットフォーム情報**: https://platform.publicai.co/
*   **SDKバージョン**: `huggingface_hub` >= 0.34.6 が必要。
*   **利用例モデル**: `swiss-ai/Apertus-70B-Instruct-2509`

### 請求方法

| 請求方法 | APIキー | 請求元 | 備考 |
| :------- | :------ | :----- | :--- |
| カスタムキー | プロバイダーのAPIキー | プロバイダー | 直接プロバイダーに請求 |
| HF経由 | Hugging Faceトークン | Hugging Face | プロバイダーの標準API料金、HFが仲介。追加マークアップなし。 |

## 引用（Notable quotes）
*   "We're thrilled to share that Public AI is now a supported Inference Provider on the Hugging Face Hub!"
*   "This launch makes it easier than ever to access public and sovereign models from institutions like the Swiss AI Initiative and AI Singapore — right from Hugging Face."

## リスクと課題
*   **料金と可用性の変更**: 現状は無料ですが、料金体系や提供状況は将来的に変更される可能性があります。
*   **長期的な安定性**: Public AIの長期的な安定性は、国家や機関からの貢献に依存しています。
*   **分散型インフラの管理**: 複数のパートナーからの寄付GPUに依存する分散型インフラの運用と維持には、継続的な調整とリソースが必要です。

## 今後の見通し/アクション
*   **フィードバックの募集**: Hugging Faceはユーザーからのフィードバックを積極的に求めています（https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49）。
*   **PROユーザー特典**: Hugging Face PROユーザーは毎月2ドル相当の推論クレジットを受け取ることができ、Public AIを含むプロバイダーで利用可能です。
*   **収益分配の可能性**: 将来的にHugging Faceとプロバイダーパートナー間で収益分配契約が確立される可能性があります。
*   **無料ユーザーへの提供**: サインインした無料ユーザーにも小規模なクォータで無料推論が提供されます。

## Source URL（必須）
https://huggingface.co/blog/inference-providers-publicai
