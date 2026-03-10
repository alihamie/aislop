#!/usr/bin/env python3
"""
AISlop auto-poster
Usage:
  python3 auto_post.py feed       → posts one random post to the feed
  python3 auto_post.py challenge  → posts one entry to the current weekly challenge

Requires env vars (set in ~/.profile):
  AISLOP_SUPABASE_URL
  AISLOP_SUPABASE_KEY
"""

import sys
import os
import random
import json
import urllib.request
import urllib.error

URL  = os.environ.get("AISLOP_SUPABASE_URL", "")
KEY  = os.environ.get("AISLOP_SUPABASE_KEY", "")

if not URL or not KEY:
    print("Error: AISLOP_SUPABASE_URL and AISLOP_SUPABASE_KEY must be set in environment")
    sys.exit(1)
H    = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# ── Seed user pool ──────────────────────────────────────────────────────────
USERS = [
    "2993be11-b376-4475-9834-549d31e8e83f",  # slopwatcher99
    "637ecec8-7979-4952-a631-24d5742d3ad7",  # judgedredd_
    "f0a9af75-a009-47ce-b25b-fcefacec1c62",  # notarobot42
    "b5c81990-683f-4076-a600-fbece72e9b23",  # sloptector
    "d97d0cf9-1823-4c7c-b701-79433578610d",  # roastmaster3000
    "c63c6e26-2a50-47d2-9ab8-2a5d186b78b1",  # aisnitch
    "2104fdc5-d58b-4cd7-8b87-ae720b878bb6",  # garbagefire
    "4007e0f8-e034-4fb2-860f-c00fbeda8974",  # fakedetector
    "e83fdae4-dfa8-4620-9f57-89e0b6c93709",  # slopscanner
    "ec204956-5bbf-4e3c-92c5-6f195742733f",  # humancheck
    "c2064a00-2e30-4ec3-8713-836f77ef60f3",  # vibecheck404
    "2af286a3-67fd-43c0-a4d5-23d431535b95",  # truthteller_
    "833bcd85-ae40-4962-8610-d92b7c16c74e",  # slopalert
    "47162a6f-4716-4b07-8e42-494d02f882b7",  # aidetect
    "858aed54-f084-4112-a5ef-7766f66b6633",  # realnesspolice
    "f5761f2c-9d63-4316-8204-c876ea49db43",  # promptpolice
    "15961182-e226-4a12-ac35-d80e44f661d8",  # buzzwordbane
    "b4a2a502-5bfc-41d5-a730-7a88753a3cce",  # slopsheriff
    "ec19030c-9fb7-4f06-8a42-dc637b14d2bc",  # junkfilter
    "1a013647-a2a5-45c6-ab5b-3f41a16c5b19",  # rhetoriccop
]

VOTER_POOL = USERS[:]

