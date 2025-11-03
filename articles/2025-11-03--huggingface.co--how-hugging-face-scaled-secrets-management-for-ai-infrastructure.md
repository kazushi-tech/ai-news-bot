---
title: "How Hugging Face Scaled Secrets Management for AI Infrastructure"
title_ja: "Hugging Face、AI基盤のシークレット管理を効率化・大規模化"
source_url: "https://huggingface.co/blog/scaling-secrets-management"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、AIインフラの急速な成長とマルチクラウド化に伴うシークレット管理の課題（シークレットスプロール、複雑な権限管理、ローカル開発の非効率性、手動ローテーション）を解決するため、Infisicalを導入しました。この移行により、セキュリティ体制が大幅に強化され、開発者の生産性が向上し、シークレット管理の一貫性が確立されました。

## 重要ポイント
*   **シークレット管理の一元化とセキュリティ強化**: マルチクラウド環境でのシークレットスプロールを解消し、Oktaと連携したきめ細やかなRBAC（ロールベースアクセス制御）によりアクセス管理を強化しました。
*   **開発効率の向上**: Infisical CLIとKubernetes Operatorの導入により、ローカル開発およびKubernetes環境でのシークレット利用を効率化・安全化し、エンジニアの作業時間を削減しました。
*   **CI/CDパイプラインとの統合**: GitHub Actions、OIDC認証、Terraformを介してCI/CDパイプラインにシームレスに統合し、デプロイメント全体のセキュリティを向上させました。
*   **一貫性と信頼性**: クラウドプロバイダー、Kubernetesクラスター、CI/CDパイプライン全体でシークレット管理の一貫性を確立し、インフラのセキュリティと信頼性を強化しました。

## 詳細レポート
### What happened
Hugging Faceは、AIインフラの急速な成長とAWS単一からAzure、GCPを含むマルチクラウド環境への移行に伴い、シークレット（機密性の高い設定データ）の管理に課題を抱えていました。これらの課題を解決するため、HashiCorp Vaultなどの代替案を検討した結果、開発者フレンドリーでマルチクラウド対応のInfisicalをシークレット管理ソリューションとして採用し、既存システムからの移行を実施しました。

### 背景
*   **インフラの進化**: AWS単一からAzure、GCPを含むマルチクラウド環境への移行により、シークレット管理の複雑性が増大。
*   **主要な課題**:
    *   環境間での一貫性のない管理による「シークレットスプロール」のリスク増大。
    *   チーム規模拡大に伴う複雑な権限管理（組織のSSO/OktaとのRBAC統合の必要性）。
    *   従来の`.env`ファイル使用によるローカル開発のセキュリティと生産性の低下。
    *   過去のセキュリティインシデント（資格情報漏洩）を契機とした、手動シークレットローテーションの負担。
*   **要件**: インフラストラクチャ・アズ・コード (IaC) への準拠、プロジェクトごとのシークレット管理、自動化と手動制御のバランス。
*   **Infisical選択理由**: 開発者フレンドリーなワークフロー、マルチクラウド抽象化、堅牢なセキュリティ機能が評価されました。

### 影響
*   **セキュリティ強化**: Okta連携によるきめ細やかなRBAC、自動監査機能、シークレットローテーションの簡素化、ML/AI研究者間の安全なシークレット共有を実現。
*   **開発効率向上**: エンジニアが手動で環境シークレットを設定する時間が不要になり、セルフサービスワークフローによってオンボーディングと日々の開発サイクルが加速。ローカル開発での`.env`ファイル利用を廃止し、セキュリティと生産性を向上。
*   **Kubernetes連携**: Infisical Kubernetes Operatorにより、Infisicalでのシークレット変更がKubernetesオブジェクトに自動同期され、必要に応じてDeploymentの自動リロードも可能に（Hugging Faceは高トラフィック環境のため、デプロイの精密な制御を優先し手動デプロイを選択）。
*   **CI/CD統合**: GitHub Actions、OIDC認証、Terraformを介してCI/CDパイプラインにシームレスに統合され、セルフホスト型ランナーを使用することで、デプロイメント全体のセキュリティが強化されました。
*   **一貫性**: クラウドプロバイダー、Kubernetesクラスター、CI/CDパイプライン全体でシークレット管理の一貫性が確立され、インフラのセキュリティと信頼性が向上しました。

### 関係者
*   **Hugging Face**: エンジニアリングチーム、ML/AI研究者（Infisicalの導入・利用者）。
*   **Infisical**: シークレット管理ソリューションのプロバイダー。

### データ
記事中に具体的な数値データは含まれていません。

## 引用 (Notable quotes)
Adrien Carreira, Head of Infrastructure at Hugging Face:
"Infisical provided all the functionality and security settings we needed to boost our security posture and save engineering time. Whether you're working locally, running kubernetes clusters in production, or operating secrets within CI/CD pipelines, Infisical has a seamless prebuilt workflow."

## リスクと課題
*   **導入前の課題**: シークレットスプロール、複雑な権限管理、ローカル開発におけるセキュリティと生産性の低下、手動シークレットローテーションの負担、過去のセキュリティインシデントによる資格情報漏洩。
*   **導入後の運用上の選択**: Infisical Kubernetes Operatorはシークレット変更時に自動でコンテナをリロードする機能を提供しますが、Hugging Faceは1分あたり1,000万件以上のリクエストを処理する高トラフィック環境でのデプロイ制御のため、手動でのデプロイを選択しています。これは課題というより、特定の運用要件に基づく戦略的な選択です。

## 今後の見通し/アクション
Hugging FaceはInfisicalの導入により、マルチクラウド環境でのシークレット管理において、セキュリティ強化と開発効率向上を両立させることに成功しました。記事は、同様の課題を抱える他のチームに対し、Infisicalのようなソリューションの採用を推奨しています。「安全なパスを最も簡単なパスにする」ことで、チームがシークレット管理の心配から解放され、イノベーションに集中できる環境を構築できると提言しています。

## Source URL
https://huggingface.co/blog/scaling-secrets-management
