import React from 'react'
import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'

// ─── STREAMING SERVICES ──────────────────────────────────────
const STREAMING_SERVICES = [
  { id: "netflix", name: "Netflix", price: 7.99, icon: "🎬", color: "#E50914" },
  { id: "hulu", name: "Hulu", price: 9.99, icon: "📺", color: "#1CE783" },
  { id: "disney", name: "Disney+", price: 9.99, icon: "🏰", color: "#113CCF" },
  { id: "hbomax", name: "Max (HBO)", price: 10.99, icon: "🎭", color: "#002BE7" },
  { id: "espn", name: "ESPN+", price: 11.99, icon: "⚽", color: "#D00" },
  { id: "peacock", name: "Peacock", price: 7.99, icon: "🦚", color: "#000" },
  { id: "paramount", name: "Paramount+", price: 7.99, icon: "⭐", color: "#0064FF" },
  { id: "appletv", name: "Apple TV+", price: 12.99, icon: "🍎", color: "#555" },
  { id: "amazon", name: "Prime Video", price: 14.99, icon: "📦", color: "#FF9900" },
  { id: "mlbtv", name: "MLB.TV", price: 12.50, icon: "⚾", color: "#002D72" },
  { id: "spotify", name: "Spotify", price: 11.99, icon: "🎵", color: "#1DB954" },
  { id: "applemusic", name: "Apple Music", price: 10.99, icon: "🎶", color: "#FA233B" },
  { id: "youtubepremium", name: "YouTube Premium", price: 13.99, icon: "▶️", color: "#FF0000" },
];

// ─── PLAN FINDER QUESTIONS ──────────────────────────────────
const CARRIER_IDENTIFIER = {
  "t-mobile": {
    label: "T-Mobile",
    icon: "📱",
    color: "#E20074",
    questions: [
      {
        q: "How many phone lines are on your account?",
        options: ["1 line", "2+ lines"],
      },
      {
        q: "Which best describes your plan? (Check T-Life app → Account → Plan name, or your bill)",
        options: [
          "Experience Beyond ($100+/line)",
          "Experience More ($85+/line)",
          "Better Value (~$47/line for 3+)",
          "Go5G Next ($100+/line)",
          "Go5G Plus ($90+/line)",
          "Go5G ($75+/line)",
          "Magenta MAX",
          "Magenta (or Magenta 55+/Military)",
          "ONE Plus / ONE Plus International",
          "ONE (T-Mobile ONE)",
          "Essentials / Simply Prepaid",
          "Not sure — show me all T-Mobile options",
        ],
      },
    ],
    resolve: (answers) => {
      const lines = answers[0];
      const plan = answers[1];
      const multiLine = lines === "2+ lines";
      if (plan?.includes("Experience Beyond")) return ["tmobile_exp_beyond"];
      if (plan?.includes("Experience More")) return ["tmobile_exp_more"];
      if (plan?.includes("Better Value")) return ["tmobile_better_value"];
      if (plan?.includes("Go5G Next")) return ["tmobile_go5g_next"];
      if (plan?.includes("Go5G Plus")) return ["tmobile_go5g_plus"];
      if (plan?.includes("Go5G (")) return multiLine ? ["tmobile_go5g_multi"] : ["tmobile_go5g_single"];
      if (plan?.includes("Magenta MAX")) return ["tmobile_magenta_max"];
      if (plan?.includes("Magenta (")) return multiLine ? ["tmobile_magenta_multi"] : ["tmobile_magenta_single"];
      if (plan?.includes("ONE Plus")) return ["tmobile_one_plus"];
      if (plan?.includes("ONE (")) return multiLine ? ["tmobile_one_multi"] : ["tmobile_one_single"];
      if (plan?.includes("Essentials")) return ["tmobile_essentials"];
      // show all
      return multiLine
        ? ["tmobile_exp_beyond", "tmobile_exp_more", "tmobile_better_value", "tmobile_go5g_next", "tmobile_go5g_plus", "tmobile_go5g_multi", "tmobile_magenta_max", "tmobile_magenta_multi", "tmobile_one_plus", "tmobile_one_multi"]
        : ["tmobile_exp_beyond", "tmobile_exp_more", "tmobile_go5g_next", "tmobile_go5g_plus", "tmobile_magenta_max", "tmobile_magenta_single", "tmobile_one_single", "tmobile_essentials"];
    },
  },
  verizon: {
    label: "Verizon",
    icon: "📱",
    color: "#CD040B",
    questions: [
      {
        q: "Which best describes your Verizon plan? (Check My Verizon app → Account → Plan)",
        options: [
          "Unlimited Ultimate (myPlan, $90+)",
          "Unlimited Plus (myPlan, $80+)",
          "Unlimited Welcome (myPlan, $65+)",
          "5G Get More (legacy)",
          "5G Play More (legacy)",
          "5G Do More (legacy)",
          "5G Start (legacy)",
          "Welcome Unlimited (legacy)",
          "Fios Home Internet (1 Gig / 2 Gig)",
          "Not sure — show me all Verizon options",
        ],
      },
    ],
    resolve: (answers) => {
      const plan = answers[0];
      if (plan?.includes("Unlimited Ultimate")) return ["verizon_ultimate"];
      if (plan?.includes("Unlimited Plus")) return ["verizon_plus"];
      if (plan?.includes("Unlimited Welcome")) return ["verizon_welcome"];
      if (plan?.includes("5G Get More")) return ["verizon_5g_get_more"];
      if (plan?.includes("5G Play More")) return ["verizon_5g_play_more"];
      if (plan?.includes("5G Do More")) return ["verizon_5g_do_more"];
      if (plan?.includes("5G Start")) return ["verizon_5g_start"];
      if (plan?.includes("Welcome Unlimited")) return ["verizon_welcome"];
      if (plan?.includes("Fios")) return ["verizon_fios"];
      return ["verizon_ultimate", "verizon_plus", "verizon_welcome", "verizon_5g_get_more", "verizon_5g_play_more", "verizon_5g_do_more", "verizon_fios"];
    },
  },
};