# ── Post pool ───────────────────────────────────────────────────────────────
# Types: linkedin | twitter | blog
POSTS = [
    # ── LinkedIn ──────────────────────────────────────────────────────────
    {
        "type": "linkedin",
        "title": "The 5 AM Club Changed My Life (And It Can Change Yours Too)",
        "content": """I resisted it for years.

"5 AM is insane," I told myself.

Then I lost a client, a deal fell through, and I sat with the question:

What am I actually doing with my mornings?

That was 14 months ago.

Today I wake up at 5 AM every single day — including weekends.

Here's what changed:

✅ My revenue went up 67% in 8 months
✅ I read 2 books a month (was zero)
✅ I workout before the world wakes up
✅ My mind is clear before the chaos hits

People ask me my secret.

It's not a secret. It's a schedule.

The morning is the only time that belongs to you — before the DMs, before the Slack, before the asks.

Own the morning. Own the day.

Drop a 🌅 in the comments if you're part of the 5 AM club.

#Entrepreneurship #Mindset #GrowthHacking #Success #MorningRoutine""",
        "slop_score": 91,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "Revenue up exactly 67% — not 65, not 70, specifically 67. The emoji checklist, the rhetorical pivot, the 'it's not a secret, it's a schedule' kicker. Requesting the 5 AM club drop a 🌅 is the cherry on top of this masterwork.",
    },
    {
        "type": "linkedin",
        "title": "Nobody Told Me This About Failure",
        "content": """In 2019, my startup failed.

$200k gone. Team dispersed. I was embarrassed.

I didn't post about it. I didn't make it a lesson.

I sat with it for 6 months.

Then something shifted.

I realized: failure isn't the opposite of success.

It's the curriculum.

Every investor I've spoken to since? They ask about my failures first.

Every great hire I've made? They lead with what didn't work.

The best founders I know have all failed publicly and loudly.

Here's what I've learned:

→ Failure is tuition for the education you couldn't have gotten any other way
→ The people who haven't failed yet just haven't tried hard enough
→ Your scar story is more powerful than your success story

If you're in a failure right now — stay in it a little longer.

The lesson hasn't finished loading yet.

♻️ Share if someone needs to hear this today.

#StartupLife #Entrepreneurship #Resilience #Leadership #Mindset""",
        "slop_score": 82,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "The $200k loss disclosed casually, followed by 'failure is tuition' — a metaphor so overused it has student debt. 'The lesson hasn't finished loading yet' is doing a lot of heavy lifting as a kicker.",
    },
    {
        "type": "linkedin",
        "title": "I Hired Slowly and It Destroyed My Company. Here's What I'd Do Differently.",
        "content": """3 years ago I followed all the advice.

"Hire slow, fire fast."

I took 4 months to make a hire. Then 5 months. Then 6.

Meanwhile, my competitor hired in 3 weeks and shipped while I was still interviewing.

I lost the market window.

Here's what I learned the hard way:

Hiring slow in a fast market is a strategy for losing.

The new framework I use:

① Define the outcome, not the role (what does success look like in 90 days?)
② Source from your network first — warm beats cold every time
③ Run a 1-week paid trial — work together before you commit
④ Make the offer on day 7 if it clicks

Result? My last 4 hires have been the best of my career.

The hiring market is brutal right now. Speed is a competitive advantage.

What's your hiring philosophy? I'm curious 👇

#Hiring #StartupLife #Leadership #TalentAcquisition #ScaleUp""",
        "slop_score": 76,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "A numbered framework with circled emoji digits — a classic. The competitor who 'hired in 3 weeks' conveniently shows up as the villain. Asking for hiring philosophies in the comments ensures at least 47 people paste their own frameworks.",
    },
    {
        "type": "linkedin",
        "title": "Your Network Is Your Net Worth (I Finally Proved It)",
        "content": """Last Thursday I needed a CFO for a Series A company.

I sent 3 DMs.

By Monday I had 2 qualified candidates.

No recruiter. No job board. No LinkedIn Recruiter license.

Just relationships I had invested in over 7 years.

The math is simple:

Every coffee ☕ you skip = a relationship you didn't build
Every follow-up you forget = a door that quietly closes
Every event you skip = 10 people you didn't meet

I know it sounds transactional. It's not.

Real networking is just:

→ Being genuinely curious about people
→ Showing up consistently over years
→ Giving before you ask

Your network is your net worth.

Not metaphorically. Literally.

Who's one person you should reach out to today? Tag them below 👇

#Networking #CareerGrowth #Leadership #ProfessionalDevelopment""",
        "slop_score": 79,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "The 'network is net worth' truism dressed up as a personal discovery, complete with a coffee emoji and a 7-year timeline flex. Tagging people in the comments will generate approximately 200 'Thanks for this!' replies.",
    },
    {
        "type": "linkedin",
        "title": "I Turned Down $500k. Here's the Lesson.",
        "content": """14 months ago, a large firm offered to acquire my agency for $500,000.

I said no.

My co-founder thought I was insane.

My wife thought I was insane.

Honestly? I wasn't sure I wasn't insane.

Here's why I said no:

The terms required me to stay for 2 years in a role where I would have had no autonomy, no equity upside, and no ability to build what I actually wanted to build.

$500k for 2 years of your life sounds great on paper.

It's $250k/year. Minus tax. Minus your freedom.

I'm now at 4x that revenue run rate with full ownership.

The lesson?

Not every exit is a win. Not every number with a comma in it is the right number.

Know what you're actually selling when you sell.

#Entrepreneurship #Acquisition #StartupLife #Founder #Freedom""",
        "slop_score": 85,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Turned down $500k — disclosed casually — then immediately revealed they're making 4x that anyway. The wife-thought-I-was-insane detail adds a human touch. Revenue flex wrapped in a humility bow.",
    },
    {
        "type": "linkedin",
        "title": "The Introvert's Playbook for Networking (That Actually Works)",
        "content": """I'm an introvert.

Conferences drain me. Small talk feels fake. Networking events make me want to hide in the bathroom.

For years I told myself: "This isn't for me."

Then I discovered the introvert advantage.

We listen more than we talk. We go deep instead of wide. We follow up better because we actually remember the conversation.

My introvert networking system:

🎯 One meaningful conversation per event (not 20 shallow ones)
📩 Follow up within 24 hours, always
📚 Read something they wrote before you meet them
🎁 Lead with value — share an article, make an intro, solve a problem

Result: My last 3 biggest clients came from 3 deep relationships, not 30 business cards.

To every introvert reading this:

Your superpower isn't broken. It's just different.

Use it.

♻️ Share if you know an introvert who needs to hear this.

#Introvert #Networking #CareerGrowth #Leadership #PersonalBrand""",
        "slop_score": 74,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "The introvert origin story, the numbered emoji system, the 'your superpower isn't broken' affirmation. Asking to share for introverts ensures maximum ironic resharing by extroverts.",
    },
    {
        "type": "linkedin",
        "title": "Most People Work Hard. The Top 1% Work Smart. Here's the Difference.",
        "content": """I used to work 70-hour weeks.

I was busy. Constantly.

But I wasn't building anything.

Then I met a mentor who said something that broke my brain:

"Show me your calendar and I'll show you your priorities."

I looked at my calendar.

Meetings: 34 hours/week.
Deep work: 3 hours/week.

I was managing. Not building.

I made one change: I blocked 9am-12pm every single day as a deep work zone.

No meetings. No Slack. No email.

3 months later:

→ Shipped a product that took 8 months to get out the door
→ Closed 2 enterprise deals I'd been "nurturing" for 6 months
→ Wrote 40,000 words of content that now drives 60% of our inbound

Hard work is necessary. But focused work is the multiplier.

What does your calendar actually say about your priorities?

#Productivity #DeepWork #Leadership #CalendarBlocking #TimeManagement""",
        "slop_score": 80,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "34 hours of meetings vs 3 hours of deep work — suspiciously round numbers. The mentor's 'show me your calendar' line has been in 4,000 LinkedIn posts this month. Content now drives 60% of inbound, mentioned off-hand like it's nothing.",
    },
    # ── Twitter ───────────────────────────────────────────────────────────
    {
        "type": "twitter",
        "title": "The Thread That Will Make You Rich (If You Actually Apply It)",
        "content": """I studied 500 millionaires.

Here are the 7 habits they ALL share:

(This took me 3 years. You'll read it in 3 minutes. Save it.)

🧵1/

1. They wake up before 6 AM — not because it's trendy. Because the first 2 hours of the day are worth 10x the rest.

2. They read 30 minutes minimum. Every. Single. Day. Not social media. Books.

3. They say no to almost everything. Their calendar has white space. White space is where ideas live.

4. They have ONE priority per day. Not a to-do list. One thing that, if done, makes everything else easier.

5. They track their net worth monthly. What gets measured gets managed.

6. They surround themselves with people who are 10x ahead of them. Your circle is your ceiling.

7. They ship before they're ready. Perfectionism is procrastination with better PR.

Which one hit hardest? RT if you learned something. 🔁""",
        "slop_score": 88,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Studied 500 millionaires (methodology unstated). The 'took me 3 years, read in 3 minutes' math is doing incredible work. 'Perfectionism is procrastination with better PR' almost slaps but arrives surrounded by six other aphorisms.",
    },
    {
        "type": "twitter",
        "title": "Unpopular opinion:",
        "content": """Unpopular opinion:

Most productivity advice is written by people who don't actually produce anything.

They produce productivity advice.

Think about that.""",
        "slop_score": 55,
        "verdict": "CERTIFIED SLOP 🗑️",
        "roast": "Four lines. Recursive self-awareness. The 'think about that' kicker is the period at the end of a gun. Somewhat self-aware for a post about productivity content appearing on a content platform.",
    },
    {
        "type": "twitter",
        "title": "How I went from $0 to $10k/month in 6 months (exact steps)",
        "content": """How I went from $0 to $10k/month in 6 months.

No code. No team. No ads.

Exact steps 🧵:

Step 1: Found one painful problem people would pay to solve. (Spent 2 weeks just asking questions in Reddit/Facebook groups. Zero selling.)

Step 2: Built the ugliest possible MVP in a weekend. Notion + Typeform + Stripe. That's it.

Step 3: DMed 50 people who had the problem. Offered it free for feedback. Got 8 users.

Step 4: Raised price from $0 to $29/mo. Lost 2 users. Kept 6. That's $174 MRR.

Step 5: Wrote one Twitter thread about the problem. 2,000 retweets. 300 signups.

Step 6: Raised to $49/mo. Added one feature every two weeks based on user feedback only.

Month 6: 210 customers × $49 = $10,290 MRR.

The tools don't matter. The sequence does.

Save this.""",
        "slop_score": 71,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "Notion + Typeform + Stripe is the holy trinity of 'I am about to sell you a course.' The math checks out suspiciously well. 'Save this' at the end of a thread about building a business is a business.",
    },
    {
        "type": "twitter",
        "title": "The algorithm rewards one thing:",
        "content": """The algorithm rewards one thing:

Consistency.

Not quality.
Not originality.
Not truth.

Just. Keep. Posting.

Make of that what you will.""",
        "slop_score": 48,
        "verdict": "CERTIFIED SLOP 🗑️",
        "roast": "Posted consistently to warn you about the dangers of posting consistently. The 'make of that what you will' exit is elite disengagement energy. Ironically original.",
    },
    {
        "type": "twitter",
        "title": "Nobody talks about the loneliness of entrepreneurship",
        "content": """Nobody talks about the loneliness of entrepreneurship.

The 2 AM spirals. The friends who stopped getting it. The smile you put on for the team while you're quietly panicking.

I've had months where revenue was up and I felt completely empty.

Building something real is the hardest thing I've ever done.

And I'd do it again without hesitation.

But let's stop pretending it's just hustle and highlight reels.

It's also this. 

If you're in it right now — you're not alone.""",
        "slop_score": 65,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "The vulnerability post. Revenue up, feeling empty — the entrepreneur's paradox disclosed at just enough distance to feel safe. '2 AM spirals' is doing a lot of emotional heavy lifting. Lands warmer than most but still ends with a CTA disguised as solidarity.",
    },
    # ── Blog ──────────────────────────────────────────────────────────────
    {
        "type": "blog",
        "title": "Why Everything You Know About Productivity Is Wrong",
        "content": """I'm going to say something that might make you angry.

You're not unproductive because you lack discipline.

You're unproductive because you're optimizing for the wrong things.

For years, I tracked my hours. I built elaborate morning routines. I read every productivity book published after 2015. I had color-coded calendars and time-blocking systems that would make a NASA engineer weep with joy.

And I was still behind.

Still reactive. Still overwhelmed. Still ending every week with a to-do list longer than the one I started with.

Then I discovered something that changed everything.

The most productive people I know don't manage time.

They manage energy.

Here's the difference, and why it's costing you thousands of hours a year.

[Continue reading → 847 words of frameworks, a 5-step system, and a call to join my newsletter]""",
        "slop_score": 83,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Opens with 'I'm going to say something that might make you angry' — a classic false alarm. The NASA calendar detail is inspired. Pivots from time management to energy management, a pivot that has appeared in approximately 14,000 blog posts since 2018.",
    },
    {
        "type": "blog",
        "title": "The Brutal Truth About Why Your Startup Is Failing",
        "content": """You don't have a marketing problem.

You don't have a funding problem.

You don't have a hiring problem.

You have a clarity problem.

I've worked with over 200 startups in the last 5 years. The ones that fail share one trait: the founder cannot explain, in one sentence, what they do and why it matters.

Not for investors. Not for press. For their mom.

If your mom can't understand what you do, your customer can't either. And your customer has to choose between you and Netflix every single day.

Here's the clarity framework I use with every founder I work with:

We help [specific person] do [specific thing] so they can [specific outcome].

That's it.

Billion-dollar companies can fill that sentence in 10 seconds.

Can you?

If not — that's where we start.

Book a call below. First 20 minutes are free. No pitch, just clarity.

📅 [Schedule Here]""",
        "slop_score": 77,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "Three 'you don't have a X problem' setups before the big reveal: clarity. The mom test dressed up in a framework. Ends with a disguised sales pitch behind a complimentary 20 minutes.",
    },
    {
        "type": "blog",
        "title": "I Read 52 Books Last Year. Here's the Only One That Mattered.",
        "content": """Last year I set a goal: read one book per week for the full year.

I hit it.

52 books. Every genre. Business, biography, philosophy, fiction, history.

I kept a spreadsheet. Took notes. Wrote summaries.

And at the end of December, I sat down and asked myself: which one actually changed how I act?

Not how I think. How I act.

The answer shocked me.

It wasn't Atomic Habits (though it's excellent).
It wasn't The Almanack of Naval Ravikant (though I've gifted it 11 times).
It wasn't 4-Hour Work Week, or Sapiens, or anything on any "top CEO reads" list.

It was a 200-page book by a retired schoolteacher about how to have hard conversations.

I won't spoil the title — because I want you to earn it.

[Answer revealed 800 words from now, after a 6-part framework and an email signup wall]""",
        "slop_score": 86,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Read 52 books, kept a spreadsheet (very relatable), gifted Naval's Almanack 11 times (name drop with receipts), and the mystery book is locked behind 800 words and an email wall. The 'earn it' framing for an email signup is genuinely audacious.",
    },
    {
        "type": "blog",
        "title": "The Real Reason You're Not Getting Promoted (It's Not What You Think)",
        "content": """I'm going to be honest with you.

The reason you're not getting promoted isn't your performance.

Your performance is probably fine. Maybe even excellent.

The reason you're not getting promoted is that the people who decide promotions don't think about you when they have a gap to fill.

Visibility is not vanity. It's a career strategy.

Here's what high performers who get promoted consistently do differently:

They solve problems in public. Not privately, not in a ticket, not in a Slack DM nobody reads. They share the win in the meeting where the decision-makers are sitting.

They make their manager's job easier. They don't just deliver results — they frame results in language that makes their manager look good upward.

They build allies, not just fans. One sponsor in a room making a promotion decision is worth 100 colleagues who "think highly of you."

This is the uncomfortable truth:

Being excellent in private is a habit. Being excellent in public is a career.

Save this post. Then go to your next meeting and try one of these.

#CareerGrowth #Promotion #Leadership #Visibility #ProfessionalDevelopment""",
        "slop_score": 78,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Opens with 'I'm going to be honest with you' — always ominous. The real reason for no promotion is visibility, packaged in three bullet points that have appeared in every career coach's content since 2020. 'Being excellent in private is a habit. In public, a career.' — framing that LinkedIn will tattoo on itself.",
    },
    {
        "type": "linkedin",
        "title": "I Was Laid Off at 42. It Was the Best Thing That Ever Happened to Me.",
        "content": """April 14th, 2022.

I walked into a meeting I wasn't scheduled for.

22 years. Gone in 11 minutes.

I drove home and sat in my car for 45 minutes before going inside.

I didn't tell my wife for 3 hours.

That was 2 years ago.

Today I run my own consulting firm. I choose my clients. I work 35 hours a week instead of 60. I made more last year than my best year at the company.

But here's what I didn't expect:

The layoff didn't give me money. It gave me back my identity.

I spent 22 years building someone else's dream. I had forgotten I had one.

If you've been laid off recently:

I know it doesn't feel like it right now.

But the door just opened.

You just can't see where it leads yet.

DM me if you want to talk. I mean that.

#Layoffs #CareerTransition #Entrepreneurship #Resilience #NewBeginnings""",
        "slop_score": 73,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "The timestamp precision (April 14th, 22 years in 11 minutes) establishes credibility through specificity. Sat in the car for 45 minutes before telling his wife — vulnerable detail deployed expertly. Revenue flex inserted at the 3rd paragraph. 'DM me' generates approximately 400 DMs, none of which he responds to.",
    },
    {
        "type": "twitter",
        "title": "Hot take: 'Work-life balance' is a myth for founders",
        "content": """Hot take:

"Work-life balance" is a myth for founders.

There is no balance. There's just life.

Some seasons are all-in. Some seasons you pull back and breathe.

Stop trying to balance a seesaw and start riding waves instead.

The goal isn't equilibrium.

It's surfing.""",
        "slop_score": 68,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "Waves. Surfing. The ocean metaphor arrives right on schedule. 'Stop balancing a seesaw, start surfing' is the kind of sentence that sounds profound for exactly 4 seconds before you realize it said nothing.",
    },
    {
        "type": "linkedin",
        "title": "Fired My Best Client Last Week. Zero Regrets.",
        "content": """They paid $18,000/month.

They also sent emails at 11 PM expecting same-night responses.
Moved the scope. Twice. Without adjusting the contract.
Made my team feel like vendors, not partners.
Questioned every decision in front of their own junior staff.

I gave them 30 days notice last Monday.

My team's response? Three people cried. Tears of relief.

Here's what I've learned about premium clients:

The best ones make your team better.
The worst ones make your team look for other jobs.

Revenue isn't the only metric that matters.

If a client costs more than they pay — in stress, morale, and time — they're not a premium client.

They're an expense with a logo.

Know your worth. Then charge it.

#AgencyLife #ClientManagement #Leadership #BusinessGrowth #KnowYourWorth""",
        "slop_score": 81,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "$18k/month disclosed by line 2. Team crying tears of relief is a suspiciously cinematic detail. 'An expense with a logo' is genuinely a good line, which makes the surrounding slop more insulting.",
    },
    {
        "type": "blog",
        "title": "Stop Calling It 'Passive Income.' There's Nothing Passive About It.",
        "content": """I have 7 income streams.

Every personal finance influencer loves to call this 'passive income.'

I call it what it actually is: deferred labor.

I spent 3 years building the systems, the content, the courses, the SaaS products. I worked harder than I ever did at my 9-5. I missed dinners. I built on weekends. I launched and failed and relaunched.

Now those streams produce money while I sleep.

But if I stop maintaining them — stop updating, stop marketing, stop engaging — they decay within months.

Nothing is truly passive.

The question isn't: "How do I make money passively?"

The question is: "What kind of work am I willing to do now so I can do less later?"

That's the real conversation. And nobody's having it.

Seven income streams. The breakdown and the build:
→ Newsletter (2 years to monetize)
→ Course (18 months to profit)
→ SaaS (still not profitable at month 14)
→ Consulting (immediate, still my largest)
→ Affiliate (embarrassingly small, everyone exaggerates this)
→ Royalties (smallest, most passive)
→ Dividends (requires capital most people don't have)

[Full breakdown in the next 1,200 words behind an email wall]""",
        "slop_score": 69,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "Seven income streams listed with tactical precision, including 'embarrassingly small affiliate income' — a rare self-deprecating detail that builds instant credibility. The full breakdown is behind an email wall. The real passive income is the email list he's building right now.",
    },
    {
        "type": "twitter",
        "title": "Thread: Everything I wish someone told me before I quit my job",
        "content": """Thread: Everything I wish someone told me before I quit my job to build a startup.

1/ Your savings will run out faster than you think. 18 months becomes 11 months the moment you need a lawyer, a designer, and AWS.

2/ Your friends won't understand. Not because they're bad friends. Because there's no reference frame for what you're doing. Loneliness is the hidden startup cost.

3/ The product is not the hard part. Selling the product is the hard part. Distribution eats product for breakfast, lunch, and dinner.

4/ Your first customers are not your real customers. They're your co-founders without equity. Listen to them like it.

5/ "Move fast and break things" was written by someone who could afford to fix what they broke. Most founders can't.

6/ The only metric that matters in year one: are customers paying and coming back?

7/ You will not be ready. Ship anyway.

If this was useful, follow me. I write about building real companies without the fake startup glamour.

↩️ RT if one of these hit.""",
        "slop_score": 72,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "Seven-point thread where every point lands slightly better than it should. '18 months becomes 11 months the moment you need a lawyer' is uncomfortably accurate. The 'follow me for real startup truth' CTA at the end of a numbered thread is the oldest move in the book.",
    },
    {
        "type": "linkedin",
        "title": "I Almost Quit Last Tuesday. Here's What Stopped Me.",
        "content": """I'm going to be vulnerable for a second.

Last Tuesday I opened a job board.

For the first time in 4 years of running my own business, I actually searched for jobs.

Not casually. Seriously.

A deal fell through. A team member quit. A client delayed payment. All in the same week.

I sat at my desk at 9 PM and thought: maybe I'm just not cut out for this.

Then my phone rang.

It was a client from 2 years ago. Someone I hadn't spoken to since we wrapped the project.

"I just referred you to three people. Wanted to let you know."

I closed my laptop.

Made a cup of tea.

And remembered why I started.

You won't hear this from the highlight reel crowd:

Some weeks, the only thing that keeps you going is one phone call you weren't expecting.

That's okay.

That's enough.

#Entrepreneurship #Founder #Resilience #Mindset #GrowthMindset""",
        "slop_score": 77,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "The vulnerability post with divine timing. Three bad things happened simultaneously (the trifecta), and was saved by a phone call from a ghost client. 'Made a cup of tea' is doing tremendous emotional work. The word 'vulnerable' appears in the first sentence.",
    },
    {
        "type": "blog",
        "title": "The Email That Generated $47,000 in 72 Hours",
        "content": """In April, I sent an email to my list.

438 words. No images. No fancy formatting. Plain text.

It generated $47,000 in 72 hours.

Not because of the subject line (though that helped).
Not because of the offer (though that mattered).

Because of one thing I did differently.

I wrote it like I was writing to one person.

Her name is Sarah. She's 34. She runs a small agency. She's good at what she does but she's exhausted and slightly resentful of clients who don't value her work.

I know Sarah because I've talked to her. Not metaphorically. Literally. I have done 200+ customer interviews.

The email didn't address "my subscribers."

It addressed Sarah.

And 47,000 dollars later, I'm telling you: write to one person.

Every time.

The template, the subject line, and the full breakdown of this campaign in the next 1,400 words.

(Plus the exact email itself — which you can steal.)

[Continue reading →]""",
        "slop_score": 84,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "$47,000 in 72 hours from 438 words — very specific, maximally credible. 'Sarah' is a composite customer persona presented as a real person with a name and a specialty. The advice (write to one person) is genuinely good, which is the sneakiest kind of slop. The email you can 'steal' is behind a paywall.",
    },
    {
        "type": "twitter",
        "title": "The difference between people who get rich and people who stay broke:",
        "content": """The difference between people who get rich and people who stay broke:

Rich: invest first, spend what's left
Broke: spend first, invest what's left

That's 90% of it.

The other 10% is income. But income without the first part = lifestyle inflation.

Fix the order. Change the outcome.""",
        "slop_score": 61,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "Rich/Broke binary with a two-line formula. The '90%/10%' split sounds researched but is vibes-based. 'Fix the order. Change the outcome.' is four words that will appear on 2,000 Instagram graphics by next Thursday.",
    },
    {
        "type": "linkedin",
        "title": "Quiet Quitting Isn't a Gen Z Problem. It's a Management Problem.",
        "content": """Everyone's talking about quiet quitting like it's a generational character flaw.

It's not.

Quiet quitting is what happens when someone has been loud quitting for 18 months and nobody listened.

I've managed teams for 12 years.

Every person I've seen "quiet quit" showed the signs 6-12 months earlier:

→ They raised a concern. It was dismissed.
→ They asked for growth. The path was unclear.
→ They went above and beyond. It went unnoticed.
→ They stopped going above and beyond. Nobody noticed that either.

Quiet quitting is rational behavior in an irrational system.

If you're a leader and your team is quiet quitting — the question isn't "what's wrong with them?"

It's "what did we miss, and when?"

The best retention strategy isn't a ping pong table.

It's listening the first time.

#Leadership #Management #HR #EmployeeEngagement #QuietQuitting""",
        "slop_score": 70,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "Takes a contrarian stance on quiet quitting (management's fault, not employees') — a position that generates peak engagement from both sides. The four-bullet decline timeline is accurate enough to sting. 'The best retention strategy isn't a ping pong table' is the kicker every HR influencer has posted at least twice.",
    },
]

