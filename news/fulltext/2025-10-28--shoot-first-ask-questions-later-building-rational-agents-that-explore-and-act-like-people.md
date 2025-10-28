---
title: "Shoot First, Ask Questions Later? Building Rational Agents that Explore and Act Like People"
date: 2025-10-28
url: https://arxiv.org/abs/2510.20886
domain: arxiv.org
lang: en
tags: ["Paper"]
---
# Shoot First, Ask Questions Later? Building Rational Agents that Explore and Act Like People

## 🔗 引用元
- **URL**: https://arxiv.org/abs/2510.20886
- **サイト**: arXiv.org
- **著者**: [Submitted on 23 Oct 2025]
- **言語**: English
## 🧭 概要
View PDF
    HTML (experimental)
            Abstract:Many high-stakes applications of AI require forming data-driven hypotheses and making targeted guesses; e.g., in scientific and diagnostic settings. Given limited resources, to what extent do agents based on language models (LMs) act rationally? We develop methods to benchmark and enhance agentic information-seeking, drawing on insights from human behavior. First, we introduce a strategic decision-oriented dialogue task called Collaborative Battleship, in which a partially-informed Captain must balance exploration (asking questions) and action (taking shots), while a fully-informed Spotter must provide accurate answers under an information bottleneck.

## 📝 詳細レポート
[View PDF](https://arxiv.org/pdf/2510.20886) [HTML (experimental)](https://arxiv.org/html/2510.20886v1)

> Abstract:Many high-stakes applications of AI require forming data-driven hypotheses and making targeted guesses; e.g., in scientific and diagnostic settings. Given limited resources, to what extent do agents based on language models (LMs) act rationally? We develop methods to benchmark and enhance agentic information-seeking, drawing on insights from human behavior. First, we introduce a strategic decision-oriented dialogue task called Collaborative Battleship, in which a partially-informed Captain must balance exploration (asking questions) and action (taking shots), while a fully-informed Spotter must provide accurate answers under an information bottleneck. Compared to human players (N=42), we find that LM agents struggle to ground answers in context, generate informative questions, and select high-value actions. Next, to address these gaps, we develop novel Monte Carlo inference strategies for LMs based on principles from Bayesian Experimental Design (BED). For Spotter agents, our approach boosts accuracy by up to 14.7% absolute over LM-only baselines; for Captain agents, it raises expected information gain (EIG) by up to 0.227 bits (94.2% of the achievable noise ceiling). Combined, these components yield sharper targeting (+0.303-0.374 F1), and enable weaker LMs, such as Llama-4-Scout, to outperform both humans (8% -> 82% win rate) and frontier models (0% -> 67% win rate vs. GPT-5) at ~1% of GPT-5's cost. We replicate these findings on Guess Who? where our methods significantly boost accuracy (+28.3-42.4 p.p.), demonstrating their general applicability for building rational information-seeking agents.

Submission history
------------------

From: Gabriel Grand \[[view email](https://arxiv.org/show-email/0c4ab010/2510.20886)\]  
**\[v1\]** Thu, 23 Oct 2025 17:57:28 UTC (9,802 KB)
