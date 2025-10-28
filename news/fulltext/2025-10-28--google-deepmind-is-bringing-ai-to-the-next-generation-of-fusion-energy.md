---
title: "Google DeepMind is bringing AI to the next generation of fusion energy"
date: 2025-10-28
url: https://deepmind.google/discover/blog/bringing-ai-to-the-next-generation-of-fusion-energy/
domain: deepmind.google
lang: en
tags: ["Google", "Research"]
---
# Google DeepMind is bringing AI to the next generation of fusion energy

## 🔗 引用元
- **URL**: https://deepmind.google/discover/blog/bringing-ai-to-the-next-generation-of-fusion-energy/
- **サイト**: Google DeepMind
- **著者**: The Fusion team
- **言語**: English
## 🧭 概要
Science
      

      
    
      
        Published
        16 October 2025
      
      
        Authors
        
      
    
  

      
    

    
      
    
    
    
      
      
    
    
  
    
  
                
              
                
                
                  
                  
  We’re partnering with Commonwealth Fusion Systems (CFS) to bring clean, safe, limitless fusion energy closer to reality.Fusion, the process that powers the sun, promises clean, abundant energy without long-lived radioactive waste. Making it work here on Earth means keeping an ionized gas, known as plasma, stable at temperatures over 100 million degrees Celsius — all within a fusion energy machine’s limits. This is a highly complex physics problem that we’re working to solve with artificial intelligence (AI).Today, we’re announcing our research partnership with Commonwealth Fusion Systems (CFS), a global leader in fusion energy. CFS is pioneering a faster path to clean, safe and effectively limitless fusion energy with its compact, powerful tokamak machine called SPARC.SPARC leverages powerful high-temperature superconducting magnets and aims to be the first magnetic fusion machine in history to generate net fusion energy — more power from fusion than it takes to sustain it.

## 📝 詳細レポート
Science

Published

16 October 2025

