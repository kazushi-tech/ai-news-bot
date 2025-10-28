---
title: "Reasoning's Razor: Reasoning Improves Accuracy but Can Hurt Recall at Critical Operating Points in Safety and Hallucination Detection"
date: 2025-10-28
url: https://arxiv.org/abs/2510.21049
domain: arxiv.org
lang: en
tags: ["Paper"]
---
# Reasoning's Razor: Reasoning Improves Accuracy but Can Hurt Recall at Critical Operating Points in Safety and Hallucination Detection

## 🔗 引用元
- **URL**: https://arxiv.org/abs/2510.21049
- **サイト**: arXiv.org
- **著者**: [Submitted on 23 Oct 2025]
- **言語**: English
## 🧭 概要
View PDF
    HTML (experimental)
            Abstract:Reasoning has become a central paradigm for large language models (LLMs), consistently boosting accuracy across diverse benchmarks. Yet its suitability for precision-sensitive tasks remains unclear. We present the first systematic study of reasoning for classification tasks under strict low false positive rate (FPR) regimes. Our analysis covers two tasks--safety detection and hallucination detection--evaluated in both fine-tuned and zero-shot settings, using standard LLMs and Large Reasoning Models (LRMs).

## 📝 詳細レポート
[View PDF](https://arxiv.org/pdf/2510.21049) [HTML (experimental)](https://arxiv.org/html/2510.21049v1)

> Abstract:Reasoning has become a central paradigm for large language models (LLMs), consistently boosting accuracy across diverse benchmarks. Yet its suitability for precision-sensitive tasks remains unclear. We present the first systematic study of reasoning for classification tasks under strict low false positive rate (FPR) regimes. Our analysis covers two tasks--safety detection and hallucination detection--evaluated in both fine-tuned and zero-shot settings, using standard LLMs and Large Reasoning Models (LRMs). Our results reveal a clear trade-off: Think On (reasoning-augmented) generation improves overall accuracy, but underperforms at the low-FPR thresholds essential for practical use. In contrast, Think Off (no reasoning during inference) dominates in these precision-sensitive regimes, with Think On surpassing only when higher FPRs are acceptable. In addition, we find token-based scoring substantially outperforms self-verbalized confidence for precision-sensitive deployments. Finally, a simple ensemble of the two modes recovers the strengths of each. Taken together, our findings position reasoning as a double-edged tool: beneficial for average accuracy, but often ill-suited for applications requiring strict precision.

Submission history
------------------

From: Hamid Kazemi \[[view email](https://arxiv.org/show-email/b8fe5d77/2510.21049)\]  
**\[v1\]** Thu, 23 Oct 2025 23:23:36 UTC (16,157 KB)
