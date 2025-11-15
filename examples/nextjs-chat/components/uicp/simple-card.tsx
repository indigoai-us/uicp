/**
 * SimpleCard UICP Component
 */

interface SimpleCardProps {
  title: string;
  content: string;
  footer?: string;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'border-gray-700 bg-gray-800/50',
  info: 'border-blue-600 bg-blue-950/50',
  success: 'border-green-600 bg-green-950/50',
  warning: 'border-yellow-600 bg-yellow-950/50',
  error: 'border-red-600 bg-red-950/50',
};

const variantTitleStyles = {
  default: 'text-gray-100',
  info: 'text-blue-300',
  success: 'text-green-300',
  warning: 'text-yellow-300',
  error: 'text-red-300',
};

export function SimpleCard({
  title,
  content,
  footer,
  variant = 'default',
}: SimpleCardProps) {
  return (
    <div
      className={`border rounded-lg p-6 my-4 ${variantStyles[variant]}`}
    >
      <h3 className={`text-xl font-semibold mb-3 ${variantTitleStyles[variant]}`}>
        {title}
      </h3>
      <div className="text-gray-300 leading-relaxed mb-4">
        {content}
      </div>
      {footer && (
        <div className="text-sm text-gray-400 pt-3 border-t border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
}

