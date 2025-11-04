---
title: "How Hugging Face Scaled Secrets Management for AI Infrastructure"
title_ja: "Hugging Face、AI基盤の機密管理を強化・効率化"
source_url: "https://huggingface.co/blog/scaling-secrets-management"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、AIインフラの急速な成長に伴う秘密情報（シークレット）管理の課題を解決するため、Infisicalを導入しました。この移行により、マルチクラウド環境でのセキュリティ体制が大幅に強化され、エンジニアの作業効率が向上し、ローカル開発からCI/CD、Kubernetes環境まで一貫した安全な秘密情報管理が実現しました。

## 重要ポイント
*   **課題**: マルチクラウド環境への移行、チーム規模拡大、過去のセキュリティインシデントにより、秘密情報の拡散、複雑な権限管理、ローカル開発の非効率性、手動ローテーションの負担が深刻化していました。
*   **解決策**: Infisicalを導入し、Kubernetes Operatorによる自動同期、Oktaと統合されたきめ細かいRBAC、CLIによるローカル開発支援、GitHub ActionsとTerraformを介したCI/CD統合を実現しました。
*   **成果**: エンジニアの秘密情報設定にかかる時間が削減され、オンボーディングと開発サイクルが加速。自動監査とアクセス制御によりセキュリティが「シフトレフト」し、インシデント対応が迅速化。クラウド、Kubernetes、CI/CD全体で一貫した信頼性の高い秘密情報管理が確立されました。

## 詳細レポート
### What happened
Hugging Faceは、400万人以上のビルダーがモデルを展開するプラットフォームの急速な成長に伴い、機密性の高い設定データ（秘密情報）の管理方法を見直す必要に迫られました。HashiCorp Vaultなどのツールを評価した結果、開発者フレンドリーなワークフロー、マルチクラウド抽象化、堅牢なセキュリティ機能を理由にInfisicalを選択し、秘密情報管理システムをInfisicalへ移行しました。

### 背景
Hugging FaceのインフラがAWS単一環境からAzureやGCPを含むマルチクラウド環境へと進化する中で、よりアジャイルでセキュア、かつ一元化された秘密情報管理方法が求められました。主な課題は以下の通りです。
*   **秘密情報の拡散**: 環境間での管理の一貫性欠如による「シークレットスプロール」のリスク増大。
*   **複雑な権限管理**: チーム規模の拡大に伴い、組織のSSO（Okta）と統合された厳格なロールベースアクセス制御（RBAC）が必要。
*   **ローカル開発の課題**: 従来の.envファイルがセキュリティと開発者の生産性を損なっていた。
*   **手動ローテーションの負担**: 過去の資格情報漏洩セキュリティインシデント後、手動での秘密情報ローテーションが大きな負担となっていた。
また、Infrastructure-as-Codeの実践、プロジェクトごとの秘密情報管理、デプロイ時の自動化と手動制御のバランスも重要な要件でした。

### 影響
*   **Kubernetes統合**: Infisical Kubernetes OperatorがInfisical上の秘密情報の変更を継続的に監視し、対応するKubernetesオブジェクトに自動的に同期します。これにより、コンテナが常に最新の秘密情報で実行されるようになります。Hugging Faceは、高トラフィック（1分あたり1000万件以上のリクエスト）と多数のレプリカ環境での精密なデプロイ制御のため、Operatorによる自動コンテナリロードではなく、手動での再デプロイを優先しています。
*   **ローカル開発**: Infisical CLIが開発環境に秘密情報を直接注入することで、安全でないローカルの.envファイルが不要になり、ローカル設定が本番環境の標準に合わせられ、オンボーディングの摩擦が軽減されました。
*   **セキュリティとアクセス管理**: Oktaとの統合により、きめ細かいRBACシステムを確立。Oktaグループから権限が自動的にマッピングされ、開発者にはプロジェクトの管理者権限、フロントエンド/バックエンドチームには適切な読み取り/書き込みアクセスが付与されます。また、ML/AI研究者間での安全な資格情報共有機能も提供され、監査と秘密情報ローテーションが簡素化されました。
*   **CI/CDとインフラ統合**: GitHub Actions、OIDC認証、Terraformを介してInfisicalをデプロイパイプラインにシームレスに組み込みました。セルフホストランナーをセキュアな環境で運用することで、すべてのデプロイが本番レベルのセキュリティ基準に準拠するようになりました。
*   **技術的成果**:
    *   エンジニアは秘密情報の手動設定から解放され、セルフサービスワークフローによりオンボーディングと日々の開発サイクルが加速。
    *   自動監査ときめ細かいアクセス制御により、インシデント対応が迅速化し、セキュリティの「シフトレフト」アプローチを促進。
    *   クラウドプロバイダー、Kubernetesクラスター、CI/CDパイプライン全体で一貫した統合が実現し、秘密情報管理の不一致が解消され、インフラのセキュリティと信頼性が強化されました。

### 関係者
*   **Hugging Face**: AIインフラの秘密情報管理を改善するユーザー企業。
*   **Infisical**: Hugging Faceが導入した秘密情報管理ソリューションの提供元。
*   **Adrien Carreira**: Hugging Faceのインフラ責任者（Head of Infrastructure）。

### データ
*   Hugging Faceのプラットフォームには400万人以上のビルダーがモデルを展開。
*   高トラフィック環境では、1分あたり1000万件以上のリクエストを処理。

## 引用 (Notable quotes)
Adrien Carreira, Head of Infrastructure at Hugging Face:
"Infisical provided all the functionality and security settings we needed to boost our security posture and save engineering time. Whether you're working locally, running kubernetes clusters in production, or operating secrets within CI/CD pipelines, Infisical has a seamless prebuilt workflow."
（Infisicalは、当社のセキュリティ体制を強化し、エンジニアリング時間を節約するために必要なすべての機能とセキュリティ設定を提供してくれました。ローカルで作業する場合でも、本番環境でKubernetesクラスターを実行する場合でも、CI/CDパイプライン内で秘密情報を操作する場合でも、Infisicalにはシームレスな事前構築済みワークフローがあります。）

## リスクと課題
*   **導入前の課題**: 秘密情報の拡散、複雑な権限管理、ローカル開発での.envファイル利用によるセキュリティと生産性の問題、手動秘密情報ローテーションの負担が顕著でした。
*   **運用上の判断**: Infisical Kubernetes Operatorは秘密情報の変更時にコンテナを自動リロードする機能を提供しますが、Hugging Faceは高トラフィック環境（1分あたり1000万件以上のリクエスト）と多数のレプリカ環境におけるデプロイの精密な制御のため、手動での再デプロイを選択しています。

## 今後の見通し/アクション
Hugging FaceのInfisicalへの移行は、マルチクラウドプラットフォーム全体で秘密情報を管理するための技術主導かつエンジニアリング中心のアプローチが、いかに大きな利益をもたらすかを示しています。同様の課題に直面しているチームにとって、Infisicalの利用はセキュリティを強化しつつ効率を高める実用的な方法です。セキュリティを確保するパスが最も簡単なパスとなることで、チームは秘密情報管理の懸念から解放され、革新的な製品開発に集中できるようになります。

## Source URL
https://huggingface.co/blog/scaling-secrets-management
