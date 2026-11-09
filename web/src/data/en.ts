/**
 * Terjemahan Inggris untuk data. Struktur logika (next, good, tactics) tetap diambil dari data Indonesia.
 * - SCENARIOS_EN: skenario Latihan (dicocokkan lewat id skenario dan kunci node)
 * - SITUATIONS_EN, STATS_EN, CHANNELS_EN, LINK_LABELS_EN: data Darurat, statistik, kanal, label tautan
 * - WHY_EN (per rule_id engine), D01_NONLATIN_EN, COMBOS_EN, LINK_ERRORS_EN: teks hasil analisis
 * Dipakai lewat i18n/data.ts dan i18n/index.tsx. STATS_EN dicocokkan lewat urutan indeks, jaga urutannya sama dengan STATS.
 */
type EnNode = { messages?: string[]; choices?: { text: string; feedback: string }[]; end?: { title: string; summary: string } };
export type EnScenario = { title: string; persona: string; contact: string; audience?: string; fact: string; nodes: Record<string, EnNode> };

export const SCENARIOS_EN: Record<string, EnScenario> = {
  loker: {
    title: "A job offer that's too good", persona: "You're a university student looking for a side job.", contact: "Karya Digital Admin",
    fact: "Fake job scams were reported 23,469 times to IASC (January 2026 data), among the most frequently reported schemes.",
    nodes: {
      n1: { messages: ["Hi! We're from Karya Digital Nusantara. Your CV has passed for the Data Entry Admin position, work from your phone, pay Rp3 million per week. No experience needed.", "Want to continue to the next stage?"], choices: [
        { text: "I'd love to! What's the process?", feedback: "You never applied here, yet you're told you passed. High pay with no requirements is a classic bait. It's not necessarily a scam, but it's reason enough to stop and ask first." },
        { text: "I don't remember applying here. Where did you get my contact?", feedback: "Good question. A genuine recruiter can explain where your data came from and usually uses a company email." } ] },
      n2: { messages: ["Easy! Transfer Rp150,000 for registration and a digital uniform, refunded with your first salary.", "Only 3 slots left and today is the last day."], choices: [
        { text: "Okay, I'll transfer now", feedback: "Asked to pay before working, plus pressure from slots and a deadline. Legitimate employers generally don't charge applicants." },
        { text: "I'll check the company first, then get back to you", feedback: "Delaying is your strongest weapon. Scammers need you to decide fast." } ] },
      n3: { messages: ["If you keep asking questions, we'll give the slot to someone else.", "We only communicate through this WhatsApp, don't tell anyone until the official contract."], choices: [
        { text: "I'll block and report this number", feedback: "Right. Threats of losing the slot and requests for secrecy are two red flags at once." },
        { text: "Fine, I'll go along", feedback: "Being asked to keep it secret keeps you away from people who could snap you out of it. That's the point." } ] },
      e_good: { end: { title: "You stopped this scam", summary: "You delayed, asked questions, and cut contact before losing anything. The sender's number can be reported at aduannomor.id." } },
      e_bad: { end: { title: "You've already sent money", summary: "If this were real, open Emergency steps now: contact your bank, report to IASC, and keep the evidence. The sooner you report, the better the chance a transaction is delayed or funds are blocked." } },
      e_bad2: { end: { title: "You kept following the scammer's instructions", summary: "When someone asks you to keep a secret, tell someone you trust. A second opinion is often enough to expose a scam." } },
    },
  },
  kurir: {
    title: "A parcel you don't remember", persona: "You shopped online last week.", contact: "Courier",
    fact: "OJK lists APK scams via WhatsApp as one of the financial scam schemes to watch out for.",
    nodes: {
      n1: { messages: ["Good afternoon, this is the courier. Your parcel could not be delivered because the address is incomplete.", "Download the Resi_Paket.apk app at this link to see the receipt and update the address: https://resi-paket.example/resi.apk"], choices: [
        { text: "Download and install the app", feedback: "An .apk file from a chat link doesn't come through an official app store. Apps like this can read your SMS and open access to your accounts." },
        { text: "Check the parcel status in the courier's official app or website", feedback: "Right. Find the official channel yourself, don't go through a link in a message." },
        { text: "Reply: what parcel? I don't remember ordering", feedback: "Replying isn't harmful by itself, but it signals that your number is active and opens the conversation further." } ] },
      n2: { messages: ["It's a parcel from an online store. To redeliver it, tell us the 6-digit code that just arrived on your phone for verification."], choices: [
        { text: "Tell them the code", feedback: "That OTP code is the key to your account. Legitimate parties don't ask for codes over chat." },
        { text: "No. I'm blocking this number", feedback: "Right. Anyone else asking for a verification code is a major red flag." } ] },
      e_good: { end: { title: "You didn't take the bait", summary: "You verified through an official channel and handed over nothing. Report the sender's number at aduannomor.id so others are helped." } },
      e_bad: { end: { title: "A suspicious app is installed", summary: "If this were real: cut the internet, remove the app, change your passwords from another device, then open Emergency steps." } },
      e_bad2: { end: { title: "You handed over your OTP code", summary: "If this were real: change your passwords and PINs, call your bank's official call center to block access, then open Emergency steps." } },
    },
  },
  teman: {
    title: "A friend suddenly asks for a transfer", persona: "You get a message from a number that isn't saved.", contact: "Rani (new number)",
    fact: "Fraud via social media was reported 19,983 times to IASC (January 2026 data).",
    nodes: {
      n1: { messages: ["It's me, Rani, new number. My old phone broke.", "Please transfer Rp750,000 first to pay a bill, it's really urgent. I'll pay you back this afternoon."], choices: [
        { text: "Okay, I'll transfer now", feedback: "New number, asking for money, and urgent. That's a common pattern for accounts impersonating friends." },
        { text: "I'll call Rani on her old number first", feedback: "Right. Confirm through a channel you already know, not through that new number." },
        { text: "Can we video call first?", feedback: "A good verification step. See how they respond." } ] },
      n2: { messages: ["Ugh, can't, my camera is broken too. Just please hurry, and don't tell anyone, I'm embarrassed."], choices: [
        { text: "Okay, I'll transfer", feedback: "Refusing a video call, rushing, and asking for secrecy. Three red flags in one message." },
        { text: "I'll stop and contact Rani on her old number", feedback: "Right. A real friend will understand you want to make sure first." } ] },
      e_good: { end: { title: "You made sure first", summary: "One call to the old number is enough to expose this impersonation. Let your real friend know their number is being used by someone else." } },
      e_bad: { end: { title: "You already transferred money", summary: "If this were real, open Emergency steps now and report to IASC as soon as possible." } },
      e_bad2: { end: { title: "You gave in to the pressure", summary: "If this were real, open Emergency steps now and report to IASC as soon as possible." } },
    },
  },
  pinjol: {
    title: "A loan paid out in 10 minutes", persona: "You need money fast to pay rent and don't have many options.", contact: "PinjamCepat Nusa",
    fact: "Between January and June 2026, OJK received 19,169 complaints about illegal online loans and 2,878 complaints about illegal investments.",
    nodes: {
      n1: { messages: ["Need funds fast? Loan paid out in 10 minutes, no credit check, no collateral, straight to your account.", "Download the PinjamCepat Nusa app here: https://pinjam-cepat.example/app.apk"], choices: [
        { text: "Download the app, I really need it", feedback: "A promise of fast cash with no checks is bait often used by illegal lenders, and the app is shared as a file outside the official app store. It's understandable to be tempted when you need money. That's exactly when it's easiest to be lured." },
        { text: "First check whether the lender is OJK-licensed via OJK Contact 157", feedback: "Right. Make sure the lender is licensed and supervised by OJK before borrowing. You can ask OJK Contact 157." } ] },
      n2: { messages: ["The app asks for access to your contacts, photo gallery and location so your loan can be approved."], choices: [
        { text: "Allow everything so it's approved quickly", feedback: "Access to contacts and photos is often used to pressure borrowers during collection. That level of permission is usually not needed to borrow money." },
        { text: "Deny the excessive permissions and delete the app", feedback: "Right. Permissions that make no sense for the app's function are a signal to stop." } ] },
      n3: { messages: ["Loan of Rp1,000,000 approved, Rp700,000 received. Due in 7 days.", "Day 8: You're overdue! Pay now or we'll spread your photo and contact everyone in your phone."], choices: [
        { text: "Borrow from another app to repay it", feedback: "Covering a loan with a new loan makes the problem bigger and gives more similar apps access." },
        { text: "Stay calm, keep evidence of the threats, tell someone you trust, then report to OJK", feedback: "Right. Threatening to spread your data is extortion. Keep screenshots and report to sipasti.ojk.go.id, OJK Contact 157, or the police." } ] },
      e_good: { end: { title: "You stopped at the start", summary: "Checking the license and refusing excessive permissions protects your money and data. Illegal lenders can be reported at sipasti.ojk.go.id." } },
      e_good2: { end: { title: "You didn't give in to threats", summary: "Keeping evidence and reporting is the right move. Open Emergency steps for the full sequence." } },
      e_bad: { end: { title: "You're caught in a loan cycle", summary: "If this were real, don't take new loans to cover old ones. Call OJK Contact 157 and open Emergency steps." } },
    },
  },
  investasi: {
    title: "An investment invitation from an old friend", persona: "You're a retired parent who wants your savings to grow.", contact: "Bu Ratna", audience: "A parent's perspective",
    fact: "Between January and June 2026, OJK received 2,878 complaints about illegal investments, besides 19,169 about illegal online loans.",
    nodes: {
      n1: { messages: ["Ma'am, this is Bu Ratna from your old arisan group. Join our investment group! Capital Rp5 million, 10% profit per month, guaranteed payout. Many ladies have already succeeded.", "They say it's supervised by OJK too."], choices: [
        { text: "Sounds interesting, how do I join?", feedback: "A guaranteed high profit, a claim of OJK supervision, and an invitation from an acquaintance is a combination often seen in illegal investment offers. OJK urges caution about unrealistically high returns." },
        { text: "Thank you, I'll check the license with OJK Contact 157 and ask my child", feedback: "Right. A claim of OJK supervision must be checked yourself, not taken from a chat message." } ] },
      n2: { messages: ["Easy, ma'am. Transfer to my personal account first, then you can see your daily profit in our app.", "Only 3 slots left for this wave."], choices: [
        { text: "Transfer Rp1 million first to try", feedback: "Depositing into a personal account plus slot pressure are red flags. Trying with a small amount feels safe, but it's often the first stage." },
        { text: "I'll check the license and legality first", feedback: "Right. Delaying gives you time to check. Scammers need you to decide quickly." } ] },
      n3: { messages: ["You think too much, ma'am. The wave closes tomorrow, those who hesitate will regret it.", "If you bring 3 friends, you get a bonus."], choices: [
        { text: "I'll still check with OJK Contact 157 and sipasti.ojk.go.id, and not join for now", feedback: "Right. Bonuses for recruiting friends and deadlines are often hallmarks of schemes that depend on new members." },
        { text: "Fine, I'll join so I don't miss out", feedback: "Fear of missing out is a feeling that's deliberately played on. Decisions about your savings deserve a calm mind." } ] },
      n4: { messages: ["Rp100,000 profit just came in, ma'am! Proof, right? Add Rp20 million capital, the profit multiplies. Bring your family for a bonus."], choices: [
        { text: "Proven! I'll add capital and bring my family", feedback: "A small payout at the start is often used to build trust before the victim deposits a large sum. It's not proof the business is real." },
        { text: "Enough. I'll stop and talk to my child before depositing again", feedback: "Right. Stopping and asking a trusted person's opinion protects you." } ] },
      e_good: { end: { title: "You checked before depositing", summary: "By checking the license and delaying your decision, you avoid the risk of losing your savings. Suspicious offers can be reported at sipasti.ojk.go.id or OJK Contact 157." } },
      e_good2: { end: { title: "You stopped before a bigger loss", summary: "Stopping after a small deposit saved the rest of your savings. If money has already gone in, open Emergency steps and report to OJK." } },
      e_bad: { end: { title: "You almost joined out of fear of missing out", summary: "If this were real, don't deposit yet. Check the license through OJK Contact 157 and talk it over with your family." } },
      e_bad2: { end: { title: "A large deposit went into a dubious scheme", summary: "If this were real, contact your bank at once to request a delay, report to IASC and tell your family. It's not your fault: schemes like this are designed to be convincing." } },
    },
  },
  lovescam: {
    title: "A new friend who feels just right", persona: "You met someone on social media two weeks ago.", contact: "Daniel",
    fact: "OJK lists love scams as a fraud scheme that exploits victims' loneliness.",
    nodes: {
      n1: { messages: ["I've never felt this connected with anyone. It feels like we were meant to meet.", "Sorry I can't video call yet, the signal where I work abroad is terrible."], choices: [
        { text: "I feel the same. I trust you", feedback: "It's natural to feel close. Love scammers are skilled at building closeness quickly. Repeated excuses for not being able to video call are a sign to pay attention to." },
        { text: "I enjoy talking with you, but I want to video call before we get closer", feedback: "A healthy step. Someone sincere will understand you want to be sure." } ] },
      n2: { messages: ["Darling, I need help. My wallet and passport were stolen, I can't come home.", "Can you transfer Rp5 million first? I'll repay as soon as I arrive. Don't tell your family yet, they might not understand."], choices: [
        { text: "I'll transfer now", feedback: "An urgent request for money from someone you've never met, plus a request to keep it from your family, is a classic love scam pattern." },
        { text: "I can't send money to someone I've never met", feedback: "Right. A clear boundary protects you, even if it feels hard." } ] },
      n3: { messages: ["If you really love me, you'd trust me. Don't disappoint me."], choices: [
        { text: "I tell my best friend and check their profile photo with a reverse image search", feedback: "Right. Scammers want you to keep it to yourself. A second opinion and a photo check are often enough to expose them." },
        { text: "Sorry, I'll transfer", feedback: "Guilt and fear of loss are deliberately played here. Your feelings are real, but that pressure is part of how the scammer works." } ] },
      e_good: { end: { title: "You kept a safe distance", summary: "You asked for real proof, refused the transfer, and involved someone you trust. You can report accounts like this to the platform where you met." } },
      e_bad: { end: { title: "The money has been sent", summary: "It's not your fault: love scammers are skilled at building closeness. If this were real, open Emergency steps and report to IASC as soon as possible." } },
      e_bad2: { end: { title: "You gave in to emotional pressure", summary: "It's not your fault. If this were real, open Emergency steps and report to IASC as soon as possible." } },
    },
  },
};

