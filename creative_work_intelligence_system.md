# Creative Work Intelligence System

## One system for creative work memory, not one process for creative work

The goal is not to build another project-management tool.

The goal is to build a **minimal, tier-aware creative work intelligence system** that gives the team one clear way to request, shape, update, review, track, close, archive, and learn from creative work.

It should work with the tools people already use: Microsoft Teams, SharePoint, Outlook, Ziflow, and creative production tools.

It should not replace creative judgment.  
It should not listen to every conversation.  
It should not force every project into the same workflow.  
It should not become a surveillance system.

It should become the trusted source of truth for:

```text
what was requested
what was promised
what is being made
who owns what
which files matter
what has been approved
what changed
where time went
what is at risk
what was learned
what should happen differently next time
```

The simplest statement:

> **A minimal workspace that turns creative work into structured memory.**

---

# 1. Product definition

## What it is

A dedicated internal workspace with a simple, almost Google/ChatGPT-like interface.

At the center is a command bar:

> “What do you want to know or do?”

Users can type things like:

```text
What do I need to do today?
Finished v1 of the teaser video, ready for review, 2h.
Show me the latest approved files for Project B.
Create a scope change for five additional slides.
What are our current project risks?
Close this project and start archive hygiene.
Show performance trends for Tier 2 video projects.
```

The system turns explicit inputs into structured project data.

## What it is not

It is not:

```text
a passive Teams listener
a replacement for SharePoint
a replacement for Ziflow
a creative-quality judge
a productivity surveillance tool
a one-size-fits-all workflow
a dashboard factory
```

It should be opinionated about **how to use the system**, not about how every creative project must be done.

---

# 2. Core philosophy

Creative teams do not usually fail because they lack tasks.

They fail because:

```text
requests are unclear
scope changes silently
files are hard to find
decisions are late
feedback is fragmented
time is not understood
capacity is overpromised
projects do not teach the next project
```

So the system should manage the things that create clarity:

```text
requests
scope
deliverables
commitments
files
time
budgets
reviews
risks
approvals
feedback
learning
```

The operating principle:

> **People give the system meaningful project inputs.  
> The system turns those inputs into clarity, coordination, reporting, archives, and learning.**

---

# 3. Non-negotiable product rules

These rules should guide every feature decision.

1. **One way to use the system, not one way to do the work.**
2. **Creative quality is always judged by humans.**
3. **CD involvement depends on project tier.**
4. **Past feedback is reference and estimation input, not creative truth.**
5. **Tier 1 and selected Tier 2 projects can have exploration.**
6. **Once work moves into production, it becomes structured.**
7. **No passive conversation capture.**
8. **External visual feedback lives in Ziflow or equivalent.**
9. **Files stay where people work during active projects.**
10. **Closed projects go through archive hygiene.**
11. **Every meaningful project action becomes a structured event.**
12. **No project is closed without learning.**
13. **No metric without context.**
14. **No individual productivity leaderboard.**
15. **No stakeholder blame language.**
16. **No AI-generated creative judgment.**
17. **No heavyweight workflow for lightweight work.**
18. **No scope change without consequence.**
19. **No promise without owner, deadline, budget, and decision path.**
20. **No dashboard unless it supports a decision.**

---

# 4. The central object: the Work Object

The system should not treat every request as a full “project.”

Instead, it should use a flexible **Work Object** model.

A Work Object can be tiny or large.

## Work hierarchy

```text
Client / stakeholder group
  Initiative
    Project
      Workstream
        Deliverable
          Commitment
            Action
```

Not every level is required.

A small Tier 3 task may only need:

```text
Deliverable
Owner
Deadline
File
Time
Approval
```

A Tier 1 campaign may need:

```text
Initiative
Project
Workstreams
Deliverables
Creative route
Exploration phase
Production plan
Stakeholders
Budget
Files
Ziflow reviews
CD evaluation
Closeout report
Archive manifest
```

The back-end model is consistent.  
The user experience adapts to the work.

---

# 5. The minimum definition of work

Every Work Object needs a small kernel.

No matter how small or large the work is, the system should know:

| Required field | Why it matters |
|---|---|
| What is being made? | Defines the output |
| Why is it needed? | Prevents meaningless execution |
| Who requested it? | Creates accountability |
| Who owns delivery? | Prevents orphan work |
| Who decides? | Prevents circular feedback |
| When is it needed? | Enables prioritization |
| What is the effort budget? | Creates awareness |
| What does “done” mean? | Prevents endless revision |
| What parent context does it belong to? | Avoids fragmentation |
| Which files/templates/guidelines apply? | Prevents reinvention |
| What review or approval path applies? | Prevents late surprises |