// ─── ALL MEMBERSHIPS & PLANS (including legacy/grandfathered) ──────
const MEMBERSHIPS_AND_PLANS = [
  // === T-MOBILE ===
  { id: "tmobile_exp_beyond", name: "T-Mobile Experience Beyond", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — included free" },
      { serviceId: "hulu", tier: "With Ads", value: 9.99, note: "Hulu (With Ads) — included free" },
      { serviceId: "appletv", tier: "$9.99 discount", value: 9.99, note: "Apple TV+ $9.99/mo discount (you pay ~$3/mo)" },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays app each spring" },
    ],
  },
  { id: "tmobile_exp_more", name: "T-Mobile Experience More", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — included free" },
      { serviceId: "appletv", tier: "$9.99 discount", value: 9.99, note: "Apple TV+ $9.99/mo discount (you pay ~$3/mo)" },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays app each spring" },
    ],
  },
  { id: "tmobile_better_value", name: "T-Mobile Better Value", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — included free" },
      { serviceId: "hulu", tier: "With Ads", value: 9.99, note: "Hulu (With Ads) — included free" },
      { serviceId: "appletv", tier: "$9.99 discount", value: 9.99, note: "Apple TV+ for ~$3/mo ($9.99 discount)" },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays app each spring" },
    ],
  },
  { id: "tmobile_go5g_next", name: "T-Mobile Go5G Next", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — included free" },
      { serviceId: "hulu", tier: "With Ads", value: 9.99, note: "Hulu (With Ads) — included free" },
      { serviceId: "appletv", tier: "$9.99 discount", value: 9.99, note: "Apple TV+ $9.99/mo discount" },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays" },
    ],
  },
  { id: "tmobile_go5g_plus", name: "T-Mobile Go5G Plus", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — included free" },
      { serviceId: "appletv", tier: "$9.99 discount", value: 9.99, note: "Apple TV+ $9.99/mo discount" },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays" },
    ],
  },
  { id: "tmobile_go5g_multi", name: "T-Mobile Go5G (2+ lines)", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — free with 2+ lines" },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays" },
    ],
  },
  { id: "tmobile_go5g_single", name: "T-Mobile Go5G (1 line)", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays" },
    ],
  },
  // LEGACY: Magenta MAX
  { id: "tmobile_magenta_max", name: "T-Mobile Magenta MAX ★ Legacy", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — included free (1 line eligible)" },
      { serviceId: "appletv", tier: "$9.99 discount", value: 9.99, note: "Apple TV+ $9.99/mo discount (pays ~$3/mo after Jan 2026)" },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays" },
    ],
  },
  // LEGACY: Magenta (2+ lines)
  { id: "tmobile_magenta_multi", name: "T-Mobile Magenta (2+ lines) ★ Legacy", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — free with 2+ Magenta lines! You may need to activate in T-Life app under Add-ons → Services." },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays" },
    ],
  },
  // LEGACY: Magenta (1 line — no Netflix)
  { id: "tmobile_magenta_single", name: "T-Mobile Magenta (1 line) ★ Legacy", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays. Note: Netflix On Us requires 2+ lines on Magenta, or upgrade to Magenta MAX/Experience More for 1-line Netflix." },
    ],
  },
  // LEGACY: ONE Plus
  { id: "tmobile_one_plus", name: "T-Mobile ONE Plus ★ Legacy", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix included (ONE Plus is treated like Magenta MAX for Netflix eligibility)" },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays" },
    ],
  },
  // LEGACY: ONE (2+ lines)
  { id: "tmobile_one_multi", name: "T-Mobile ONE (2+ lines) ★ Legacy", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "netflix", tier: "Standard with Ads", value: 7.99, note: "Netflix Standard with Ads — free with 2+ ONE lines. Activate in T-Life app." },
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays" },
    ],
  },
  // LEGACY: ONE (1 line)
  { id: "tmobile_one_single", name: "T-Mobile ONE (1 line) ★ Legacy", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays. Netflix On Us requires 2+ lines on ONE plan." },
    ],
  },
  // Essentials — no streaming
  { id: "tmobile_essentials", name: "T-Mobile Essentials", category: "T-Mobile", icon: "📱", color: "#E20074",
    streamingPerks: [
      { serviceId: "mlbtv", tier: "Full Season", value: 12.50, note: "Free via T-Mobile Tuesdays. No Netflix/Hulu/Apple TV+ perks on Essentials — consider upgrading." },
    ],
  },

  // === VERIZON ===
  { id: "verizon_ultimate", name: "Verizon Unlimited Ultimate (myPlan)", category: "Verizon", icon: "📱", color: "#CD040B",
    streamingPerks: [
      { serviceId: "disney", tier: "Disney Bundle $10/mo perk", value: 10, note: "$10/mo add-on perk: Disney+, Hulu, ESPN+ (with ads)" },
      { serviceId: "hulu", tier: "Via Disney Bundle perk", value: 0, note: "Included in $10/mo Disney Bundle perk" },
      { serviceId: "espn", tier: "Via Disney Bundle perk", value: 0, note: "Included in $10/mo Disney Bundle perk" },
      { serviceId: "netflix", tier: "Netflix & Max $10/mo perk", value: 10, note: "$10/mo perk: Netflix + Max (with ads)" },
      { serviceId: "hbomax", tier: "Via Netflix & Max perk", value: 0, note: "Included in $10/mo Netflix & Max perk" },
    ],
  },
  { id: "verizon_plus", name: "Verizon Unlimited Plus (myPlan)", category: "Verizon", icon: "📱", color: "#CD040B",
    streamingPerks: [
      { serviceId: "disney", tier: "Disney Bundle $10/mo perk", value: 10, note: "$10/mo add-on perk: Disney+, Hulu, ESPN+ (with ads)" },
      { serviceId: "hulu", tier: "Via Disney Bundle perk", value: 0, note: "Included in $10/mo Disney Bundle perk" },
      { serviceId: "espn", tier: "Via Disney Bundle perk", value: 0, note: "Included in $10/mo Disney Bundle perk" },
      { serviceId: "netflix", tier: "Netflix & Max $10/mo perk", value: 10, note: "$10/mo perk: Netflix + Max (with ads)" },
      { serviceId: "hbomax", tier: "Via Netflix & Max perk", value: 0, note: "Included in $10/mo Netflix & Max perk" },
    ],
  },
  { id: "verizon_welcome", name: "Verizon Unlimited Welcome / Welcome Unlimited", category: "Verizon", icon: "📱", color: "#CD040B",
    streamingPerks: [
      { serviceId: "disney", tier: "Disney Bundle $10/mo perk", value: 10, note: "$10/mo add-on perk: Disney+, Hulu, ESPN+ (with ads)" },
      { serviceId: "hulu", tier: "Via Disney Bundle perk", value: 0, note: "Included in $10/mo Disney Bundle perk" },
      { serviceId: "espn", tier: "Via Disney Bundle perk", value: 0, note: "Included in $10/mo Disney Bundle perk" },
    ],
  },
  // LEGACY: 5G Get More — Disney Bundle FREE
  { id: "verizon_5g_get_more", name: "Verizon 5G Get More ★ Legacy", category: "Verizon", icon: "📱", color: "#CD040B",
    streamingPerks: [
      { serviceId: "disney", tier: "Disney+ Premium FREE", value: 16.99, note: "Disney+ Premium (No Ads), Hulu (with ads), ESPN+ (with ads) — ALL INCLUDED FREE. $24.99/mo value!" },
      { serviceId: "hulu", tier: "With Ads — FREE", value: 9.99, note: "Included free with Disney Bundle on 5G Get More" },
      { serviceId: "espn", tier: "With Ads — FREE", value: 11.99, note: "Included free with Disney Bundle on 5G Get More" },
      { serviceId: "applemusic", tier: "Free trial", value: 10.99, note: "6-month free Apple Music trial included" },
    ],
  },
  // LEGACY: 5G Play More — Disney Bundle FREE
  { id: "verizon_5g_play_more", name: "Verizon 5G Play More ★ Legacy", category: "Verizon", icon: "📱", color: "#CD040B",
    streamingPerks: [
      { serviceId: "disney", tier: "Disney+ Premium FREE", value: 16.99, note: "Disney+ Premium (No Ads), Hulu (with ads), ESPN+ (with ads) — ALL INCLUDED FREE!" },
      { serviceId: "hulu", tier: "With Ads — FREE", value: 9.99, note: "Included free with Disney Bundle on 5G Play More" },
      { serviceId: "espn", tier: "With Ads — FREE", value: 11.99, note: "Included free with Disney Bundle on 5G Play More" },
      { serviceId: "applemusic", tier: "Free trial", value: 10.99, note: "6-month free Apple Music trial included" },
    ],
  },
  // LEGACY: 5G Do More — 6-month Disney+ trial
  { id: "verizon_5g_do_more", name: "Verizon 5G Do More ★ Legacy", category: "Verizon", icon: "📱", color: "#CD040B",
    streamingPerks: [
      { serviceId: "disney", tier: "6-month Disney+ free", value: 9.99, note: "6-month Disney+ Premium (No Ads) free trial if not already redeemed" },
      { serviceId: "applemusic", tier: "Free trial", value: 10.99, note: "6-month free Apple Music trial included" },
    ],
  },
  // LEGACY: 5G Start — 6-month Disney+ trial
  { id: "verizon_5g_start", name: "Verizon 5G Start ★ Legacy", category: "Verizon", icon: "📱", color: "#CD040B",
    streamingPerks: [
      { serviceId: "disney", tier: "6-month Disney+ free", value: 9.99, note: "6-month Disney+ Premium (No Ads) free trial if not already redeemed" },
      { serviceId: "applemusic", tier: "Free trial", value: 10.99, note: "6-month free Apple Music trial included" },
    ],
  },
  // Verizon Fios
  { id: "verizon_fios", name: "Verizon Fios 1 Gig / 2 Gig Internet", category: "Verizon", icon: "🌐", color: "#CD040B",
    streamingPerks: [
      { serviceId: "netflix", tier: "12 months free (With Ads)", value: 7.99, note: "12 months Netflix (with ads) free, then $10/mo" },
      { serviceId: "hbomax", tier: "12 months free (With Ads)", value: 10.99, note: "12 months Max (with ads) free, then $10/mo" },
    ],
  },

  // === AT&T Legacy ===
  { id: "att_legacy", name: "AT&T Unlimited Elite/Plus/Choice ★ Legacy", category: "AT&T", icon: "📱", color: "#009FDB",
    streamingPerks: [
      { serviceId: "hbomax", tier: "With Ads — included", value: 10.99, note: "HBO Max included on legacy Unlimited Elite, Unlimited Plus, Unlimited Choice plans. Check your AT&T account — if you have one of these grandfathered plans, don't give it up!" },
    ],
  },

  // === OTHER CARRIERS ===
  { id: "metro_tmobile", name: "Metro by T-Mobile ($60 plan)", category: "Other Carriers", icon: "📱", color: "#46196E",
    streamingPerks: [
      { serviceId: "amazon", tier: "Prime included", value: 14.99, note: "Full Amazon Prime membership included free" },
    ],
  },
  { id: "cricket_supreme", name: "Cricket Supreme Unlimited ($55)", category: "Other Carriers", icon: "📱", color: "#6CC24A",
    streamingPerks: [
      { serviceId: "hbomax", tier: "With Ads — FREE", value: 10.99, note: "HBO Max (with ads) included free" },
    ],
  },
  { id: "us_mobile", name: "US Mobile (3+ Premium lines)", category: "Other Carriers", icon: "📱", color: "#0055FF",
    streamingPerks: [
      { serviceId: "netflix", tier: "Choose 1 free service", value: 15.49, note: "Pick 1 free: Netflix Standard, Max, Disney Bundle, or Apple TV+" },
    ],
  },
  { id: "straight_talk", name: "Straight Talk Gold+ ($55+)", category: "Other Carriers", icon: "📱", color: "#FF6600",
    streamingPerks: [
      { serviceId: "paramount", tier: "Via Walmart+", value: 7.99, note: "Free Walmart+ included → gives Paramount+ or Peacock" },
      { serviceId: "peacock", tier: "Via Walmart+", value: 7.99, note: "OR choose Peacock instead" },
    ],
  },

  // === INTERNET PROVIDERS ===
  { id: "comcast_stream", name: "Comcast/Xfinity + StreamSaver ($15/mo)", category: "Internet Provider", icon: "🌐", color: "#F50057",
    streamingPerks: [
      { serviceId: "netflix", tier: "With Ads", value: 7.99, note: "Netflix (ads) + Peacock (ads) + Apple TV+ for $15/mo total" },
      { serviceId: "peacock", tier: "With Ads", value: 7.99, note: "Included in $15/mo StreamSaver" },
      { serviceId: "appletv", tier: "Full", value: 12.99, note: "Included in $15/mo StreamSaver" },
    ],
  },

  // === MEMBERSHIPS ===
  { id: "amazon_prime", name: "Amazon Prime ($14.99/mo)", category: "Membership", icon: "📦", color: "#FF9900",
    streamingPerks: [
      { serviceId: "amazon", tier: "Prime Video included", value: 8.99, note: "Prime Video included with membership" },
    ],
  },
  { id: "amazon_student", name: "Amazon Prime Student ($7.49/mo)", category: "Student Discount", icon: "🎓", color: "#FF9900",
    streamingPerks: [
      { serviceId: "amazon", tier: "Prime Video (50% off)", value: 8.99, note: "Full Prime at half price. 6-month free trial for new students!" },
    ],
  },
  { id: "walmart_plus", name: "Walmart+ ($12.95/mo)", category: "Membership", icon: "🛒", color: "#0071CE",
    streamingPerks: [
      { serviceId: "paramount", tier: "Essential — FREE", value: 7.99, note: "Free Paramount+ Essential OR Peacock Premium. Switch every 90 days!" },
      { serviceId: "peacock", tier: "Premium — FREE", value: 7.99, note: "OR choose Peacock Premium instead" },
    ],
  },
  { id: "walmart_student", name: "Walmart+ Student ($6.47/mo)", category: "Student Discount", icon: "🎓", color: "#0071CE",
    streamingPerks: [
      { serviceId: "paramount", tier: "Essential — FREE", value: 7.99, note: "50% off membership + free Paramount+ or Peacock!" },
      { serviceId: "peacock", tier: "Premium — FREE", value: 7.99, note: "OR choose Peacock instead" },
    ],
  },
  { id: "kroger_boost", name: "Kroger Boost (Annual ~$99/yr)", category: "Membership", icon: "🛒", color: "#E31937",
    streamingPerks: [
      { serviceId: "disney", tier: "With Ads — FREE", value: 9.99, note: "Choose 1: Disney+ OR Hulu OR ESPN+ (with ads) free" },
      { serviceId: "hulu", tier: "With Ads — FREE", value: 9.99, note: "OR choose Hulu" },
      { serviceId: "espn", tier: "With Ads — FREE", value: 11.99, note: "OR choose ESPN+" },
    ],
  },
  { id: "instacart_plus", name: "Instacart+ ($99/yr)", category: "Membership", icon: "🛒", color: "#43B02A",
    streamingPerks: [
      { serviceId: "peacock", tier: "Premium — FREE", value: 7.99, note: "Free Peacock Premium included" },
    ],
  },

  // === CREDIT CARDS ===
  { id: "amex_plat", name: "Amex Platinum ($895/yr)", category: "Credit Card", icon: "💳", color: "#006FCF",
    streamingPerks: [
      { serviceId: "disney", tier: "Up to $25/mo credit", value: 25, note: "$25/mo digital entertainment credit covers: Disney+, Hulu, ESPN+, Peacock, Paramount+, YouTube Premium, NYT, WSJ, and more" },
      { serviceId: "hulu", tier: "Covered", value: 0, note: "Eligible for $25/mo credit" },
      { serviceId: "espn", tier: "Covered", value: 0, note: "Eligible for $25/mo credit" },
      { serviceId: "peacock", tier: "Covered", value: 0, note: "Eligible for $25/mo credit" },
      { serviceId: "paramount", tier: "Covered", value: 0, note: "Eligible for $25/mo credit" },
      { serviceId: "youtubepremium", tier: "Covered", value: 0, note: "Eligible for $25/mo credit" },
    ],
  },
  { id: "chase_sapphire_res", name: "Chase Sapphire Reserve", category: "Credit Card", icon: "💳", color: "#1A4480",
    streamingPerks: [
      { serviceId: "appletv", tier: "Free thru June 2027", value: 12.99, note: "Apple TV+ and Apple Music free through June 2027" },
      { serviceId: "applemusic", tier: "Free thru June 2027", value: 10.99, note: "Included with Apple TV+ perk" },
    ],
  },
  { id: "amex_bce", name: "Amex Blue Cash Everyday ($0/yr)", category: "Credit Card", icon: "💳", color: "#006FCF",
    streamingPerks: [
      { serviceId: "disney", tier: "$7/mo Disney credit", value: 7, note: "$7/mo statement credit toward Disney+, Hulu, ESPN+, or Disney bundles" },
    ],
  },
  { id: "amex_bcp", name: "Amex Blue Cash Preferred ($95/yr)", category: "Credit Card", icon: "💳", color: "#006FCF",
    streamingPerks: [
      { serviceId: "disney", tier: "$10/mo Disney credit", value: 10, note: "$10/mo statement credit toward Disney streaming + 6% cashback on all streaming" },
    ],
  },
  { id: "mastercard_world", name: "Mastercard World/World Elite", category: "Credit Card", icon: "💳", color: "#EB001B",
    streamingPerks: [
      { serviceId: "peacock", tier: "$3–5/mo credit", value: 3, note: "$3/mo (World) or $5/mo (Elite/Legend) Peacock credit. New customers only." },
    ],
  },

  // === STUDENT DISCOUNTS ===
  { id: "hulu_student", name: "Hulu Student ($1.99/mo)", category: "Student Discount", icon: "🎓", color: "#1CE783",
    streamingPerks: [
      { serviceId: "hulu", tier: "80% off!", value: 8.00, note: "Hulu for $1.99/mo instead of $9.99 — 80% savings!" },
    ],
  },
  { id: "spotify_student", name: "Spotify Student ($5.99/mo)", category: "Student Discount", icon: "🎓", color: "#1DB954",
    streamingPerks: [
      { serviceId: "spotify", tier: "Premium", value: 11.99, note: "Spotify Premium for $5.99/mo" },
      { serviceId: "hulu", tier: "With Ads — FREE", value: 9.99, note: "Hulu (with ads) FREE with Spotify Student!" },
    ],
  },
  { id: "youtube_student", name: "YouTube Premium Student ($7.99/mo)", category: "Student Discount", icon: "🎓", color: "#FF0000",
    streamingPerks: [
      { serviceId: "youtubepremium", tier: "Student rate", value: 6, note: "$7.99/mo instead of $13.99/mo" },
    ],
  },

  // === STREAMING BUNDLES ===
  { id: "disney_hulu_espn_bundle", name: "Disney+, Hulu, ESPN Select Bundle ($19.99/mo)", category: "Streaming Bundle", icon: "📦", color: "#113CCF",
    streamingPerks: [
      { serviceId: "disney", tier: "With Ads", value: 9.99, note: "Saves ~$12/mo vs. buying all 3 separately" },
      { serviceId: "hulu", tier: "With Ads", value: 9.99, note: "Included in bundle" },
      { serviceId: "espn", tier: "ESPN Select", value: 11.99, note: "Included in bundle" },
    ],
  },
  { id: "disney_hulu_max_bundle", name: "Disney+, Hulu, Max Bundle ($19.99/mo)", category: "Streaming Bundle", icon: "📦", color: "#113CCF",
    streamingPerks: [
      { serviceId: "disney", tier: "With Ads", value: 9.99, note: "Saves ~$13/mo vs. buying all 3 separately" },
      { serviceId: "hulu", tier: "With Ads", value: 9.99, note: "Included in bundle" },
      { serviceId: "hbomax", tier: "With Ads", value: 10.99, note: "Included in bundle" },
    ],
  },
];

