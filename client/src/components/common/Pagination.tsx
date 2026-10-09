import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-[#E8E0D6] mt-4">
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <p className="text-xs text-[#77716B]">
          Showing <span className="font-semibold text-[#24211F]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-semibold text-[#24211F]">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{' '}
          of <span className="font-semibold text-[#24211F]">{totalItems}</span> results
        </p>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-[#E8E0D6] bg-white text-gray-600 hover:bg-[#FAF7F2] hover:text-[#B8955A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-[#24211F] bg-[#FAF7F2] border border-[#E8E0D6] rounded-lg">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-[#E8E0D6] bg-white text-gray-600 hover:bg-[#FAF7F2] hover:text-[#B8955A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
