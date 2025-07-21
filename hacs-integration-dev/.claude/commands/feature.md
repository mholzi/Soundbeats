---
description: Interactive feature/bug documentation - analyzes code first, asks targeted questions, calculates requirements certainty


PLEASE FOLLOW THIS RUN SCRIPT EXACTLY TO THE DOT. DO NOT ANY CODING
---

# 🚀 Interactive Feature/Bug Documentation with Certainty Assessment

I'll help you create detailed requirements through an intelligent Q&A process.

> **Important:** This command documents requirements only - no code will be modified.

## 📝 Session Initialization

```bash
timestamp=$(date +%Y%m%d_%H%M%S)
feature_name="${ARGUMENTS// /_}"
echo "🎯 Session started for: $ARGUMENTS"
echo "📅 Timestamp: $timestamp"
mkdir -p requirements
# Validate current integration state
hacs validate 2>/dev/null || echo "HACS validation not available"
```

---

## ❓ Question 1: Implementation Scope

First, I need to understand what type of implementation this is.

**What are you implementing?**

Please type:
- `phase-1` through `phase-10` - Implement a specific phase from PLANNING_SOUNDBEATS.md
- `feature` - New functionality not covered in existing phases
- `bug` - Something isn't working correctly

**Waiting for your response...**

---

## 🔍 Phase Analysis (if phase selected)

*If you selected a phase (phase-1 through phase-10), I will:*
1. *Read PLANNING_SOUNDBEATS.md to understand the specific phase requirements*
2. *Analyze current codebase state to determine what's already implemented*
3. *Identify dependencies from previous phases*
4. *Check if any prerequisites are missing*
5. *Determine if the phase can be fully implemented or needs modifications*

*This analysis will help me ask more targeted questions about the specific phase deliverables.*

---

## ❓ Question 2: Implementation Details

### For PHASE Implementation:
**After analyzing the phase requirements and current codebase, please clarify:**

1. **Can the full phase be implemented as planned?** (Yes/No)
2. **Are there any deliverables you want to postpone to a later phase?** (List specific items)
3. **Are there any additional requirements not covered in the phase?** (New deliverables)
4. **Dependencies ready?** (Are previous phases completed successfully?)

### For BUG Reports:
**If you selected `bug` in Question 1, please provide:**

1. **What specifically is broken?** (Describe the current incorrect behavior)
2. **What should happen instead?** (Describe the expected correct behavior)
3. **Steps to reproduce** (if applicable)
4. **Error messages** (if any - paste them here)
5. **When did this start happening?** (After a recent change, always been broken, etc.)
6. **Which Home Assistant version?** (e.g., 2024.1.0)
7. **Integration version?** (from manifest.json)
8. **Relevant logs?** (from Settings > System > Logs)
9. **Browser console errors?** (Open DevTools > Console)
10. **WebSocket connection status?** (Check Network tab)
11. **Panel loading issues?** (Does sidebar icon appear?)

### For FEATURE Requests:
**If you selected `feature` in Question 1:**

1. **What new functionality do you need?** (Detailed description)
2. **How does this relate to existing phases?** (Should it be added to a phase or create new one?)
3. **What's the priority?** (Critical, Important, Nice-to-have)

**Waiting for your response...**

---

## 🔍 Targeted Code Analysis

*After you respond to Questions 1-2, I will analyze the codebase to understand:*
- *Current implementation state for the selected phase*
- *Panel registration and frontend integration patterns*
- *WebSocket API patterns for real-time updates*
- *Game state management and persistence*
- *Media player service integration*
- *Lit Element component structure*
- *HACS dashboard panel requirements*

*This targeted analysis will help me ask more specific and relevant follow-up questions.*

---

## 📋 Dynamic Phase Planning Updates

*If during Question 2 you indicate:*
- **Postponed deliverables**: I will automatically update PLANNING_SOUNDBEATS.md to move these items to appropriate future phases
- **Additional requirements**: I will add these to the current phase or create new phase items
- **Phase infeasibility**: I will restructure the phase breakdown and update dependencies

*This ensures the planning document stays accurate and reflects real implementation decisions.*

---

*Each subsequent question will be presented one at a time, based on:*
1. *Your implementation scope (phase/feature/bug)*
2. *Your phase modifications or bug details*
3. *Current codebase analysis findings*
4. *Home Assistant integration patterns and requirements*
5. *Any HACS compliance constraints I discover*

---

## 📊 Requirements Certainty Assessment

After gathering all information, I will calculate a **Requirements Certainty Score** based on:

### Scoring Criteria (12 points total):
1. **Problem Clarity** (0-2 points)
   - 0: Vague or unclear
   - 1: Partially clear
   - 2: Crystal clear

2. **Scope Definition** (0-2 points)
   - 0: Scope unclear
   - 1: Some boundaries defined
   - 2: Well-bounded scope

3. **Technical Details** (0-2 points)
   - 0: Missing technical context
   - 1: Some technical details
   - 2: Complete technical understanding

4. **Success Criteria** (0-2 points)
   - 0: No clear success metrics
   - 1: Basic success criteria
   - 2: Measurable success criteria

5. **Edge Cases & Constraints** (0-2 points)
   - 0: Not considered
   - 1: Some consideration
   - 2: Thoroughly addressed

6. **UI/UX Criteria** (0-2 points)
   - 0: No UI considerations
   - 1: Basic UI requirements
   - 2: Complete responsive design specs

### Certainty Thresholds:
- **11-12/12**: Requirements are complete ✅
  - **Automatic Action**: Will trigger `/generate-ha-prp` with the created MD file
- **8-10/12**: Requirements need minor clarification 🟡
  - **Action**: Will ask 1-2 clarifying questions
- **<8/12**: Requirements need significant clarification 🔴
  - **Action**: Will ask targeted questions to improve clarity

---

## 📋 Documentation Process

Based on the certainty score:

### If Score ≥ 11/12:
1. **Create comprehensive requirements document** in `/requirements/`
2. **Include certainty assessment** in the summary
3. **Automatically execute** the PRP generation process with the created requirements file

### If Score < 11/12:
1. **Present the current certainty score** with breakdown
2. **Ask clarifying questions** to address weak areas
3. **Iterate until reaching 11/12** certainty
4. **Then proceed with documentation and PRP generation**

### Document Format:
- Clear problem statement
- Detailed requirements with certainty score
- Technical constraints
- Success criteria
- Examples and references
- **Certainty Assessment Summary**

---

## 💡 Tips for Best Results

- **Be specific** in your responses
- **Mention any files or components** you know are related
- **Share any error messages** if this is a bug
- **Describe the ideal outcome** you're looking for
- **Consider edge cases** when answering questions

Ready to begin the intelligent requirements gathering process with certainty tracking!

---

## 🚀 Automatic PRP Generation

**IMPORTANT**: When the requirements certainty score reaches 11/12 or higher, I will:
1. Save the requirements document to `/requirements/[feature-name]-[timestamp].md`
2. **Automatically execute the generate-ha-prp command** by reading and processing the `/generate-ha-prp` command with the created requirements file
3. No manual intervention needed - the PRP will be generated automatically upon reaching sufficient certainty!