const CANCEL_INSTRUCTIONS = {
  netflix: { steps: ["Go to netflix.com/account", "Click 'Cancel Membership'", "Confirm cancellation", "You keep access until end of billing period"], url: "netflix.com/account" },
  hulu: { steps: ["Go to hulu.com/account", "Click 'Cancel' under Your Subscription", "Follow prompts to confirm"], url: "hulu.com/account" },
  disney: { steps: ["Go to disneyplus.com/account", "Click your subscription → 'Cancel'", "Confirm"], url: "disneyplus.com/account" },
  hbomax: { steps: ["Go to max.com → Settings → Subscription", "Click 'Cancel Subscription'", "Confirm"], url: "max.com" },
  espn: { steps: ["Go to plus.espn.com/account", "Click 'Cancel Subscription'", "Confirm"], url: "plus.espn.com/account" },
  peacock: { steps: ["Go to peacocktv.com/account", "'Plan & Payment' → 'Cancel Plan'"], url: "peacocktv.com/account" },
  paramount: { steps: ["Go to paramountplus.com/account", "Click 'Cancel Subscription'"], url: "paramountplus.com/account" },
  appletv: { steps: ["iPhone: Settings → your name → Subscriptions", "Or go to tv.apple.com → Account → Subscriptions"], url: "tv.apple.com" },
  amazon: { steps: ["Go to amazon.com/mc/cancel", "Select 'End Membership'", "Confirm"], url: "amazon.com/mc/cancel" },
  mlbtv: { steps: ["Go to mlb.com/account", "Select 'Subscriptions' → Cancel"], url: "mlb.com/account" },
  spotify: { steps: ["Go to spotify.com/account", "'Change plan' → 'Cancel Premium'"], url: "spotify.com/account" },
  applemusic: { steps: ["iPhone: Settings → Subscriptions → Apple Music", "Or music.apple.com"], url: "music.apple.com" },
  youtubepremium: { steps: ["Go to youtube.com/paid_memberships", "'Manage' → 'Deactivate'"], url: "youtube.com/paid_memberships" },
};