For small work, this should be lightweight.  
For important work, this should be strict.

---

# 6. Project tiers

Project tier is the main way to avoid over-processing small work and under-managing important work.

## Tier 1 — high creative impact

Examples:

```text
major campaign
brand identity
executive event identity
strategic pitch
high-visibility video
major storytelling platform
large company event creative
```

Tier 1 is about creative quality, strategy, and impact.

| Area | Tier 1 behavior |
|---|---|
| CD role | Full creative evaluation |
| Exploration | Required |
| Past feedback | Reference and estimation only |
| Structure | Light in exploration, strict in production |
| Quality | CD-evaluated |
| Closeout | Full closeout report |
| Reporting | Full learning, quality, budget, timeline, feedback |
| Speed | Important, but secondary to quality and strategic fit |

Tier 1 should not be rushed into production too early.

---

## Tier 2 — medium complexity or meaningful visibility

Examples:

```text
campaign extension
important presentation
moderate video
event support package
report design
stakeholder-facing creative package
```

Tier 2 balances quality, speed, and structure.

| Area | Tier 2 behavior |
|---|---|
| CD role | Selective input or escalation |
| Exploration | Optional / lightweight |
| Past feedback | Reference, risk, estimation, possible consistency guide |
| Structure | Shaping, then structured production |
| Quality | Creative lead / senior designer; CD if needed |
| Closeout | Standard closeout |
| Reporting | Timeline, budget, review, scope, learnings |
| Speed | Balanced with quality |

Tier 2 should not automatically create CD bottlenecks.

---

## Tier 3 — fast, repeatable, consistency-led work

Examples:

```text
social adaptation
presentation proofing
minor deck update
resize
formatting
known asset adaptation
template-based production
```

Tier 3 is about speed, consistency, and low friction.

| Area | Tier 3 behavior |
|---|---|
| CD role | No task-level feedback |
| Exploration | None |
| Past feedback | Can inform estimates, templates, consistency |
| Structure | Minimal |
| Quality | Correctness, consistency, requester acceptance |
| Closeout | Lightweight |
| Reporting | Volume, speed, rework, template issues, time |
| Speed | Primary priority |

Tier 3 should not feel like a campaign process.

---

# 7. Exploration and production

The system should clearly distinguish between **exploration** and **production**.

## Exploration mode

Used for Tier 1 and selected Tier 2 work.

Purpose:

```text
think
explore
test creative routes
compare directions
define the creative answer
```

System behavior:

```text
lighter structure
rough files allowed
time tracked at phase level
CD or creative lead guidance
creative routes and rationale captured
not every draft treated as production evidence
```

Exploration protects ambiguity.

## Production mode

Used once the creative direction is approved.

Purpose:

```text
execute
track
review
approve
deliver
archive
learn
```

System behavior:

```text
clear deliverables
owners
deadlines
budgets
file states
review paths
Ziflow approvals
time confirmation
risk tracking
change control
```

The transition from exploration to production should be a formal project moment.

Example:

```text
Creative route approved.
Project moves to production.
Deliverables, timeline, budget, review path, and ownership are now locked.
```

---

# 8. The lifecycle

The full lifecycle should look like this:

```text
1. Request
2. Context resolution
3. Tier assignment
4. Shaping
5. Exploration, if applicable
6. Production lock
7. Execution
8. Review and approval
9. Change management
10. Delivery
11. Feedback
12. Closeout report
13. Archive hygiene
14. Reporting update
15. Learning applied to future work
```

## 1. Request

A request can come through:

```text
form
workspace command bar
PM input
stakeholder request
Outlook-based request
Teams app input
```

But it should become structured.

## 2. Context resolution

The system checks whether the request belongs to an existing:

```text
initiative
project
campaign
event
client workstream
presentation package
```

It should flag possible collisions.

Example:

```text
This video request appears related to the Leadership Summit initiative.
There are already active requests for keynote slides and social posts.
Recommend attaching this as a new deliverable under the existing initiative.
```

## 3. Tier assignment

The PM assigns a tier.

The system can suggest, but a human confirms.

The CD can upgrade a project if the creative stakes are higher than initially understood.

## 4. Shaping

The system helps define:

```text
scope
deliverables
owners
budget
timeline
decision maker
approval path
known risks
required files
templates
guidelines
```

## 5. Exploration

