---
title: '4M Models Scanned: Protect AI + Hugging Face 6 Months In'
date: '2025-11-03'
model: gemini-2.5-flash
source_url: 'https://huggingface.co/blog/pai-6-month'
host: huggingface.co
tldr: >-
  Hugging FaceとProtect
  AIは2024年10月の提携から6ヶ月で、機械学習モデルのセキュリティを大幅に強化しました。2025年4月1日までに447万件のモデルをスキャンし、35万2千件の安全でない問題を特定し、4つの新しい脅威検知モジュールを展開しています。
key_points:
  - >-
    Hugging FaceとProtect AIは2024年10月に提携し、Protect AIのGuardianスキャン技術を通じてHugging
    Face Hubにおける機械学習モデルのセキュリティを強化しています。
  - >-
    2025年4月1日までに、Protect AIはHugging Face
    Hubで447万件のユニークなモデルバージョンをスキャンし、51,700件のモデルで合計352,000件の安全でない/疑わしい問題を特定しました。
  - >-
    パートナーシップ開始以来、アーカイブスリップ、Joblibモデルの不審なコード実行、TensorFlow
    SavedModelのバックドア、Llamafileの悪意あるコード実行に対応する4つの新しい脅威検知モジュールが導入されました。
  - >-
    Protect
    AIはAI/MLセキュリティにゼロトラストのアプローチを適用し、社内脅威研究チームと17,000人以上のセキュリティ研究者が参加するhuntrバグバウンティプログラムを活用して、モデルの脆弱性検出能力を進化させています。
  - >-
    ライブラリ依存型攻撃、難読化された攻撃、KerasのCVE-2025-1550のようなフレームワーク拡張性コンポーネントの脆弱性、TensorFlowを含むアーキテクチャ上のバックドア、JoblibやLlamafileなどのモデル形式に対する脅威検出が包括的に強化されました。
title_ja: ''
tags:
  - ai-news
source:
  url: 'https://huggingface.co/blog/pai-6-month'
summarized_at: '2025-11-05T10:57:09.283Z'
---
# 4M Models Scanned: Protect AI + Hugging Face 6 Months In

## TL;DR
- Hugging FaceとProtect AIは提携から6ヶ月で、MLモデルセキュリティを大幅に強化しました。
- Protect AIのGuardianは4つの新しい脅威検出モジュールを導入し、検出能力を飛躍的に向上させました。
- 447万以上のモデルバージョンをスキャンし、51,700モデルで合計352,000件の安全でない/疑わしい問題を特定しました。
- ゼロトラストアプローチとhuntrコミュニティの協力により、進化するAI/MLセキュリティ脅威に対応しています。
- ライブラリ依存攻撃、難読化されたペイロード、フレームワーク拡張性脆弱性、複合的な攻撃チェーンへの検出が強化されました。

## 重要ポイント
- 2024年10月にHugging FaceとProtect AIが提携し、Hugging Face HubのオープンソースMLモデルの安全性をGuardianのスキャン技術で向上させました。
- GuardianはPAIT-ARV-100（アーカイブスリップ）、PAIT-JOBLIB-101（Joblib疑わしいコード実行）、PAIT-TF-200（TensorFlowバックドア）、PAIT-LMAFL-300（Llamafile悪意のあるコード実行）を含む4つの新しい脅威検出モジュールをローンチし、検出能力を拡張しました。
- 2025年4月1日までに447万のモデルバージョンがスキャンされ、51,700モデルにおいて352,000件の危険または疑わしい問題が検出されました。
- Protect AIはAI/MLセキュリティにゼロトラストアプローチを採用し、難読化されたペイロードや一見無害に見えるコード実行リスクも検出対象としています。
- huntrコミュニティ（17,000人以上のセキュリティ研究者）からの200件以上の脆弱性レポートがGuardianの検出機能に組み込まれ、脅威研究と検出能力が継続的に強化されています。

## 概要
Hugging FaceとProtect AIは、2024年10月の提携以降、MLモデルのセキュリティを大幅に強化してきました。Protect AIのGuardianスキャン技術は、4つの新しい検出モジュールを導入し、447万以上のモデルバージョンをスキャンして35万件以上の潜在的な脆弱性を特定。ゼロトラストアプローチと大規模なバグバウンティプログラム「huntr」の協力を通じて、ライブラリ依存攻撃や難読化されたペイロードなど、進化する脅威への検出能力を向上させ、Hugging Faceユーザーに包括的なセキュリティ情報を提供しています。
