---
title: "Hugging Face Teams Up with Protect AI: Enhancing Model Security for the ML Community"
title_ja: "Hugging FaceとProtect AIが連携 MLモデルのセキュリティ強化へ"
source_url: "https://huggingface.co/blog/protectai"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)

Hugging Faceは、AIセキュリティ企業Protect AIと提携し、MLコミュニティ向けのモデルセキュリティを大幅に強化しました。特に、Pickleなどの脆弱なシリアライズ形式に起因する任意コード実行リスクから保護するため、Protect AIのGuardianスキャナーをHugging Face Hubに統合。これにより、公開モデルリポジトリは自動的にスキャンされ、より安全なモデル共有環境が提供されます。

## 重要ポイント

*   **Protect AIとの提携:** Hugging Faceは、AIの安全な世界を目指すProtect AIとパートナーシップを締結。
*   **モデルセキュリティの強化:** モデルのシリアライズ形式（特にPickle）に潜む任意コード実行などの脆弱性からコミュニティを保護。
*   **Guardianスキャナーの統合:** Protect AIのGuardianスキャナーをHugging Faceの既存スキャナー群に組み込み、PickleだけでなくKeras Lambdaレイヤーなどの広範な脆弱性を検出。
*   **自動スキャンとUI改善:** 公開モデルリポジトリは自動的にGuardianによってスキャンされ、結果は刷新されたフロントエンドに表示される。
*   **コミュニティ保護と成長促進:** 安全で摩擦のないモデル共有を可能にし、ML分野全体の成長に貢献。

## 詳細レポート（What happened/背景/影響/関係者/データ）

*   **What happened:** Hugging Faceは、AIセキュリティの専門企業Protect AIとの提携を発表し、同社のGuardianスキャナーをHugging Face Hubに統合しました。この統合により、モデルのセキュリティスキャン機能が強化され、脆弱性の検出とユーザーへの可視化が向上します。
*   **背景:** Hugging FaceはMLモデル共有の主要プラットフォームとして、モデルの安全性確保を重視しています。特に、モデルの保存・転送に用いられるシリアライズ形式（例: Pickle）には、任意コード実行などの深刻な脆弱性が存在するリスクが指摘されていました。Hugging Faceは既に`picklescan`などのツールを開発していましたが、より広範な脆弱性に対応するため、Protect AIのコミュニティ重視のアプローチとセキュリティ専門知識に着目し、提携に至りました。
*   **影響:**
    *   **ユーザーへの影響:** 公開モデルリポジトリは、ユーザーが特別な操作をすることなく、自動的にGuardianによってスキャンされます。スキャン結果はHugging Face Hubのモデルページに表示され、セキュリティリスクの有無を簡単に確認できるようになります。これにより、モデルの利用者はより安心してモデルをダウンロード・利用でき、モデル提供者は自身のモデルの安全性を証明しやすくなります。
    *   **プラットフォームへの影響:** Hugging Faceは、MLコミュニティに安全で信頼性の高いプラットフォームを提供するという長期的なコミットメントを強化し、モデル共有におけるセキュリティの懸念を軽減します。
*   **関係者:**
    *   **Hugging Face:** MLモデル共有プラットフォームの運営者、セキュリティ強化の推進者。
    *   **Protect AI:** AIセキュリティツール「Guardian」の開発元、Hugging Faceのセキュリティパートナー。
    *   **MLコミュニティ:** Hugging Face Hubを利用してモデルを共有・利用する開発者、研究者、企業。
*   **データ:**
    *   Hugging Faceは既に数億のファイルをスキャン済み。
    *   Hugging Face Hubには100万以上のモデルリポジトリが存在するため、全てのリポジトリのスキャン完了には時間がかかる見込み。
    *   GuardianはPickleだけでなく、Keras Lambdaレイヤーの脆弱性など、追加のファイル形式におけるエクスプロイトも検出可能。

## 引用（Notable quotes）

*   「We are pleased to announce our partnership with Protect AI, as part of our long-standing commitment to provide a safe and reliable platform for the ML community.」
*   「empowering the community to share models in a safe and frictionless manner will lead to growth for the whole field.」

## リスクと課題

*   **スキャン完了までの時間:** Hugging Face Hubには100万以上のモデルリポジトリが存在するため、全ての既存モデルのリポジトリのスキャンが完了するには時間を要する可能性があります。
*   **新たな脆弱性への対応:** AI技術の進化に伴い、新たなモデル形式や脆弱性が出現する可能性があるため、継続的なセキュリティ対策とスキャナーの更新が求められます。

## 今後の見通し/アクション

Hugging Faceは、Protect AIとの提携を通じて、MLコミュニティに安全で信頼性の高いモデル共有プラットフォームを提供し続けることを目指しています。これにより、モデルを安全かつ摩擦なく共有できる環境が整備され、AI分野全体の成長が促進されると期待されます。

Hugging Faceは、セキュリティパートナーシップへの参加やスキャン情報の提供に関心のある企業や個人に対し、security@huggingface.co への連絡を呼びかけています。

## Source URL（必須）
https://huggingface.co/blog/protectai
