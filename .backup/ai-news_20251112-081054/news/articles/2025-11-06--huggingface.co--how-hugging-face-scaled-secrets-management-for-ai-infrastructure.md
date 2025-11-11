---
title: How Hugging Face Scaled Secrets Management for AI Infrastructure
title_ja: ''
source_url: 'https://huggingface.co/blog/scaling-secrets-management'
date: '2025-11-06'
model: gemini-2.5-flash
host: huggingface.co
tags:
  - ai-news
tldr: '## 概要 (TL;DR)'
key_points:
  - >-
    - Hugging
    Faceは、急成長するAIインフラにおけるシークレット管理の課題（シークレットスプロール、複雑な権限管理、ローカル開発の非効率性、手動ローテーションの負担）を解決するため、Infisicalを導入しました。この移行により、マ
  - '- ## 重要ポイント'
  - >-
    - *   **一元化と自動化**: Infisicalを導入し、マルチクラウド環境（AWS, Azure,
    GCP）におけるシークレット管理を一元化・自動化しました。
  - >-
    - *   **Kubernetes統合**: Infisical Kubernetes
    Operatorにより、シークレットの変更がKubernetesオブジェクトに自動同期され、必要に応じてアプリケーションの再デプロイが可能です（Huggi
  - >-
    - *   **セキュリティ強化**:
    Oktaとの連携によるきめ細かいロールベースアクセス制御（RBAC）、自動監査、安全なシークレット共有、CI/CDパイプラインへの統合により、セキュリティ体制を大幅に強化しました。
---
## 概要 (TL;DR)
Hugging Faceは、急成長するAIインフラにおけるシークレット管理の課題（シークレットスプロール、複雑な権限管理、ローカル開発の非効率性、手動ローテーションの負担）を解決するため、Infisicalを導入しました。この移行により、マルチクラウド環境でのKubernetes統合、CI/CD連携、OktaとのRBAC統合、ローカル開発の改善が実現され、セキュリティの大幅な強化とエンジニアリング効率の向上が達成されました。

## 重要ポイント
*   **一元化と自動化**: Infisicalを導入し、マルチクラウド環境（AWS, Azure, GCP）におけるシークレット管理を一元化・自動化しました。
*   **Kubernetes統合**: Infisical Kubernetes Operatorにより、シークレットの変更がKubernetesオブジェクトに自動同期され、必要に応じてアプリケーションの再デプロイが可能です（Hugging Faceは高トラフィック環境での制御のため手動再デプロイを優先）。
*   **セキュリティ強化**: Oktaとの連携によるきめ細かいロールベースアクセス制御（RBAC）、自動監査、安全なシークレット共有、CI/CDパイプラインへの統合により、セキュリティ体制を大幅に強化しました。
*   **開発者体験の向上**: Infisical CLIによりローカル開発での非安全な.envファイルが不要となり、オンボーディングの摩擦が軽減され、開発者の生産性が向上しました。
*   **エンジニアリング効率**: シークレットの手動設定が不要になり、セルフサービスワークフローが確立されたことで、エンジニアの作業時間が削減され、インシデント対応能力が向上しました。

## 詳細レポート
### What happened
Hugging Faceは、AIインフラの急速な成長とマルチクラウド化に伴うシークレット管理の課題に直面し、HashiCorp Vaultなどの代替案を評価した結果、Infisicalを導入しました。既存のKubernetes、Terraform、Okta、GitHub ActionsなどのシステムとInfisicalを統合することで、シークレット管理のセキュリティと効率を抜本的に改善しました。

### 背景
*   **課題**:
    *   **シークレットスプロール**: AWSからAzure、GCPを含むマルチクラウド環境への移行に伴い、環境間でのシークレット管理の不整合とリスクが増大。
    *   **複雑な権限管理**: チーム規模の拡大に伴い、きめ細かいロールベースアクセス制御（RBAC）と組織のSSO（Okta）との統合が必要。
    *   **ローカル開発の非効率・非安全性**: 従来の.envファイルの使用がセキュリティリスクと開発者の生産性低下を招いていた。
    *   **手動シークレットローテーション**: 過去のセキュリティインシデントで露呈した、手動でのシークレットローテーションの負担。
