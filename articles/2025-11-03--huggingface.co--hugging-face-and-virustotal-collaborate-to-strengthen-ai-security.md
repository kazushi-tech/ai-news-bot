---
title: "Hugging Face and VirusTotal collaborate to strengthen AI security"
title_ja: "Hugging FaceとVirusTotal、AIセキュリティ強化で連携"
source_url: "https://huggingface.co/blog/virustotal"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceとVirusTotalが提携し、Hugging Face Hub上の220万以上の全パブリックモデルおよびデータセットリポジトリをVirusTotalで継続的にスキャンすることで、AIセキュリティを大幅に強化します。これにより、機械学習コミュニティを悪意のある、または侵害されたアセットから保護します。

## 重要ポイント
*   **対象範囲の広さ:** Hugging Face Hub上の220万以上のパブリックモデルおよびデータセットリポジトリが、VirusTotalによって継続的にスキャンされます。
*   **セキュリティ強化の必要性:** AIモデルは複雑なデジタル成果物であり、悪意のあるペイロード、改ざんファイル、既知のマルウェア、危険な依存関係など、多様なセキュリティリスクを抱えています。
*   **プライバシー保護:** ファイルハッシュのみをVirusTotalの脅威インテリジェンスデータベースと照合し、実際のファイル内容は共有しないため、ユーザーのプライバシーとデータ保護原則が維持されます。
*   **透明性と安全性:** ユーザーはリポジトリページでファイルのVirusTotalスキャン結果（クリーン/悪意あり、検出数、関連情報など）を直接確認でき、ダウンロードや統合前の安全性を高めます。
*   **コミュニティへのメリット:** 透明性、安全性、効率性、信頼性の向上を通じて、Hugging Face Hubをより安全で信頼性の高いオープンソースAIコラボレーションの場とします。

## 詳細レポート（What happened/背景/影響/関係者/データ）

*   **What happened:**
    Hugging Faceと世界有数の脅威インテリジェンスおよびマルウェア分析プラットフォームであるVirusTotalが新たな提携を発表しました。この提携により、Hugging Face Hubで共有されるファイルのセキュリティが強化され、機械学習コミュニティを悪意のある、または侵害されたアセットから保護します。本日より、Hugging Face Hub上の220万を超えるすべてのパブリックモデルおよびデータセットリポジトリがVirusTotalによって継続的にスキャンされます。

*   **背景:**
    AIモデルは強力である一方で、大規模なバイナリファイル、シリアライズされたデータ、依存関係など、複雑なデジタル成果物であり、隠れたリスクを伴うことがあります。Hugging Face Hubは世界最大のオープンな機械学習モデルおよびデータセットプラットフォームとして成長を続けており、共有されるアセットの安全性を確保することが不可欠です。脅威は、モデルファイルやアーカイブに偽装した悪意のあるペイロード、アップロード前に侵害されたファイル、既知のマルウェアキャンペーンに関連するバイナリアセット、ロード時に安全でないコードを実行する依存関係やシリアライズされたオブジェクトなど、さまざまな形で存在します。

*   **影響:**
    *   **ユーザー:** リポジトリページやファイル/ディレクトリページにアクセスすると、Hubが自動的に対応するファイルのVirusTotal情報を取得します。これにより、ユーザーはファイルダウンロードや統合前に、そのセキュリティに関する貴重なコンテキスト（検出数、既知の悪意のある関係、関連する脅威キャンペーン情報など）を得ることができます。
    *   **組織:** VirusTotalのチェックをCI/CDまたはデプロイメントワークフローに統合することで、悪意のあるアセットの拡散を防止できます。
    *   **Hugging Face Hub:** オープンソースAIのコラボレーションにおいて、より安全で信頼性の高いプラットフォームとなります。

*   **関係者:**
    *   **Hugging Face:** 機械学習モデルとデータセットのための世界最大のオープンなプラットフォーム。
    *   **VirusTotal:** 世界有数の脅威インテリジェンスおよびマルウェア分析プラットフォーム（Googleが所有）。

*   **データ:**
    *   Hugging Face Hubには220万以上のパブリックモデルおよびデータセットリポジトリが存在します。

*   **スキャンメカニズム:**
    1.  ユーザーがリポジトリ、ファイル、またはディレクトリページにアクセスすると、Hubが自動的に対応するファイルのVirusTotal情報を取得します。
    2.  Hugging FaceはファイルのハッシュをVirusTotalの脅威インテリジェンスデータベースと照合します。
    3.  ファイルハッシュがVirusTotalによって以前に分析されている場合、そのステータス（クリーンまたは悪意あり）が取得されます。
    4.  **重要な点として、生のファイル内容はVirusTotalと共有されません。** これにより、ユーザーのプライバシーとHugging Faceのデータ保護原則が維持されます。
    5.  結果には、検出数、既知の悪意のある関係、関連する脅威キャンペーンインテリジェンスなどのメタデータが含まれます。

## 引用（Notable quotes）
*   "Starting today, every one of the 2.2M+ public model and datasets repositories on the Hugging Face Hub is being continuously scanned with VirusTotal."
*   "By collaborating with VirusTotal, we’re adding an extra layer of protection and visibility by enabling files shared through Hugging Face to be checked against one of the largest and most trusted malware intelligence databases in the world."
*   "No raw file contents are shared with VirusTotal maintaining user privacy and compliance with Hugging Face’s data protection principles."
*   "Together, we’re making the Hugging Face Hub a more secure, reliable place to collaborate on open-source AI."
*   "Together, we can make AI collaboration not just open but secure by design."

## リスクと課題
*   **未知の脅威への対応:** ファイルハッシュベースの照合は、既知の脅威に対して非常に効果的ですが、ゼロデイ攻撃や未知のマルウェアに対する検出能力には限界がある可能性があります。
*   **誤検知（False Positive）:** 脅威インテリジェンスデータベースの性質上、稀に誤検知が発生する可能性があり、それがユーザーの混乱や不必要な懸念を引き起こす可能性があります。
*   **プライベートリポジトリのセキュリティ:** この提携によるスキャンは「パブリック」リポジトリに限定されており、プライベートリポジトリのセキュリティは別途ユーザーの責任となります。

## 今後の見通し/アクション
*   Hugging Face Hubは、オープンソースAIモデルとデータセットの共有において、より安全で信頼性の高いプラットフォームとしての地位を確立します。
*   ユーザーや組織は、AIモデルやデータセットの利用・統合において、より高いレベルの安心感を得られるようになります。
*   Hugging Faceは、オープンソースAIエコシステム全体の安全性向上に貢献し、AIコラボレーションを「オープンであるだけでなく、設計上安全」なものにすることを目指します。
*   この統合に関する詳細情報や、より安全なオープンソースAIエコシステムへの貢献に関心がある場合は、security@huggingface.coへの連絡が呼びかけられています。

## Source URL（必須）
https://huggingface.co/blog/virustotal
