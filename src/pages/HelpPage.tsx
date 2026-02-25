import { useState } from 'react';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HelpCircle, Book, MessageCircle, Mail, Search, Zap, Shield, Package, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    category: 'Getting Started',
    icon: Zap,
    questions: [
      { q: 'How do I add a product?', a: 'Click "Add Product" in the sidebar or dashboard, paste any product URL, and our AI will automatically research it for you.' },
      { q: 'What kind of products can I research?', a: 'Any product from any online store — Amazon, eBay, Walmart, Apple, Nike, or any other website. Just paste the product link.' },
      { q: 'How long does research take?', a: 'AI research typically takes 10-20 seconds per product. You\'ll see real-time updates as the analysis completes.' },
    ]
  },
  {
    category: 'Product Research',
    icon: Package,
    questions: [
      { q: 'What does the AI analyze?', a: 'Our AI evaluates products across 5 dimensions: Quality, Value for Money, Innovation, Sustainability, and Market Popularity. It also provides pros, cons, and a recommendation.' },
      { q: 'Can I re-research a product?', a: 'Yes! Click the refresh icon on any product card to get an updated analysis.' },
      { q: 'How accurate are the ratings?', a: 'Ratings are based on AI analysis of the product URL, brand reputation, and available information. They provide a good starting point for decision-making.' },
    ]
  },
  {
    category: 'Data & Privacy',
    icon: Shield,
    questions: [
      { q: 'Is my data secure?', a: 'Yes, all data is encrypted and stored securely. Only you can see your product research.' },
      { q: 'Can I export my data?', a: 'Go to Settings > Products & Data and click "Export Data" to download a CSV of all your researched products.' },
      { q: 'Can I delete my data?', a: 'Yes, in Settings > Danger Zone, you can delete all products or your entire account.' },
    ]
  },
  {
    category: 'Account',
    icon: Users,
    questions: [
      { q: 'Is it really free?', a: 'Yes! All features are completely free with no limits on the number of products you can research.' },
      { q: 'How do I change my password?', a: 'Go to Settings > Account and click "Change Password".' },
    ]
  }
];

function HelpContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredFaqs = faqs.map(c => ({
    ...c,
    questions: c.questions.filter(q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || q.a.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(c => c.questions.length > 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-4xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Help Center</h1>
          <p className="text-muted-foreground mt-2">Find answers to common questions</p>
        </div>

        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search for answers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 text-base rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ title: 'Documentation', desc: 'Guides and references', icon: Book },
            { title: 'Community', desc: 'Connect with users', icon: MessageCircle },
            { title: 'Support', desc: 'Get help from our team', icon: Mail }].map(r => (
            <div key={r.title} className="bg-card rounded-2xl border p-5 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10"><r.icon className="h-5 w-5 text-primary" /></div>
                <div><h3 className="font-semibold">{r.title}</h3><p className="text-sm text-muted-foreground mt-1">{r.desc}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-display font-semibold">Frequently Asked Questions</h2>
          {filteredFaqs.map(cat => (
            <div key={cat.category} className="bg-card rounded-2xl border overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                <div className="p-2 rounded-lg bg-primary/10"><cat.icon className="h-4 w-4 text-primary" /></div>
                <h3 className="font-medium">{cat.category}</h3>
              </div>
              <Accordion type="single" collapsible className="px-4">
                {cat.questions.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-sm hover:no-underline">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-display font-semibold mb-2">Still need help?</h2>
          <p className="text-muted-foreground mb-4">Our support team is here to assist you</p>
          <Button className="gap-2"><Mail className="h-4 w-4" />Contact Support</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function HelpPage() {
  return (<TierProvider><HelpContent /></TierProvider>);
}
