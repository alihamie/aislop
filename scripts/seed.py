#!/usr/bin/env python3
"""Seed script: creates fake users, profiles, posts, and reactions."""

import urllib.request, urllib.error, json, random, uuid
from datetime import datetime, timedelta, timezone

import os
URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://thgblghowoechnsexnpk.supabase.co")
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def req(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(f"{URL}{path}", data=data, headers=HEADERS, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=15)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:300]
        print(f"  !! {method} {path} → {e.code}: {err}")
        return None


# ── Fake usernames ──────────────────────────────────────────────────────────
USERNAMES = [
    "slopwatcher99", "judgedredd_", "notarobot42", "sloptector", "roastmaster3000",
    "aisnitch", "garbagefire", "fakedetector", "slopscanner", "humancheck",
    "vibecheck404", "truthteller_", "slopalert", "aidetect", "realnesspolice",
    "promptpolice", "buzzwordbane", "slopsheriff", "junkfilter", "rhetoriccop",
]

# ── Post content ─────────────────────────────────────────────────────────────
POSTS = [
    {
        "title": "Humbled and Grateful for This Journey 🙏",
        "content": "Humbled and grateful to announce that after 6 incredible years of synergizing cross-functional stakeholder ecosystems, I've decided to embark on an exciting new journey of personal and professional transformation.\n\nThe truth is, I didn't just 'get promoted.' I EVOLVED. 🚀\n\nAlong the way, I've learned that success isn't about the destination — it's about leveraging your authentic value proposition to disrupt the paradigm of what's possible.\n\nTo every mentor, colleague, and LinkedIn connection who has been part of this tapestry of growth: thank you. You know who you are. 🙏\n\nThe best is yet to come. Stay tuned for some VERY exciting announcements.\n\n#Grateful #Leadership #Growth #Synergy #NextChapter",
        "slop_score": 92,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "I've seen more authentic emotion from a vending machine error message. This post is 95% buzzwords, 4% humble-bragging, and 1% actual information.",
    },
    {
        "title": "Introducing NexaFlow™ — The Future of Productivity",
        "content": "Introducing NexaFlow™ — the world's first AI-powered, blockchain-enabled, human-centric platform that leverages machine learning to disrupt the $4.7 trillion productivity landscape.\n\nAt its core, NexaFlow™ is more than software. It's a movement.\n\nWe believe that in today's fast-paced, ever-evolving digital ecosystem, the convergence of data-driven insights and holistic user journeys creates unprecedented opportunities for value creation at scale.\n\nOur proprietary algorithm has been trained on over 2 billion data points to deliver personalized, actionable, real-time synergies that empower teams to do more with less while fostering a culture of innovation.\n\nWe're not just building a product. We're building the future. 🌍",
        "slop_score": 88,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "Congratulations, you've managed to use 'blockchain' and 'holistic user journeys' in the same pitch deck. The only thing disrupted here is my ability to read.",
    },
    {
        "title": "A Heartfelt Apology From Our Team",
        "content": "Dear Valued Customer,\n\nFirst and foremost, we want to express our sincere appreciation for your continued loyalty and support. Your experience matters deeply to us, and we take all feedback seriously as part of our ongoing commitment to excellence.\n\nWe understand that your recent interaction may not have met the high standards you rightfully expect from us. Please know that we are taking immediate and decisive action to ensure this does not happen again.\n\nAt [Company], we believe that every touchpoint is an opportunity to deliver world-class, customer-centric solutions that exceed expectations. While we fell short in this instance, we remain steadfast in our dedication to your satisfaction.\n\nAs a token of our appreciation, please find attached a 10% discount on your next purchase.\n\nWarmly,\nThe [Company] Team",
        "slop_score": 79,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "They left '[Company]' in the template. This apology apologizes for nothing, promises nothing, and delivers a discount code as an emotional Band-Aid. Classic.",
    },
    {
        "title": "10 Habits of Highly Successful People You Need Now",
        "content": "Success isn't an accident. It's a series of intentional choices made consistently over time.\n\nHere are 10 habits that separate high-achievers from everyone else:\n\n1. They wake up early. Most CEOs start their day before 5 AM.\n2. They prioritize deep work. No distractions, no notifications.\n3. They read voraciously. The average billionaire reads 50 books per year.\n4. They exercise daily. A healthy body fuels a productive mind.\n5. They journal their thoughts. Clarity comes from reflection.\n6. They network intentionally. Your network is your net worth.\n7. They embrace failure as feedback.\n8. They practice gratitude every morning.\n9. They invest in continuous learning.\n10. They have a clear vision for their future.\n\nWhich of these will you start TODAY? Drop a 🔥 below!",
        "slop_score": 85,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "Woke up early, read 50 books, journaled, networked, exercised, and embraced failure — all before 6 AM. Truly a marvel of human achievement or a ChatGPT fever dream.",
    },
    {
        "title": "As An AI Language Model...",
        "content": "As an AI language model, I want to preface this response by acknowledging that the following information is provided for educational purposes only and should not be construed as professional advice. I am committed to providing helpful, accurate, and balanced information to the best of my abilities.\n\nWith that being said, I understand your query relates to the nature of artificial intelligence and its implications for modern society. This is indeed a fascinating and multifaceted topic that touches on philosophy, ethics, technology, and human psychology.\n\nIt is important to note that while AI systems like myself have made remarkable strides in natural language processing and generation, we remain fundamentally different from human intelligence in several key respects.\n\nI hope this comprehensive overview has been helpful in addressing your question. Please feel free to ask any follow-up questions you may have!",
        "slop_score": 96,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "It opened with 'As an AI language model' and I blacked out. This is pure, uncut, pharmaceutical-grade AI slop. The pinnacle. The apex predator of generated garbage.",
    },
    {
        "title": "My Sourdough Journey: A Story of Patience and Flour",
        "content": "If you've been following along on my sourdough journey, you know that this recipe has been years in the making. I still remember the first time I tried to bake sourdough — it was a cold November morning, and I had just moved into my first apartment. The loaf was dense, pale, and honestly? Kind of sad.\n\nBut I kept going. Because that's what sourdough teaches you: patience, persistence, and the importance of a warm proving environment.\n\nToday, I'm finally ready to share my Perfect Sourdough Recipe with you. Before we get into the actual recipe (scroll down for the jump-to-recipe button!), I want to talk about the science of fermentation, the history of bread in Western civilization, and why I think sourdough changed my relationship with food.\n\nAlso, a quick note: this post contains affiliate links. If you purchase through my links, I earn a small commission at no extra cost to you!",
        "slop_score": 68,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "400 words and we still haven't seen a single gram of flour. A masterclass in saying nothing. The recipe is somewhere in page 4, after the author's childhood trauma.",
    },
    {
        "title": "The Future of Work Is Here. Are You Ready?",
        "content": "The world of work is changing. Fast.\n\nRemote work, AI automation, the gig economy, and the Great Resignation have fundamentally shifted what employees expect — and what employers must deliver.\n\nThe organizations that will thrive in this new landscape are those that:\n\n✅ Prioritize employee wellbeing as a strategic imperative\n✅ Embrace flexible, outcome-based performance models\n✅ Foster psychological safety and inclusive cultures\n✅ Leverage technology to amplify human potential, not replace it\n✅ Build resilient, adaptive teams capable of navigating uncertainty\n\nThe future belongs to companies that treat their people as their greatest asset.\n\nLeaders: the question isn't whether the future of work is coming. It's whether you'll be ready.\n\nWhat does the future of work mean to you? Share your thoughts in the comments 👇\n\n#FutureOfWork #Leadership #HR #Culture",
        "slop_score": 77,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Five bullet points with checkmarks, three rhetorical questions, and zero original insights. This LinkedIn post wrote itself. Literally. It was written by AI.",
    },
    {
        "title": "Unlock Your Best Self: A Guide to Holistic Wellness",
        "content": "In today's fast-paced world, it's easy to neglect the most important person in your life: yourself.\n\nHolistic wellness isn't just about diet and exercise. It's about nurturing your mind, body, AND soul in harmony.\n\nHere's what a truly balanced wellness routine looks like:\n\n🧘 Morning meditation (even 5 minutes!)\n💧 Drink 8 glasses of water daily\n🌿 Incorporate adaptogens into your routine\n📚 Read for personal growth\n🛁 Practice self-care rituals\n🌙 Prioritize quality sleep\n\nRemember: you cannot pour from an empty cup. When you invest in yourself, you show up better for everyone around you.\n\nYour wellness journey starts with a single step. Take it today. ✨\n\nSave this post for when you need a reminder! 💛",
        "slop_score": 82,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Adaptogens, empty cups, and saving posts for inspiration. This is what happens when a wellness influencer and a chatbot have a baby. Meditate on that.",
    },
    {
        "title": "Our Brand Story: More Than Just a Company",
        "content": "We didn't start [Brand Name] because we saw a market opportunity.\n\nWe started it because we believed the world deserved better.\n\nBetter products. Better experiences. Better values.\n\nOur founder, [Name], had a vision: to create a company that puts people first — always. A company where innovation meets purpose. Where every product tells a story, and every customer feels like family.\n\nWe're not just selling [product category]. We're selling a lifestyle. A community. A movement.\n\nWhen you choose [Brand Name], you're not just making a purchase. You're making a statement.\n\nJoin us. Let's build something beautiful together. 🌟",
        "slop_score": 74,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "They forgot to fill in [Brand Name] and [product category] but published it anyway. This brand story tells the story of exactly zero things. Peak placeholder energy.",
    },
    {
        "title": "5 Ways AI Will Transform Your Business in 2024",
        "content": "Artificial intelligence is no longer a futuristic concept — it's here, and it's reshaping industries at an unprecedented pace.\n\nHere are 5 ways AI will transform your business this year:\n\n1. **Hyper-personalization at scale**: AI enables businesses to deliver tailored experiences to millions of customers simultaneously.\n2. **Predictive analytics**: Move from reactive to proactive decision-making.\n3. **Process automation**: Eliminate repetitive tasks and free your team for high-value work.\n4. **Enhanced customer service**: 24/7 support via intelligent chatbots.\n5. **Data-driven insights**: Turn raw data into actionable intelligence.\n\nThe businesses that adopt AI today will be tomorrow's market leaders. Those that don't risk becoming obsolete.\n\nAre you ready to embrace the AI revolution?\n\n#AI #Business #Innovation #DigitalTransformation",
        "slop_score": 71,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Written by AI, about AI, to convince you to buy AI. The ouroboros of slop. The word 'unprecedented' alone earns this a conviction.",
    },
    {
        "title": "Setting Intentions vs. Goals: What Nobody Tells You",
        "content": "There's a difference between setting goals and setting intentions. And it's costing you your peace.\n\nGoals are external. They're tied to outcomes, metrics, and validation from others.\n\nIntentions are internal. They're rooted in your values, your energy, and your authentic self.\n\nWhen we chase goals, we often find ourselves running on empty — achieving, but not fulfilled.\n\nWhen we set intentions, we align our actions with our deeper purpose. We show up fully. We experience joy in the process, not just the outcome.\n\nThis week, I invite you to release one goal and replace it with an intention.\n\nNot 'I want to lose 10 pounds' but 'I intend to nourish my body with love.'\nNot 'I want to make more money' but 'I intend to create value that flows back to me.'\n\nNotice how that shift feels. ✨",
        "slop_score": 86,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "We're replacing measurable goals with vibes. 'Create value that flows back to me' is what happens when therapy-speak escapes the group chat.",
    },
    {
        "title": "My Honest Review of the MacBook Air M3",
        "content": "I've been using the MacBook Air M3 for three months now, and here are my actual thoughts.\n\nThe battery life is genuinely ridiculous — I regularly get 14-15 hours of mixed use. That's not a typo.\n\nThe screen is sharp enough that after two weeks I stopped noticing it, which is the best compliment I can give a display.\n\nThe silence is eerie. No fan noise ever. During a 2-hour video export it stayed completely quiet and barely warm.\n\nDownsides: two USB-C ports is still annoying. You will need a hub. Accept it.\n\nWould I buy it again? Yes, without hesitation. It's the best laptop I've ever owned for everyday work, and I've owned a lot of laptops.",
        "slop_score": 12,
        "verdict": "BARELY SLOP 😬",
        "roast": "Annoyingly well-written. Clear, opinionated, actually useful. I looked for the AI fingerprints and found none. Acquitted — but I'm watching you.",
    },
    {
        "title": "Important Update Regarding Our Privacy Policy",
        "content": "At [Company], we are committed to protecting your privacy and ensuring the security of your personal data. As part of our ongoing efforts to maintain transparency and comply with applicable data protection regulations, we are updating our Privacy Policy effective [Date].\n\nKey changes include:\n• Enhanced data collection disclosures\n• Updated third-party sharing provisions\n• Clearer opt-out mechanisms\n• Additional rights for users in applicable jurisdictions\n\nBy continuing to use our services after [Date], you acknowledge and agree to the updated Privacy Policy. If you do not agree with these changes, you may discontinue use of our services at any time.\n\nFor questions, please contact our Privacy Team at privacy@[company].com.\n\nThank you for your continued trust in us.\n\nThe [Company] Privacy Team",
        "slop_score": 61,
        "verdict": "PREMIUM GARBAGE 💩",
        "roast": "Three placeholders left in a privacy policy. They left '[Date]' in twice. This document was assembled at 4:52 PM on a Friday by someone who had somewhere to be.",
    },
    {
        "title": "How I Manifested My Dream Life (And How You Can Too)",
        "content": "Three years ago, I was broke, burned out, and living in a studio apartment with a broken radiator.\n\nToday? I run a six-figure business, work from anywhere in the world, and wake up every morning genuinely excited about my life.\n\nThe secret? I got intentional about what I wanted to attract.\n\nHere's my manifestation framework:\n1. Clarity: Get crystal clear on your vision\n2. Belief: Embody the version of you who already has it\n3. Action: Take aligned, inspired action daily\n4. Release: Detach from outcomes and trust the process\n5. Gratitude: Acknowledge every win, no matter how small\n\nManifesting isn't magic. It's a mindset. It's a practice. It's a way of life.\n\nDM me 'MANIFEST' and I'll send you my free workbook. 🌟✨💫",
        "slop_score": 90,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "Babe, that's just... having goals. And also a DM funnel. The universe manifested this post directly into my slop detector.",
    },
    {
        "title": "The Pomodoro Technique Changed How I Work",
        "content": "I spent years fighting focus. Then I found the Pomodoro Technique and my life genuinely changed.\n\nThe concept: work for 25 minutes, break for 5. Repeat four times, then take a longer break.\n\nThat's it. Deceptively simple.\n\nWhat I didn't expect: the time pressure makes tasks feel manageable. A vague 'work on project' becomes 'work on project for 25 minutes.' Way less intimidating.\n\nI've been doing it for eight months. I'm more productive AND I feel less wrecked at the end of the day.\n\nThe only downside is that I'm now that person who explains the Pomodoro Technique to everyone.\n\nSorry.",
        "slop_score": 18,
        "verdict": "BARELY SLOP 😬",
        "roast": "Self-aware, concise, ends with an apology. The author knows what they are. Barely slop. The judge is merciful today.",
    },
    {
        "title": "Embrace the Journey: Finding Peace in Uncertainty",
        "content": "Life is not a destination. It's a journey.\n\nAnd journeys, by their very nature, involve uncertainty.\n\nIn a world that demands certainty, productivity, and constant optimization, choosing to embrace the unknown is a radical act of self-love.\n\nWhen we release our need to control outcomes, we open ourselves to possibility. When we stop resisting what is, we begin to flow with the river of life.\n\nThis week, I encourage you to sit with discomfort. To breathe into the uncertainty. To trust that the universe has a plan, even when you can't see it.\n\nYou are exactly where you need to be. 🌊✨\n\nSave this. Share this. Tag someone who needs to hear this today. 💛\n\n#Mindfulness #Growth #Healing #Wellness #SpiritualJourney",
        "slop_score": 84,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "The universe has a plan and that plan apparently involves five hashtags and asking me to tag someone. I've sat with this discomfort. The discomfort is this post.",
    },
    {
        "title": "Why I Deleted Instagram and Never Looked Back",
        "content": "I deleted Instagram 18 months ago. No dramatic announcement, no goodbye post. Just gone.\n\nThe first week was weird. I kept picking up my phone and thumb-hovering where the app used to be.\n\nBy week three, I noticed something: I had opinions again. About music I actually liked, not what was algorithmically pushed at me. About my own life, not a curated highlight reel comparison.\n\nI'm not claiming purity — I'm still on Twitter (X, whatever) and I doom scroll as much as anyone.\n\nBut Instagram was the specific flavour of bad that got under my skin. The influencer-industrial complex, the fake candid photos, the relentless performative happiness.\n\nWould I go back? Ask me again in six months. But probably not.",
        "slop_score": 16,
        "verdict": "BARELY SLOP 😬",
        "roast": "Honest, hedged, non-preachy. Notes its own hypocrisy. The system almost has nothing to work with here. Minimal slop detected — investigate further.",
    },
    {
        "title": "How To Build a Personal Brand That Stands Out",
        "content": "Your personal brand isn't your logo. It's not your Instagram aesthetic. It's not even your content.\n\nYour personal brand is the feeling people have when they think of you.\n\nIn today's noisy digital landscape, standing out requires more than consistency — it requires authenticity, courage, and a clear point of view.\n\nHere's how to build a brand that resonates:\n\n🔑 Define your unique value proposition\n🔑 Show up consistently across platforms\n🔑 Share your story — vulnerably and authentically\n🔑 Add value before you ask for anything\n🔑 Engage with your community genuinely\n\nRemember: people buy from people they know, like, and trust.\n\nYour brand is your promise. Make it one worth keeping. 💼✨\n\n#PersonalBrand #Marketing #Entrepreneurship",
        "slop_score": 76,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Three key emojis in five bullet points. Your unique value proposition is that you wrote this post exactly like the 40,000 other personal branding posts written this week.",
    },
    {
        "title": "The night my flight got cancelled and I wrote this",
        "content": "Flight cancelled. Four hours in Denver airport. No lounge access. Gate B17, which smells like a Cinnabon had an argument with a Subway.\n\nI've eaten: one overpriced veggie wrap that was mostly lettuce and regret, two $14 airport beers, and a bag of trail mix that's 80% M&Ms (not complaining).\n\nMy laptop battery is at 31%. I'm writing this partially to feel productive and partially because the man across from me has been on speakerphone for 47 minutes.\n\nI will make my connection. Everything will be fine. But right now, in this moment, Gate B17 is a purgatory of fluorescent light and Fox News on mute.\n\nShoutout to whoever designed airport seating — may your own chairs be slightly too hard.",
        "slop_score": 9,
        "verdict": "BARELY SLOP 😬",
        "roast": "Specific, funny, grounded in real misery. The M&M detail alone disqualifies this from real slop consideration. The judge rules: painfully human.",
    },
    {
        "title": "Synergizing Core Competencies for Maximum Value Delivery",
        "content": "In the current business landscape, organizations must leverage their core competencies to create synergistic value propositions that resonate with stakeholders across the entire ecosystem.\n\nBy implementing a holistic, end-to-end approach to operational excellence, forward-thinking enterprises can unlock unprecedented growth opportunities while simultaneously driving bottom-line impact and top-line revenue acceleration.\n\nKey strategic imperatives include:\n• Cross-functional alignment of KPIs and OKRs\n• Agile transformation of legacy infrastructure\n• Human-centered design thinking at scale\n• Data-driven decision-making frameworks\n• Continuous improvement and kaizen culture cultivation\n\nOrganizations that fail to embrace this paradigm shift risk commoditization and irrelevance in an increasingly competitive, disruption-prone marketplace.\n\nThe time to act is now. The window of opportunity is closing.",
        "slop_score": 98,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "This is what happens when you ask AI to write a business strategy and it achieves sentience but only knows buzzwords. I counted 23 corporate euphemisms in 150 words. A new record.",
    },
    {
        "title": "My therapy taught me this one thing about anger",
        "content": "I spent most of my twenties convinced that anger was bad and I needed to get rid of it.\n\nTherapy taught me: anger is information.\n\nIt tells you a boundary has been crossed. It tells you something matters to you. It's not a flaw — it's a signal.\n\nThe problem isn't the anger. It's what we do with it: suppress it, explode it, or turn it inward.\n\nNow when I notice anger, I try to ask: what is this protecting? What does it need?\n\nUsually it needs to be heard, not extinguished.\n\nThis took me an embarrassingly long time to figure out. Writing it down anyway.",
        "slop_score": 22,
        "verdict": "BARELY SLOP 😬",
        "roast": "Therapy content that isn't completely insufferable? Rare. Specific, not preachy, actually ends with vulnerability. The judge marks it barely slop but acknowledges the work.",
    },
    {
        "title": "7 Morning Routine Hacks to 10x Your Productivity",
        "content": "Want to know the secret of the world's most productive people?\n\nIt starts before 6 AM.\n\nHere are 7 morning routine hacks that will literally 10x your output:\n\n1. 🌅 Wake up at 5 AM — your most creative hours are before the world wakes up\n2. 💧 Drink 500ml of water IMMEDIATELY — hydrate before caffeinate\n3. 📔 Write 3 pages of stream-of-consciousness journaling (morning pages)\n4. 🧘 10 minutes of breathwork or meditation\n5. 💪 Move your body — even a 20-minute walk counts\n6. 📚 Read 10 pages of a non-fiction book\n7. 🎯 Write your top 3 priorities for the day BEFORE checking any devices\n\nDo this for 30 days. Your life will not be the same.\n\nSave this post and thank me later 🙏\n\n#MorningRoutine #Productivity #Success #5AMClub",
        "slop_score": 89,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "You have now added 90 minutes to your morning that you don't have and seven new sources of guilt when you skip them. 'Thank me later' is doing heavy lifting here.",
    },
    {
        "title": "The Case for Boring Software",
        "content": "I've been writing software for twelve years. My most contrarian opinion: boring technology is usually the right choice.\n\nEvery new framework promises to solve the problems of the old one. Some do. Most introduce different problems with better marketing.\n\nThe engineers I most respect reach for PostgreSQL before anything else. They use boring queues and boring caches and boring programming languages.\n\nNot because they lack ambition. Because they've shipped enough things to know that the exciting part should be the product, not the infrastructure.\n\nThe best technology decision I ever made was refusing to add a microservice when a single well-structured table would do.\n\nBoring scales. Boring is maintainable. Boring means your 3am alert is a query optimization, not an existential distributed systems failure.",
        "slop_score": 14,
        "verdict": "BARELY SLOP 😬",
        "roast": "A developer wrote a tech opinion that is actually coherent and isn't trying to sell a course. The judge finds minimal slop. Suspicious. Under review.",
    },
    {
        "title": "You Are Enough. A Reminder for Hard Days",
        "content": "On the days when you feel like you're falling behind —\nOn the days when comparison steals your joy —\nOn the days when your inner critic is loudest —\n\nRemember this: you are enough.\n\nYou are enough right now, exactly as you are.\nNot when you lose the weight.\nNot when you get the promotion.\nNot when your life looks more like theirs.\n\nNOW. Today. As you are.\n\nYour worth is not determined by your productivity. Your value is not contingent on your output.\n\nYou are a human being, not a human doing.\n\nSave this for when you need it. You deserve to come back to it. 💛\n\n#MentalHealth #SelfLove #YouAreEnough #Healing",
        "slop_score": 83,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Human being, not human doing. I have seen this line 4,000 times. The sentiment is fine but it was manufactured at a factory that makes inspirational fridge magnets.",
    },
    {
        "title": "GPT-4 gave me a business plan and honestly it slapped",
        "content": "I asked ChatGPT to write me a business plan for a dog grooming startup and I want to share the experience.\n\nIt was incredibly confident. Projected revenue to the dollar. Detailed competitive analysis. Full marketing strategy.\n\nIt also made up three competitors that don't exist, cited a 'Groom Industry Association Report 2022' that I cannot find anywhere, and suggested I expand to 'three additional locations' in year two without knowing my city.\n\nThe formatting was immaculate. It had headers and bullet points and bold text and it looked like a business plan and it was mostly vibes.\n\nI used none of it. But I did feel very productive for about 45 minutes and that's worth something, isn't it.",
        "slop_score": 8,
        "verdict": "BARELY SLOP 😬",
        "roast": "Meta-slop: content about AI slop. But it's self-aware, funny, and the 'mostly vibes' line is earned. The judge laughed. Acquitted.",
    },
    {
        "title": "Disrupting the Status Quo: Our Mission Statement",
        "content": "At [Company], we exist to disrupt.\n\nNot for disruption's sake — but because the status quo is no longer good enough.\n\nWe believe in a world where technology empowers humans, not replaces them. Where innovation is inclusive, not exclusive. Where progress lifts everyone, not just the few.\n\nOur mission: To leverage cutting-edge solutions to solve real-world problems at scale, creating lasting impact for our customers, our communities, and our planet.\n\nOur values:\n🌟 Innovation: We challenge what's possible\n💡 Integrity: We do the right thing, always\n🤝 Inclusivity: Every voice matters\n🌍 Impact: We measure success by the change we create\n\nJoin us in building the future.\n\nTogether, we can change everything. ✊",
        "slop_score": 93,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "They left [Company] unfilled AGAIN. Four values that every company claims. 'Disrupt' used as a positive twice. This mission statement could apply to a dog food brand or a hedge fund. Indistinguishable.",
    },
    {
        "title": "In defence of reply guys",
        "content": "Reply guys get a bad reputation online. Mostly deserved, but hear me out.\n\nThe most interesting corners of any platform are usually sustained by people who just... show up and say things. Not content creators optimizing for virality. Not brands executing a strategy. Just people who have opinions and type them.\n\nThe best reply guys (they exist) teach you things. They disagree in ways that are actually useful. They make the conversation worth having.\n\nThe internet's been professionalizing for fifteen years and the result is mostly polished emptiness. The chaos agents, the over-commenters, the people who reply 'actually' to everything — they are at least present.\n\nI contain multitudes. I have been a reply guy. I stand by it.",
        "slop_score": 11,
        "verdict": "BARELY SLOP 😬",
        "roast": "A hot take that isn't annoying. Concise, a little contrarian, ends with some self-awareness. The judge is disarmed. Barely slop. The reply guys are winning today.",
    },
    {
        "title": "Exciting News About Our Upcoming Product Launch 🎉",
        "content": "We are THRILLED to announce that something BIG is coming.\n\nWe've been working behind the scenes for months (years, really) to bring you something we truly believe will change the game.\n\nWe can't share everything just yet — but we can tell you this:\n\n🔥 It's unlike anything you've seen before\n🔥 It's designed with YOU in mind\n🔥 It's launching VERY soon\n\nStay tuned. Sign up for our newsletter to be the first to know.\n\nWe are so excited to share this journey with you. You have no idea what's coming.\n\n(And yes, we know you've heard that before. This time, we mean it. 😉)\n\n#ComingSoon #Launch #Exciting #StayTuned",
        "slop_score": 87,
        "verdict": "LEGENDARY FILTH 👑",
        "roast": "Nothing. Announced. Nothing is announced here. Three fire emojis and three non-clues. They know this is bad — look at that winking emoji. It's a confession.",
    },
    {
        "title": "How I grew my newsletter to 50k subscribers",
        "content": "Real talk on the newsletter growth:\n\n- Months 1-6: wrote consistently, got about 200 subscribers, mostly people I knew\n- Month 7: one issue hit on Hacker News front page, jumped to 4,000 overnight\n- Months 8-14: slower growth, referral program helped, crossed 10k\n- Month 18: a creator with a big audience mentioned it in their newsletter, gained 8k in a week\n- Month 24: 50k\n\nThe uncomfortable truth: about 60% of the growth came from two lucky breaks that I couldn't have engineered.\n\nI wrote good stuff. That was necessary. But it wasn't sufficient.\n\nAnyone who tells you they have a repeatable formula for this is either lucky or selling you a course.",
        "slop_score": 19,
        "verdict": "BARELY SLOP 😬",
        "roast": "Admits luck. Shows actual numbers. Warns against course-sellers. Barely slop. The judge is almost impressed, which is extremely suspicious.",
    },
    {
        "title": "Unlocking Human Potential in the Age of AI",
        "content": "We stand at a pivotal inflection point in human history.\n\nArtificial intelligence is not coming. It's here. And it's transforming every industry, every role, and every aspect of how we live and work.\n\nThe question is not whether AI will change your job. It will.\n\nThe question is: will you be the person who harnesses AI's potential — or the person it leaves behind?\n\nAt [Organization], we believe that the human element remains irreplaceable. Creativity, empathy, critical thinking, ethical judgment — these are the distinctly human capabilities that AI cannot replicate.\n\nOur programs are designed to help professionals:\n✅ Future-proof their careers\n✅ Develop AI-adjacent skill sets\n✅ Lead with confidence in an AI-augmented world\n\nThe future belongs to those who prepare for it today.\n\nAre you ready to unlock your potential? 🚀",
        "slop_score": 80,
        "verdict": "WEAPONS-GRADE SLOP ☣️",
        "roast": "Another '[Organization]' placeholder in the wild. 'Pivotal inflection point in human history' — said by every tech blog since 2015. Also: if AI can't replicate empathy, why did AI write this?",
    },
]

