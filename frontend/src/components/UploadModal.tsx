import React, { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
import { TOOLS_DATA, ToolItem } from '../utils/toolsData';
import { UploadedFileMetadata } from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMetadata | null>(null);

  const getMatchedTools = (extWithDot: string): ToolItem[] => {
    return TOOLS_DATA.filter((tool) =>
      tool.fileTypes.some((t) => t.toLowerCase() === extWithDot.toLowerCase() || t === '*.*')
    );
  };

  const matchedTools = uploadedFile
    ? getMatchedTools(`.${uploadedFile.extension}`)
    : [];

  const handleClose = () => {
    setUploadedFile(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload File"
      description="Upload your document or image for server-side verification and matching tools."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Reusable FileUpload Component */}
        <FileUpload
          autoUpload={true}
          onUploadSuccess={(metadata) => setUploadedFile(metadata)}
          onFileRemove={() => setUploadedFile(null)}
        />

        {/* Recommended Tools if uploaded */}
        {uploadedFile && (
          <div className="space-y-2.5 pt-3 border-t border-[#EDE7D9] dark:border-[#332B20]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
                Recommended Tools for this {uploadedFile.extension.toUpperCase()} file:
              </span>
              <span className="text-[11px] text-[#666666] dark:text-[#B8AF9F] font-mono">
                {matchedTools.length} found
              </span>
            </div>

            {matchedTools.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20] text-xs text-[#666666] dark:text-[#B8AF9F] text-center">
                No specialized tools registered for this file extension yet.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {matchedTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      handleClose();
                      onSelectTool(tool);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#17130E] hover:border-[#FFBF00] hover:bg-[#FBF3DF] dark:hover:bg-[#251F17] transition-all flex items-center justify-between cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#FFBF00]"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-[#202020] dark:text-[#FFFDF7] group-hover:text-[#FF7900] transition">
                        {tool.name}
                      </h5>
                      <p className="text-[11px] text-[#666666] dark:text-[#B8AF9F]">{tool.description}</p>
                    </div>
                    <span className="text-[11px] text-[#FF7900] font-medium flex items-center gap-1 shrink-0">
                      Select <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-3 rounded-xl bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20] text-[11px] text-[#666666] dark:text-[#B8AF9F] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Files are held in temporary staging and automatically swept after TTL expiry.</span>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;