For Tier 1 and selected Tier 2.

Creative routes, references, rationale, and CD guidance are captured as project context.

## 6. Production lock

Once the direction is approved, the project becomes structured.

## 7. Execution

Work is updated through explicit inputs.

Example:

```text
Finished v1 of the keynote deck. Ready for internal review. 3h.
```

The system updates:

```text
status
time
review request
project log
budget burn
forecast
```

## 8. Review and approval

External visual feedback happens in Ziflow or equivalent.

The project system tracks:

```text
review status
version
reviewers
approval state
open comments
resolved comments
approval date
review-cycle count
```

## 9. Change management

Scope, budget, date, or deliverable changes create a visible trade-off.

Example:

```text
Adding five slides is estimated at 4–6h.
To keep the current deadline, reduce another deliverable or approve additional effort.
```

## 10. Delivery

Final files are approved and delivered.

## 11. Feedback

Feedback is requested from the right people based on tier.

## 12. Closeout

The system generates a report.

## 13. Archive hygiene

Final files, source files, approvals, reports, and project memory are stored centrally or referenced through a clean manifest.

## 14. Reporting

Metrics update across:

```text
individuals
teams
project types
tiers
stakeholder groups
regions
portfolios
```

## 15. Learning

Future estimates, risk warnings, and planning suggestions improve.

---

# 9. Explicit input model

The system should not capture conversations automatically.

Instead, it should rely on explicit inputs from:

```text
requesters
PMs
creatives
creative leads
creative directors
account managers
stakeholders
resource managers
Ziflow/review tools
SharePoint/file metadata
time confirmations
closeout feedback
```

This preserves trust.

## Accepted explicit inputs

| Input | Example |
|---|---|
| Progress update | “v1 is done, ready for review, 2h” |
| Time confirmation | “Confirm 3h on Project B” |
| File update | “This replaces the previous version” |
| Review request | “Send this to Ziflow for stakeholder review” |
| Approval | “Client approved v4” |
| Scope change | “Add five slides” |
| Risk | “Blocked until copy arrives” |
| Escalation | “Need CD guidance before production” |
| Closeout feedback | “Brief was clear, but source files arrived late” |

The system should be easy enough that giving an update is faster than sending a messy side message.

---

# 10. One way to use the system

“One way” means one official method for common system actions.

Examples:

| Action | One system method |
|---|---|
| Log time | Explicit update or daily time confirmation |
| Mark file ready | File status update |
| Request review | Review request action |
| Approve work | Named approval action |
| Change scope | Scope-change request |
| Raise blocker | Blocker/risk action |
| Close project | Closeout workflow |
| Archive files | Archive hygiene workflow |
| Report feedback | Tier-based feedback flow |

The work can vary.  
The system interaction should be consistent.

This prevents the usual problem where a team has five different ways to track time, three ways to approve files, and no reliable way to know what is final.

---

# 11. Core system objects

The system should be built around these objects:

```text
Work Object
Initiative
Project
Workstream
Deliverable
Commitment
Action
Person
Role
Permission
Artifact
Review
Approval
Decision
Risk
Budget
Time Entry
Feedback
Project Log
Context Pack
Closeout Report
Archive Manifest
Memory Card
```

These objects create the work graph.

Everything users see is a view of that graph.

---

# 12. Project states

Use a small number of clear states.

```text
Requested
Clarifying
Shaping
Exploring
Ready for production
In production
In review
Waiting
Delivered
Closing
Closed
Archived
```

Not every work type uses every state.

Tier 3 may be:

```text
Requested → In production → In review → Delivered → Closed
```

Tier 1 may be:

```text
Requested → Shaping → Exploring → Ready for production → In production → In review → Delivered → Closing → Archived
```

---

# 13. Roles and rights

The system needs roles because not everyone should be able to change the promise.

## Key rule

> **Anyone can raise reality.  
> Only authorized roles can change commitments.**

A designer can say:

```text
This is no longer a 2-hour task.
```

But that becomes a scope-change signal for a PM, not an automatic scope change.

## Role model

| Role | Core rights |
|---|---|
| Requester | Submit requests, clarify needs, review, approve if named |
| Designer / creative | Update progress, log time, attach files, request review, raise blockers |
| Senior designer / creative lead | Review work, guide production, approve Tier 2 quality where delegated |
| Creative Director | Full Tier 1 creative evaluation, creative override, escalation authority |
| Project Manager | Shape scope, assign tier, manage timeline, budget, risks, SOW, closeout |
| Account Manager | Manage stakeholder communication, expectation alignment, client-facing status |
| Resource Manager | Assign people, balance capacity, support growth and workload health |
| Operations / finance | Maintain budgets, reporting structures, cost assumptions |
| Admin | Manage settings, integrations, permissions |

