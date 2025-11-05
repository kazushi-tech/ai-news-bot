---
title: "Hugging Face and JFrog partner to make AI Security more transparent"
title_ja: "Hugging FaceとJFrogが提携 AIモデルの安全性向上・透明化"
source_url: "https://huggingface.co/blog/jfrog"
date: "2025-11-05"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceはJFrogと提携し、AIモデルのセキュリティを大幅に強化しました。JFrogのスキャナーをHugging Face Hubに統合することで、モデルウェイト内の悪意のあるコードをより深く解析し、誤検知を削減しながら、任意コード実行などの脆弱性からコミュニティを保護します。ユーザーは追加の操作なしに、公開モデルリポジトリが自動的にスキャンされる恩恵を受けられます。

## 重要ポイント
*   **戦略的提携**: Hugging FaceとJFrogがAIモデルのセキュリティ透明性向上を目指しパートナーシップを締結。
*   **セキュリティ強化**: JFrogのスキャナーをHugging Face Hubに導入し、モデルウェイト内のコードを解析して悪意のある使用を検出。
*   **高度な検出**: 既存の`picklescan`よりも深い分析が可能となり、誤検知を削減しつつ、pickleやKeras Lambdaレイヤーなどの脆弱性を特定。
*   **ユーザーへの影響**: 全ての公開モデルリポジトリは自動的にスキャンされ、ユーザー側での操作は不要。
*   **目的**: 安全で摩擦のないモデル共有を促進し、AI分野全体の成長に貢献。

## 詳細レポート（What happened/背景/影響/関係者/データ）

**What happened:**
Hugging Faceは、JFrog Software Supply Chain PlatformのクリエイターであるJFrogとの提携を発表しました。この提携の一環として、JFrogのスキャナーがHugging Face Hubに統合され、AIモデルのセキュリティが強化されます。

**背景:**
Hugging Faceは、MLコミュニティに安全で信頼性の高いプラットフォームを提供することを長年のコミットメントとしています。モデルのシリアル化形式（特にpickle）は、逆シリアル化時や推論時に任意コード実行の脆弱性を持つ可能性があり、共有されるモデルが潜在的に危険であるという課題がありました。既存の`picklescan`はパターンマッチングに限定され、モデルウェイト内のコードの悪意のある使用を常に確認できるわけではありませんでした。このため、より高度なコード解析能力を持つセキュリティソリューションが必要とされていました。

**影響:**
*   Hugging Face Hub上のAIモデルのセキュリティが大幅に向上します。
*   JFrogスキャナーはモデルウェイト内のコードを解析し、悪意のある使用をチェックすることで、誤検知を削減しつつ、より正確な脅威検出を可能にします。
*   ユーザーは、モデルのアップロード時に追加の操作をすることなく、公開モデルリポジトリが自動的にスキャンされるため、安全にモデルを共有・利用できるようになります。
*   これにより、AIコミュニティ全体が安全かつ摩擦なくモデルを共有できるようになり、AI分野全体の成長に貢献することが期待されます。

**関係者:**
*   **Hugging Face**: AIモデル共有プラットフォームの提供者。
*   **JFrog**: ソフトウェアサプライチェーンプラットフォームおよびセキュリティスキャナーの提供者。
*   **MLコミュニティ**: Hugging Face Hubを利用するモデル開発者および利用者。

**データ:**
*   既に数億のファイルがJFrogスキャナーによってスキャンされています。
*   Hugging Face Hubには数百万のモデルリポジトリが存在するため、全てのスキャンが完了するには時間がかかる見込みです。

## 引用（Notable quotes）
*   「JFrog goes a step deeper and will parse and analyze code it finds in models weights to check for potential malicious usage.」
*   「There's nothing you have to do to benefit from this! All public model repositories will be scanned by JFrog automatically as soon as you push your files to the Hub.」
*   「we believe that empowering the community to share models in a safe and frictionless manner will lead to growth for the whole field.」

## リスクと課題
*   **既存リポジトリのスキャン時間**: 数百万に及ぶ既存のモデルリポジトリ全てをスキャンするには、かなりの時間を要する可能性があります。
*   **進化する脅威**: AIモデルのセキュリティ脅威は常に進化しており、新たな脆弱性や攻撃手法への継続的な監視と対策が必要です。
*   **誤検知のバランス**: 悪意のあるコードの検出精度を高めつつ、開発者にとって無害なコードを誤って検出しないよう、バランスの取れたスキャンロジックの維持が課題となります。

## 今後の見通し/アクション
*   Hugging Face Hub上の全ての公開モデルリポジトリは、JFrogスキャナーによって自動的にスキャンされ続けます。
*   Hugging Faceは、セキュリティパートナーシップの拡大に関心があり、スキャン情報提供に関心のある企業からの連絡（security@huggingface.co）を歓迎しています。
*   Hugging Faceは、セキュリティに関するドキュメント（https://huggingface.co/docs/hub/security）を継続的に更新し、コミュニティへの情報提供を強化します。

## Source URL
https://huggingface.co/blog/jfrog
