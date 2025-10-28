---
title: "Self-Rewarding PPO: Aligning Large Language Models with Demonstrations Only"
date: 2025-10-28
url: https://arxiv.org/abs/2510.21090
domain: arxiv.org
lang: en
tags: ["Paper"]
---
# Self-Rewarding PPO: Aligning Large Language Models with Demonstrations Only

## 🔗 引用元
- **URL**: https://arxiv.org/abs/2510.21090
- **サイト**: arXiv.org
- **著者**: [Submitted on 24 Oct 2025]
- **言語**: English
## 🧭 概要
Authors:Qingru Zhang, Liang Qiu, Ilgee Hong, Zhenghao Xu, Tianyi Liu, Shiyang Li, Rongzhi Zhang, Zheng Li, Lihong Li, Bing Yin, Chao Zhang, Jianshu Chen, Haoming Jiang, Tuo Zhao            
    View PDF
    HTML (experimental)
            Abstract:Supervised fine-tuning (SFT) has emerged as a crucial method for aligning large language models (LLMs) with human-annotated demonstrations. However, SFT, being an off-policy approach similar to behavior cloning, often struggles with overfitting and poor out-of-domain generalization, especially in limited-data scenarios. To address these limitations, we propose Self-Rewarding PPO, a novel fine-tuning method that leverages on-policy techniques to enhance generalization performance. Our approach combines the strengths of SFT and proximal policy optimization (PPO) to achieve more effective alignment from demonstration data.

## 📝 詳細レポート
Authors:[Qingru Zhang](https://arxiv.org/search/cs?searchtype=author&query=Zhang,+Q), [Liang Qiu](https://arxiv.org/search/cs?searchtype=author&query=Qiu,+L), [Ilgee Hong](https://arxiv.org/search/cs?searchtype=author&query=Hong,+I), [Zhenghao Xu](https://arxiv.org/search/cs?searchtype=author&query=Xu,+Z), [Tianyi Liu](https://arxiv.org/search/cs?searchtype=author&query=Liu,+T), [Shiyang Li](https://arxiv.org/search/cs?searchtype=author&query=Li,+S), [Rongzhi Zhang](https://arxiv.org/search/cs?searchtype=author&query=Zhang,+R), [Zheng Li](https://arxiv.org/search/cs?searchtype=author&query=Li,+Z), [Lihong Li](https://arxiv.org/search/cs?searchtype=author&query=Li,+L), [Bing Yin](https://arxiv.org/search/cs?searchtype=author&query=Yin,+B), [Chao Zhang](https://arxiv.org/search/cs?searchtype=author&query=Zhang,+C), [Jianshu Chen](https://arxiv.org/search/cs?searchtype=author&query=Chen,+J), [Haoming Jiang](https://arxiv.org/search/cs?searchtype=author&query=Jiang,+H), [Tuo Zhao](https://arxiv.org/search/cs?searchtype=author&query=Zhao,+T)

[View PDF](https://arxiv.org/pdf/2510.21090) [HTML (experimental)](https://arxiv.org/html/2510.21090v1)

> Abstract:Supervised fine-tuning (SFT) has emerged as a crucial method for aligning large language models (LLMs) with human-annotated demonstrations. However, SFT, being an off-policy approach similar to behavior cloning, often struggles with overfitting and poor out-of-domain generalization, especially in limited-data scenarios. To address these limitations, we propose Self-Rewarding PPO, a novel fine-tuning method that leverages on-policy techniques to enhance generalization performance. Our approach combines the strengths of SFT and proximal policy optimization (PPO) to achieve more effective alignment from demonstration data. At its core is a reward function designed as the log policy ratio between the SFT model and the pretrained base model. This function serves as an implicit reward signal, using the pretrained policy as a baseline and the SFT policy as a target. By doing so, it enables on-policy fine-tuning without relying on human preference annotations. The integration of this self-rewarding mechanism with PPO addresses key limitations of SFT, improving generalization, data efficiency, and robustness. Our empirical evaluation across a range of natural language processing tasks demonstrates that Self-Rewarding PPO consistently outperforms traditional SFT methods. The results highlight the effectiveness of our approach in aligning LLMs using demonstration data, particularly in scenarios where high-quality annotated data is scarce.

Submission history
------------------

From: Qingru Zhang \[[view email](https://arxiv.org/show-email/93af0ccd/2510.21090)\]  
**\[v1\]** Fri, 24 Oct 2025 02:02:13 UTC (337 KB)
