---
title: "Can Confidence Estimates Decide When Chain-of-Thought Is Necessary for LLMs?"
date: 2025-10-28
url: https://arxiv.org/abs/2510.21007
domain: arxiv.org
lang: en
tags: ["Paper"]
---
# Can Confidence Estimates Decide When Chain-of-Thought Is Necessary for LLMs?

## 🔗 引用元
- **URL**: https://arxiv.org/abs/2510.21007
- **サイト**: arXiv.org
- **著者**: [Submitted on 23 Oct 2025 (v1), last revised 27 Oct 2025 (this version, v2)]
- **言語**: English
## 🧭 概要
View PDF
    HTML (experimental)
            Abstract:Chain-of-thought (CoT) prompting has emerged as a common technique for enhancing the reasoning abilities of large language models (LLMs). While extended reasoning can boost accuracy on complex tasks, it is often unnecessary and substantially increases token usage, limiting the practicality of reasoning models in many scenarios. Recent models, such as GPT-OSS and Qwen3, expose controls that enable users to adjust the length of CoT or determine whether it is used at all. Yet, it remains unclear when CoT should be used: on some tasks it improves performance, while on others it provides little benefit or even harms performance.

## 📝 詳細レポート
[View PDF](https://arxiv.org/pdf/2510.21007) [HTML (experimental)](https://arxiv.org/html/2510.21007v2)

> Abstract:Chain-of-thought (CoT) prompting has emerged as a common technique for enhancing the reasoning abilities of large language models (LLMs). While extended reasoning can boost accuracy on complex tasks, it is often unnecessary and substantially increases token usage, limiting the practicality of reasoning models in many scenarios. Recent models, such as GPT-OSS and Qwen3, expose controls that enable users to adjust the length of CoT or determine whether it is used at all. Yet, it remains unclear when CoT should be used: on some tasks it improves performance, while on others it provides little benefit or even harms performance. We address this challenge with confidence-gated CoT, where a model invokes reasoning only when confidence in its direct answer is low. To this end, we present the first systematic study of training-free confidence estimation methods for CoT gating. Specifically, we evaluate four training-free confidence estimation methods and compare them to a random baseline and an oracle that always knows when CoT is needed. Through extensive experiments, we show that existing training-free confidence measures can reduce redundant CoT and outperform randomly invoked CoT. However, the utility of individual confidence measures is inconsistent, varying with both the dataset and the model, underscoring the difficulty of deploying confidence-gated CoT in practice. By analysing both strengths and failure modes, our study highlights the potential and limitations of current methods and paves the way toward more reliable adaptive gating of CoT.

Submission history
------------------

From: Samuel Lewis-Lim \[[view email](https://arxiv.org/show-email/289c92e0/2510.21007)\]  
**[\[v1\]](https://arxiv.org/abs/2510.21007v1)** Thu, 23 Oct 2025 21:33:28 UTC (813 KB)  
**\[v2\]** Mon, 27 Oct 2025 09:25:38 UTC (813 KB)
