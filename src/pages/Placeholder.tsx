

interface PlaceholderProps {
  title: string;
  description?: string;
}

const Placeholder = ({ title, description }: PlaceholderProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">
          This page will be implemented in a future batch.
        </p>
      </div>
    </div>
  );
};

export default Placeholder;
