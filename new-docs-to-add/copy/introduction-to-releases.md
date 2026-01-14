# Introduction to Releases

Building business logic is only half the story. The rules and flows you create in Rulebricks represent critical decision-making processes—pricing calculations, eligibility checks, fraud detection, compliance validation—that drive real outcomes in your applications. But between the moment you finish building a rule and the moment it starts serving production traffic, there exists a gap that many teams overlook until it becomes a problem.

Consider what happens without proper release management: a well-intentioned change to a pricing rule goes live immediately, affecting thousands of calculations before anyone realizes the logic contains an edge case. Or a compliance rule gets updated by one team member while another is still testing a different version, and suddenly no one is certain which logic is actually running. These scenarios are not hypothetical; they represent the daily reality for teams that treat business logic deployment as an afterthought.

Rulebricks Releases addresses this challenge by introducing structured, version-controlled deployments for your rules and flows. Rather than having changes take effect the moment you click "publish," Releases creates a deliberate separation between development work and production deployment, giving you control over what runs where and when.

## The Releases Tab

When you navigate to the Releases tab in your Rulebricks workspace, you encounter a unified view of your deployment landscape. The interface organizes your assets—both rules and flows—into two distinct categories that reflect their current deployment status.

![The Releases tab provides a central view of pending and active releases across your environments](images/releases-tab-entry.png)

At the top of the screen, you can toggle between viewing rules and flows, and filter by environment using the dropdown selector. This environment-centric view is intentional: rather than asking "what state is this rule in?" you ask "what is deployed to staging?" or "what is live in production?" This subtle shift in perspective mirrors how operations teams actually think about deployments.

The interface divides releases into two sections. The Pending section shows releases that have been requested but not yet approved—these represent changes that are in flight, awaiting review before they go live. Below that, the Releases section displays assets that have successfully been released to the selected environment, showing you exactly what version is currently active and when it was deployed.

## Why This Matters

The value of this approach becomes clear when you consider the alternative. Without releases, every published change takes effect immediately across all consumers of your rule. You lose the ability to test a new version in a staging environment before promoting it to production. You have no audit trail of who approved what, when. And when something goes wrong, rolling back means manually editing the rule and hoping you remember what the previous logic looked like.

Releases transforms this chaotic process into something systematic. You can publish a new version of a rule, tag it for release to your staging environment, have it reviewed by the appropriate team members, and only then promote it to production. Each step is tracked, each approval is recorded, and at any point you can see exactly what version of a rule is serving traffic in each environment.

This is not about adding bureaucracy for its own sake. The goal is to give you confidence that the business logic running in production is exactly what you intend it to be, with a clear path from development to deployment that your entire team can understand and participate in.
