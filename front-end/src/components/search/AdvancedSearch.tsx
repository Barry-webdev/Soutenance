import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, X, Loader } from 'lucide-react';

interface SearchFilters {
  query: string;
  wasteType: string;
  status: string;
  startDate: string;
  endDate: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  _id: string;
  description: string;
  wasteType: string;
  status: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
  userId: {
    name: string;
    email: string;
  };
  images?: {
    thumbnailUrl?: string;
  };
}

interface AdvancedSearchProps {
  onResultsChange?: (results: SearchResult[]) => void;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onResultsChange, 
  className = '' 
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    wasteType: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const wasteTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'plastique', label: 'Plastique' },
    { value: 'verre', label: 'Verre' },
    { value: 'papier', label: 'Papier' },
    { value: 'metal', label: 'Métal' },
    { value: 'organique', label: 'Organique' },
    { value: 'electronique', label: 'Électronique' },
    { value: 'textile', label: 'Textile' },
    { value: 'autre', label: 'Autre' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'collected', label: 'Collecté' },
    { value: 'resolved', label: 'Résolu' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date de création' },
    { value: 'wasteType', label: 'Type de déchet' },
    { value: 'status', label: 'Statut' }
  ];

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.query.trim()) {
        performSearch();
      } else {
        setResults([]);
        setPagination({ currentPage: 1, totalPages: 1, totalCount: 0 });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Suggestions avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.query]);

  const performSearch = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: page.toString(),
        limit: '20'
      });

      // Supprimer les paramètres vides
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof SearchFilters] || filters[key as keyof SearchFilters] === 'all') {
          params.delete(key);
        }
      });

      const response = await fetch(`/api/search/reports?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.reports);
        setPagination(data.data.pagination);
        onResultsChange?.(data.data.reports);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/search/suggestions?query=${encodeURIComponent(filters.query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, query: suggestion }));
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      wasteType: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setResults([]);
    setPagination({ currentPage: 1, totalPages: 1, totalCount: 0 });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      collected: 'bg-green-100 text-green-800',
      resolved: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      collected: 'Collecté',
      resolved: 'Résolu'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Barre de recherche principale */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des signalements..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              
              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
            </button>
            
            {(filters.query || filters.wasteType !== 'all' || filters.status !== 'all' || filters.startDate || filters.endDate) && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-3 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de déchet
              </label>
              <select
                value={filters.wasteType}
                onChange={(e) => handleFilterChange('wasteType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {wasteTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Résultats */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Recherche en cours...</span>
          </div>
        )}

        {!loading && results.length === 0 && filters.query && (
          <div className="text-center py-8">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {pagination.totalCount} résultat{pagination.totalCount > 1 ? 's' : ''} trouvé{pagination.totalCount > 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {results.map((result) => (
                <div key={result._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    {result.images?.thumbnailUrl && (
                      <img
                        src={result.images.thumbnailUrl}
                        alt="Signalement"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {result.wasteType}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(result.status)}`}>
                          {getStatusLabel(result.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {result.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{result.location.address || `${result.location.lat.toFixed(4)}, ${result.location.lng.toFixed(4)}`}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span>Par {result.userId.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-2">
                <button
                  onClick={() => performSearch(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {pagination.currentPage} sur {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => performSearch(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;