## Rights examples

| Action | Designer | PM | Creative Lead | CD | Account | Resource Manager |
|---|---:|---:|---:|---:|---:|---:|
| Log time | Yes | Yes | Yes | Yes | Yes | Yes |
| Attach file | Yes | Yes | Yes | Yes | Limited | Limited |
| Request review | Yes | Yes | Yes | Yes | Yes | No |
| Change scope | Propose | Yes | Propose | Override if creative | Propose / align | No |
| Change deadline | Propose | Yes | No | Escalate | Yes if stakeholder-aligned | No |
| Approve Tier 1 quality | No | No | No | Yes | No | No |
| Approve Tier 2 quality | No | No | Yes if delegated | Yes | No | No |
| Approve Tier 3 task | Sometimes | Yes | Sometimes | Usually no | Sometimes | No |
| Assign people | No | Request | Recommend | Recommend | No | Yes |
| Close project | No | Yes | No | Tier 1 input | No | No |
| Archive project | No | Yes / Ops | No | No | No | No |

---

# 14. Human-in-the-loop gates

The system can propose. Humans decide when consequences matter.

## Required human gates

| Moment | Reviewer |
|---|---|
| Tier assignment | PM |
| Tier upgrade | PM or CD |
| Tier 1 creative direction | CD |
| Tier 1 move from exploration to production | CD + PM |
| Scope change | PM |
| Budget increase | PM / account / ops depending on size |
| Deadline change | PM / account |
| Client-visible communication | Account or PM |
| Final Tier 1 creative approval | CD |
| Project closeout validation | PM; CD for Tier 1 |
| Archive completion | PM or operations |

## No approval needed for

```text
routine time entry
ordinary progress update
draft upload
minor task status
raising a blocker
requesting review
asking for context
```

The system should not become slow.

---

# 15. Creative quality model

Creative quality is always human-evaluated.

The bot can summarize evidence, review cycles, feedback themes, and variance.  
It cannot judge whether the creative work is good.

## Quality by tier

| Tier | Quality owner | Evaluation style |
|---|---|---|
| Tier 1 | Creative Director | Full creative evaluation |
| Tier 2 | Creative lead / senior designer; CD if needed | Selective quality review |
| Tier 3 | Requester / template adherence / consistency check | Speed and correctness |

## Tier 1 CD evaluation dimensions

```text
strategic fit
brand fit
originality
craft
clarity
audience relevance
creative ambition
execution quality
```

## Tier 3 quality dimensions

```text
correct template
correct format
correct content
brand consistency
no obvious errors
delivered on time
requester acceptance
```

This prevents the system from applying campaign-level critique to production work.

---

# 16. Past feedback model

Past feedback should be useful, but limited.

It can inform:

```text
time estimates
risk forecasts
review-cycle expectations
stakeholder preference awareness
template choices
known production issues
```

It should not define the creative answer.

## By tier

| Tier | Use of past feedback |
|---|---|
| Tier 1 | Context and risk only; CD decides relevance |
| Tier 2 | Context, estimation, possible consistency reference |
| Tier 3 | Stronger operational use for speed and consistency |

Bad behavior:

```text
Client disliked bold colors last year, so do not use bold colors.
```

Better behavior:

```text
Previous feedback mentioned concern about bold colors. For this Tier 1 project, treat this as context only and confirm with the CD whether it applies.
```

---

# 17. Microsoft working layer

Active work should stay where people already work.

## Microsoft products

| Tool | Role |
|---|---|
| Teams | Team coordination, explicit bot input, notifications |
| SharePoint | Working files and project folders |
| Outlook | Stakeholder communication, requests, approvals where relevant |
| Calendar | Availability, milestones, review deadlines |
| Microsoft 365 identity | Users, groups, permissions |

The system should not try to replace SharePoint.

It should know what SharePoint files mean.

---

# 18. File and artifact management

Files should become **artifacts**.

A file is not just a file. It has project meaning.

## Artifact metadata

```text
file name
file location
project / deliverable
type
owner
version
status
source or export
approval state
client-visible or internal
supersedes / superseded by
linked Ziflow review
final/archive status
related decision
related feedback
```

## File states

```text
Draft
Ready for internal review
In Ziflow review
Changes requested
Approved
Final
Archived
Superseded
```

