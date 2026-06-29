// Run: node test-jokes/generate.js
// Writes test-jokes/jokes-library.json — import it in the app to load 30 jokes + 3 sample setlists

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = dirname(fileURLToPath(import.meta.url))

// ── jokes ──────────────────────────────────────────────────────────────────────

const jokes = [
  {
    title: 'First Date App',
    status: 'polished',
    tags: ['dating', 'apps', 'relationships'],
    versions: [
      { label: 'v1', text: 'I matched with someone on a dating app.\nShe had the same interests as me.\nSame music. Same movies. Same sense of humor.\nTurns out I was her second account.', notes: 'Pause after "humor". Let it land before the twist.' },
      { label: 'v2 - Shorter', text: 'I matched with a woman who had everything in common with me.\nSame taste in music, movies, jokes.\nTurns out she was catfishing herself.\nWe\'re both still confused.', notes: 'Works better in longer sets. Cut if time is short.' },
      { label: 'v3 - Punchy', text: 'I fell in love with my own catfish account.\nThat\'s called growth.', notes: 'Tag for another bit. Don\'t open with this.' },
    ],
  },
  {
    title: "My Therapist's Face",
    status: 'polished',
    tags: ['therapy', 'mental health'],
    versions: [
      { label: 'v1', text: 'My therapist has a face she makes\nwhen I say something that requires a full hour to unpack.\nI\'ve started calling it "the invoice face".', notes: 'Mime the face. Big laugh in Edinburgh.' },
      { label: 'v2 - Extended', text: 'My therapist has this face she makes.\nNeutral. Calm. Professionally concerned.\nI call it "the invoice face".\nBecause it appears every time I say something\nthat costs me another session.', notes: 'Better for longer sets. Adds a beat.' },
    ],
  },
  {
    title: 'Airport Security Logic',
    status: 'working',
    tags: ['travel', 'airports', 'absurdity'],
    versions: [
      { label: 'v1', text: 'Airport security took my water bottle.\nBut let through a man in socks\ncarrying a bag full of cables\nand an unsettling amount of confidence.', notes: 'Mime taking shoes off. Physical works here.' },
      { label: 'v2 - Expanded', text: 'Airport security is theater.\nThey confiscated my 200ml moisturizer.\nThree grams over the limit. Lethal.\nThe guy behind me walked through\nwith a bag of power banks, a belt buckle the size of Texas,\nand what I can only describe as "an aura of ill intent".\nThey waved him through.', notes: 'Slow down on "aura of ill intent". Let audience picture it.' },
      { label: 'v3 - Character focus', text: 'There was a man at security.\nNo shoes. Full eye contact with the guard.\nBag full of wires.\nHe had the energy of someone who has never been questioned.\nThey let him through.\nThey took my yogurt.', notes: 'Best version so far. Test at next open mic.' },
      { label: 'v4 - Short', text: 'They took my water.\nLet through a man made entirely of confidence and red flags.\nI\'m not saying the system is broken\nbut I am saying I\'m still thirsty.', notes: 'Good closer for travel section.' },
    ],
  },
  {
    title: 'Gym January',
    status: 'idea',
    tags: ['gym', 'new year', 'society'],
    versions: [
      { label: 'v1', text: 'In January the gym is full of people who decided to change.\nBy February it\'s just us again.\nThe regulars.\nThe ones who never changed anything\nand made peace with it.', notes: 'Needs a punchline. Too soft right now.' },
    ],
  },
  {
    title: "My Dog's Judgment",
    status: 'polished',
    tags: ['pets', 'dogs', 'self-awareness'],
    versions: [
      { label: 'v1', text: 'My dog watches me eat cereal for dinner\nwith an expression that says:\n"I thought you were the smart one."', notes: 'Short. Works as a one-liner or opener.' },
      { label: 'v2 - With callback', text: 'My dog has this look.\nIt\'s the look of someone who eats the same brown pellets every day\nand still feels sorry for me.\nI\'m eating cereal at 11pm.\nHe\'s right to judge.', notes: 'Callback works if you mentioned the dog earlier.' },
      { label: 'v3 - Darker', text: 'My dog and I have reached an understanding.\nHe doesn\'t ask why I\'m eating cereal at midnight.\nI don\'t ask why he drinks from the toilet.\nWe respect each other\'s choices.', notes: 'Audience likes this. Less needy than v1.' },
    ],
  },
  {
    title: 'Work From Home Reality',
    status: 'working',
    tags: ['work', 'remote', 'pandemic'],
    versions: [
      { label: 'v1', text: 'I\'ve been working from home for three years.\nThe commute is great.\nThe dress code is flexible.\nI have not made a single friend.', notes: 'Deadpan delivery. Don\'t smile at the last line.' },
      { label: 'v2 - More detail', text: 'Working from home sounds perfect.\nNo commute. No office politics. No pants.\nWhat nobody tells you\nis that without the commute\nyou lose the thirty minutes a day\nyou used to spend being a person\nbefore becoming an employee.\nI miss that person.', notes: '"Being a person before becoming an employee" is the line.' },
    ],
  },
  {
    title: 'Parents on WhatsApp',
    status: 'polished',
    tags: ['family', 'technology', 'parents'],
    versions: [
      { label: 'v1', text: 'My dad discovered WhatsApp.\nHe now sends me good morning messages\nat 6am every day.\nBefore WhatsApp he never called.\nI preferred that relationship.', notes: 'Timing: beat before last line.' },
      { label: 'v2 - Extended', text: 'My dad is on WhatsApp.\nEvery morning: a sun emoji. "Good morning, son".\nEvery evening: a moon emoji. "Good night, son".\nHe\'s using me as a clock.\nI didn\'t hear from him for three years before this.\nNow I\'m his timezone.', notes: '"I\'m his timezone" is good. Might be the button.' },
      { label: 'v3 - With mum', text: 'My mum joined WhatsApp.\nMy dad joined to watch my mum.\nNow I get three messages a day:\nMum: "Are you eating?"\nDad: "Did you eat?"\nMum: "Your father asked if you ate."\nI\'m 34 years old.', notes: 'Best crowd response. Keep this version.' },
      { label: 'v4 - Lean', text: 'Mum joined WhatsApp.\nDad joined to monitor mum.\nI\'m in a group chat called "Family"\nwhere nobody speaks Polish anymore\nbut everyone screenshots everything.', notes: 'Too personal for general audiences. Edinburgh only.' },
      { label: 'v5 - Punchline focus', text: 'My whole family is now on WhatsApp.\nWe share memes. We share news. We share opinions.\nWe\'ve run out of things to not talk about.', notes: 'Short version. Good if running long.' },
    ],
  },
  {
    title: 'Self-Checkout Machines',
    status: 'draft',
    tags: ['technology', 'supermarket', 'frustration'],
    versions: [
      { label: 'v1', text: 'Self-checkout machines are optimistic.\nThey expect me to know what I\'m doing.\nUnexpected item in the bagging area.\nThe item is me. I am the unexpected item.', notes: 'Last line needs work. Too cute.' },
      { label: 'v2', text: 'I trigger the self-checkout alarm every time.\nEvery time.\nThe assistant comes over.\nShe doesn\'t speak. She just fixes it.\nWe\'ve been doing this for two years.\nShe knows. I know. We don\'t discuss it.', notes: 'Better but still needs a punchline.' },
    ],
  },
  {
    title: 'Subscription Services',
    status: 'working',
    tags: ['money', 'streaming', 'modern life'],
    versions: [
      { label: 'v1', text: 'I have twelve streaming subscriptions.\nI watch one show on each.\nI\'m paying forty euros a month\nfor the right to feel overwhelmed by choice\nand watch nothing.', notes: 'Relatable opener. Test crowd response.' },
      { label: 'v2', text: 'The worst part of streaming services\nis the algorithm.\nIt knows what I like.\nIt knows what I\'ll watch next.\nIt knows I\'m going to cancel\nand it\'s already making it hard to find the button.', notes: '"Making it hard to find the button" lands well.' },
      { label: 'v3 - Short', text: 'I cancelled Netflix.\nThey asked me why.\nI said I found better content elsewhere.\nThey said where.\nI said outside.\nWe were both lying.', notes: 'Good button for tech section.' },
    ],
  },
  {
    title: 'Adulting',
    status: 'draft',
    tags: ['growing up', 'life', 'existential'],
    versions: [
      { label: 'v1', text: 'Nobody tells you that being an adult\nmeans choosing between fixing the thing\nor learning to live with the thing.\nI have chosen. The shower squeaks now. It\'s fine.', notes: 'Needs more. Too thin as a standalone.' },
    ],
  },
  {
    title: 'My GPS',
    status: 'working',
    tags: ['technology', 'driving', 'relationships'],
    versions: [
      { label: 'v1', text: 'My GPS said "recalculating" so many times\nI started to feel judged.\nRecalculating. Recalculating.\nThat\'s not navigation. That\'s disappointment.', notes: 'Mimic the GPS voice. Physicality helps here.' },
      { label: 'v2', text: 'My GPS has given up on me.\nIt used to say "turn left in 200 meters".\nNow it just says "recalculating"\nin a tone that means "you already passed it, I knew you would".', notes: '"I knew you would" is good. Explore more.' },
      { label: 'v3 - Relationship angle', text: 'I\'ve had two long-term relationships.\nBoth ended with someone saying "recalculating".\nOne was a GPS.\nThe other was Sarah.\nThe GPS was more helpful.', notes: 'Good if doing relationship material around it.' },
      { label: 'v4 - Punchy', text: 'My GPS and my ex have the same tone of voice.\nPatient. Resigned. Waiting for me to realize\nI should have listened.', notes: 'Best version. Short and lands clean.' },
    ],
  },
  {
    title: 'Online Reviews',
    status: 'polished',
    tags: ['internet', 'food', 'consumer culture'],
    versions: [
      { label: 'v1', text: 'Restaurant reviews on Google are philosophy.\nFive stars: "changed my life."\nOne star: "wrong sauce."\nThese people are living in different realities\nand they\'re both writing to me.', notes: 'Pause between stars and text. Let the gap breathe.' },
      { label: 'v2 - Character', text: 'One-star review: "The waiter looked at me funny."\nFive-star review: "The waiter looked at me."\nSame waiter. Same look.\nDifferent experiences of being perceived.', notes: 'More specific. Audience leans in.' },
    ],
  },
  {
    title: 'The Weather App',
    status: 'idea',
    tags: ['technology', 'weather', 'optimism'],
    versions: [
      { label: 'v1', text: 'My weather app says "partly cloudy with a chance of sun".\nEvery day.\nFor eight months.\nI live in Poland. This is a lie.\nBut I appreciate the optimism.', notes: 'Might be too local. Rewrite for general audiences.' },
    ],
  },
  {
    title: 'Meal Prep Sunday',
    status: 'draft',
    tags: ['food', 'health', 'self-improvement'],
    versions: [
      { label: 'v1', text: 'I did meal prep on Sunday.\nFive portions of rice and chicken.\nI was so proud.\nI ate all five on Sunday evening while watching TV.', notes: 'Short but good. Needs a second beat.' },
      { label: 'v2', text: 'Meal prep is a form of time travel.\nYou sacrifice Sunday-you\nto help future-you.\nFuture-you is always ungrateful\nand eats it all on Sunday anyway.', notes: '"Time travel" angle is interesting. Develop further.' },
      { label: 'v3 - Dark', text: 'I made five meals on Sunday.\nHealthy. Balanced. Labeled with the day.\nMonday\'s meal was gone by Sunday midnight.\nWednesday\'s by Monday morning.\nBy Tuesday I was ordering pizza\nand apologizing to the containers.', notes: '"Apologizing to the containers" is good. Keep.' },
    ],
  },
  {
    title: "My Ex's Netflix Account",
    status: 'polished',
    tags: ['relationships', 'breakups', 'technology'],
    versions: [
      { label: 'v1', text: 'My ex and I broke up two years ago.\nI still use her Netflix.\nShe still uses my Spotify.\nWe are financially co-dependent exes\nwho haven\'t spoken since March.', notes: 'Opening bit. Sets relationship tone for set.' },
      { label: 'v2', text: 'I know my ex is doing well\nbecause she\'s been watching documentaries.\nWhen we were together it was all reality TV.\nPersonal growth is real\nand I\'m watching it happen on her profile.', notes: '"Watching it happen on her profile" is the line.' },
      { label: 'v3 - Confrontation', text: 'She changed the password last month.\nJust for Netflix.\nStill on my Spotify.\nThat\'s a message.\nI\'m just not sure what it means.', notes: 'Pause before "That\'s a message". Very good.' },
      { label: 'v4 - Button', text: 'She changed my profile name from "Dawid" to "Ex".\nI feel seen.\nI feel reduced.\nI watched three episodes like that.', notes: 'Potential closer for relationship section.' },
      { label: 'v5 - Short punchy', text: 'My ex changed my Netflix profile to "Ex".\nFair enough.\nI changed her Spotify playlist name to "Moving On".\nWe\'re both lying.', notes: 'Best for tight sets. Clean and fast.' },
    ],
  },
  {
    title: 'Sleep Schedule',
    status: 'working',
    tags: ['health', 'insomnia', 'modern life'],
    versions: [
      { label: 'v1', text: 'I\'ve been trying to fix my sleep schedule.\nEvery night I go to bed at a reasonable time.\nEvery night I spend ninety minutes\nreviewing decisions I made in 2014.', notes: 'Needs a specific example. Too vague.' },
      { label: 'v2', text: '3am is when my brain decides to audit my life.\nEvery embarrassing moment. Every missed opportunity.\nEvery time I said "you too" when a waiter said "enjoy your meal".\nAll of it. Reviewed. In full. At 3am.', notes: '"You too" to the waiter is universal. Audience always reacts.' },
    ],
  },
  {
    title: 'Wine Knowledge',
    status: 'working',
    tags: ['food', 'pretension', 'social anxiety'],
    versions: [
      { label: 'v1', text: 'I know nothing about wine.\nBut I\'ve learned to say "interesting" when I taste it.\nThat covers everything.\n"Interesting" means yes, no, maybe, and "I\'ll drink it anyway".', notes: 'Could go longer with sommelier bit.' },
      { label: 'v2 - Extended', text: 'The sommelier brought me a sample.\nHe watched me taste it.\nI said "interesting".\nHe said "what notes do you get?"\nI said "grape".\nLong pause.\nHe poured it and walked away.', notes: 'Physical acting on "long pause". Great crowd moment.' },
      { label: 'v3 - Social anxiety', text: 'Wine tasting is just being judged slowly.\nYou smell it. You swirl it.\nYou try to look like someone\nwho has opinions about fermentation.\nI have one opinion: more.', notes: '"I have one opinion: more" is a strong closer.' },
    ],
  },
  {
    title: 'Parking Ticket',
    status: 'retired',
    tags: ['bureaucracy', 'city life'],
    versions: [
      { label: 'v1', text: 'I got a parking ticket.\nI appealed it.\nThey rejected my appeal.\nI appealed the rejection.\nThey rejected that too.\nI am now in a relationship with the parking authority\nand neither of us is happy.', notes: 'Retired. Audiences don\'t care about parking tickets.' },
    ],
  },
  {
    title: 'LinkedIn Connections',
    status: 'working',
    tags: ['social media', 'work', 'performance'],
    versions: [
      { label: 'v1', text: 'LinkedIn is Facebook for people\nwho are ashamed of having feelings.\n"I\'m thrilled to announce I\'ve been laid off."\n"Excited to share my redundancy."\n"Grateful for this growth opportunity\nthat came with a security escort."', notes: 'Delivery: read it like a real LinkedIn post. Serious face.' },
      { label: 'v2', text: 'Someone on LinkedIn posted:\n"I got fired today. It was the best thing that ever happened to me."\nTwo thousand likes.\nI got fired once. I cried in a Tesco.\nNobody liked that.', notes: '"Cried in a Tesco" is very specific and very good.' },
      { label: 'v3 - Humblebrags', text: 'The LinkedIn humblebrag is an art form.\n"I\'ve been offered three CEO roles. Torn."\n"Interviewed at Google, Amazon, and a quiet farm in Tuscany."\n"Overwhelmed by the love. Blessed."\nNo you\'re not. You\'re terrified. So am I. We\'re the same.', notes: '"Terrified. So am I." hits if you make it personal.' },
      { label: 'v4 - Short', text: 'LinkedIn is where people go\nto perform being okay about work.\nI\'m fine. I\'m growing. I\'m pivoting.\nWe\'re all just pivoting.\nNobody knows what direction.', notes: 'Good closer for career section.' },
    ],
  },
  {
    title: 'The Dentist',
    status: 'polished',
    tags: ['health', 'anxiety', 'social situations'],
    versions: [
      { label: 'v1', text: 'My dentist asks me questions\nwhile her hands are in my mouth.\n"How\'s work?"\nI say something that means "fine".\nShe nods like she understood.\nMaybe she did. Maybe she\'s just being kind.\nThat\'s somehow the saddest possibility.', notes: 'Slow down at the end. Don\'t rush the sadness.' },
      { label: 'v2 - Funnier', text: 'The dentist asks "does this hurt?"\nwhile doing the thing that hurts.\nI say "a bit".\nShe says "good".\nI don\'t know what that means\nbut I chose to believe it\'s encouraging.', notes: '"I chose to believe" is a recurring character trait.' },
    ],
  },
  {
    title: "My Cat's Opinions",
    status: 'draft',
    tags: ['pets', 'cats', 'self-awareness'],
    versions: [
      { label: 'v1', text: 'My cat ignores me unless she wants something.\nI\'ve been in relationships like that.\nAt least the cat is honest about it.', notes: 'Too short. Needs development.' },
      { label: 'v2', text: 'My cat has three modes:\nIgnoring me. Demanding food. Sitting on my laptop.\nShe\'s not interested in my emotional state\nunless my emotional state is adjacent to the kitchen.', notes: '"Adjacent to the kitchen" is the line.' },
      { label: 'v3 - Mirror bit', text: 'My therapist says I attract unavailable people.\nI think about my cat.\nShe sleeps on my face.\nShe bites me when I pet her.\nShe walks away mid-conversation.\nShe\'s my type exactly.', notes: 'Callback to therapist bit. Needs to be in a set with that joke.' },
    ],
  },
  {
    title: 'Delivery Tracking',
    status: 'polished',
    tags: ['technology', 'shopping', 'anxiety'],
    versions: [
      { label: 'v1', text: 'I ordered something online.\nThe tracking said "out for delivery".\nI watched the map for four hours.\nHe went everywhere except my street.\nI started to take it personally.', notes: 'Mime watching the phone. Lean in physically.' },
      { label: 'v2', text: 'The delivery driver was two streets away for forty minutes.\nI made eye contact with his icon on the map.\nHe didn\'t blink.\nHe went to six other addresses first.\nI\'m not bitter. I left a five-star review.\nI\'m very bitter.', notes: '"I\'m not bitter" beat then "I\'m very bitter" — classic.' },
      { label: 'v3 - Escalated', text: 'Package tracking is emotional warfare.\nExpected today between 9am and 9pm.\nThat\'s not a window. That\'s a day.\nI waited. He came at 8:58.\nI was in the shower.\nWe both know this was intentional.', notes: '"Intentional" gets a big laugh. Keep this version.' },
      { label: 'v4 - Absurdist', text: 'I tracked my parcel so obsessively\nI started to worry about him.\nIs he warm? Did he eat?\nHe\'s carrying my things.\nThe least I can do is care.', notes: 'Softer crowd pleaser. Good for mixed audiences.' },
      { label: 'v5 - Short', text: 'My delivery driver and I have a complicated relationship.\nHe\'s never on time.\nI\'m never dressed.\nWe make it work.', notes: 'Good opener or tag. Very tight.' },
    ],
  },
  {
    title: 'Zoom Calls',
    status: 'retired',
    tags: ['work', 'technology', 'pandemic'],
    versions: [
      { label: 'v1', text: 'Zoom calls taught me what I look like\nwhen I think I\'m listening.\nI don\'t look like I\'m listening.\nI look like someone told me bad news\nand I\'m still processing it.', notes: 'Retired — too pandemic-era.' },
      { label: 'v2 - Generic', text: 'On video calls I discovered I have a face I make\nwhen I\'m pretending to pay attention.\nIt\'s the same face I make in real life.\nI\'ve been getting away with it for thirty years.', notes: 'Better angle. Maybe revive as "video call" generically.' },
    ],
  },
  {
    title: 'My Fitness Tracker',
    status: 'working',
    tags: ['health', 'technology', 'self-improvement'],
    versions: [
      { label: 'v1', text: 'My fitness tracker congratulates me for standing up.\nLiteral applause on my wrist.\n"Great job standing!"\nI\'ve achieved the minimum.\nThis is what my life has become.', notes: 'Deadpan. Don\'t celebrate the applause — that\'s the joke.' },
      { label: 'v2', text: 'My watch tells me to breathe.\nEvery hour: "Time to breathe."\nI\'ve been breathing my whole life.\nWithout a reminder.\nBut apparently now I need supervision.', notes: 'Adjust name for audience.' },
      { label: 'v3 - Competition', text: 'My friend challenged me to a step competition on the app.\nHe won.\nHe\'s a postman.\nI\'m a comedian.\nWe\'re not the same person\nand I respect that he didn\'t pretend otherwise.', notes: '"Didn\'t pretend otherwise" — quiet dignity joke.' },
    ],
  },
  {
    title: 'The Snooze Button',
    status: 'idea',
    tags: ['sleep', 'optimism', 'self-deception'],
    versions: [
      { label: 'v1', text: 'Every time I hit snooze\nI\'m making a promise to future-me\nthat I have no intention of keeping.\nFuture-me knows this.\nFuture-me hates me.', notes: 'Too short. Feels like a tweet not a bit.' },
    ],
  },
  {
    title: 'Restaurant Menus',
    status: 'working',
    tags: ['food', 'pretension', 'social anxiety'],
    versions: [
      { label: 'v1', text: 'Restaurant menus have gotten longer.\nThree pages of descriptions.\n"Pan-seared with a whisper of lemon and regret."\nI just want chicken. Is there chicken?\nI\'m reading a novel about chicken.', notes: '"Whisper of lemon and regret" — improv the description.' },
      { label: 'v2', text: 'My menu said "deconstructed Caesar salad".\nI ordered it.\nIt was just a Caesar salad.\nI looked at the waiter.\nHe looked at me.\nNeither of us mentioned it.', notes: 'Long pause after "just a Caesar salad". Very good.' },
      { label: 'v3 - QR code', text: 'Restaurants replaced menus with QR codes.\nNow I eat with my phone on the table,\na glass of wine in one hand,\nconnecting to their wifi with the other.\nThis is what intimacy looks like in 2024.', notes: '"This is what intimacy looks like" lands clean.' },
      { label: 'v4 - With friend', text: 'I went to dinner with someone who reads the whole menu.\nAloud.\nAll three pages.\nBy the time she ordered I had eaten the bread,\ncrossed a stage of grief,\nand was ready to go home.', notes: 'Great character bit. Works with animated performance.' },
    ],
  },
  {
    title: 'Autocorrect',
    status: 'polished',
    tags: ['technology', 'communication', 'family'],
    versions: [
      { label: 'v1', text: 'Autocorrect changed "I love you" to "I live you".\nI sent it anyway.\nShe said "what does that mean".\nI said "it means I live you".\nWe\'ve been together four years.\nIt\'s our thing now.', notes: 'True story. Audience always asks after the show.' },
      { label: 'v2', text: 'My phone knows me better than I know myself.\nEvery time I type "I\'m fine"\nit suggests "I\'m trying".\nI don\'t correct it anymore.\nThe phone is right.', notes: 'Quiet. Works in intimate venues. Cut from club sets.' },
      { label: 'v3 - Family', text: 'My dad texted "I\'m proud of you"\nbut autocorrect changed it to "I\'m proved of you".\nHe sent it.\nI knew what he meant.\nIt was the first time he\'d said either one.\nI didn\'t correct it.', notes: 'Personal. Vulnerable closer.' },
    ],
  },
  {
    title: 'Breaking News Alerts',
    status: 'draft',
    tags: ['media', 'anxiety', 'modern life'],
    versions: [
      { label: 'v1', text: 'My phone sends me breaking news alerts\nat all hours.\n3am: "Markets react to uncertainty."\n4am: "Uncertainty continues."\n5am: "Things still uncertain."\nI didn\'t know I subscribed to anxiety as a service.', notes: '"Anxiety as a service" could be a title. Explore.' },
      { label: 'v2', text: 'I turned off all notifications except calls.\nFor three days I thought everything was fine.\nThen a friend called.\nNothing was fine.\nBut I was so rested.', notes: '"So rested" is the button. Make it wistful not triumphant.' },
    ],
  },
  {
    title: 'Sourdough Starter',
    status: 'retired',
    tags: ['pandemic', 'food', 'hobbies'],
    versions: [
      { label: 'v1', text: 'During lockdown I made a sourdough starter.\nNamed it Gerald.\nFed it every day for three weeks.\nThen I ate Gerald.\nI\'m still not sure how to feel about that.', notes: 'Retired. Too 2020. Gerald deserved better.' },
    ],
  },
  {
    title: 'Therapy Speak',
    status: 'working',
    tags: ['therapy', 'language', 'relationships'],
    versions: [
      { label: 'v1', text: 'Everyone speaks therapy now.\n"I\'m not triggered, I\'m processing."\n"That\'s not a fight, it\'s a rupture."\n"I need to hold space for this."\nI grew up saying "fine" and "whatever".\nWe communicated less but faster.', notes: 'Good opener. Sets therapy-heavy set tone.' },
      { label: 'v2', text: 'My friend cancelled our plans.\nShe said "I need to honor my energy today."\nIn my family we said "I don\'t feel like it".\nSame message.\nFour fewer therapy sessions to figure out.', notes: '"Four fewer therapy sessions" is the line. Don\'t rush it.' },
      { label: 'v3 - Self-aware', text: 'I used to make fun of therapy speak.\nThen I started therapy.\nNow I talk about my attachment style at parties.\nI\'ve become exactly what I mocked.\nMy therapist says this is growth.\nShe might be right. That\'s the worst part.', notes: 'Vulnerable and funny. Best version.' },
      { label: 'v4 - Quick', text: 'Therapy taught me to say "I feel hurt" instead of "you\'re wrong".\nIt\'s more honest.\nIt\'s also much harder to win an argument with.', notes: 'Good one-liner. Opener or tag.' },
      { label: 'v5 - Relationship', text: 'I told my ex I needed closure.\nShe said she needed to process.\nWe scheduled a meeting.\nWe brought our therapists.\nNeither therapist knew about the other.\nThat was an interesting session.', notes: '"Interesting session" — callback to therapist joke if in set.' },
    ],
  },
]

