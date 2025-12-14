import { useState } from 'react';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail, 
  ChevronDown,
  ExternalLink,
  Search,
  Zap,
  Shield,
  BarChart3,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

const faqs = [
  {
    category: 'Getting Started',
    icon: Zap,
    questions: [
      {
        q: 'How do I sync my school data?',
        a: 'Navigate to the Settings page and click "Sync Now" in the Data & Sync section. This will fetch the latest data from your connected Google Sheet.'
      },
      {
        q: 'What is the Impact Score?',
        a: 'The Impact Score is a composite metric calculated from five key criteria: Sustainability, Community Engagement, Wellbeing, Innovation, and Global Awareness. Each criterion is weighted equally to provide an overall assessment of a school\'s impact.'
      },
      {
        q: 'How often is data updated?',
        a: 'Data can be synced manually at any time. You can also enable auto-sync in Settings to automatically update data every hour.'
      }
    ]
  },
  {
    category: 'Features & Tiers',
    icon: BarChart3,
    questions: [
      {
        q: 'What features are available in each tier?',
        a: 'Free tier includes basic dashboard access and leaderboard. Plus tier adds analytics, comparisons, and export features. Pro tier unlocks advanced AI insights, unlimited comparisons, and priority support.'
      },
      {
        q: 'How do I upgrade my subscription?',
        a: 'You can upgrade your subscription by visiting the Settings page and selecting "Manage Subscription" under the Account section.'
      },
      {
        q: 'Can I switch between tiers?',
        a: 'Yes! Use the Tier Selector on the dashboard to preview features available at different subscription levels. Your actual access depends on your current subscription.'
      }
    ]
  },
  {
    category: 'Data & Privacy',
    icon: Shield,
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes, all data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties.'
      },
      {
        q: 'How can I export my data?',
        a: 'Go to Settings > Data & Sync and click "Export Data" to download a CSV file containing all your school data.'
      },
      {
        q: 'Can I delete my data?',
        a: 'Yes, in Settings > Danger Zone, you can delete all school data or your entire account. Note that this action is irreversible.'
      }
    ]
  },
  {
    category: 'Account Management',
    icon: Users,
    questions: [
      {
        q: 'How do I change my password?',
        a: 'Navigate to Settings > Account and click "Change Password". You\'ll receive instructions to update your credentials securely.'
      },
      {
        q: 'How do I enable two-factor authentication?',
        a: 'Go to Settings > Security and click "Enable 2FA". Follow the prompts to set up authenticator app-based verification.'
      },
      {
        q: 'Can I change my email address?',
        a: 'Yes, in Settings > Account, click "Change Email" to update your email address. You\'ll need to verify the new email before the change takes effect.'
      }
    ]
  }
];

const resources = [
  {
    title: 'Documentation',
    description: 'Complete guides and API references',
    icon: Book,
    href: '#'
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users',
    icon: MessageCircle,
    href: '#'
  },
  {
    title: 'Contact Support',
    description: 'Get help from our team',
    icon: Mail,
    href: '#'
  }
];

function HelpContent() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Help Center</h1>
          <p className="text-muted-foreground mt-2">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.href}
              className="bg-card rounded-2xl border p-5 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <resource.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resource.description}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <h2 className="text-lg font-display font-semibold">
            Frequently Asked Questions
          </h2>
          
          {filteredFaqs.map((category) => (
            <div key={category.category} className="bg-card rounded-2xl border overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <category.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">{category.category}</h3>
              </div>
              <Accordion type="single" collapsible className="px-4">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-sm hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-display font-semibold mb-2">
            Still need help?
          </h2>
          <p className="text-muted-foreground mb-4">
            Our support team is here to assist you
          </p>
          <Button className="gap-2">
            <Mail className="h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function HelpPage() {
  return (
    <TierProvider>
      <HelpContent />
    </TierProvider>
  );
}
