---
title: "Hugging Face and VirusTotal collaborate to strengthen AI security"
title_ja: "Hugging FaceとVirusTotal、AIセキュリティを強化"
source_url: "https://huggingface.co/blog/virustotal"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、世界有数の脅威インテリジェンスプラットフォームであるVirusTotalとの提携を発表しました。これにより、Hugging Face Hub上の220万以上の公開モデルおよびデータセットリポジトリがVirusTotalによって継続的にスキャンされ、AIコミュニティを悪意のある、または侵害された資産から保護します。

## 重要ポイント
*   **AIセキュリティの強化**: AIモデルの複雑性と潜在的なリスク（悪意のあるペイロード、侵害されたファイル、既知のマルウェア、安全でないコード実行など）に対処するため、Hugging Face Hubにセキュリティ層を追加。
*   **スキャンメカニズム**: リポジトリやファイルページ訪問時に、ファイルハッシュをVirusTotalの脅威インテリジェンスデータベースと照合。ファイルの内容自体はVirusTotalと共有されず、ユーザーのプライバシーが保護されます。
*   **提供情報**: 検出数、既知の悪意のある関係、関連する脅威キャンペーン情報などのメタデータがユーザーに提供されます。
*   **コミュニティへのメリット**: 透明性（ファイルのフラグ状況確認）、安全性（CI/CD統合による悪意ある資産拡散防止）、効率性（既存インテリジェンス活用）、信頼性（より安全なコラボレーション環境）。

## 詳細レポート
### What happened
Hugging Faceは、Googleが所有する世界有数の脅威インテリジェンスおよびマルウェア分析プラットフォームであるVirusTotalとの新たな提携を発表しました。この提携により、Hugging Face Hub上の220万を超えるすべての公開モデルおよびデータセットリポジトリが、VirusTotalによって継続的にスキャンされるようになります。

### 背景
AIモデルは強力である一方で、大規模なバイナリファイル、シリアライズされたデータ、依存関係など、隠れたリスクを伴う複雑なデジタル成果物です。Hugging Face Hubは世界最大のオープンな機械学習モデルおよびデータセットプラットフォームとして成長しており、共有される資産の安全性を確保することが不可欠です。脅威は、モデルファイルに偽装した悪意のあるペイロード、アップロード前に侵害されたファイル、既知のマルウェアキャンペーンに関連するバイナリ資産、ロード時に安全でないコードを実行する依存関係など、さまざまな形で存在します。

### 影響
*   **ユーザーへの影響**: リポジトリやファイル/ディレクトリページにアクセスすると、Hubは自動的に対応するファイルに関するVirusTotal情報を取得します。ユーザーはファイルをダウンロードまたは統合する前に、そのファイルの安全性に関する貴重なコンテキストを得ることができます。
*   **組織への影響**: 組織はVirusTotalチェックをCI/CDまたはデプロイワークフローに統合し、悪意のある資産の拡散を防止できます。
*   **コミュニティへの影響**: Hugging Face Hubは、より透明性が高く、安全で、効率的かつ信頼性の高いオープンソースAIコラボレーションの場となります。

### 関係者
*   **Hugging Face**: 機械学習モデルとデータセットのための世界最大のオープンプラットフォーム。
*   **VirusTotal**: 世界有数の脅威インテリジェンスおよびマルウェア分析プラットフォーム（Googleが所有）。

### データ
*   **スキャン対象**: Hugging Face Hub上の220万以上の公開モデルおよびデータセットリポジトリ。
*   **スキャン方法**: ファイルハッシュをVirusTotalの脅威インテリジェンスデータベースと照合。ファイルの内容は共有されません。
*   **提供される情報**: 検出数、既知の悪意のある関係、関連する脅威キャンペーンインテリジェンスなど。

## 引用（Notable quotes）
*   "Starting today, every one of the 2.2M+ public model and datasets repositories on the Hugging Face Hub is being continuously scanned with VirusTotal."
*   "No raw file contents are shared with VirusTotal maintaining user privacy and compliance with Hugging Face’s data protection principles."
*   "Together, we’re making the Hugging Face Hub a more secure, reliable place to collaborate on open-source AI."

## リスクと課題
記事には直接的なリスクや課題の記述はありませんが、一般的に以下の点が考えられます。
*   **誤検知（False Positives）**: クリーンなファイルが悪意あると誤って検出される可能性。
*   **未検知（False Negatives）**: 新しい、または巧妙なマルウェアが検出をすり抜ける可能性。
*   **スキャン範囲の限界**: ファイルハッシュ比較は静的分析であり、実行時の動的な挙動やゼロデイ攻撃には対応しきれない可能性がある。
*   **ユーザーの理解と活用**: 提供されるセキュリティ情報をユーザーが適切に理解し、自身のワークフローに組み込むための教育やガイダンスが必要となる可能性。

## 今後の見通し/アクション
Hugging Faceは、オープンソースAIエコシステムにおけるコラボレーションを「オープン」であるだけでなく「設計上安全」にすることを目指しています。この提携は、その目標に向けた重要な一歩です。
ユーザーは、この統合についてさらに詳しく知りたい場合や、より安全なオープンソースAIエコシステムへの貢献方法を探りたい場合は、security@huggingface.coに連絡することができます。

## Source URL（必須）
https://huggingface.co/blog/virustotal