export const SITUATIONS_EN: Record<string, { title: string; desc: string; now: string[]; after: string[]; warn: string }> = {
  transfer: {
    title: "I already transferred money", desc: "To a bank or e-wallet account that turned out to be suspicious.",
    now: ["Contact your bank or e-wallet through its official call center (find the number in the app or on your card, not from a chat) and ask them to delay the transaction or block the recipient account.", "Report to IASC at iasc.ojk.go.id as soon as possible so the transaction can be delayed or funds blocked.", "Stop replying to the scammer. Don't transfer again, including for a \"refund fee\"."],
    after: ["Keep evidence: chat screenshots, the transfer receipt, the account number and the scammer's phone number.", "Report the recipient account at cekrekening.id and the phone number at aduannomor.id.", "File a police report through patrolisiber.id or your nearest police station, with the evidence you saved.", "Warn friends and family so they don't become the next victims."],
    warn: "Beware! I almost/just fell for a scam: I was asked to transfer money first for something unclear. If anyone asks for money over chat, verify by phone or an official channel first, and don't rush to transfer.",
  },
  otp: {
    title: "I already sent an OTP, PIN or password", desc: "A verification code or login details were already handed over.",
    now: ["Change the password and PIN of the related accounts (bank, e-wallet, email) from the official app, preferably on a device you trust.", "Call the official call center of your bank or e-wallet to temporarily block the card or account.", "Check your statements and transaction history. If money left that isn't yours, report it to IASC now."],
    after: ["Turn on two-step verification on important accounts.", "Remove unfamiliar devices from the list of devices logged in to your account.", "Change the same password on any other accounts.", "Keep the chat evidence and report the scammer's number at aduannomor.id."],
    warn: "Beware! There's a scam asking for OTP codes or PINs over chat and calls. Legitimate parties never ask for them. If someone asks, stop and contact the official channel yourself.",
  },
  apk: {
    title: "I clicked a link or installed an APK file", desc: "From a message that turned out to be suspicious (receipt, invitation, bill).",
    now: ["Turn off mobile data and Wi-Fi (or enable airplane mode) so the app can't keep communicating.", "Remove the app you just installed from the APK file. If it can't be removed, revoke its device administrator permission in settings first.", "From another safe device, change your email and important account passwords, then call your bank's official call center to block mobile banking access."],
    after: ["Check your bank and e-wallet statements. If there are transactions you didn't make, report to IASC.", "Consider a factory reset after backing up your photos and contacts, if you doubt the device is clean.", "Report the sender's number at aduannomor.id.", "Warn contacts who may receive similar messages from your number."],
    warn: "Beware! There are messages disguised as parcel receipts or invitations that urge you to install an .apk file. Don't install it. Check parcel status through the courier's official app or website.",
  },
  ancaman: {
    title: "I'm being threatened or my data will be leaked", desc: "For example illegal online loan collection or extortion using photos and contacts.",
    now: ["Don't pay and don't give in to threats. Extortion often continues after the victim pays.", "Stop replying and keep evidence: screenshots of the threats, the number, the account and the time of the incident.", "Tell someone you trust. You don't have to carry this alone."],
    after: ["Set your social media accounts to private and tell close contacts to ignore messages from the perpetrator.", "If it comes from an online loan, report illegal ones through sipasti.ojk.go.id or OJK Contact 157.", "Report the threats to the police through patrolisiber.id or your nearest police station."],
    warn: "Beware! Illegal online lenders and extortionists are using collection pressure and threats to leak data. Don't pay or panic, keep evidence, and report to OJK or the police.",
  },
};