Users should be able to ask:

```text
Show me the latest approved files for Project B.
Show all files waiting for review.
Show the final client-ready deck.
Which files are missing for archive?
```

The system returns a useful gallery or list, not a folder dump.

---

# 19. Ziflow as review layer

External visual feedback should happen in Ziflow or a similar tool.

The system should sync or store:

```text
asset under review
version
reviewers
status
approval state
open comments count
resolved comments count
approval date
review-cycle count
link to review
summary of key feedback
```

The project system should answer:

```text
Is it approved?
Who still needs to review?
Which version is current?
What feedback is blocking delivery?
How many review cycles happened?
Did feedback create scope or time impact?
```

It should not recreate visual review.

---

# 20. Archive hygiene

During active work:

```text
files stay in SharePoint / Teams / Ziflow / creative tools
```

At closeout:

```text
final files
source files
approval evidence
Ziflow review links/summaries
SOW/scope
budget summary
closeout report
project memory card
```

are stored centrally or referenced in a clean archive manifest.

## Archive hygiene workflow

```text
1. Identify relevant files
2. Classify files
   - final deliverable
   - source file
   - working draft
   - reference
   - approval evidence
   - review evidence
   - project record

3. Confirm latest approved versions
4. Detect missing required files
5. Normalize metadata
6. Create archive manifest
7. Store centrally or reference canonical locations
8. Apply permissions
9. Attach closeout report
10. Mark project archived
```

A project is not truly closed until the archive is clean.

---

# 21. Context packs

Every project should have a context pack.

This prevents knowledge loss.

## Tier 1 context pack

```text
strategic brief
creative ambition
brand guidelines
previous relevant work
past feedback as reference
stakeholder preferences
templates
approval path
budget
known risks
exploration outputs
approved creative route
production requirements
```

## Tier 2 context pack

```text
brief
brand/template guidance
similar past work
stakeholder preferences
key files
approval path
budget
risks
```

## Tier 3 context pack

```text
request
template
format
deadline
approver
source file
final delivery location
```

A creative should be able to ask:

```text
What do I need to know before working on this?
```

And get the relevant context immediately.

---

# 22. Request checking and collision detection

The system should watch incoming requests for possible relationship or conflict.

Not by reading conversations, but by comparing structured request data.

It should detect:

```text
duplicate requests
same campaign or event
same stakeholder group
same deadline
same source files
same template
same launch moment
conflicting messages
conflicting deadlines
missing central owner
budget collisions
review bottlenecks
file conflicts
```

Example:

```text
This social post request appears related to the existing Leadership Summit initiative.
Related work:
- keynote deck
- teaser video
- event visuals

Recommendation:
Attach as deliverable under Leadership Summit instead of creating a separate project.
```

This helps prevent fragmented work.

---

# 23. Time tracking

There should be only one official way to track time.

## Time model

```text
explicit time in update
or
daily time confirmation
```

Examples:

```text
Finished v1, ready for review, 2h.
```

or:

```text
Confirm today’s time:
- Project A / video edit: 3h
- Project B / deck proofing: 1h
- Internal review: 30m
```

The system should use time for:

```text
forecasting
budget awareness
capacity planning
project learning
future estimates
```

Not for simplistic individual productivity scoring.

Time is organizational memory, not a weapon.

---

# 24. Budget awareness

Even if work is not externally charged, every project should have an effort budget.

## Budget fields

```text
estimated effort
approved effort budget
confirmed time
forecast remaining
projected total
variance
reason for variance
```

Example:

```text
Estimated effort: 18–22h
Approved effort budget: 20h
Confirmed time: 14h
Forecast remaining: 9h
Projected total: 23h
Variance: +3h
Reason: additional review round
```

Stakeholder-facing language should be neutral:

```text
This addition is estimated at 6–8 hours of creative capacity.
To keep the current deadline, we need to reduce another deliverable or approve the additional effort.
```

The purpose is:

```text
awareness
trade-offs
better planning
capacity protection
learning
```

---

# 25. People intelligence

The system should learn about people carefully.

The goal is not to rank people.

The goal is to support:

```text
better staffing
growth
fairness
capacity health
avoidance of burnout
avoiding people being trapped in one area
better collaboration
```

## People profile

```text
skills
skill depth
growth goals
preferred work types
current load
project history
tier exposure
client familiarity
template familiarity
time zone
availability
recent overload
collaboration constraints, if formally entered
```

## Assignment recommendation example

