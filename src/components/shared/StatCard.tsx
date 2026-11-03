import Card from '@/components/ui/Card';
import { CardContent } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
}: StatCardProps) => {
  return (
    <Card 
      className="bg-card border border-border"
      style={{ 
        borderRadius: '24px',
        boxShadow: '0 4px 32px rgba(0, 0, 0, 0.1)',
        height: '136px'
      }}
    >
      <CardContent className="p-5 h-full flex flex-col">
        <div 
          className="rounded-full flex items-center justify-center mb-3"
          style={{ 
            width: '48px', 
            height: '48px',
            backgroundColor: 'var(--color-icon-bg)'
          }}
        >
          <Icon className="w-5 h-5 text-brand-text" />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '20px', color: '#393939' }}>
            {value}
          </div>
          <div className="text-sm font-medium text-muted-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', color: '#717171' }}>
            {title}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
