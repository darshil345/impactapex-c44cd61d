import { useState } from 'react';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { SchoolProfile } from '@/components/dashboard/SchoolProfile';
import { School } from '@/lib/mockData';

function LeaderboardContent() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Global Leaderboard</h1>
          <p className="text-muted-foreground">Top performing schools worldwide ranked by impact score</p>
        </div>
        
        <Leaderboard 
          onSchoolClick={setSelectedSchool} 
          selectedSchool={selectedSchool} 
        />
      </div>

      <SchoolProfile 
        school={selectedSchool} 
        onClose={() => setSelectedSchool(null)} 
      />
    </DashboardLayout>
  );
}

export default function LeaderboardPage() {
  return (
    <TierProvider>
      <LeaderboardContent />
    </TierProvider>
  );
}