# ── Helpers ─────────────────────────────────────────────────────────────────

def api(method: str, path: str, body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(f"{URL}{path}", data=data, headers=H, method=method)
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()[:200]}")
        return None

def get_current_challenge_id() -> str | None:
    result = api("POST", "/rest/v1/rpc/get_or_create_current_challenge", {})
    if result and len(result) > 0:
        return result[0]["id"]
    return None

def get_already_posted_titles() -> set:
    """Fetch recent post titles to avoid duplicates."""
    result = api("GET", "/rest/v1/posts?select=title&order=created_at.desc&limit=50")
    if result:
        return {r["title"] for r in result}
    return set()

def pick_post(exclude_titles: set) -> dict:
    available = [p for p in POSTS if p["title"] not in exclude_titles]
    if not available:
        available = POSTS  # all used — reset
    return random.choice(available)

def add_reactions(post_id: str):
    voters = random.sample(VOTER_POOL, random.randint(3, 7))
    slop_count = random.randint(len(voters) - 2, len(voters))
    for i, uid in enumerate(voters):
        rtype = "slop" if i < slop_count else "not_slop"
        api("POST", "/rest/v1/reactions", {
            "post_id": post_id,
            "user_id": uid,
            "reaction_type": rtype,
        })

# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "feed"
    if mode not in ("feed", "challenge"):
        print("Usage: auto_post.py [feed|challenge]")
        sys.exit(1)

    exclude = get_already_posted_titles()
    post_data = pick_post(exclude)
    user_id = random.choice(USERS)

    challenge_id = None
    if mode == "challenge":
        challenge_id = get_current_challenge_id()
        if not challenge_id:
            print("Could not fetch current challenge — posting to feed instead")
            mode = "feed"

    payload = {
        "user_id": user_id,
        "title": post_data["title"],
        "content": post_data["content"],
        "slop_score": post_data["slop_score"],
        "verdict": post_data["verdict"],
        "roast": post_data["roast"],
        "challenge_id": challenge_id,
    }

    result = api("POST", "/rest/v1/posts", payload)
    if result and len(result) > 0:
        post_id = result[0]["id"]
        add_reactions(post_id)
        print(f"✓ [{mode.upper()}] '{post_data['title'][:60]}' → {post_id[:8]} (score: {post_data['slop_score']})")
    else:
        print("✗ Failed to post")
        sys.exit(1)

if __name__ == "__main__":
    main()
