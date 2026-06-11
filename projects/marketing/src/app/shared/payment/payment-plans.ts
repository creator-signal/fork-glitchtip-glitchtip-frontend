export interface PlanFeature {
  text: string;
  tooltip?: string;
}

export interface PlanOption {
  name: string;
  subtitle: string;
  includesFrom?: string;
  features: PlanFeature[];
  monthlyPrice: number | "Free" | "Custom";
  annualPrice?: number | "Custom";
  priceSuffix?: string;
  ctaText?: string;
  ctaUrl?: string;
  // Self-serve Stripe Payment Links, one per billing interval. When set, the
  // CTA links to the interval matching the monthly/annual toggle instead of
  // ctaUrl. NOTE: sandbox (test_) URLs — swap for live links before launch.
  paymentLinks?: { monthly: string; annual: string };
}

export const planOptions: PlanOption[] = [
  {
    name: "Free",
    subtitle: "For Personal Projects",
    features: [
      { text: "Up to 1,000 events/mo" },
      { text: "Error tracking" },
      { text: "Unlimited projects" },
      { text: "Unlimited team members" },
    ],
    monthlyPrice: "Free",
  },
  {
    name: "Small",
    subtitle: "For small teams",
    includesFrom: "Free",
    features: [
      { text: "Up to 100k events/mo" },
      { text: "Support access" },
    ],
    monthlyPrice: 15,
    annualPrice: 150,
  },
  {
    name: "Medium",
    subtitle: "For growing businesses",
    includesFrom: "Small",
    features: [
      { text: "Up to 500k events/mo" },
      { text: "Priority email & live chat support" },
    ],
    monthlyPrice: 50,
    annualPrice: 500,
  },
  {
    name: "Large",
    subtitle: "For large scaling organizations",
    includesFrom: "Medium",
    features: [
      { text: "Up to 3 million events/mo" },
      { text: "Development support & prioritization" },
      { text: "Business Associate Agreement (BAA) available upon request" },
    ],
    monthlyPrice: 250,
    annualPrice: 2500,
  },
];

export const selfHostedPlanOptions: PlanOption[] = [
  {
    name: "Starter Edition",
    subtitle: "For personal use and open source projects",
    features: [
      { text: "Unlimited usage" },
      { text: "Host on your infrastructure" },
      { text: "Unlimited projects" },
    ],
    monthlyPrice: "Free",
    ctaText: "Get started",
    ctaUrl: "https://glitchtip.com/documentation/install",
  },
  {
    name: "Individual License",
    subtitle: "Developer use for 1 user",
    includesFrom: "Starter",
    features: [{ text: "Support access for 1 user" }],
    monthlyPrice: 5,
    annualPrice: 50,
    ctaText: "Subscribe",
    ctaUrl: "https://glitchtip.com/documentation/install",
    paymentLinks: {
      monthly: "https://buy.stripe.com/test_dRm9AV4Vv47B6HpdGtd7q03",
      annual: "https://buy.stripe.com/test_3cI3cx4Vv0Vpe9ReKxd7q02",
    },
  },
  {
    name: "Commercial License",
    subtitle: "For business use",
    includesFrom: "Individual",
    features: [
      { text: "Team support access: priority email & live chat + update assistance" },
    ],
    monthlyPrice: 15,
    annualPrice: 150,
    priceSuffix: "/user/month",
    ctaText: "Subscribe",
    ctaUrl: "mailto:sales@glitchtip.com",
    paymentLinks: {
      monthly: "https://buy.stripe.com/test_bJedRb2Nn5bF9TBfOBd7q05",
      annual: "https://buy.stripe.com/test_28EfZj73DgUn0j18m9d7q06",
    },
  },
  {
    name: "Scaled Support",
    subtitle: "For large organizations and regulated industries (10 user minimum)",
    includesFrom: "Commercial",
    features: [
      { text: "Custom Branding" },
      { text: "Single Sign-On integration" },
      { text: "Development support & prioritization" },
    ],
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    ctaText: "Contact sales",
    ctaUrl: "mailto:sales@glitchtip.com",
  },
];
