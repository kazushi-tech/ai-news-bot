---
title: "Hugging Face and VirusTotal collaborate to strengthen AI security"
title_ja: "Hugging FaceとVirusTotal、AIセキュリティ強化へ提携"
source_url: "https://huggingface.co/blog/virustotal"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、世界有数の脅威インテリジェンス・マルウェア分析プラットフォームであるVirusTotalとの提携を発表しました。これにより、Hugging Face Hubで共有される220万以上の公開AIモデルおよびデータセットリポジトリがVirusTotalによって継続的にスキャンされ、機械学習コミュニティを悪意のある資産から保護し、AIセキュリティを強化します。

## 重要ポイント
*   **AIモデルのセキュリティリスク対策:** 複雑なAIモデルに含まれるバイナリファイル、シリアライズデータ、依存関係に潜む悪意のあるペイロード、侵害されたファイル、マルウェア関連資産、安全でないコード実行の脅威に対処します。
*   **広範なスキャン対象:** Hugging Face Hub上の全220万以上の公開モデルおよびデータセットリポジトリが継続的なスキャン対象となります。
*   **プライバシー保護:** ファイルハッシュのみがVirusTotalのデータベースと比較され、生のファイル内容は共有されないため、ユーザーのプライバシーとHugging Faceのデータ保護原則が維持されます。
*   **コミュニティへのメリット:** ユーザーはファイルの安全性を透明に確認でき、組織はCI/CDワークフローにセキュリティチェックを統合可能。既存のVirusTotalインテリジェンスを活用することで効率性が向上し、Hub全体の信頼性が高まります。

## 詳細レポート（What happened/背景/影響/関係者/データ）
*   **What happened:** Hugging Faceは、Googleが所有する脅威インテリジェンス・マルウェア分析プラットフォームであるVirusTotalとの新たな提携を発表しました。この提携により、Hugging Face Hub上のすべての公開AIモデルおよびデータセットリポジトリがVirusTotalによって継続的にスキャンされるようになります。
*   **背景:** AIモデルは強力であると同時に複雑なデジタル資産であり、大規模なバイナリファイル、シリアライズデータ、および依存関係に隠れたセキュリティリスクを抱えています。Hugging Face Hubは220万以上の公開モデルをホストし、世界最大のオープンな機械学習プラットフォームとして成長しており、悪意のあるペイロード、アップロード前に侵害されたファイル、既知のマルウェアキャンペーンに関連するバイナリ資産、安全でないコードを実行する依存関係など、多様な脅威から共有資産を保護することが不可欠でした。
*   **影響:** ユーザーがリポジトリやファイルページにアクセスすると、Hubは自動的に該当ファイルのVirusTotal情報を取得し、ファイルハッシュをVirusTotalの脅威インテリジェンスデータベースと比較します。これにより、ユーザーはファイルをダウンロードまたは統合する前に、そのファイルの安全性を評価するための貴重なコンテキスト（検出数、既知の悪意のある関係、関連する脅威キャンペーン情報など）を得ることができます。組織は、悪意のある資産の拡散を防ぐために、VirusTotalチェックをCI/CDまたはデプロイワークフローに統合することが可能になります。この連携は、Hugging Face Hubをより安全で信頼性の高いオープンソースAIコラボレーションの場へと変革します。
*   **関係者:**
    *   **Hugging Face:** AIモデルとデータセットのためのオープンなプラットフォームを提供。
    *   **VirusTotal:** 世界有数の脅威インテリジェンスおよびマルウェア分析プラットフォーム。
*   **データ:** 220万以上の公開モデルおよびデータセットリポジトリが継続的なスキャン対象となります。

## 引用（Notable quotes）
*   "TL;DR - Starting today, every one of the 2.2M+ public model and datasets repositories on the Hugging Face Hub is being continuously scanned with VirusTotal."
*   "No raw file contents are shared with VirusTotal maintaining user privacy and compliance with Hugging Face’s data protection principles."
*   "Together, we can make AI collaboration not just open but secure by design."

## リスクと課題
記事本文では、この提携の背景にある課題として、AIモデルの複雑性に起因する潜在的なセキュリティリスクが挙げられています。これには、悪意のあるペイロードがモデルファイルやアーカイブに偽装されること、アップロード前にファイルが侵害されること、既知のマルウェアキャンペーンに関連するバイナリ資産、およびロード時に安全でないコードを実行する依存関係やシリアライズオブジェクトなどが含まれます。このHugging FaceとVirusTotalの提携は、これらのリスクに対処し、AIエコシステムの安全性を向上させることを目的としています。

## 今後の見通し/アクション
Hugging Faceは、オープンソースAIエコシステムの安全性向上に継続的に取り組む姿勢を示しており、「AIコラボレーションをオープンであるだけでなく、設計上安全にする」というビジョンを掲げています。この統合に関する詳細情報や、より安全なオープンソースAIエコシステムへの貢献方法に関心のあるユーザーは、security@huggingface.coへ問い合わせることが推奨されています。

## Source URL
https://huggingface.co/blog/virustotal