*   **要件**: Infrastructure-as-codeの実践、プロジェクトごとのシークレット管理、デプロイ時の自動化と手動制御のバランス。
*   **Infisical選定理由**: 開発者フレンドリーなワークフロー、マルチクラウド抽象化、堅牢なセキュリティ機能。

### 影響
*   **セキュリティ強化**: Okta連携によるRBAC、自動監査、安全なシークレット共有機能、CI/CDパイプラインへの統合により、セキュリティ体制が大幅に向上。
*   **エンジニアリング効率向上**: シークレットの手動設定が不要になり、セルフサービスワークフローが確立。オンボーディングが加速し、日々の開発サイクルが効率化。
*   **一貫性**: クラウドプロバイダー、Kubernetesクラスター、CI/CDパイプライン全体でのシークレット管理の一貫性が確保され、インフラのセキュリティと信頼性が強化。
*   **Kubernetes統合**: Infisical Kubernetes OperatorがInfisicalでのシークレット変更を自動的に検知し、対応するKubernetesシークレットを更新。必要に応じてPodの自動リロードも可能。ただし、Hugging Faceは1分あたり1000万以上のリクエストを処理する高トラフィック環境での精密な制御のため、手動での再デプロイを選択。
*   **ローカル開発**: Infisical CLIにより、開発環境にシークレットを直接注入できるようになり、非安全な.envファイルが不要に。

### 関係者
*   **Hugging Face**: AIプラットフォームを運営する企業。特にエンジニアリングチームとインフラ責任者のAdrien Carreira氏が主導。
*   **Infisical**: シークレット管理ソリューションを提供する企業。

### データ
*   Hugging Face Hubには400万人以上のビルダーがモデルをデプロイ。
*   Kubernetes環境では1分あたり1000万以上のリクエストを処理。
*   **Infisical Kubernetes Operatorによるシークレット同期の例**:
    ```yaml
    apiVersion: infisical.com/v1alpha1
    kind: InfisicalSecret
    metadata:
      name: my-app-secret
      namespace: production
    spec:
      infisicalSecretId: "123e4567-e89b-12d3-a456-426614174000"
      targetSecretName: "my-app-k8s-secret"
    ```

## 引用（Notable quotes）
Adrien Carreira (Head of Infrastructure at Hugging Face):
"Infisical provided all the functionality and security settings we needed to boost our security posture and save engineering time. Whether you're working locally, running kubernetes clusters in production, or operating secrets within CI/CD pipelines, Infisical has a seamless prebuilt workflow."
（Infisicalは、セキュリティ体制を強化し、エンジニアリング時間を節約するために必要なすべての機能とセキュリティ設定を提供してくれました。ローカルで作業する場合でも、本番環境でKubernetesクラスターを運用する場合でも、CI/CDパイプライン内でシークレットを操作する場合でも、Infisicalにはシームレスな事前構築済みワークフローがあります。）

## リスクと課題
*   **導入前の課題**: シークレットスプロール、複雑な権限管理、ローカル開発の非効率性・非安全性、手動シークレットローテーションの負担といった、AIインフラの急速な成長に伴う一般的なシークレット管理の課題に直面していました。
*   **導入後の運用上の考慮事項**: Infisical Kubernetes Operatorはシークレット変更時にPodの自動リロードをトリガーできますが、Hugging Faceは1分あたり1000万以上のリクエストを処理する高トラフィック環境での精密な制御のため、手動での再デプロイを選択しています。これは、大規模システムにおける自動化と制御のバランスに関する重要な考慮事項を示しています。

## 今後の見通し/アクション
Hugging Faceの事例は、技術主導のエンジニアリング中心のアプローチが、マルチクラウド環境でのシークレット管理において大きなメリットをもたらすことを示しています。Infisicalのようなツールを活用することで、セキュリティを強化しつつ効率的に作業を進め、開発チームがシークレット管理の心配なくイノベーションに集中できる環境を構築することが推奨されます。同様の課題を持つチームは、Infisicalの導入や、記事で紹介されている関連リソース（Secure GitOps Workflows、Kubernetes Secrets Management Guideなど）を参考にすることが推奨されます。

## Source URL
https://huggingface.co/blog/scaling-secrets-management
