import { useState, useMemo } from 'react';
import { School } from '@/lib/mockData';
import { Search, Filter, X, MapPin, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolSearchProps {
  schools: School[];
  onFilter: (filtered: School[]) => void;
}

export function SchoolSearch({ schools, onFilter }: SchoolSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'trend'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(schools.map(s => s.region))];
    return ['all', ...uniqueRegions];
  }, [schools]);

  const filteredSchools = useMemo(() => {
    let result = [...schools];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.country.toLowerCase().includes(query) ||
        s.region.toLowerCase().includes(query)
      );
    }

    // Region filter
    if (selectedRegion !== 'all') {
      result = result.filter(s => s.region === selectedRegion);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'score') {
        comparison = a.avgScore - b.avgScore;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'trend') {
        comparison = a.trendValue - b.trendValue;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [schools, searchQuery, selectedRegion, sortBy, sortOrder]);

  // Update parent with filtered results
  useMemo(() => {
    onFilter(filteredSchools);
  }, [filteredSchools, onFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSortBy('score');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || selectedRegion !== 'all';

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schools, countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {regions.map(region => (
              <option key={region} value={region}>
                {region === 'all' ? 'All Regions' : region}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'trend')}
            className="px-3 py-2 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="trend">Sort by Trend</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4 text-muted-foreground" />
            ) : (
              <SortDesc className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filteredSchools.length} of {schools.length} schools
        </span>
        {hasActiveFilters && (
          <span className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filters active
          </span>
        )}
      </div>
    </div>
  );
}
