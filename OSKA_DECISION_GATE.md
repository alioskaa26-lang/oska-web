# OSKA DECISION CAPTURE & HUMAN APPROVAL GATE

Date: 2026-09-22

## Purpose
Prevent long conversations from polluting the canonical OSKA system while ensuring important decisions are not lost.

## Core rule
Conversation text is NOT copied wholesale into project systems.

Instead:
1. Extract only durable decisions, changed rules, approved priorities, constraints, new requirements and reversals.
2. Remove repetition, brainstorming, temporary ideas and superseded statements.
3. Present a concise "ONAY BEKLEYEN KARARLAR" summary to the owner.
4. Do NOT write those conversation-derived decisions into canonical project files, rules, specs or operational systems until the owner explicitly approves them.
5. After approval, write only the approved decision set to the appropriate source of truth.
6. Record approval date/time and source context.
7. If the owner edits/rejects an item, only the revised approved version is canonical.
8. Latest approved decision wins over older approved decisions; superseded decisions remain in history but are marked superseded, not deleted.

## Scope
Applies to:
- website rules/specs
- lead generation rules
- 925 / brass-bronze strategy
- agents/distributors
- CAD/product development
- creative/photo/video
- automation/cloud
- cybersecurity
- Master Lead/data operations
- future OSKA departments

## What requires this approval gate
- new strategic rule
- change to an existing canonical rule
- new red-line/non-negotiable
- permanent workflow/process change
- new system architecture decision
- role/responsibility change
- new recurring automation policy
- changed approval policy
- changed data governance/source-of-truth rule
- new collection/product/content rule intended to be durable

## What does NOT require this conversation-decision approval gate
Routine, reversible work already authorized by existing approved rules, such as:
- research
- QA
- dedup
- retries
- source rotation
- safe staging fixes
- non-production experiments
- temporary drafts
- low-risk corrections that do not change policy

## Required approval format
When new durable decisions are detected, present:

ONAY BEKLEYEN KARARLAR
1. <decision>
2. <decision>
...

DEĞİŞTİRİLEN ESKİ KURAL
- <old -> new>, if applicable

PROJEYE YAZILACAK YER
- <file/system>

Owner actions:
- "Onayla" = approve all
- "1,3 onay" = approve selected
- "2 değiştir: ..." = revise item
- "Reddet" = do not persist

No canonical write before explicit approval.

## Audit
After approved write:
- write
- readback
- record source/approval timestamp
- preserve history