# ── Create fake auth users ───────────────────────────────────────────────────
print("Creating fake auth users...")
user_ids = []
for i, username in enumerate(USERNAMES):
    body = {
        "email": f"seed_{username}_{uuid.uuid4().hex[:6]}@aislop.fake",
        "password": "SeedPass123!",
        "email_confirm": True,
        "user_metadata": {"username": username},
    }
    result = req("POST", "/auth/v1/admin/users", body)
    if result and "id" in result:
        uid = result["id"]
        user_ids.append(uid)
        print(f"  ✓ user {username} → {uid}")
    else:
        print(f"  ✗ failed to create {username}")

print(f"\nCreated {len(user_ids)} users")

# ── Create profiles ──────────────────────────────────────────────────────────
print("\nCreating profiles...")
profiles = []
for uid, uname in zip(user_ids, USERNAMES[:len(user_ids)]):
    result = req("POST", "/rest/v1/profiles", {"id": uid, "username": uname})
    if result:
        profiles.append({"id": uid, "username": uname})
        print(f"  ✓ profile {uname}")

print(f"Created {len(profiles)} profiles")

# ── Create posts ─────────────────────────────────────────────────────────────
print("\nCreating posts...")
now = datetime.now(timezone.utc)
inserted_posts = []

for i, p in enumerate(POSTS):
    # Spread posts over last 14 days with some randomness
    hours_ago = random.randint(i * 8 + random.randint(0, 6), i * 8 + 12)
    created_at = (now - timedelta(hours=hours_ago)).isoformat()

    # Pick a random profile as author
    author = random.choice(profiles) if profiles else {"id": user_ids[0]}
    post_body = {
        "user_id": author["id"],
        "title": p["title"],
        "content": p["content"],
        "slop_score": p["slop_score"],
        "verdict": p["verdict"],
        "roast": p["roast"],
        "created_at": created_at,
    }
    result = req("POST", "/rest/v1/posts", post_body)
    if result and len(result) > 0:
        post_id = result[0]["id"]
        inserted_posts.append({"id": post_id, "slop_score": p["slop_score"]})
        print(f"  ✓ post '{p['title'][:40]}...' id={post_id[:8]}")
    else:
        print(f"  ✗ failed: {p['title'][:40]}")

print(f"\nInserted {len(inserted_posts)} posts")

# ── Add reactions ─────────────────────────────────────────────────────────────
print("\nAdding reactions...")
reaction_count = 0

for post in inserted_posts:
    score = post["slop_score"]

    # High slop posts get more reactions overall
    if score >= 80:
        num_reactors = random.randint(10, 18)
        slop_ratio = 0.80  # 80% agree it's slop
    elif score >= 60:
        num_reactors = random.randint(6, 12)
        slop_ratio = 0.65
    elif score >= 40:
        num_reactors = random.randint(3, 8)
        slop_ratio = 0.45
    else:
        num_reactors = random.randint(1, 5)
        slop_ratio = 0.20

    # Pick random subset of users
    reactors = random.sample(user_ids, min(num_reactors, len(user_ids)))

    for uid in reactors:
        reaction_type = "slop" if random.random() < slop_ratio else "not_slop"
        body = {"post_id": post["id"], "user_id": uid, "reaction_type": reaction_type}
        result = req("POST", "/rest/v1/reactions", body)
        if result:
            reaction_count += 1

print(f"Added {reaction_count} reactions")
print("\n✅ Seeding complete!")
