---
title: "Hugging Face partners with Wiz Research to Improve AI Security"
title_ja: "Hugging Face、Wiz Researchと提携AIセキュリティ強化へ"
source_url: "https://huggingface.co/blog/hugging-face-wiz-security-blog"
date: "2025-11-06"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
# Hugging FaceがWiz Researchと提携しAIセキュリティを強化

## 概要 (TL;DR)
Hugging FaceはWiz Researchとの提携を発表し、プラットフォームおよびAI/MLエコシステム全体のセキュリティ強化に乗り出しました。この提携により、Wizの脆弱性管理・クラウドセキュリティ態勢管理ソリューションを導入し、Wizの研究チームが特定したpickleファイル関連のサンドボックス脆弱性も既に修正済みです。Hugging Faceは、セキュリティリスクの高いpickleファイルの代替としてSafetensorsへの移行を強く推奨し、オープンソースコミュニティ全体にセキュリティ意識の向上と協力的な行動を呼びかけています。

## 重要ポイント
*   **Wiz Researchとの提携**: Hugging FaceはWiz Researchと提携し、プラットフォームのセキュリティを強化。Wizの脆弱性管理およびクラウドセキュリティ態勢管理（CSPM）ソリューションを導入しました。
*   **Pickleファイルの脆弱性修正**: Wizの研究チームが特定した、pickleファイルを利用したサンドボックス環境の脆弱性は、Hugging Faceによって既に解決済みです。
*   **Safetensorsの推進**: セキュリティリスクのあるpickleファイルの安全な代替として、Hugging FaceはSafetensorsを開発・推進し、プラットフォーム上で「ファーストクラスシチズン」として扱っています。
*   **オープンソースセキュリティへの貢献**: Microsoftとの共同開発によるPicklescan、Safetensorsの監査、堅牢なバグバウンティプログラム、マルウェア・シークレットスキャンなど、コミュニティとの協力を通じたセキュリティツールと実践を強化しています。
*   **ユーザーへのベストプラクティス**: 信頼できるソースからのモデル使用、本番環境でのpickleファイル不使用、Safetensorsの使用、MFA有効化、セキュアな開発ライフサイクルの確立など、AI/MLユーザー向けのセキュリティベストプラクティスを提示しています。
*   **コミュニティへの呼びかけ**: Safetensorsへの積極的な移行と、オープンソースライブラリにおけるセキュアなデフォルトの推進をコミュニティに求めています。

## 詳細レポート（What happened/背景/影響/関係者/データ）
### What happened
Hugging Faceは、クラウドセキュリティ企業Wiz Researchとの提携を発表しました。この提携の一環として、Hugging FaceはWizの脆弱性管理およびクラウドセキュリティ態勢管理（CSPM）ソリューションを自社プラットフォームに統合しました。Wizの研究チームは、Hugging Faceのサンドボックスコンピューティング環境におけるpickleファイルを利用した脆弱性を特定しましたが、Hugging Faceはこれらの問題を既に解決済みであることを公表しています。

### 背景
AI/ML技術の急速な進化は、新たな脅威ベクトルを日々生み出しており、セキュリティの重要性が増しています。特に、長年にわたりセキュリティリスクが指摘されてきたPythonのpickleファイル形式は、AI/MLコミュニティで依然として広く使用されており、Hugging FaceのようなオープンソースAIプラットフォームにとって大きな課題となっていました。Hugging Faceは、ユーザーがAI/MLシステムを安全に利用できる環境を提供するため、セキュリティ対策の強化とコミュニティへの啓発が急務であると認識していました。

### 影響
*   **Hugging Faceプラットフォームのセキュリティ向上**: Wizのソリューション導入と脆弱性修正により、プラットフォーム全体のセキュリティ体制が強化されます。
*   **AI/MLエコシステム全体の安全性向上**: Hugging Faceが提供するSafetensorsのような安全な代替手段の普及と、セキュリティベストプラクティスの推進により、AI/MLコミュニティ全体のセキュリティリスク低減に貢献します。
*   **ユーザーの信頼性向上**: セキュリティへの積極的な取り組みは、Hugging Faceプラットフォームを利用するユーザーの信頼を高めます。

### 関係者
*   **Hugging Face**: オープンソースAIプラットフォームの提供者。セキュリティ強化の主導者。
*   **Wiz Research**: クラウドセキュリティ企業。Hugging Faceのセキュリティ評価、脆弱性特定、ソリューション提供。
*   **Microsoft**: Picklescanの共同開発パートナー。
*   **Nicolas Patry**: Safetensorsの開発者。
*   **Trail of Bits, EleutherAI, Stability AI**: Safetensorsの監査に協力。
*   **オープンソースAIコミュニティ**: Hugging Faceプラットフォームのユーザー、モデル開発者、研究者。

### データ
記事には具体的な脆弱性件数や攻撃成功率などのデータは含まれていませんが、Wizの研究チームが「pickleファイルを利用してシステム内で任意のコードを実行することで、サンドボックスコンピューティング環境の欠陥を特定した」という事実が述べられています。

## 引用（Notable quotes）
SafetensorsのクリエイターであるNicolas Patry氏からの呼びかけ：
「Pro-actively start replacing your pickle files with Safetensors. As mentioned earlier, pickle contains inherent security flaws and may be unsupported in the near future. Keep opening issues/PRs upstream about security to your favorite libraries to push secure defaults as much as possible upstream.」
（能動的にpickleファイルをSafetensorsに置き換え始めてください。前述の通り、pickleには固有のセキュリティ上の欠陥があり、近い将来サポートされなくなる可能性があります。お気に入りのライブラリに対してセキュリティに関するissue/PRを積極的に開き、可能な限りセキュアなデフォルトを上流に推進してください。）

## リスクと課題
*   **Pickleファイルの固有の脆弱性**: pickleファイルは、任意のコード実行を許す可能性のある固有のセキュリティ上の欠陥を抱えています。
*   **コミュニティにおけるpickleファイルの広範な使用**: AI/MLコミュニティでは、その使いやすさから、リスクが認識されつつもpickleファイルが依然として広く利用されており、安全な代替形式への移行が課題となっています。
*   **セキュリティと利便性のバランス**: Hugging Faceは、pickleファイルの使用を完全に禁止せず、リスクを軽減しつつ使用を許可するという「中間的な選択肢」を取っており、エンジニアリングおよびセキュリティチームに大きな負担をかけています。
*   **オープンソースコミュニティの協力不足**: 上流のオープンソースコミュニティや大手テック・セキュリティ企業からの、pickle問題解決への貢献が少ないことが課題として挙げられています。

## 今後の見通し/アクション
*   **セキュリティリーダーシップの継続**: Hugging Faceは、AIコミュニティの保護とセキュリティにおけるリーダーシップを継続する意向です。
*   **Pickleファイルのサポート終了の検討**: pickleファイルのサポート終了も視野に入れていますが、コミュニティへの影響を考慮し、慎重に判断する方針です。
*   **セキュリティ出版物の継続**: AI/MLコミュニティが直面するセキュリティ問題に対処するためのセキュリティ出版物シリーズを継続します。
*   **ユーザーへの呼びかけ**:
    *   pickleファイルをSafetensorsに積極的に置き換えること。
    *   お気に入りのライブラリに対してセキュリティに関するissue/PRを積極的に提出し、セキュアなデフォルトを推進すること。
    *   セキュリティ脆弱性やバグを適切なチャネルを通じて責任を持って開示すること。

## Source URL
https://huggingface.co/blog/hugging-face-wiz-security-blog
