import { useState, useMemo } from 'react';
import { TierProvider } from '@/contexts/TierContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSchools } from '@/hooks/useSchools';
import { SchoolProfile } from '@/components/dashboard/SchoolProfile';
import { School } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 12;

function SchoolsContent() {
  const { data: schools, isLoading } = useSchools();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('avgScore');
  const [currentPage, setCurrentPage] = useState(1);

  const countries = useMemo(() => {
    if (!schools) return [];
    const uniqueCountries = [...new Set(schools.map(s => s.country))];
    return uniqueCountries.sort();
  }, [schools]);

  const filteredSchools = useMemo(() => {
    if (!schools) return [];
    
    let result = [...schools];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.country.toLowerCase().includes(query)
      );
    }
    
    // Country filter
    if (countryFilter && countryFilter !== 'all') {
      result = result.filter(s => s.country === countryFilter);
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'avgScore':
          return b.avgScore - a.avgScore;
        case 'sustainability':
          return b.sustainability - a.sustainability;
        case 'trend':
          return b.trendValue - a.trendValue;
        default:
          return 0;
      }
    });
    
    return result;
  }, [schools, searchQuery, countryFilter, sortBy]);

  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSchools.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSchools, currentPage]);

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Schools Directory</h1>
            <p className="text-muted-foreground text-sm">
              {filteredSchools.length} schools in the directory
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="avgScore">Highest Score</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="sustainability">Sustainability</SelectItem>
              <SelectItem value="trend">Trending Up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedSchools.map((school) => (
            <div
              key={school.id}
              onClick={() => setSelectedSchool(school)}
              className="bg-card rounded-2xl border p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {school.name.charAt(0)}
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  school.trend === 'up' 
                    ? "bg-primary/10 text-primary" 
                    : school.trend === 'down' 
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
                )}>
                  {school.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {school.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                  {school.trendValue > 0 ? '+' : ''}{school.trendValue}%
                </div>
              </div>
              
              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {school.name}
              </h3>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" />
                {school.country}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Impact Score</span>
                <span className="text-lg font-bold text-primary">{school.avgScore.toFixed(1)}</span>
              </div>
              
              {/* Score bars */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-16">Sustain</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${school.sustainability}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-16">Community</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-plus rounded-full" 
                      style={{ width: `${school.communityEngagement}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-16">Wellbeing</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pro rounded-full" 
                      style={{ width: `${school.wellbeing}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* School Profile Modal */}
      {selectedSchool && (
        <SchoolProfile 
          school={selectedSchool} 
          onClose={() => setSelectedSchool(null)} 
        />
      )}
    </DashboardLayout>
  );
}

export default function SchoolsPage() {
  return (
    <TierProvider>
      <SchoolsContent />
    </TierProvider>
  );
}
