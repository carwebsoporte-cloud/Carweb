interface SeverityBadgeProps {
  severity: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const getStyles = () => {
    if (severity === 'Crítica/No conducir') {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    } else if (severity === 'Moderada') {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getLabel = () => {
    if (severity === 'Crítica/No conducir') return 'Crítica';
    return severity;
  };

  return (
    <span className={`${sizeClasses[size]} ${getStyles()} font-medium rounded-full border`}>
      {getLabel()}
    </span>
  );
}
