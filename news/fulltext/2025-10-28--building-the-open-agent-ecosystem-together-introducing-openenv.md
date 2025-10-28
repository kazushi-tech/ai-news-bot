---
title: "Building the Open Agent Ecosystem Together: Introducing OpenEnv"
date: 2025-10-28
url: https://huggingface.co/blog/openenv
domain: huggingface.co
lang: en
tags: ["HuggingFace", "OSS"]
---
# Building the Open Agent Ecosystem Together: Introducing OpenEnv

## 🔗 引用元
- **URL**: https://huggingface.co/blog/openenv
- **サイト**: huggingface.co
- **言語**: English
## 🧭 概要
Back to Articles

					
					
					
					
					

					
The Problem
									
								The Solution
									
								The RFCs
									
								Use cases
									
								What’s Next
									
								With tools like TRL, TorchForge and verl, the open-source community has shown how to scale AI across complex compute infrastructure. But compute is only one side of the coin. The other side is the developer community; the people and tools that make agentic systems possible. That’s why Meta and Hugging Face are partnering to launch the OpenEnv Hub: a shared and open community hub for agentic environments.

## 📝 詳細レポート
[Back to Articles](https://huggingface.co/blog)

*   [The Problem](#the-problem "The Problem")
    
*   [The Solution](#the-solution "The Solution")
    
*   [The RFCs](#the-rfcs "The RFCs")
    
*   [Use cases](#use-cases "Use cases")
    
*   [What’s Next](#whats-next "What’s Next")
    

With tools like [TRL](https://github.com/huggingface/trl), [TorchForge](https://github.com/meta-pytorch/torchforge) and [verl](https://github.com/volcengine/verl), the open-source community has shown how to scale AI across complex compute infrastructure. But compute is only one side of the coin. The other side is the developer community; the people and tools that make agentic systems possible. That’s why Meta and Hugging Face are partnering to launch the [OpenEnv Hub](https://huggingface.co/openenv): a shared and open community hub for agentic environments.

Agentic environments define everything an agent needs to perform a task: the tools, APIs, credentials, execution context, and nothing else. They bring clarity, safety, and sandboxed control to agent behavior.

These environments can be used for both training and deployment, and serve as the foundation for scalable agentic development.

[](#the-problem)The Problem
---------------------------

Modern AI agents can act autonomously across thousands of tasks. However, a large language model isn’t enough to get those tasks to actually run — it needs access to the right tools. Exposing millions of tools directly to a model isn’t reasonable (or safe). Instead, we need **agentic environments**: secure, semantically clear sandboxes that define exactly what’s required for a task, and nothing more. These environments handle the critical details:

*   Clear semantics about what a task needs
*   Sandboxed execution and safety guarantees
*   Seamless access to authenticated tools and APIs

[](#the-solution)The Solution
-----------------------------

To supercharge this next wave of agentic development, Meta-PyTorch and Hugging Face are partnering to launch a [Hub for Environments](https://huggingface.co/openenv): a shared space where developers can build, share, and explore OpenEnv-compatible environments for both training and deployment. The figure below shows how **OpenEnv** fits in the new post-training stack being developed by **Meta**, with integrations for other libraries like **TRL**, **SkyRL**, and **Unsloth** underway:

![rl_stack](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/openenv/rl-stack.png)

Starting next week, developers can:

*   Visit the new [Environment Hub](https://huggingface.co/openenv) on Hugging Face where we will seed some initial environments
*   Interact with environments directly as a Human Agent
*   Enlist a model to solve tasks within the environment
*   Inspect which tools the environment exposes and how it defines its observations
*   Every environment uploaded to the Hub that conforms to the OpenEnv specification automatically gains this functionality — making it fast and easy to validate and iterate before running full RL training.

Alongside this, we’re releasing the [OpenEnv 0.1 Spec (RFC)](https://github.com/meta-pytorch/OpenEnv/blob/main/rfcs/002-env-spec.md) to gather community feedback and help shape the standard.

[](#the-rfcs)The RFCs
---------------------

In the current state of the repository, environment creators can create environments using `step()`, `reset()`, `close()` APIs (part of RFCs below). A few examples on how to create such environments can be seen [here](https://github.com/meta-pytorch/OpenEnv/tree/main/src/envs). Environment users can play with local Docker based environments for all environments already available in the repo. Following RFCs are under review:

*   [RFC 001:](https://github.com/meta-pytorch/OpenEnv/blob/main/rfcs/001-abstractions.md) Establish architecture for how the core components like Environment, Agent, Task, etc. are related
*   [RFC 002:](https://github.com/meta-pytorch/OpenEnv/blob/main/rfcs/002-env-spec.md) Propose basic env interface, packaging, isolation and communication w/ environment.
*   [RFC 003:](https://github.com/meta-pytorch/OpenEnv/blob/main/rfcs/003-mcp-support.md) Propose encapsulation of MCP tools through environment abstraction and isolation boundaries
*   [RFC 004:](https://github.com/meta-pytorch/OpenEnv/blob/main/rfcs/004-actions-as-tool-calls.md) Extend tool support to cover unified action schema covering tool calling agents as well as CodeAct paradigm.

[](#use-cases)Use cases
-----------------------

*   RL Post training: pull in environments across collections and use them to train RL agents with TRL, TorchForge+Monarch, VeRL etc.
*   Environment creation: build an environment and ensure that it interops with popular RL tools in the ecosystem, share with collaborators, etc.
*   Reproduction of SOTA methods: easily replicate methods like those from FAIR's [Code World Model](https://huggingface.co/papers/2510.02387) by integrating environments for agentic coding and software engineering.
*   Deployment: users can create an environment, train on the same environment and then use the same for inference too (the full pipeline)

[](#whats-next)What’s Next
--------------------------

This is just the beginning. We’re integrating the OpenEnv Hub with Meta’s new **TorchForge RL library**, and collaborating with other open-source RL projects such as **verl**, **TRL**, and **SkyRL** to expand compatibility. Join us at the PyTorch Conference on Oct 23 for a live demo and walkthrough of the spec, and stay tuned for our upcoming community meetup on environments, RL post-training, and agentic development.

👉 Explore the [OpenEnv Hub](https://huggingface.co/openenv) on Hugging Face and start building the environments that will power the next generation of agents.

👉 Check out the 0.1 spec which can be found implemented in the [OpenEnv project](https://github.com/meta-pytorch/OpenEnv) → we welcome ideas and contributions to making it better!

👉 Engage on [Discord](https://discord.gg/YsTYBh6PD9) and talk with the community about RL, environments and agentic development

👉 Try it out yourself - We created a comprehensive [notebook](https://colab.research.google.com/github/meta-pytorch/OpenEnv/blob/main/examples/OpenEnv_Tutorial.ipynb) that walks you through an end to end example and of course you can easily pip install the package via [PyPI](https://pypi.org/project/openenv-core/). This notebook walks you through the abstractions we’ve built, along with an example of how to use existing integrations and how to add yours - Try it out in Google Colab!

👉 Check out supporting platforms - [Unsloth](https://github.com/unslothai/unsloth), [TRL](https://huggingface.co/docs/trl/main/en/openenv), [Lightning.AI](http://lightning.ai/)

Let's build the future of open agents together, one environment at a time 🔥!
