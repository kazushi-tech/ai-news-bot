---
title: "Hugging Face and VirusTotal collaborate to strengthen AI security"
title_ja: ""
source_url: "https://huggingface.co/blog/virustotal"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceとVirusTotalが提携し、Hugging Face Hub上の220万以上の公開モデルおよびデータセットリポジトリすべてがVirusTotalによって継続的にスキャンされるようになりました。これにより、AI資産のセキュリティが強化され、機械学習コミュニティを悪意のある、または侵害されたコンテンツから保護します。

## 重要ポイント
*   **提携**: Hugging Faceと世界有数の脅威インテリジェンス・マルウェア分析プラットフォームであるVirusTotalが提携。
*   **セキュリティ強化**: Hugging Face Hub上の全公開モデル・データセットリポジトリ（220万以上）をVirusTotalで継続的にスキャン。
*   **プライバシー保護**: ファイルのハッシュのみをVirusTotalと共有し、元のファイル内容は共有せずユーザープライバシーとデータ保護原則を維持。
*   **透明性と安全性**: ユーザーはリポジトリ訪問時にファイルのVirusTotal情報を確認でき、ダウンロード前に安全性を評価可能。
*   **コミュニティへの恩恵**: 透明性、安全性、効率性、信頼性の向上を通じて、オープンソースAIコラボレーションをより安全に。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened**:
Hugging Faceは、Googleが所有する世界有数の脅威インテリジェンスおよびマルウェア分析プラットフォームであるVirusTotalとの新たな提携を発表しました。この提携により、Hugging Face Hubで共有されるファイルのセキュリティが大幅に強化されます。

**背景**:
AIモデルは強力である一方で、大規模なバイナリファイル、シリアライズデータ、依存関係などを含む複雑なデジタル成果物であり、隠れたリスクを伴う可能性があります。Hugging Face Hubは現在220万以上の公開モデルをホストしており、世界最大のオープンな機械学習プラットフォームとして成長を続ける中で、共有される資産の安全性を確保することが不可欠です。脅威は、悪意のあるペイロード、アップロード前に侵害されたファイル、既知のマルウェアキャンペーンに関連するバイナリ資産、安全でないコードを実行する依存関係など、様々な形で存在します。

**影響**:
*   **継続的なスキャン**: Hugging Face Hub上の220万以上の公開モデルおよびデータセットリポジトリすべてが、VirusTotalによって継続的にスキャンされます。
*   **リアルタイム情報**: ユーザーがリポジトリページやファイル/ディレクトリページを訪れると、Hubは該当ファイルのVirusTotal情報を自動的に取得し表示します。
*   **プライバシー配慮**: ファイルのハッシュのみがVirusTotalの脅威インテリジェンスデータベースと比較され、元のファイル内容は共有されません。
*   **ユーザーへのメリット**: 検出数、既知の悪意のある関係、関連する脅威キャンペーン情報などのメタデータが提供され、ユーザーはファイルをダウンロードまたは統合する前に貴重なコンテキストを得られます。
*   **組織へのメリット**: 組織はVirusTotalチェックをCI/CDまたはデプロイワークフローに統合し、悪意のある資産の拡散を防ぐことができます。
*   **効率性**: 既存のVirusTotalインテリジェンスを活用することで、重複したスキャンが不要になり効率が向上します。

**関係者**:
*   **Hugging Face**: AIモデルとデータセットのオープンなプラットフォームを提供。
*   **VirusTotal**: 世界有数の脅威インテリジェンスおよびマルウェア分析プラットフォーム。

**データ**:
*   Hugging Face Hubには220万以上の公開モデルおよびデータセットリポジトリが存在。

## 引用（Notable quotes）
*   「Starting today, every one of the 2.2M+ public model and datasets repositories on the Hugging Face Hub is being continuously scanned with VirusTotal.」
*   「Together, we can make AI collaboration not just open but secure by design.」

## リスクと課題
*   AIモデルの複雑性: 大規模なバイナリファイル、シリアライズデータ、依存関係などが潜在的なリスクを抱える。
*   多様な脅威: 悪意のあるペイロード、アップロード前に侵害されたファイル、既知のマルウェアキャンペーンに関連するバイナリ、安全でないコードを実行する依存関係やシリアライズオブジェクト。
*   プラットフォームの成長: Hugging Face Hubの急速な成長に伴い、共有されるAI資産の安全確保が喫緊の課題。

## 今後の見通し/アクション
Hugging Faceは、この提携を通じてHugging Face Hubを「オープンであるだけでなく、設計上安全な」AIコラボレーションの場にすることを目指しています。この統合についてさらに詳しく知りたい場合や、より安全なオープンソースAIエコシステムへの貢献方法を模索したい場合は、security@huggingface.co に連絡するよう呼びかけています。

## Source URL（必須）
https://huggingface.co/blog/virustotal