export const STATS_EN = [
  { value: "702,342", label: "scam reports received by the Indonesia Anti-Scam Centre (IASC)", period: "22 Nov 2024 – Sep 2026", src: "OJK, via Kontan" },
  { value: "Rp9.1 trillion", label: "total losses reported to IASC", period: "up to 14 Jan 2026", src: "OJK, via Kontan" },
  { value: "Rp638.9 billion", label: "victim funds blocked by IASC", period: "up to May 2026", src: "OJK, via Investortrust" },
  { value: "23,469", label: "fake job scam reports at IASC (social media: 19,983)", period: "Jan 2026 data", src: "OJK, via Kontan" },
];
export const CHANNELS_EN: Record<string, { name: string; use: string }> = {
  iasc: { name: "Indonesia Anti-Scam Centre (OJK)", use: "Financial transaction fraud. Designed to speed up delaying transactions or blocking funds." },
  kontak157: { name: "OJK Contact 157", use: "Ask questions, check legality, and report. The 157 line now operates 24 hours." },
  sipasti: { name: "SiPasti OJK (Satgas PASTI)", use: "Report illegal online loans, illegal investments, and illegal pawn services." },
  cekrekening: { name: "CekRekening.id (Komdigi)", use: "Check whether an account has been reported, and report scam accounts." },
  aduannomor: { name: "AduanNomor.id (Komdigi)", use: "Report phone numbers used for fraud or spam." },
  patrolisiber: { name: "Patroli Siber (Polri)", use: "Report cybercrime to the police. You may be asked to visit a police station for follow-up statements." },
};
export const LINK_LABELS_EN: Record<string, string> = { "Telepon 157": "Call 157" };