```text
Maya is the strongest technical fit but has done 8 similar video edits recently and is at 92% capacity.

Jonas is a strong fit, has growth interest in motion, and is at 61% capacity.

Recommendation:
Assign Jonas, with Maya as reviewer.
```

This avoids the trap of always giving the same person the same work.

## Safeguards

```text
no individual leaderboard
no hidden AI-generated people labels
collaboration constraints are human-entered only
restricted visibility
review/expiry date
correction path
```

---

# 26. Presentation team mode

Presentation work needs special treatment.

Many presentation tasks are small and fast but connected to larger client or stakeholder projects.

The system should support micro-work without turning every request into a full project.

## Presentation work types

```text
proofing
format cleanup
template conversion
slide polish
new slide creation
deck redesign
pitch deck sprint
event keynote
```

## Example proofing request

```text
Proof slides 12–25 in the Q3 deck by 16:00.
No design review needed.
90-minute budget.
```

Required fields:

```text
source deck
slide range
deadline
proofing required yes/no
timebox
requester
output format
```

## Reclassification rule

If a proofing task becomes design work, the system should flag it.

Example:

```text
This was submitted as proofing, but the requested changes affect layout and design across 28 slides.

Recommend reclassifying as deck polish or redesign.
```

This protects the presentation team from hidden scope expansion.

---

# 27. The daily experience

The workspace should open with immediate usefulness.

## Creative home screen

```text
Today

1. My commitments
2. Files waiting for my action
3. Reviews I need to respond to
4. Blocked work
5. Context I need
6. Handover notes, if applicable
7. Time to confirm
```

A creative should not need to search for today’s work.

The interface should not feel like a factory queue.

Use language like:

```text
Today’s commitments
Work waiting for you
Files needing action
Decisions blocking your work
```

Avoid language like:

```text
productivity queue
efficiency score
tasks completed ranking
```

---

# 28. PM experience

The PM should own the promise.

The system should reduce coordination mechanics, not replace judgment.

## PM view

```text
projects needing shaping
scope changes awaiting approval
risks
budget variance
decision delays
review status
closeout tasks
archive hygiene status
```

A PM can ask:

```text
What projects are at risk this week?
Which scope changes need approval?
What has changed since the last status update?
Which projects are waiting on stakeholder decisions?
```

The system should generate useful, neutral summaries.

---

# 29. Creative Director experience

The CD should not be dragged into every task.

The system should surface only the right work.

## CD view

```text
Tier 1 projects needing evaluation
Tier 2 escalations
creative direction decisions
quality risks
projects moving from exploration to production
closeout evaluations for Tier 1
repeated creative feedback themes
```

The CD can ask:

```text
Which Tier 1 projects need my input?
Show me projects moving into production.
Where is creative quality at risk?
Show me closeout summaries for major campaigns.
```

---

# 30. Stakeholder experience

Stakeholders should see clarity, not internal complexity.

They should see:

```text
what was requested
what is being delivered
what is needed from them
what is approved
what is waiting
what happens if a decision is late
which files are ready for review
```

They should not see:

```text
internal creative disagreement
individual performance
private resource issues
sensitive team notes
unfiltered internal risk language
```

## Language principle

Avoid blame.

Instead of:

```text
Your delay is causing risk.
```

Use:

```text
To keep the current delivery date, approval is needed by Thursday 12:00.
If approval comes later, final delivery is likely to move by one day.
```

---

# 31. Reporting layer

Reporting should not be a dashboard museum.

It should answer four questions:

```text
What is happening now?
What happened on this project?
What patterns are emerging?
What should we change next time?
```

## Reporting levels

```text
individual
team
project
tier
work type
client / stakeholder group
region
portfolio
```

## Reporting dimensions

| Dimension | What it reveals |
|---|---|
| Delivery reliability | Are promises being met? |
| Estimate accuracy | Are we planning realistically? |
| Budget variance | Where effort exceeds plan |
| Scope stability | How often work changes after commitment |
| Review efficiency | How review cycles affect delivery |
| Decision latency | Where approvals slow work |
| File readiness | Whether work starts with the right inputs |
| Rework rate | Where unclear briefs or feedback cause extra work |
| Capacity health | Whether teams are overcommitted |
| Tier mix | Whether the team is doing the right kind of work |
| Growth balance | Whether people are developing or stuck |
| Closeout quality | Whether projects produce learning |

## No naked metrics

Every metric needs context.

Example:

```text
Designer completed 72% of commitments on time.

Context:
- 48% were urgent requests
- 31% had incomplete source material
- 22% changed scope after start
- average deadline window was under 24 hours
```

Without context, reporting becomes misleading.

---

# 32. Individual reporting

Individual reporting should support:

```text
growth
staffing
development
load protection
skill diversification
better project matching
```

It should not be used for simplistic productivity ranking.

## Useful individual signals

```text
work mix
tier exposure
skill growth
current load
context switching
deadline compression
project types handled
estimate accuracy by work type
growth interests
repeated blockers
```

Bad metric:

```text
Who completed the most tasks?
```

Better question:

```text
Is this person being overused, underdeveloped, or trapped in one type of work?
```

---

# 33. Team reporting

Team reporting is often more useful and less risky.

Example:

```text
Presentation team / last 30 days

- 186 requests completed
- 34% were same-day
- 29% arrived without the correct template
- 21% were submitted as proofing but became redesign
- Median proofing time: 42 minutes
- Median redesign time: 6.8 hours

Recommendation:
Separate intake into proofing, polish, redesign, and new slide creation.
```

This kind of reporting improves the operating model.

---

# 34. Project closeout

Every project should close with the right amount of feedback and learning.

The closeout depth depends on tier.

## Tier 1 closeout

```text
original brief
final deliverables
creative route chosen
CD quality evaluation
timeline vs actual
budget vs actual
scope changes
review cycles
stakeholder feedback
team feedback
Ziflow feedback summary
file/archive status
risks encountered
lessons learned
future recommendation
```

## Tier 2 closeout

```text
deliverables
timeline
budget
scope changes
review cycles
quality review if applicable
stakeholder feedback
team feedback
file/archive status
lessons learned
```

## Tier 3 closeout

```text
delivered asset
time spent
template/consistency check
approval status
file archived
issue flags if any
```

The feedback should be lightweight.

A Tier 3 task should not trigger a long retrospective.

---

# 35. Feedback collection

Feedback should come from the relevant parties.

## Feedback sources

| Source | Contribution |
|---|---|
| Requester / stakeholder | Did it meet the need? Was the process clear? |
| PM | Was scope, timeline, budget, and decision-making healthy? |
| Creative / designer | Was the brief clear? Were files and time sufficient? |
| Creative lead / CD | Was creative quality appropriate for the tier? |
| Account manager | Was stakeholder alignment healthy? |
| Bot | Quantitative observations and pattern detection |

## Bot feedback can include

```text
planned vs actual effort
timeline variance
scope changes
review-cycle count
approval delay
budget variance
missing files
similar-project comparison
risk pattern
```

## Bot feedback should not include

```text
creative quality judgment
taste judgment
originality scoring
craft scoring without human input
```

---

# 36. Project Memory Card

Every closed project should produce a compact memory card.

Example:

```text
Project Memory Card

Project:
Leadership Summit Teaser Video

Tier:
Tier 2

Planned effort:
42h

Actual effort:
57h

Variance:
+15h / +36%

Main drivers:
- source material arrived 2 days late
- review cycles increased from 2 to 4
- subtitles added after production started

Ziflow:
4 review cycles
23 comments
5 unresolved comments before final approval

Learning:
For similar video work, require source material before commitment or add contingency.

Future estimate recommendation:
50–60h if source material is incomplete or stakeholder count exceeds 3.
```

This is the learning artifact that improves future planning.

---

# 37. Project log

Every project/task should have a log.

The log is based on explicit system events, not captured conversations.

## Log entries include

```text
request submitted
context linked
tier assigned
scope approved
budget set
owner assigned
file submitted
review requested
Ziflow review completed
approval recorded
scope changed
deadline changed
time confirmed
risk raised
escalation decision
project delivered
feedback submitted
archive completed
closeout report approved
```

The log should answer:

```text
what happened
when
who did it
what changed
why
what evidence exists
who approved it
```

This is essential when something goes wrong.

---

# 38. Risk reporting

Risk should be visible globally and locally.

The system should detect risk from explicit project data.

## Risk signals

```text
late decision
overdue review
budget variance
scope increase
missing source files
unclear approver
too many active commitments
same approver blocking many projects
review cycles exceeding plan
Tier 1 project entering production without CD approval
Tier 3 task expanding into redesign
archive incomplete after delivery
```

## Risk report example