// ─── APP COMPONENT ──────────────────────────────────────────
function StreamSaverApp() {
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMemberships, setSelectedMemberships] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedSaving, setExpandedSaving] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  // Plan finder state
  const [showPlanFinder, setShowPlanFinder] = useState(null); // carrier key or null
  const [finderAnswers, setFinderAnswers] = useState([]);
  const [finderStep, setFinderStep] = useState(0);

  useEffect(() => { setTimeout(() => setAnimateIn(true), 100); }, []);

  const toggleService = (id) => setSelectedServices(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  const toggleMembership = (id) => setSelectedMemberships(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const savings = showResults ? (() => {
    const results = [];
    const userMemberships = selectedMemberships.map(id => MEMBERSHIPS_AND_PLANS.find(m => m.id === id)).filter(Boolean);
    for (const serviceId of selectedServices) {
      const service = STREAMING_SERVICES.find(s => s.id === serviceId);
      if (!service) continue;
      const perksForService = [];
      for (const membership of userMemberships) {
        for (const perk of membership.streamingPerks.filter(p => p.serviceId === serviceId)) {
          perksForService.push({ membership: membership.name, tier: perk.tier, savings: perk.value, note: perk.note, color: membership.color });
        }
      }
      if (perksForService.length > 0) {
        const best = perksForService.sort((a, b) => b.savings - a.savings)[0];
        results.push({ service, perks: perksForService, bestPerk: best, monthlySavings: Math.min(best.savings, service.price), cancelInstructions: CANCEL_INSTRUCTIONS[serviceId] });
      }
    }
    return results.sort((a, b) => b.monthlySavings - a.monthlySavings);
  })() : [];

  const totalMonthly = savings.reduce((s, i) => s + i.monthlySavings, 0);
  const totalAnnual = totalMonthly * 12;
  const categories = [...new Set(MEMBERSHIPS_AND_PLANS.map(m => m.category))];

  // Plan Finder logic
  const startPlanFinder = (carrierKey) => { setShowPlanFinder(carrierKey); setFinderAnswers([]); setFinderStep(0); };
  const closePlanFinder = () => { setShowPlanFinder(null); setFinderAnswers([]); setFinderStep(0); };
  const answerFinderQuestion = (answer) => {
    const carrier = CARRIER_IDENTIFIER[showPlanFinder];
    const newAnswers = [...finderAnswers, answer];
    setFinderAnswers(newAnswers);
    if (finderStep + 1 < carrier.questions.length) {
      setFinderStep(finderStep + 1);
    } else {
      // Resolve
      const planIds = carrier.resolve(newAnswers);
      // Auto-select the resolved plans
      setSelectedMemberships(prev => {
        const updated = [...prev];
        for (const pid of planIds) { if (!updated.includes(pid)) updated.push(pid); }
        return updated;
      });
      closePlanFinder();
    }
  };

  const Btn = ({ children, onClick, primary, disabled, style: sx }) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "14px 20px", borderRadius: "14px", fontSize: "15px", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      border: primary ? "none" : "1px solid rgba(255,255,255,0.08)",
      background: primary ? (disabled ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #10B981, #059669)") : "rgba(255,255,255,0.04)",
      color: primary ? (disabled ? "#4B5C75" : "#fff") : "#7B8BA5",
      boxShadow: primary && !disabled ? "0 8px 32px rgba(16,185,129,0.3)" : "none",
      transition: "all 0.3s ease", ...sx,
    }}>{children}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(165deg, #0a0e17 0%, #0d1526 25%, #111d35 50%, #0a1628 75%, #060b14 100%)", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#e8ecf4", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(45,108,223,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-300px", left: "-200px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* HEADER */}
      <header style={{ padding: "28px 24px 20px", textAlign: "center", position: "relative", zIndex: 2, opacity: animateIn ? 1 : 0, transform: animateIn ? "translateY(0)" : "translateY(-20px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: "linear-gradient(135deg, #10B981, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 8px 32px rgba(16,185,129,0.3)" }}>💰</div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #10B981, #60A5FA, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>StreamSaver Pro</h1>
        </div>
        <p style={{ color: "#7B8BA5", fontSize: "13px", margin: "6px 0 0", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
          Stop overpaying for streaming. Discover what's already free or discounted through your plans, memberships, cards & student status.
        </p>
      </header>

      {/* PROGRESS */}
      <div style={{ padding: "0 24px", maxWidth: "600px", margin: "0 auto 20px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["Your Streaming", "Your Plans & Perks", "Your Savings"].map((label, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ height: "4px", borderRadius: "4px", background: step >= i ? "linear-gradient(90deg, #10B981, #3B82F6)" : "rgba(255,255,255,0.08)", transition: "all 0.5s" }} />
              <span style={{ display: "block", marginTop: "5px", fontSize: "10px", fontWeight: 600, color: step >= i ? "#10B981" : "#4B5C75", textAlign: "center" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "0 16px 100px", position: "relative", zIndex: 2 }}>

        {/* === STEP 0: Streaming Services === */}
        {step === 0 && (
          <div style={{ opacity: animateIn ? 1 : 0, transition: "opacity 0.5s ease 0.2s" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "22px 18px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>What streaming services are you paying for?</h2>
              <p style={{ color: "#6B7D95", fontSize: "12px", margin: "0 0 16px" }}>Select every service you currently subscribe to individually</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {STREAMING_SERVICES.map(s => {
                  const sel = selectedServices.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleService(s.id)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: sel ? `${s.color}18` : "rgba(255,255,255,0.02)", border: sel ? `2px solid ${s.color}77` : "2px solid rgba(255,255,255,0.06)", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", outline: "none" }}>
                      <span style={{ fontSize: "20px" }}>{s.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: sel ? "#fff" : "#b0bdd0" }}>{s.name}</div>
                        <div style={{ fontSize: "10px", color: sel ? s.color : "#5a6b82" }}>${s.price}/mo</div>
                      </div>
                      {sel && <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff", flexShrink: 0 }}>✓</div>}
                    </button>
                  );
                })}
              </div>
              {selectedServices.length > 0 && (
                <div style={{ marginTop: "16px", padding: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", textAlign: "center" }}>
                  <span style={{ fontSize: "12px", color: "#fca5a5" }}>Current spend: </span>
                  <span style={{ fontSize: "22px", fontWeight: 800, color: "#EF4444" }}>${selectedServices.reduce((sum, id) => sum + (STREAMING_SERVICES.find(s => s.id === id)?.price || 0), 0).toFixed(2)}/mo</span>
                </div>
              )}
            </div>
            <Btn primary onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={!selectedServices.length} style={{ width: "100%", marginTop: "16px" }}>
              Next: Your Plans & Perks →
            </Btn>
          </div>
        )}

        {/* === STEP 1: Plans / Memberships with PLAN FINDER === */}
        {step === 1 && (
          <div>
            {/* PLAN FINDER MODAL */}
            {showPlanFinder && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={closePlanFinder}>
                <div onClick={e => e.stopPropagation()} style={{ background: "#131B2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "28px 22px", maxWidth: "440px", width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "28px" }}>{CARRIER_IDENTIFIER[showPlanFinder].icon}</span>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Find Your {CARRIER_IDENTIFIER[showPlanFinder].label} Plan</div>
                      <div style={{ fontSize: "11px", color: "#6B7D95" }}>Answer {CARRIER_IDENTIFIER[showPlanFinder].questions.length} quick question{CARRIER_IDENTIFIER[showPlanFinder].questions.length > 1 ? "s" : ""} to identify your perks</div>
                    </div>
                  </div>

                  {/* Tip box */}
                  <div style={{ padding: "12px 14px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "12px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#FCD34D", marginBottom: "4px" }}>📱 How to find your plan name:</div>
                    <div style={{ fontSize: "11px", color: "#D4A04A", lineHeight: 1.6 }}>
                      {showPlanFinder === "t-mobile" ? (
                        <>• Open the <b>T-Life</b> (or T-Mobile) app<br />• Tap <b>Account</b> → your plan name is shown at the top<br />• Or check your monthly bill — it's listed near the top<br />• Common legacy names: Magenta, Magenta MAX, ONE, ONE Plus</>
                      ) : (
                        <>• Open the <b>My Verizon</b> app<br />• Go to <b>Account</b> → <b>Plan</b> — your plan name is listed<br />• Or check your bill statement<br />• Common legacy names: 5G Play More, 5G Get More, 5G Do More</>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#dbeafe", marginBottom: "12px" }}>
                    {CARRIER_IDENTIFIER[showPlanFinder].questions[finderStep].q}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {CARRIER_IDENTIFIER[showPlanFinder].questions[finderStep].options.map(opt => (
                      <button key={opt} onClick={() => answerFinderQuestion(opt)} style={{
                        padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px", cursor: "pointer", textAlign: "left", color: "#c8d4e6",
                        fontSize: "13px", fontWeight: 500, transition: "all 0.2s", outline: "none",
                      }}>
                        {opt}
                        {opt.includes("★") || opt.includes("Legacy") || opt.includes("Magenta (") || opt.includes("ONE (") || opt.includes("ONE Plus") || opt.includes("Magenta MAX") ? (
                          <span style={{ marginLeft: "6px", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(251,191,36,0.15)", color: "#FCD34D" }}>legacy</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <button onClick={closePlanFinder} style={{ marginTop: "16px", padding: "10px", background: "transparent", border: "none", color: "#5a6b82", fontSize: "13px", cursor: "pointer", width: "100%", textAlign: "center" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "22px 18px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>What plans & memberships do you have?</h2>
              <p style={{ color: "#6B7D95", fontSize: "12px", margin: "0 0 6px" }}>Select your carrier, internet, cards, memberships, and student status</p>

              {/* PLAN FINDER BUTTONS */}
              <div style={{ padding: "14px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "14px", marginBottom: "18px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#93c5fd", marginBottom: "10px" }}>🔍 Not sure which plan you have? We'll help you find it:</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button onClick={() => startPlanFinder("t-mobile")} style={{ padding: "10px 16px", borderRadius: "10px", background: "#E2007422", border: "1px solid #E2007455", color: "#F472B6", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    📱 Find My T-Mobile Plan
                  </button>
                  <button onClick={() => startPlanFinder("verizon")} style={{ padding: "10px 16px", borderRadius: "10px", background: "#CD040B22", border: "1px solid #CD040B55", color: "#FCA5A5", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    📱 Find My Verizon Plan
                  </button>
                </div>
              </div>

              {/* ALL MEMBERSHIPS BY CATEGORY */}
              {categories.map(cat => (
                <div key={cat} style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#5a6b82", marginBottom: "8px", paddingLeft: "4px" }}>{cat}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {MEMBERSHIPS_AND_PLANS.filter(m => m.category === cat).map(m => {
                      const sel = selectedMemberships.includes(m.id);
                      const relevant = m.streamingPerks.filter(p => selectedServices.includes(p.serviceId));
                      const isLegacy = m.name.includes("★");
                      return (
                        <button key={m.id} onClick={() => toggleMembership(m.id)} style={{
                          display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", width: "100%",
                          background: sel ? `${m.color}15` : "rgba(255,255,255,0.02)",
                          border: sel ? `2px solid ${m.color}55` : "2px solid rgba(255,255,255,0.05)",
                          borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", outline: "none",
                        }}>
                          <span style={{ fontSize: "18px" }}>{m.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: sel ? "#fff" : "#b0bdd0", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              {m.name.replace(" ★ Legacy", "")}
                              {isLegacy && <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "rgba(251,191,36,0.15)", color: "#FCD34D", fontWeight: 700 }}>GRANDFATHERED</span>}
                            </div>
                            {relevant.length > 0 && (
                              <div style={{ fontSize: "10px", color: "#10B981", marginTop: "2px" }}>
                                Covers: {relevant.map(p => STREAMING_SERVICES.find(s => s.id === p.serviceId)?.name).filter((v, i, a) => a.indexOf(v) === i).join(", ")}
                              </div>
                            )}
                          </div>
                          {sel && <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff", flexShrink: 0 }}>✓</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <Btn onClick={() => setStep(0)} style={{ flex: 1 }}>← Back</Btn>
              <Btn primary onClick={() => { setStep(2); setShowResults(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={!selectedMemberships.length} style={{ flex: 2 }}>
                Show My Savings 💰
              </Btn>
            </div>
          </div>
        )}

        {/* === STEP 2: Results === */}
        {step === 2 && showResults && (
          <div>
            {totalMonthly > 0 ? (
              <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.08))", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "24px", padding: "28px 22px", textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#10B981", textTransform: "uppercase", letterSpacing: "2px" }}>You could be saving</div>
                <div style={{ fontSize: "52px", fontWeight: 900, lineHeight: 1.1, marginTop: "6px", background: "linear-gradient(135deg, #10B981, #34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  ${totalMonthly.toFixed(2)}
                </div>
                <div style={{ fontSize: "15px", color: "#86efac", fontWeight: 600 }}>per month</div>
                <div style={{ marginTop: "10px", display: "inline-block", padding: "7px 18px", borderRadius: "99px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>${totalAnnual.toFixed(0)}</span>
                  <span style={{ fontSize: "12px", color: "#6ee7b7" }}> saved per year</span>
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px 22px", textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
                <h3 style={{ fontSize: "16px", color: "#fff", margin: "0 0 6px" }}>No Direct Overlaps Found</h3>
                <p style={{ fontSize: "12px", color: "#6B7D95", margin: 0 }}>Your memberships don't cover the exact services you selected. Check the tips below!</p>
              </div>
            )}

            {/* Individual savings cards */}
            {savings.map((item, idx) => (
              <div key={item.service.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", marginBottom: "10px", overflow: "hidden" }}>
                <button onClick={() => setExpandedSaving(expandedSaving === idx ? null : idx)} style={{ width: "100%", padding: "16px 18px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left", outline: "none" }}>
                  <span style={{ fontSize: "26px" }}>{item.service.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{item.service.name}</div>
                    <div style={{ fontSize: "11px", color: "#6B7D95" }}>via {item.bestPerk.membership.replace(" ★ Legacy", "")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "17px", fontWeight: 800, color: "#10B981" }}>-${item.monthlySavings.toFixed(2)}</div>
                    <div style={{ fontSize: "10px", color: "#6B7D95" }}>per month</div>
                  </div>
                  <span style={{ fontSize: "14px", color: "#4B5C75", transform: expandedSaving === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>▼</span>
                </button>
                {expandedSaving === idx && (
                  <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#60A5FA", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>✅ How to get this free/discounted</div>
                      {item.perks.map((p, i) => (
                        <div key={i} style={{ padding: "10px 12px", background: "rgba(59,130,246,0.06)", borderRadius: "10px", marginBottom: "5px", borderLeft: `3px solid ${p.color}` }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "#dbeafe" }}>{p.membership.replace(" ★ Legacy", "")}</div>
                          <div style={{ fontSize: "11px", color: "#93c5fd", marginTop: "2px" }}>{p.note}</div>
                        </div>
                      ))}
                    </div>
                    {item.cancelInstructions && (
                      <div style={{ marginTop: "14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#F87171", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>❌ Cancel your paid {item.service.name}</div>
                        <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.06)", borderRadius: "10px", borderLeft: "3px solid #EF4444" }}>
                          {item.cancelInstructions.steps.map((s, i) => (
                            <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                              <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fca5a5", flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ fontSize: "11px", color: "#fca5a5", lineHeight: "18px" }}>{s}</span>
                            </div>
                          ))}
                          <div style={{ marginTop: "6px", fontSize: "11px", color: "#60A5FA" }}>🔗 {item.cancelInstructions.url}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* No-match services */}
            {selectedServices.filter(id => !savings.find(s => s.service.id === id)).length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "14px 16px", marginTop: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#4B5C75", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>No perk found for:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedServices.filter(id => !savings.find(s => s.service.id === id)).map(id => {
                    const s = STREAMING_SERVICES.find(x => x.id === id);
                    return <span key={id} style={{ padding: "5px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", fontSize: "11px", color: "#6B7D95" }}>{s?.icon} {s?.name}</span>;
                  })}
                </div>
              </div>
            )}

            {/* Tips */}
            <div style={{ marginTop: "20px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "16px", padding: "18px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#FCD34D", marginBottom: "8px" }}>💡 Pro Tips</div>
              <div style={{ fontSize: "11px", color: "#D4A04A", lineHeight: 1.7 }}>
                • <b>Activate perks manually</b> — T-Mobile: open T-Life app → Account → Add-ons → Services. Verizon: My Verizon → Products & plan perks.<br />
                • <b>Don't switch legacy plans</b> — Grandfathered plans (Magenta, ONE, 5G Play More, etc.) often have better perks than new plans. Switching means losing them permanently!<br />
                • <b>Cancel paid sub BEFORE</b> activating the free version to avoid double-billing.<br />
                • <b>Student?</b> Hulu $1.99/mo, Spotify+Hulu $5.99/mo, Amazon Prime 50% off, Walmart+ 50% off.<br />
                • <b>Amex Platinum</b> = $25/mo entertainment credit covering Disney+, Hulu, ESPN+, Peacock, Paramount+, YouTube Premium, and more.<br />
                • <b>Walmart+</b> = free Paramount+ or Peacock (switch every 90 days). AARP saves extra $40/yr.<br />
                • <b>Kroger Boost</b> = free Disney+, Hulu, or ESPN+. <b>Instacart+</b> = free Peacock.
              </div>
            </div>

            {/* ══ SAVINGS CONFIRMATION ══ */}
            <div style={{ marginTop: "20px", background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.06))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", marginBottom: "6px" }}>🎉</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Did you activate a perk or cancel a duplicate?</div>
              <div style={{ fontSize: "11px", color: "#7B8BA5", marginBottom: "14px", lineHeight: 1.5 }}>Let us know! Your feedback helps us prove this tool works and improve it for everyone.</div>
              <a href="https://forms.gle/YOUR_SAVINGS_FORM_ID" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "12px 28px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 24px rgba(16,185,129,0.3)", transition: "all 0.2s" }}>
                ✅ Yes, I Saved Money! (30 sec survey)
              </a>
            </div>

            {/* ══ EMAIL CAPTURE ══ */}
            <div style={{ marginTop: "14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", marginBottom: "6px" }}>🔔</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Get alerts when your perks change</div>
              <div style={{ fontSize: "11px", color: "#7B8BA5", marginBottom: "14px", lineHeight: 1.5 }}>Carriers update perks without warning. We'll email you when something changes so you never miss savings or lose a perk.</div>
              <a href="https://forms.gle/YOUR_EMAIL_FORM_ID" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "12px 28px", borderRadius: "12px", background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", fontSize: "14px", fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 24px rgba(99,102,241,0.3)", transition: "all 0.2s" }}>
                📧 Sign Up for Free Alerts
              </a>
              <div style={{ fontSize: "10px", color: "#4B5C75", marginTop: "8px" }}>No spam. Only perk changes that affect you. Unsubscribe anytime.</div>
            </div>

            {/* ══ SHARE ══ */}
            <div style={{ marginTop: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#b0bdd0", marginBottom: "10px" }}>Know someone overpaying for streaming?</div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent("I just found out I had free streaming through my phone plan and I've been paying for it separately 🤦 Check if you're overpaying too:") + "&url=" + encodeURIComponent("https://streamsaver-pro.vercel.app")} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(29,161,242,0.15)", border: "1px solid rgba(29,161,242,0.3)", color: "#1DA1F2", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>Share on X</a>
                <button onClick={() => { if (navigator.share) { navigator.share({ title: "StreamSaver Pro", text: "I found free streaming I didn't know about! Check yours:", url: "https://streamsaver-pro.vercel.app" }); } else { navigator.clipboard.writeText("https://streamsaver-pro.vercel.app"); alert("Link copied!"); } }} style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b0bdd0", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>📋 Copy Link</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Btn onClick={() => { setStep(1); setShowResults(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ flex: 1 }}>← Edit Plans</Btn>
              <Btn onClick={() => { setStep(0); setShowResults(false); setSelectedServices([]); setSelectedMemberships([]); setExpandedSaving(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ flex: 1, background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", border: "none", fontWeight: 700, boxShadow: "0 8px 32px rgba(59,130,246,0.3)" }}>Start Over 🔄</Btn>
            </div>

            <div style={{ textAlign: "center", marginTop: "28px", fontSize: "10px", color: "#3B4A5E" }}>
              Data last updated February 2026 · Perks and prices subject to change<br />StreamSaver Pro
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null, React.createElement(StreamSaverApp))
)
