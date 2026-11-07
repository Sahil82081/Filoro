import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, FileText, FileImage, FileCode, AppWindow, Sparkles } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { TOOLS_DATA, ToolItem } from '../utils/toolsData';

interface ToolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolItem) => void;
}

export const ToolSearchModal: React.FC<ToolSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState('');

  // Reset query on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.fileTypes.some((ext) => ext.toLowerCase().includes(q))
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#FF7900]" />;
      case 'image':
        return <FileImage className="w-4 h-4 text-[#FFBF00]" />;
      case 'document':
        return <FileCode className="w-4 h-4 text-[#E66D00]" />;
      case 'application':
        return <AppWindow className="w-4 h-4 text-[#202020] dark:text-[#FFFDF7]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#666666] dark:text-[#B8AF9F]" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'pdf':
        return <Badge variant="coral" size="sm">PDF</Badge>;
      case 'image':
        return <Badge variant="brand" size="sm">Image</Badge>;
      case 'document':
        return <Badge variant="champagne" size="sm">Document</Badge>;
      case 'application':
        return <Badge variant="neutral" size="sm">App Tool</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{category}</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search Filoro Tools"
      description="Quickly find tools by name, action, or extension (e.g. pdf, compress, webp)."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Search input field */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF7900]" />
          <input
            type="text"
            aria-label="Search tools by name, action, or file type"
            placeholder="Search tools (e.g. compress, pdf, resize, docx)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20] text-sm text-[#202020] dark:text-[#FFFDF7] placeholder:text-[#666666]/50 dark:placeholder:text-[#B8AF9F]/40 focus:outline-none focus:border-[#FFBF00] focus:ring-2 focus:ring-[#FFBF00]/25 transition"
          />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
          {filteredTools.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#666666] dark:text-[#B8AF9F]">
              No tools matching "{query}".
            </div>
          ) : (
            filteredTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectTool(tool);
                }}
                className="w-full text-left p-3 rounded-xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#17130E] hover:border-[#FFBF00] hover:bg-[#FBF3DF] dark:hover:bg-[#251F17] transition flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-[#FFBF00]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F8F5EE] dark:bg-[#221D16] border border-[#EDE7D9] dark:border-[#332B20]">
                    {getCategoryIcon(tool.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7] group-hover:text-[#FF7900] transition">
                        {tool.name}
                      </span>
                      {getCategoryBadge(tool.category)}
                    </div>
                    <p className="text-[11px] text-[#666666] dark:text-[#B8AF9F] line-clamp-1">{tool.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#666666] dark:text-[#B8AF9F] bg-[#F8F5EE] dark:bg-[#221D16] px-2 py-0.5 rounded border border-[#EDE7D9] dark:border-[#332B20]">
                    {tool.fileTypes.slice(0, 2).join(' ')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#FF7900] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ToolSearchModal;