// Alasan temuan (dari mesin Rust) dalam bahasa Inggris, dikunci dengan id aturan.
export const WHY_EN: Record<string, string> = {
  R01: "The message pushes you to act fast. Scammers often use this so you have no time to think.",
  R02: "Claims of limited slots or quotas are often used to rush your decision.",
  R03: "Phrases like 'rare opportunity' are usually meant to make you afraid of missing out.",
  R04: "An OTP code is secret. Legitimate parties usually do not ask for it over chat or phone.",
  R05: "PINs, passwords and CVV codes should never be requested by anyone else.",
  R06: "Photos of your ID card or family card can be misused to take out loans or create fake accounts.",
  R07: "Requests for your account or card number for 'verification' are a common way to break into accounts.",
  R08: "Being asked to pay a fee before receiving something is a very common scam pattern.",
  R09: "Requests to transfer money upfront with no guarantee are often a sign of fraud.",
  R10: "Deposits required to open an account or withdraw funds often appear in investment scams.",
  R11: "Genuine prizes usually do not require the winner to pay taxes or shipping first.",
  R12: "News that you won a draw you never entered is suspicious.",
  R13: "Guaranteed profit or 'risk-free' returns are almost never real. Every investment carries risk.",
  R14: "High pay with no clear requirements is often used in fake job offers.",
  R15: "Bonuses or free credit that come with a link often lead to fake sites.",
  R16: "Loans that pay out instantly with no checks are often used by illegal lenders.",
  R17: "Threats to block your account are used to make you panic and obey.",
  R18: "Legal threats over chat are a way to pressure victims.",
  R19: "Threatening to leak your data or photos is extortion. Do not comply, and keep the evidence.",
  R20: "A 'suspicious transaction' alert that asks you to click or call a number is often a trap.",
  R21: "Claiming to be an official institution over private chat. Verify through official contacts you look up yourself.",
  R22: "Genuine recruiters usually use a company email, not only private chat or a free email address.",
  R23: "APK files or links disguised as invitations, receipts or bills often carry harmful apps.",
  R24: "Being asked to keep something secret is how scammers keep you away from people who could set you straight.",
  R25: "A message from a 'friend' on a new number asking for money should be confirmed by phone or another channel.",
  R26: "Being moved to another app for an interview or tasks can be a way to avoid platform oversight.",
  R27: "Shortened links or links with many hyphens hide the real destination.",
  R28: "Brand names placed in unofficial or cheap domains are often used by fake sites.",
  J01: "Typical online-gambling slang such as gacor, maxwin or scatter. Messages like this almost always invite you to gamble, which is illegal in Indonesia and often used to keep victims depositing.",
  J01b: "The word 'slot' together with other gambling words (win, bonus, deposit, jackpot, withdraw). A common pattern in online-gambling ads.",
  J02: "'Jepe' (jackpot) and 'wede' (withdraw) are slang used by online-gambling sites.",
  J03: "JP (jackpot) or WD (withdraw) appearing with an invitation to play or sign up is online-gambling slang.",
  J05: "A promised sure win ('guaranteed victory', 'new accounts must win') cannot be kept. Gambling is designed so the house wins.",
  J06: "Hooks like 'rarely withdraw' or 'keep losing' are used by gambling sites to attract people trying to win their money back.",
  J07: "Tiny capital and 'one deposit' make gambling feel cheap and safe to try. That is the trap: deposits keep growing.",
  J08: "Handing out 'free balance' to play is bait so you sign up and end up depositing your own money.",
  J09: "Phrases like 'chips added automatically', 'flood of scatters' or x500 multipliers are promotional language of slot-gambling sites.",
  J10: "Names of popular slot games mentioned together with a call to win or deposit.",
  J11: "An excited 'sign up and play' or 'join now' call typical of mass promotional messages.",
  J12: "Telling you to search Google for a 'official stall' is used so gambling sites are harder to trace through links.",
  J13: "The domain name contains terms or numbers typical of online-gambling sites (for example gacor, maxwin or 777).",
  N01: "The message claims funds or a deposit have 'already arrived' and includes a link. It is bait to make you open the link and then deposit money or hand over data. Check your balance in the official app, not through a link.",
  N02: "A very short verification deadline is used so you have no time to think.",
  N03: "'Choose to withdraw or continue' is bait: the money said to be in your account is not real, and 'continue' usually means depositing.",
  N04: "Being asked to check your balance through a link in the message. Check balances only in the official app you installed yourself.",
  N05: "A number or ID masked with asterisks is made to look personal. Mass messages often use this trick.",
  N06: "A friendly greeting with the recipient's own phone number is used to make a mass message feel addressed to you.",
  N07: "Being told to quickly 'collect' or 'claim' something is a way to push you to open the link without thinking.",
  L22: "The domain name contains terms typical of online-gambling sites. Online gambling is illegal in Indonesia and such sites often trap victims into depositing again and again.",
  L23: "The domain ends in digits commonly used by online-gambling sites, such as 777 or 88. Not always harmful, but worth checking.",

  E01: "The message (in English) pushes you to act fast. Scammers often use this so you have no time to think.",
  E02: "Claims of limited slots or spots are often used to rush your decision.",
  E03: "An OTP or verification code is secret. Legitimate parties usually do not ask for it over chat or phone.",
  E04: "Passwords, PINs, CVV codes or wallet recovery phrases should never be requested by anyone else.",
  E05: "Being asked to enter or verify a password through a link is a common route to account theft.",
  E06: "Photos of your ID, passport or ID number can be misused to take out loans or open fake accounts.",
  E07: "Requests for your account or card details for 'verification' are a common way to break into accounts.",
  E08: "Being asked to pay a fee before receiving something is a very common scam pattern.",
  E09: "Customs, shipping or tax fees that must be paid before an item or prize is released are often used by scammers.",
  E10: "Requests to pay or transfer money upfront with no guarantee are often a sign of fraud.",
  E11: "Deposits required to open an account or withdraw funds often appear in investment scams.",
  E12: "Being asked to pay with gift cards, crypto or international cash transfers is a hard-to-trace method that scammers favour.",
  E13: "News that you won a prize or draw you never entered is suspicious.",
  E14: "Guaranteed profit or 'risk-free' returns are almost never real. Every investment carries risk.",
  E15: "High pay with no clear requirements is often used in fake job offers.",
  E16: "Bonuses or free credit that come with a link often lead to fake sites.",
  E17: "Loans that pay out instantly with no checks are often used by illegal lenders.",
  E18: "Threats to block or freeze your account are used to make you panic and obey.",
  E19: "Legal threats over chat are a way to pressure victims.",
  E20: "Threatening to leak your data or photos is extortion. Do not comply, and keep the evidence.",
  E21: "A 'suspicious activity' alert that asks you to click, call or verify is often a trap.",
  E22: "Claiming to be an official institution over private chat. Verify through official contacts you look up yourself.",
  E23: "Genuine recruiters usually use a company email, not only private chat or a free email address.",
  E24: "APK files or links disguised as parcels, bills or fines often lead to harmful apps or sites.",
  E25: "Being asked to keep something secret is how scammers keep you away from people who could set you straight.",
  E26: "Being moved to another app for an interview or tasks can be a way to avoid platform oversight.",
  E27: "A message from 'family or a friend' on a new number should be confirmed by phone or a channel you already know.",
  E28: "An urgent request for money from someone you know over chat should be checked by phone or another channel.",
  E29: "Closeness built quickly that ends in a request for money is a classic love scam pattern.",
  E30: "Guaranteed crypto or trading profits, and airdrops that ask for your wallet, are often used by scammers.",
  E31: "Being asked to install remote-access software lets someone else control your device and your accounts.",
  E32: "A refund or overpayment notice that asks you to click or share account details is often a trap.",
  E33: "Being asked to verify or restore an account through a link is a very common phishing pattern.",
  E34: "Being asked to read out or forward a code just sent to your phone is almost always an account takeover attempt.",
  E35: "Being asked to reply with full personal details to receive a prize or opportunity is a way of collecting victims' data.",
  L16: "This site is hosted on a free platform where anyone can create an address. Many legitimate sites use these, but so do fake ones.",
  L17: "A brand name is used as the site name on a free hosting platform. Genuine brand owners almost always use their own domain.",
  L18: "The link carries a parameter that looks like a password, PIN or OTP. Legitimate sites do not ask for secrets through a link.",
  L19: "The domain name uses encoded characters (the % sign) that disguise the real address.",
  L20: "The IP address is written in a disguised way (hexadecimal, octal or one long number) to hide the destination.",
  L21: "This platform lets anyone publish pages or forms. The content is not necessarily from the party named in the message.",
  D01: "The domain name imitates a brand using digits or look-alike letters, for example the digit 4 replacing the letter a.",
  D02: "The domain name is almost identical to a brand name, differing by one letter. Deliberate typos are often used by fake sites.",
  D03: "A brand name is combined with another word in one domain. This pattern is common on fake sites, though not always harmful, so check first.",
  D04: "The domain uses special encoding (punycode) that can disguise look-alike letters.",
  L01: "The link uses unencrypted http. Legitimate sites generally use https. Note that https alone does not guarantee a site is safe.",
  L02: "Everything before the @ sign is decoration. The real destination is the address after the @, so a link can look official while opening a different site.",
  L03: "The link uses an IP address instead of a domain name. Legitimate sites almost always use a domain name.",
  L04: "The link is shortened, so the real destination is hidden. We cannot open it to see where it leads.",
  L05: "This domain ending is cheap and often used by fake sites, though many legitimate sites use it too.",
  L06: "Many layers of subdomains are used to hide the real main domain.",
  L07: "The main domain contains many hyphens or digits, a pattern common on fake sites.",
  L08: "A brand name appears as a subdomain, while the main domain belongs to someone else. The main domain decides who owns the site.",
  L09: "A brand name appears in the link path, not in the domain name. Anyone can put anything in the path.",
  L10: "The domain name contains bait words such as login or verification. Legitimate sites usually do not put these in the domain name.",
  L11: "The link path contains bait words such as login or verification.",
  L12: "The link points to an executable file, such as an APK app. Only install such files from official app stores.",
  L13: "The link uses a port number that is unusual for ordinary websites.",
  L14: "The link carries another address inside it and may redirect to a different site.",
  L15: "The link is very long. A long tail is often used to hide the destination.",
};
export const D01_NONLATIN_EN = "The domain contains non-Latin letters that can look identical to ordinary letters, a common trick for posing as an official site.";
export const COMBOS_EN: Record<string, string> = {
  "OTP atau PIN disertai urgensi": "OTP or PIN request combined with urgency",
  "Lowongan kerja dengan biaya di muka": "Job offer with an upfront fee",
  "Investasi dengan deposit": "Investment with a required deposit",
  "Ancaman disertai tautan mencurigakan": "Threat combined with a suspicious link",
  "Beberapa tanda muncul bersamaan": "Several signs appear together",
  "Ajakan judi online dengan tautan": "Online-gambling invitation with a link",
  "Notifikasi saldo palsu dengan tautan": "Fake balance notice with a link",
};
export const LINK_ERRORS_EN: Record<string, string> = {
  "Tempel tautan terlebih dahulu.": "Paste a link first.",
  "Tautan tidak boleh mengandung spasi dan tidak ada tautan yang bisa diambil dari teks ini. Tempel satu tautan, atau pakai Cek pesan untuk teks panjang.": "A link cannot contain spaces, and no link could be taken from this text. Paste a single link, or use Check message for longer text.",
  "Hanya tautan http dan https yang bisa diperiksa.": "Only http and https links can be checked.",
  "Alamat IPv6 tidak valid.": "Invalid IPv6 address.",
  "Tautan tidak memiliki nama domain.": "The link has no domain name.",
  "Alamat tidak valid.": "Invalid address.",
  "Ini tampaknya bukan alamat situs karena tidak ada titik, misalnya contoh.com.": "This does not look like a website address because it has no dot, for example example.com.",
  "Nama domain tidak valid.": "Invalid domain name.",
  "Nama domain mengandung karakter yang tidak valid.": "The domain name contains invalid characters.",
  "Bagian akhir domain tidak valid.": "The domain ending is not valid.",
};