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
Hugging Face Hubは、Featherless AIを新たな公式インファレンスプロバイダーとして追加しました。これにより、ユーザーはDeepSeek、Meta、Google、Qwenなどの最新オープンソースモデルを含む、非常に広範なテキストおよび会話モデルを、サーバーレスかつコスト効率の良い価格で利用できるようになります。Hugging FaceのUIおよびPython/JS SDKを通じてシームレスに統合され、直接課金またはHugging Face経由の課金が選択可能です。

## 重要ポイント
*   **Featherless AIの統合**: Hugging Face HubにFeatherless AIが公式インファレンスプロバイダーとして加わりました。
*   **広範なモデルサポート**: DeepSeek、Meta、Google、Qwenなど、最新のオープンソースモデルを含む多様なテキスト・会話モデルに対応しています。
*   **サーバーレスかつコスト効率**: Featherless AI独自のモデルロードとGPUオーケストレーションにより、広範なモデルをサーバーレス価格で提供し、コストとモデル範囲の両立を実現します。
*   **シームレスな利用**: Hugging FaceのウェブUIおよびPython/JavaScriptクライアントSDKから簡単に利用できます。
*   **柔軟な課金体系**: プロバイダーのAPIキーを使用する直接課金と、Hugging Face経由でルーティングされる課金（Hugging Faceアカウントに標準API料金で請求）の2種類があります。
*   **PROユーザー特典**: Hugging Face PROユーザーは毎月2ドル分のインファレンスクレジットを受け取れます。

## 詳細レポート
Hugging Faceは、AIインファレンスプロバイダーのエコシステムを拡大し、Featherless AIを新たな公式パートナーとしてHubに統合しました。Featherless AIは、独自のモデルロードとGPUオーケストレーション技術を特徴とするサーバーレスAIインファレンスプロバイダーであり、ユーザーに非常に広範なモデルカタログを提供します。これにより、通常は限定的なモデルセットに低コストでアクセスするか、無制限のモデル範囲のためにサーバー管理と関連コストを負担するかの二択だった状況に対し、「モデルの多様性とサーバーレス価格」という両方の利点を提供します。

ユーザーはHugging FaceのウェブUIでアカウント設定からFeatherless AIのAPIキーを設定し、プロバイダーの優先順位を管理できます。また、Pythonの`huggingface_hub`ライブラリ（v0.33.0以降）やJavaScriptの`@huggingface/inference`ライブラリを通じて、クライアントSDKからプログラム的にFeatherless AIを利用することが可能です。利用時には、自身のFeatherless AI APIキーを使用するか、Hugging Faceトークンを介してHugging Faceがリクエストをルーティングするかの2つのモードを選択できます。

課金に関しては、プロバイダーのAPIキーを直接使用する場合はFeatherless AIから直接請求されます。Hugging Face経由でルーティングされる場合は、Hugging Faceアカウントにプロバイダーの標準API料金が請求され、Hugging Faceからの追加マークアップはありません。Hugging Face PROユーザーは毎月2ドル分のインファレンスクレジットが付与され、無料ユーザーにも小規模なクォータが提供されます。

## 引用（Notable quotes）
*   "Featherless provides the best of both worlds offering unmatched model range and variety but with serverless pricing."
*   "PRO users get $2 worth of Inference credits every month. You can use them across providers. 🔥"

## リスクと課題
*   **課金体系の理解**: 直接課金とHugging Face経由の課金で請求元が異なるため、ユーザーは自身の利用状況と課金方法を正確に理解する必要があります。
*   **APIキー管理**: 複数のプロバイダーを利用する場合、それぞれのAPIキーの安全な管理が求められます。
*   **モデル互換性**: Featherless AIがサポートするモデルと、Hugging Face Hub上のモデルとの互換性を確認する必要があります。

## 今後の見通し/アクション
Hugging Faceは、この新しいプロバイダーを活用してユーザーがどのようなものを構築するかを楽しみにしています。ユーザーからのフィードバックを積極的に募集しており、Hugging Face Spacesのディスカッションページ（https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49）で意見やコメントを共有するよう促しています。将来的には、Hugging Faceとプロバイダーパートナー間でレベニューシェアリング契約を確立する可能性も示唆されています。

## Source URL
https://huggingface.co/blog/inference-providers-featherless
