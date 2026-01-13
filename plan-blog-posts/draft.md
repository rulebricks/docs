# Introducing Rulebricks Gradient

**How we've stealthily built our way towards remarkable AI rule mining capabilities**

---

Rule engines ask their users a series of questions that seem incredibly reasonable from a software and technology perspective, but far less pragmatic from a process perspective.

"What are your business rules?"

"What data do you need to make this decision?"

"Can you encode this logic in a decision table?"

These questions make perfect sense to engineers. But ask anyone who actually runs a business process and you'll get uncomfortable silence, followed by something like: "Well, it depends. Sarah usually handles those cases, and she just... knows."

Yes, it's true that many businesses have decisions that decisioning platforms can automate and make transparent. But those decisions are almost never written down in one place, in an executable format. They live in spreadsheets that haven't been updated since 2019. They exist in the heads of employees who've been doing this for fifteen years. They're scattered across Slack threads and half-remembered meetings.

And the data is never quite perfect either. It emerges from silos—a credit score from one vendor, employment verification from another, income data from a third. It arrives at unpredictable times. The loan application comes in Monday, but you won't have everything you need to make a decision until Friday. Maybe next Friday.

Traditional rule engines assume you've already solved these problems. They assume you have:

- All your rules written down, ready to encode
- All your data available at once, ready to process
- Time to manually translate tribal knowledge into executable logic

None of this is true for most organizations. And we've been thinking about how to change that.

---

## The Progressive Data Problem

Consider a typical business decision: approving a mortgage application.

The applicant submits their basic information on Monday. The credit bureau returns their score on Wednesday. Employment verification finishes Friday. The appraisal report arrives next week. The title search completes the week after that.

By the time you have everything you need to make a decision, where did Monday's data go?

In a traditional setup, you'd need to build infrastructure to:

1. Store all this data somewhere as it arrives
2. Track what you have and what's still missing
3. Periodically check if you can finally run your rules
4. Manually trigger execution when everything's ready
5. Store the decision output somewhere else

This is undifferentiated heavy lifting. Every team building decision automation reinvents this same orchestration layer—state tracking, polling, webhooks, status APIs. It's not the interesting part of the problem, but it consumes months of engineering time.

We wanted to eliminate it entirely.

---

## Introducing Contexts

**Contexts hold your decision together while the pieces arrive.**

A Context defines the facts relevant to a specific decision. You declare what you need—credit score, income, employment status—and Rulebricks tracks everything as it arrives from different sources at different times.

When you submit a fact, the API tells you exactly where you stand:

```javascript
POST /api/v1/contexts/loan-application/APP-12345
{ "credit_score": 720 }

// Response
{
  "status": "pending",
  "have": ["application_id", "credit_score"],
  "need": ["annual_income", "employment_verified"]
}
```

You're not polling. You're not checking status. Every submission tells you what's arrived and what's still missing.

And when the final piece arrives? Your rules execute automatically:

```javascript
POST /api/v1/contexts/loan-application/APP-12345
{ "employment_verified": true }

// Response
{
  "status": "complete",
  "state": {
    "approval_decision": "approved",
    "max_loan_amount": 250000
  }
}
```

No manual trigger. No orchestration code. The decision just happens when it can happen.

### Cascading Execution

It gets better. Rules can write facts that other rules depend on. Submit a credit score, and your risk assessment rule runs. That writes a risk tier, which triggers your pricing rule. That writes a rate and maximum amount.

```
Submit: credit_score = 720
        ↓
  [Risk Assessment Rule] executes
        ↓
Writes: risk_tier = "low"
        ↓
  [Pricing Rule] executes (was waiting for risk_tier)
        ↓
Writes: rate = 4.5, max_amount = 500000
```

You submitted one fact. Three derived values appeared. This cascade happens within a single API response—no webhooks, no polling, no orchestration.

Contexts turn the progressive data problem from a months-long infrastructure project into a schema definition. You describe what matters for your decision. We handle the rest.

---

## The Implicit Knowledge Problem

But solving data collection only addresses half the challenge.

Even if you have perfect infrastructure to gather facts and trigger rules, you still need rules to trigger. And this is where most rule engine deployments stall.

The rules aren't written down. They exist as:

- Spreadsheets maintained by someone who left two years ago
- Historical patterns no one has bothered to codify
- The intuition of experienced employees ("I just know a risky application when I see one")
- Approval workflows that evolved organically without documentation

Asking a business to "just write their rules" is like asking them to document every decision they've ever made and why. It's a massive undertaking, and it usually doesn't happen. Teams get 60% of the way there, the edge cases pile up, and the project loses momentum.

We kept asking ourselves: what if we could flip this around?

What if instead of asking businesses to encode their knowledge, we could observe their decisions and discover the patterns ourselves?

---

## Introducing Gradient

**Gradient discovers the rules you didn't know you had.**

Here's the insight: Contexts don't just track inputs. They track outcomes. Every solved context—every completed decision—captures what facts were present and what was decided.

This is labeled data. Training data. And there's a lot of it.

Gradient analyzes the history flowing through your Contexts and surfaces the decision patterns hiding in it. That credit approval workflow your team runs manually? Gradient sees that 94% of applicants with scores above 720 and debt ratios below 30% get approved—and generates the rule for you.

**It discovers patterns like:**

- "Orders from gold-tier customers over $500 are always expedited"
- "Applications missing employment verification stall 3x longer than others"
- "Price adjustments above 15% require manager approval regardless of other factors"

These become draft rules you can review, refine, and publish. The implicit knowledge living in your business operations becomes explicit, auditable, executable logic.

You're not starting from a blank decision table wondering what to encode. You're starting from observed reality, with patterns already identified.

---

## Bottleneck Analysis

Beyond rule generation, Gradient identifies where decisions get stuck.

Which facts are most often missing when applications stall? Where would a new integration have the highest ROI? What data gaps are costing you the most in delayed decisions and frustrated customers?

Gradient turns operational friction into actionable insights. You see exactly which problems are worth solving first.

Maybe you discover that employment verification is the bottleneck in 40% of stalled applications. Maybe you find that a particular customer segment almost always gets approved anyway, and you could fast-track them. Maybe you realize that a single missing field is responsible for most of your operational delays.

This is the kind of analysis that usually requires a dedicated data science project. Gradient makes it continuous and automatic.

---

## Why This Matters

Let's return to where we started.

Rule engines have been asking reasonable technical questions that make unreasonable demands on businesses:

- "Write down all your rules" → but they're not written down anywhere
- "Provide all your data" → but it arrives from different places at different times
- "Encode your business logic" → but most of it is implicit, tribal knowledge

We've been quietly building toward a different approach. Contexts solve the data problem—decisions that hold together while information arrives progressively. Gradient solves the knowledge problem—rules discovered from observed patterns rather than extracted from reluctant experts.

Together, they flip the traditional rule engine model:

- What if your rules could be discovered, not just executed?
- What if data infrastructure built itself around your decisions?
- What if the implicit became explicit automatically?

This is the vision we've been working toward. Every context instance is a training example. Every solved decision is labeled data. The more you use Rulebricks, the smarter it gets about your business.

---

## Get Started

**Contexts** are available now. If you're building decision automation where data arrives progressively—loan processing, insurance underwriting, order fulfillment, fraud detection—Contexts eliminate the orchestration infrastructure you'd otherwise have to build.

**Gradient** is in active development. We're working with early access partners to refine automated rule discovery and bottleneck analysis. If you're interested in having your rules write themselves, [reach out](mailto:support@rulebricks.com). We'd love to learn about your use case.

The questions rule engines ask don't have to be unreasonable. We're making them practical.
