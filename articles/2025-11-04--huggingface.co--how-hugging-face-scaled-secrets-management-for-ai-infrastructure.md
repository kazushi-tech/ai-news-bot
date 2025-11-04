---
title: "How Hugging Face Scaled Secrets Management for AI Infrastructure"
title_ja: ""
source_url: "https://huggingface.co/blog/scaling-secrets-management"
date: "2025-11-04"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging Faceは、AIインフラの急速な成長とマルチクラウド化に伴うシークレット管理の課題を解決するため、Infisicalを導入しました。これにより、シークレット管理の一元化、セキュリティ体制の強化、開発者の生産性向上を達成し、ローカル開発からKubernetes、CI/CDまでシームレスでセキュアなワークフローを確立しました。

## 重要ポイント
*   **シークレット管理の一元化と標準化**: 複数のクラウド環境にまたがるシークレットの「スプロール」を解消し、Infisicalで一元管理。
*   **Kubernetesとの強力な連携**: Infisical Kubernetes Operatorにより、シークレットの自動同期と更新が可能になり、セキュリティと運用効率が向上。
*   **セキュリティとアクセス管理の強化**: OktaとのSSO連携によるきめ細やかなRBACを確立し、監査とシークレットローテーションを簡素化。
*   **開発者体験の向上**: ローカル開発での`.env`ファイル依存を排除し、CLIを通じてセキュアなシークレット注入を実現。
*   **CI/CDパイプラインへの統合**: GitHub ActionsとOIDC認証、Terraformを組み合わせ、セキュアなデプロイメントワークフローを構築。
*   **エンジニアリング時間の節約**: 手動設定の削減、オンボーディングの加速、インシデント対応の迅速化により、開発者の生産性が大幅に向上。

## 詳細レポート
### What happened
Hugging Faceは、AIインフラのシークレット管理における課題を解決するため、HashiCorp Vaultなどの代替案を検討した後、Infisicalを導入し、既存のシステムからの移行を完了しました。

### 背景
*   **インフラの進化**: AWS単一環境からAzure、GCPを含むマルチクラウド環境への移行。
*   **シークレットスプロール**: 環境間での管理の一貫性欠如によるシークレットの分散とリスクの増大。
*   **複雑な権限管理**: チーム規模拡大に伴う、SSO（Okta）と連携したきめ細やかなロールベースアクセス制御（RBAC）の必要性。
*   **ローカル開発の課題**: `.env`ファイル使用によるセキュリティリスクと開発者生産性の低下。
*   **手動ローテーションの負担**: 過去のセキュリティインシデントで露呈した、手動でのシークレットローテーションの非効率性。
*   **要件**: Infrastructure-as-Codeへの準拠、プロジェクトごとのシークレット管理、自動化と手動制御のバランス。

### 影響
*   **セキュリティの向上**: シークレットの一元管理、RBACの強化、自動監査、セキュアなCI/CD統合により、全体的なセキュリティ体制が大幅に改善。
*   **開発効率の向上**: エンジニアはシークレットの手動設定から解放され、オンボーディングが加速し、日々の開発サイクルが効率化。
*   **運用の一貫性**: マルチクラウド、Kubernetes、CI/CDパイプライン全体でシークレット管理が標準化され、インフラの信頼性が向上。
*   **インシデント対応の迅速化**: 自動監査と詳細なアクセス制御により、セキュリティインシデントへの対応能力が強化。

### 関係者
*   **Hugging Face**: AIモデルプラットフォームを運営する企業。エンジニアリングチームがInfisicalの導入と運用を担当。
*   **Adrien Carreira**: Hugging Faceのインフラ責任者。
*   **Infisical**: シークレット管理ソリューションを提供する企業。

### データ
*   Hugging Face Hubには400万人以上のビルダーがモデルをデプロイ。
*   Kubernetes環境では1分あたり1000万件以上のリクエストを処理する高トラフィック環境。

## 引用（Notable quotes）
Adrien Carreira (Head of Infrastructure at Hugging Face)は次のように述べています。
"Infisical provided all the functionality and security settings we needed to boost our security posture and save engineering time. Whether you're working locally, running kubernetes clusters in production, or operating secrets within CI/CD pipelines, Infisical has a seamless prebuilt workflow."
（Infisicalは、セキュリティ体制を強化し、エンジニアリング時間を節約するために必要なすべての機能とセキュリティ設定を提供してくれました。ローカルでの作業、本番環境でのKubernetesクラスターの実行、CI/CDパイプライン内でのシークレット操作のいずれにおいても、Infisicalにはシームレスな組み込みワークフローがあります。）

## リスクと課題
*   **導入前の課題**: シークレットスプロール、複雑な権限管理、ローカル開発の非効率性、手動シークレットローテーションの負担、過去のセキュリティインシデント。
*   **導入後の運用上の考慮事項**: Infisical Kubernetes Operatorはシークレット変更時に自動でコンテナをリロードする機能を持つが、Hugging Faceは1分あたり1000万件以上のリクエストを処理する高トラフィック環境でのデプロイの精密な制御のため、手動での再デプロイを選択しています。

## 今後の見通し/アクション
*   Infisicalの導入は、技術主導のエンジニアリング中心のアプローチがマルチクラウド環境でのシークレット管理に大きな利益をもたらすことを実証しました。
*   セキュリティを最も簡単なパスにすることで、チームはシークレット管理の心配から解放され、イノベーションに集中できるようになります。
*   同様のアプローチを検討するチーム向けに、セキュアなGitOpsワークフローやKubernetesシークレット管理に関するリソースが提供されています。

## Source URL
https://huggingface.co/blog/scaling-secrets-management
