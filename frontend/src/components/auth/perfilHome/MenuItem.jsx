import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export const MenuItem = ({ icon: Icon, title, subtitle, href, isLast }) => (
  <Link 
    href={href} 
    className={`flex w-full items-center gap-4 py-4 px-4 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
  >
    <div className="shrink-0 text-[#0B376D] h-6 w-6">
      {Icon}
    </div>
    
    <div className="flex grow flex-col text-left">
      <span className="text-sm font-semibold text-[#0B376D]">{title}</span>
      {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
    </div>
    
    <div className="shrink-0">
      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    </div>
  </Link>
);