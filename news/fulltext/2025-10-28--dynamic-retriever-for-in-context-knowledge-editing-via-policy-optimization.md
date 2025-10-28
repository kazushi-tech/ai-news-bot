---
title: "Dynamic Retriever for In-Context Knowledge Editing via Policy Optimization"
date: 2025-10-28
url: https://arxiv.org/abs/2510.21059
domain: arxiv.org
lang: en
tags: ["Paper"]
---
# Dynamic Retriever for In-Context Knowledge Editing via Policy Optimization

## 🔗 引用元
- **URL**: https://arxiv.org/abs/2510.21059
- **サイト**: arXiv.org
- **著者**: [Submitted on 24 Oct 2025 (v1), last revised 27 Oct 2025 (this version, v2)]
- **言語**: English
## 🧭 概要
View PDF
    HTML (experimental)
            Abstract:Large language models (LLMs) excel at factual recall yet still propagate stale or incorrect knowledge. In-context knowledge editing offers a gradient-free remedy suitable for black-box APIs, but current editors rely on static demonstration sets chosen by surface-level similarity, leading to two persistent obstacles: (i) a quantity-quality trade-off, and (ii) lack of adaptivity to task difficulty. We address these issues by dynamically selecting supporting demonstrations according to their utility for the edit. We propose Dynamic Retriever for In-Context Knowledge Editing (DR-IKE), a lightweight framework that (1) trains a BERT retriever with REINFORCE to rank demonstrations by editing reward, and (2) employs a learnable threshold to prune low-value examples, shortening the prompt when the edit is easy and expanding it when the task is hard.

## 📝 詳細レポート
[View PDF](https://arxiv.org/pdf/2510.21059) [HTML (experimental)](https://arxiv.org/html/2510.21059v2)

> Abstract:Large language models (LLMs) excel at factual recall yet still propagate stale or incorrect knowledge. In-context knowledge editing offers a gradient-free remedy suitable for black-box APIs, but current editors rely on static demonstration sets chosen by surface-level similarity, leading to two persistent obstacles: (i) a quantity-quality trade-off, and (ii) lack of adaptivity to task difficulty. We address these issues by dynamically selecting supporting demonstrations according to their utility for the edit. We propose Dynamic Retriever for In-Context Knowledge Editing (DR-IKE), a lightweight framework that (1) trains a BERT retriever with REINFORCE to rank demonstrations by editing reward, and (2) employs a learnable threshold to prune low-value examples, shortening the prompt when the edit is easy and expanding it when the task is hard. DR-IKE performs editing without modifying model weights, relying solely on forward passes for compatibility with black-box LLMs. On the COUNTERFACT benchmark, it improves edit success by up to 17.1%, reduces latency by 41.6%, and preserves accuracy on unrelated queries, demonstrating scalable and adaptive knowledge editing. The code is available at [this https URL](https://github.com/mwnafee/DR-IKE) .

Submission history
------------------

From: Mahmud Wasif Nafee \[[view email](https://arxiv.org/show-email/68e98618/2510.21059)\]  
**[\[v1\]](https://arxiv.org/abs/2510.21059v1)** Fri, 24 Oct 2025 00:15:30 UTC (1,715 KB)  
**\[v2\]** Mon, 27 Oct 2025 00:25:35 UTC (1,715 KB)
