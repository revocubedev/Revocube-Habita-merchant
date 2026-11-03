import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Home, DoorOpen } from 'lucide-react';
import { mockProperties } from '@/lib/mockData';

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCardMenu, setShowCardMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const filteredProperties = mockProperties.filter((property) =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProperties.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.card-menu-container')) {
        setShowCardMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'Poppins' }}>
        <span className="text-muted-foreground">Real Estate</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-brand-text font-medium" style={{ color: '#f30100' }}>Properties</span>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Property List
        </h2>
        <button
          className="text-sm text-white transition-colors flex items-center gap-2 px-4 py-2"
          style={{ 
            fontFamily: 'Poppins', 
            borderRadius: '8px', 
            backgroundColor: '#f30100',
            border: 'none'
          }}
        >
          + Create Property
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-lg p-4" style={{ borderColor: '#e3e3e3', borderRadius: '12px' }}>
        <div className="max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-brand-text/20 transition-colors"
            style={{ fontFamily: 'Poppins', borderColor: '#e3e3e3' }}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentProperties.map((property) => (
          <div
            key={property.id}
            className="bg-card border border-border rounded-lg overflow-hidden"
            style={{ borderColor: '#e3e3e3', borderRadius: '12px' }}
          >
            {/* Property Image */}
            <div className="relative h-40 bg-muted">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <Home className="w-12 h-12 text-gray-400" />
              </div>
              
              {/* Ownership Badge */}
              <div
                className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded"
                style={{
                  fontFamily: 'Poppins',
                  backgroundColor: 'white',
                  border: '1px solid #f30100',
                  color: '#f30100',
                  borderRadius: '4px'
                }}
              >
                {property.ownershipType}
              </div>

              {/* Image Navigation */}
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button
                  className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Property Info */}
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground" style={{ fontFamily: 'Poppins' }}>
                  {property.name}
                </h3>
                <div className="relative card-menu-container">
                  <button
                    onClick={() => setShowCardMenu(showCardMenu === property.id ? null : property.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showCardMenu === property.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg p-1 z-10" style={{ borderColor: '#e3e3e3', borderRadius: '8px' }}>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Property
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Property
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2 text-brand-text" style={{ color: '#f30100' }}>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3 line-clamp-2" style={{ fontFamily: 'Poppins' }}>
                {property.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground" style={{ fontFamily: 'Poppins' }}>
                <div className="flex items-center gap-1">
                  <DoorOpen className="w-3 h-3" />
                  <span>{property.unitCount} Unit</span>
                </div>
                <div className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span>{property.roomCount} Rooms</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Poppins' }}>
            Show
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 text-sm border border-border rounded bg-card"
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
          <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Poppins' }}>
            entries per page
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" 
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            First
          </button>
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" 
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted"
                style={{ 
                  fontFamily: 'Poppins', 
                  borderRadius: '6px', 
                  borderColor: '#e3e3e3',
                  backgroundColor: currentPage === pageNum ? '#f30100' : 'white',
                  color: currentPage === pageNum ? 'white' : 'inherit'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" 
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            Next
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted disabled:opacity-50" 
            style={{ fontFamily: 'Poppins', borderRadius: '6px', borderColor: '#e3e3e3' }}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default Properties;
