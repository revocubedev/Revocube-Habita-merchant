import { useState, useEffect } from 'react';
import { MoreHorizontal, Download, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';
import { mockNotices } from '@/lib/mockData';

const NoticeBoard = () => {
  const [showCardMenu, setShowCardMenu] = useState<string | null>(null);

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
      {/* Page Heading */}
      <h1 className="text-2xl font-display font-semibold text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 600, color: '#393939' }}>
        Notice Board
      </h1>

      {/* Note List Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Note List
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
          + Create Note
        </button>
      </div>

      {/* Notice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockNotices.map((notice) => (
          <Card
            key={notice.id}
            className="bg-card border border-border"
            style={{ 
              borderColor: '#e3e3e3',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent className="p-4">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Poppins' }}>
                  {notice.date}
                </div>
                <div className="relative card-menu-container">
                  <button
                    onClick={() => setShowCardMenu(showCardMenu === notice.id ? null : notice.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showCardMenu === notice.id && (
                    <div
                      className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg p-1 z-10"
                      style={{ borderColor: '#e3e3e3', borderRadius: '8px' }}
                    >
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Property
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2 text-brand-text"
                        style={{ color: '#f30100' }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1" style={{ fontFamily: 'Poppins' }}>
                    Title
                  </div>
                  <div className="text-sm font-medium text-foreground" style={{ fontFamily: 'Poppins' }}>
                    {notice.title}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1" style={{ fontFamily: 'Poppins' }}>
                    Description
                  </div>
                  <div className="text-sm text-muted-foreground" style={{ fontFamily: 'Poppins' }}>
                    {notice.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;