```text
Current global risks

1. Leadership Summit Video
Risk: High
Cause: Source footage arrived late and Ziflow review is one cycle over plan.
Impact: Delivery likely slips by one day unless review is completed today.
Recommended action: PM to confirm reduced scope or new delivery date.

2. Q3 Sales Deck
Risk: Medium
Cause: Submitted as proofing, but requested changes are redesign-level.
Impact: Presentation team capacity may be exceeded.
Recommended action: Reclassify as deck polish and approve additional effort.

3. Product Launch Social
Risk: Medium
Cause: Three related requests appear disconnected.
Impact: Inconsistent messaging.
Recommended action: Link under one initiative and assign single decision owner.
```

Risk reporting should be decision-oriented.

---

# 39. Reports should create recommendations

The system should not only show data.

It should say what to change.

Example:

```text
Finding:
Tier 2 video projects overran by 31% on average.

Observed causes:
- source files arrived late in 6 of 9 projects
- review cycles exceeded plan in 5 of 9 projects
- stakeholder count was above 3 in 7 of 9 projects

Recommendation:
For Tier 2 video work:
1. require source files before commitment
2. include two review cycles by default
3. add contingency when stakeholder count exceeds 3
```

This is where reporting becomes learning.

---

# 40. The minimal interface

The workspace should have very little navigation.

Possible navigation:

```text
Today
Work
Files
Reports
People
Admin
```

For creatives, even less:

```text
Today
Work
Files
Ask
```

For PMs:

```text
Today
Work
Risks
Reports
Files
```

For CDs:

```text
Today
Creative Review
Tier 1
Escalations
Reports
```

The interface should be role-aware.

---

# 41. Core command examples

## Creative

```text
What do I need to do today?
Finished v1 of the video, ready for internal review, 2h.
Blocked until copy arrives.
This file replaces the previous version.
Show me the context pack for this project.
```

## PM

```text
Create a project from this request.
Assign Tier 2.
Show open scope changes.
What projects are at risk this week?
Prepare closeout for Project B.
```

## CD

```text
Show Tier 1 projects needing my input.
Show creative routes awaiting approval.
Move this project to production.
Add CD evaluation to closeout.
```

## Stakeholder / account

```text
Show what needs client approval.
Prepare a stakeholder update.
What files are ready for review?
What happens if approval comes tomorrow?
```

## Leadership

```text
Show project performance by tier.
Where are we overcommitted?
Which work types are underestimated?
What stakeholder groups create the most rework?
```

---

# 42. MVP proposal

The first version should not build everything.

It should prove the core loop.

## MVP 1: Today view

For creatives and PMs.

```text
my commitments
reviews
blockers
files needing action
time confirmation
```

## MVP 2: Explicit conversational updates

Support:

```text
progress update
time log
file status
review request
blocker
scope change
approval
```

## MVP 3: Work object model

Support:

```text
initiative
project
deliverable
commitment
artifact
event log
```

## MVP 4: Tiering

Support:

```text
Tier 1
Tier 2
Tier 3
exploration for Tier 1
structured production after approval
```

## MVP 5: Microsoft file linkage

Keep files in SharePoint, but track:

```text
latest version
status
owner
approval state
final/archive state
```

## MVP 6: Ziflow integration or manual review status

Track:

```text
review link
version
review status
approval state
review-cycle count
```

## MVP 7: Closeout report and memory card

At project end:

```text
request feedback
summarize time/budget/review/scope
generate memory card
start archive checklist
```

This MVP would test whether the system actually reduces friction and improves learning.

---

# 43. What to measure in the pilot

Use one or two project types first.

Good candidates:

```text
presentation requests
Tier 2 video projects
event support packages
social asset packages
```

Measure:

```text
request completeness
estimate vs actual
scope changes
review cycles
decision delay
file readiness
time-confirmation compliance
archive completion
on-time delivery
team sentiment
stakeholder clarity
repeated issues captured
```

The pilot succeeds only if users say:

> “This removed work.”

Not merely:

> “This gave leadership more visibility.”

---

# 44. Final product statement

The full concept:

> **A minimal, tier-aware creative work intelligence system that gives global creative teams one clear way to request, update, review, track, close, archive, and learn from work. It keeps files and visual feedback in existing tools like Microsoft 365 and Ziflow, relies on explicit human inputs rather than passive conversation capture, uses Creative Directors for human quality evaluation where appropriate, and turns every project into structured memory for better estimates, cleaner handovers, stronger reporting, and better future work.**

The shorter version:

> **One source of truth for creative work — built from explicit inputs, human judgment, project evidence, and learning.**

The sharpest version:

> **Not a PM tool. A memory system for creative work.**