Authors

 ![Photograph taken at the Commonwealth Fusion Systems headquarters in Devens, Massachusetts. The image shows construction in progress for SPARC, a compact, powerful tokamak machine called SPARC. A rendering of SPARC when completed is shown on the rear wall. Copyright 2025 Commonwealth Fusion Systems (CFS).](https://lh3.googleusercontent.com/BD0Vc3DBLrSfYQXBogn6lEsscuF-49ThPq9JXHUOP_h7RScLy5tlDS3SQ_HZV2Qc10jlD2iBbl0THusUPsjAfQP4m-awS6A3OHi4y17UpNtJ6frqYg=w1072-h603-n-nu)

We’re partnering with Commonwealth Fusion Systems (CFS) to bring clean, safe, limitless fusion energy closer to reality.

Fusion, the process that powers the sun, promises clean, abundant energy without long-lived radioactive waste. Making it work here on Earth means keeping an ionized gas, known as plasma, stable at temperatures over 100 million degrees Celsius — all within a fusion energy machine’s limits. This is a highly complex physics problem that we’re working to solve with artificial intelligence (AI).

Today, we’re announcing our research partnership with [Commonwealth Fusion Systems](https://cfs.energy/) (CFS), a global leader in fusion energy. CFS is pioneering a faster path to clean, safe and effectively limitless fusion energy with its compact, powerful tokamak machine called [SPARC](https://cfs.energy/technology/sparc).

SPARC leverages powerful high-temperature superconducting magnets and aims to be the first magnetic fusion machine in history to generate net fusion energy — more power from fusion than it takes to sustain it. That landmark achievement is known as crossing “breakeven,” and a critical milestone on the path to viable fusion energy.

This partnership builds on [our groundbreaking work using AI to successfully control a plasma](https://deepmind.google/discover/blog/accelerating-fusion-science-through-learned-plasma-control/). With academic partners at the [Swiss Plasma Center at EPFL (École Polytechnique Fédérale de Lausanne)](https://www.epfl.ch/research/domains/swiss-plasma-center/), we showed that deep reinforcement learning can control the magnets of a tokamak to stabilize complex plasma shapes. To cover a wider range of physics, we developed [TORAX](https://torax.readthedocs.io/), a fast and differentiable plasma simulator written in JAX.

Now, we’re bringing that work to CFS to accelerate the timeline to deliver fusion energy to the grid. We’ve been collaborating on three key areas so far:

*   Producing a fast, accurate, differentiable simulation of a fusion plasma.
*   Finding the most efficient and robust path to maximizing fusion energy.
*   Using reinforcement learning to discover novel real-time control strategies.

The combination of our AI expertise with CFS’s cutting-edge hardware makes this the ideal partnership to advance foundational discoveries in fusion energy for the benefit of the worldwide research community, and ultimately, the whole world.

Simulating fusion plasma
------------------------

To optimize the performance of a tokamak, we need to simulate how heat, electric current and matter flow through the core of a plasma and interact with the systems around it. Last year, we released TORAX, an open-source plasma simulator built for optimization and control, expanding the scope of physics questions we could address beyond magnetic simulation. TORAX is built in JAX, so it can run easily on both CPUs and GPUs and can smoothly integrate AI-powered models, [including our own](https://github.com/google-deepmind/fusion_surrogates/), to achieve even better performance.

TORAX will help CFS teams test and refine their operating plans by running millions of virtual experiments before SPARC is even turned on. It also gives them flexibility to quickly adapt their plans once the first data arrives.

This software has become a linchpin in CFS’s daily workflows, helping them understand how the plasma will behave under different conditions, saving precious time and resources.

> TORAX is a professional, open-source plasma simulator that saved us countless hours in setting up and running our simulation environments for SPARC.

Devon Battaglia, Senior Manager of Physics Operations at CFS

Finding the fastest path to maximum energy
------------------------------------------

Operating a tokamak involves countless choices in how to tune the various “knobs” available, like magnetic coil currents, fuel injection and heating power. Manually finding a tokamak’s optimal settings to produce the most energy, while staying within operating limits, could be very inefficient.

Using TORAX in combination with reinforcement learning or evolutionary search approaches like [AlphaEvolve](https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/), our AI agents can explore vast numbers of potential operating scenarios in simulation, rapidly identifying the most efficient and robust paths to generating net energy. This can help CFS focus on the most promising strategies, increasing the probability of success from day one, even before SPARC is fully commissioned and operating at full power.

We've been building the infrastructure to investigate various SPARC scenarios. We can look at maximizing fusion power produced under different constraints, or optimizing for robustness as we learn more about the machine.

Here we illustrate examples of a standard SPARC pulse simulated in TORAX. Our AI system can assess many possible pulses to find the settings we expect to perform the best.

Visualizations of a cross section through SPARC. Left: The plasma in fuchsia. Right: An example plasma pulse simulated in TORAX, showing changes in the plasma pressure. Far right: We show that adjusting control commands changes the plasma performance, resulting in different plasma pulses.

Through our growing network of collaborations within the fusion research community, we’ll be able to validate and calibrate TORAX against past tokamak data and high-fidelity simulations. This information will provide confidence in simulation accuracy and help us nimbly adapt as soon as SPARC begins operations.

Developing an AI pilot for real-time control
--------------------------------------------

In [our previous work](https://deepmind.google/discover/blog/accelerating-fusion-science-through-learned-plasma-control/), we showed reinforcement learning can control the magnetic configuration of a tokamak. We’re now increasing complexity by adding simultaneous optimization of more aspects of tokamak performance, such as maximizing fusion power or managing SPARC’s heat load, so it can run at high performance with a greater margin to machine limits.

When running at full power, SPARC will release immense heat concentrated onto a small area that must be carefully managed to protect the solid materials closest to the plasma. One strategy SPARC could use is to magnetically sweep this exhaust energy along the wall, as illustrated below.

Left: The location of the plasma-facing materials depicted on the right side of SPARC’s interior. Right: Three-dimensional animation of the rate at which energy is deposited on the plasma-facing materials, as the plasma configuration changes (not representative of an actual pulse on SPARC). Image rendered with HEAT (https://github.com/plasmapotential/HEAT), courtesy of Tom Looby at CFS.

In the initial phase of our collaboration, we’re investigating how reinforcement learning agents can learn to dynamically control plasma to distribute this heat effectively. In the future, AI could learn adaptive strategies more complex than anything an engineer would craft, especially when balancing multiple constraints and objectives. We could also use reinforcement learning to quickly tune traditional control algorithms for a specific pulse. The combination of pulse optimization and optimal control could push SPARC further and faster to achieve its historic goals.

Uniting AI and fusion to build a cleaner future
-----------------------------------------------

Alongside our research, [Google has invested in CFS](https://blog.google/outreach-initiatives/sustainability/our-latest-bet-on-a-fusion-powered-future/), supporting their work on promising scientific and engineering breakthroughs, and moving their technology toward commercialization.

Looking ahead, our vision extends beyond optimizing SPARC operations. We’re building the foundations for AI to become an intelligent, adaptive system at the very heart of future fusion power plants. This is just the beginning of our journey together, and we hope to share more details about our collaboration as we reach new milestones.

By uniting the revolutionary potential of AI and fusion, we’re building a cleaner and more sustainable energy future.

Learn more about our work
-------------------------

*   [Learn more about TORAX](https://torax.readthedocs.io/en/v1.1.1/)
*   [Download the TORAX code](https://github.com/google-deepmind/torax)
*   [Read the CFS blog](https://blog.cfs.energy/with-ai-alliance-google-deepmind-and-cfs-take-fusion-to-the-next-level/)

**Acknowledgements**

This work is a collaboration between Google DeepMind and Commonwealth Fusion Systems.

Google Deepmind contributors: David Pfau, Sarah Bechtle, Sebastian Bodenstein, Jonathan Citrin, Ian Davies, Bart De Vylder, Craig Donner, Tom Eccles, Federico Felici, Anushan Fernando, Ian Goodfellow, Philippe Hamel, Andrea Huber, Tyler Jackson, Amy Nommeots-Nomm, Tamara Norman, Uchechi Okereke, Francesca Pietra, Akhil Raju and Brendan Tracey.

Commonwealth Fusion Systems contributors: Devon Battaglia, Tom Body, Dan Boyer, Alex Creely, Jaydeep Deshpande, Christoph Hasse, Peter Kaloyannis, Wil Koch, Tom Looby, Matthew Reinke, Josh Sulkin, Anna Teplukhina, Misha Veldhoen, Josiah Wai and Chris Woodall.

We’d also like to thank Pushmeet Kohli and Bob Mumgaard for their support.

_Credits: The image of the SPARC Facility, the SPARC renderings and CAD rendering of the divertor tiles are copyright from 2025 Commonwealth Fusion Systems._