// ── setlists ───────────────────────────────────────────────────────────────────

const setlists = [
  {
    title: 'Relationships & Tech — 20 min preview',
    items: [
      { type: 'joke', title: "My Ex's Netflix Account", version: 'v5 - Short punchy' },
      { type: 'segue', text: 'Which brings me to why I got a therapist...' },
      { type: 'joke', title: "My Therapist's Face", version: 'v2 - Extended' },
      { type: 'segue', text: 'And speaking of things designed to make you feel judged...' },
      { type: 'joke', title: 'My GPS', version: 'v4 - Punchy' },
      { type: 'segue', text: 'The GPS at least tells you where it thinks you went wrong. The app just knows.' },
      { type: 'joke', title: 'Delivery Tracking', version: 'v3 - Escalated' },
      { type: 'segue', text: 'I\'ve started to wonder if I care about people the way I care about packages.' },
      { type: 'joke', title: 'First Date App', version: 'v3 - Punchy' },
      { type: 'segue', text: 'I\'m working on it. My therapist says so.' },
      { type: 'joke', title: 'Autocorrect', version: 'v3 - Family' },
    ],
  },
  {
    title: 'Work & Modern Life — Club Set',
    items: [
      { type: 'joke', title: 'LinkedIn Connections', version: 'v2' },
      { type: 'segue', text: 'The internet didn\'t make us more connected, it made us more performative.' },
      { type: 'joke', title: 'Subscription Services', version: 'v3 - Short' },
      { type: 'segue', text: 'At some point the convenience became the problem.' },
      { type: 'joke', title: 'Self-Checkout Machines', version: 'v2' },
      { type: 'segue', text: 'I go to a real cashier now. Just to be recognized.' },
      { type: 'joke', title: 'Work From Home Reality', version: 'v2 - More detail' },
      { type: 'segue', text: 'The real casualty of working from home is the version of you that had to pretend to be okay.' },
      { type: 'joke', title: 'Breaking News Alerts', version: 'v2' },
    ],
  },
  {
    title: 'WIP — Full Preview (all material)',
    items: [
      { type: 'joke', title: "My Therapist's Face", version: 'v1' },
      { type: 'joke', title: 'Parents on WhatsApp', version: 'v3 - With mum' },
      { type: 'segue', text: 'My family communicates entirely through screens now.' },
      { type: 'joke', title: 'Airport Security Logic', version: 'v3 - Character focus' },
      { type: 'joke', title: 'Delivery Tracking', version: 'v2' },
      { type: 'segue', text: 'The package anxiety is real.' },
      { type: 'joke', title: "My Dog's Judgment", version: 'v3 - Darker' },
      { type: 'joke', title: 'Sleep Schedule', version: 'v2' },
      { type: 'segue', text: 'That\'s what 3am is. A performance review you didn\'t ask for.' },
      { type: 'joke', title: 'Wine Knowledge', version: 'v2 - Extended' },
      { type: 'joke', title: 'Restaurant Menus', version: 'v2' },
      { type: 'segue', text: 'Food used to be simpler. So was I.' },
      { type: 'joke', title: 'Therapy Speak', version: 'v3 - Self-aware' },
      { type: 'joke', title: "My Ex's Netflix Account", version: 'v2' },
      { type: 'segue', text: 'Personal growth is real and I\'m watching it happen on her profile.' },
      { type: 'joke', title: 'Autocorrect', version: 'v1' },
    ],
  },
]

// ── write ──────────────────────────────────────────────────────────────────────

const out = join(dir, 'jokes-library.json')
writeFileSync(out, JSON.stringify({ jokes, setlists }, null, 2))

const versionCount = jokes.reduce((n, j) => n + j.versions.length, 0)
console.log(`✓ jokes-library.json`)
console.log(`  ${jokes.length} jokes · ${versionCount} versions · ${setlists.length} setlists`)
console.log(`\nImport: Jokes → "Import .json" → select jokes-library.json`)
