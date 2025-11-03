---
title: "Hugging Face partners with Wiz Research to Improve AI Security"
title_ja: "Hugging Face、Wizと提携 AIセキュリティを共同強化"
source_url: "https://huggingface.co/blog/hugging-face-wiz-security-blog"
date: "2025-11-03"
model: "gemini-2.5-flash"
host: "huggingface.co"
tags: [ai-news]
---
## 概要 (TL;DR)
Hugging FaceはWiz Researchと提携し、AI/MLエコシステム全体のセキュリティ強化を発表しました。特に、長年セキュリティリスクが指摘されてきた「pickleファイル」の脆弱性に対処し、Wizが発見したサンドボックス環境の欠陥を修正済みです。Hugging FaceはWizのセキュリティツールを導入し、Safetensorsへの移行を推奨するなど、コミュニティと協力してAIセキュリティの向上に努めています。

## 重要ポイント
*   **Wiz Researchとの提携**: Hugging FaceはWiz Researchと提携し、プラットフォーム全体のセキュリティを強化。WizのVulnerability ManagementとCloud Security Posture Management (CSPM)を導入しました。
*   **Pickleファイルの脆弱性**: Wizの研究チームは、pickleファイルを利用したサンドボックス環境の脆弱性を特定。Hugging Faceはこれらの問題を全て解決済みであり、脅威検出とインシデント対応プロセスを継続しています。
*   **Safetensorsへの移行推奨**: Hugging Faceは、pickleファイルの安全な代替としてSafetensorsを推奨。コミュニティに対し、積極的にSafetensorsへの移行を呼びかけています。
*   **オープンソースセキュリティへの貢献**: Microsoftと共同開発したPicklescanや、EleutherAI、Stability AI、Trail of Bitsと協力して監査されたSafetensorsなど、コミュニティと連携してセキュリティツールやベストプラクティスを提供しています。
*   **セキュリティベストプラクティス**: 信頼できるソースからのモデル利用、MFAの有効化、Secure Development Lifecycleの確立など、AI/MLユーザー向けのセキュリティガイドラインを提示しています。

## 詳細レポート
### What happened
Hugging Faceは、クラウドセキュリティ企業Wiz Researchとの提携を発表しました。この提携の一環として、Wizの研究チームはHugging Faceのサンドボックス化されたコンピューティング環境におけるセキュリティ上の欠陥（特にpickleファイルに起因するもの）を特定しました。Hugging Faceはこれらの脆弱性を全て解決し、プラットフォームのセキュリティを強化しています。具体的には、WizのVulnerability ManagementとCloud Security Posture Management (CSPM)を導入し、脆弱性の継続的な管理とクラウド環境のセキュリティ設定監視を行っています。これにより、ストレージからコンピューティング、ネットワークまで、脆弱性に対する包括的な可視性を得て、自動修復機能も構築しました。

### 背景
AI/MLの急速な進化は、新たな脅威ベクトルを日々生み出しています。特に、Pythonオブジェクトのシリアライズ形式である「pickleファイル」は、任意コード実行の可能性から長年セキュリティリスクが指摘されてきました。しかし、その利便性からAI/MLコミュニティでは広く利用されており、Hugging FaceはオープンソースAIプラットフォームとして、このリスクとコミュニティの利便性の間でバランスを取る必要がありました。

### 影響
*   Hugging Faceプラットフォームのセキュリティが大幅に向上し、ユーザーはより安全にAI/MLモデルを共有・利用できるようになります。
*   Wizのツール導入により、セキュリティ脆弱性の検出から修復までのプロセスが効率化・自動化されます。
*   Safetensorsの普及が促進され、AIエコシステム全体のセキュリティレベル向上に貢献することが期待されます。
*   Hugging Faceは、pickleファイルの利用を完全に禁止するのではなく、リスクを軽減しつつ利用を許容する「中間的な解決策」を選択しており、これによりエンジニアリングおよびセキュリティチームに継続的な負担が生じています。

### 関係者
*   **Hugging Face**: AI/MLプラットフォームの提供者、セキュリティ強化の主体。
*   **Wiz Research**: クラウドセキュリティ企業、Hugging Faceとの提携、脆弱性発見、セキュリティツール提供。
*   **Microsoft**: Picklescan開発におけるパートナー。
*   **Nicolas Patry**: Safetensorsの開発者。
*   **EleutherAI & Stability AI**: Safetensorsのセキュリティ監査における協力者。
*   **Trail of Bits**: Safetensorsのセキュリティ監査を実施。

### データ
記事中で具体的な数値データは示されていませんが、Hugging FaceがWizのツールを導入し、複数のKubernetesクラスター、複数リージョン、複数クラウドプロバイダーにわたるリソースの脆弱性を一元的に管理していることが言及されています。

## 引用（Notable quotes）
*   「We are pleased to announce that we are partnering with Wiz with the goal of improving security across our platform and the AI/ML ecosystem at large.」
*   「As you read this blog and the Wiz security research paper, it is important to remember that we have resolved all issues related to the exploit and continue to remain diligent in our Threat Detection and Incident Response process.」
*   「Pro-actively start replacing your pickle files with Safetensors. As mentioned earlier, pickle contains inherent security flaws and may be unsupported in the near future.」

## リスクと課題
*   **Pickleファイルの固有のセキュリティリスク**: 任意コード実行の可能性があり、AI/MLコミュニティで広く利用されていることが大きなリスクです。
*   **コミュニティのpickleファイルへの依存**: 利便性から多くのユーザーがpickleファイルを使用しており、Hugging Faceは完全な禁止ではなく、リスクを軽減しつつ利用を許容する「中間的な解決策」を維持する負担を負っています。
*   **上流コミュニティの貢献不足**: pickleファイル問題に対するオープンソースコミュニティや大手テック企業の貢献が不足しており、Hugging Faceが対策の定義と実装に多大な投資をしています。
*   **新たな脅威ベクトルの出現**: AI産業の急速な変化に伴い、新たな攻撃手法やエクスプロイトが常に特定されており、継続的なセキュリティ対策が求められます。

## 今後の見通し/アクション
*   **Hugging Faceの継続的なセキュリティ強化**: Wizとの連携を継続し、プラットフォームのセキュリティをさらに強化。セキュリティに関する出版物を定期的に発表し、AI/MLコミュニティ全体のリスクと緩和策を共有します。
*   **Pickleファイルのサポート見直し**: pickleファイル関連のリスクを監視・対処し続け、将来的にはサポート終了も視野に入れています。
*   **Safetensorsの普及推進**: Safetensorsをプラットフォームの「ファーストクラスシチズン」として推進し、コミュニティメンバーに安全な代替手段を提供します。
*   **コミュニティへの呼びかけ**:
    *   ユーザーに対し、pickleファイルをSafetensorsに積極的に置き換えるよう促します。
    *   お気に入りのライブラリに対してセキュリティに関するissue/PRを積極的に開き、安全なデフォルト設定を推進するよう求めます。
    *   セキュリティ脆弱性を責任ある方法で開示するよう呼びかけます。

## Source URL
https://huggingface.co/blog/hugging-face-wiz-security-blog
