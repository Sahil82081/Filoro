import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ToolItem } from '../utils/toolsData';

interface ToolPreviewModalProps {
  tool: ToolItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ToolPreviewModal: React.FC<ToolPreviewModalProps> = ({
  tool,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!tool) return null;

  const handleOpenTool = () => {
    if (tool.route) {
      onClose();
      navigate(tool.route);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tool.name}
      description={`Category: ${tool.category.toUpperCase()} • Supported formats: ${tool.fileTypes.join(', ')}`}
      maxWidth="md"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 w-full">
          <Button variant="secondary" size="sm" onClick={onClose} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />} className="w-full sm:w-auto">
            Back to Tools
          </Button>

          {tool.isAvailable && tool.route ? (
            <Button variant="primary" size="sm" onClick={handleOpenTool} rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#202020]" />} className="w-full sm:w-auto">
              Open Tool Now
            </Button>
          ) : (
            <span className="text-xs text-[#666666] dark:text-[#B8AF9F] py-1 font-medium">Scheduled in Roadmap</span>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {tool.isAvailable ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7]">Tool Status:</span>
                <Badge variant="emerald" size="sm" dot>
                  Live & Available
                </Badge>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                This tool is fully implemented with real processing pipelines, custom controls, and automated cleanup.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#FBF3DF] dark:bg-[#251F17] border border-[#F2CF7E] dark:border-[#4A3D2A] flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#FF7900] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7]">Tool Status:</span>
                <Badge variant="amber" size="sm" dot>
                  {tool.statusText}
                </Badge>
              </div>
              <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1 leading-relaxed">
                This tool interface and its backend processing pipeline will be implemented in subsequent stages. In accordance with project integrity standards, we do not fake file processing.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] uppercase tracking-wider">
            Tool Overview
          </h4>
          <p className="text-xs text-[#202020] dark:text-[#FFFDF7] leading-relaxed bg-[#F8F5EE] dark:bg-[#17130E] p-3.5 rounded-xl border border-[#EDE7D9] dark:border-[#332B20]">
            {tool.description}
          </p>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] uppercase tracking-wider">
            Pipeline Specifications
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20]">
              <span className="text-[11px] text-[#666666] dark:text-[#B8AF9F] block">Accepted Formats</span>
              <span className="font-semibold text-[#FF7900] font-mono mt-0.5 block">
                {tool.fileTypes.join(' ')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20]">
              <span className="text-[11px] text-[#666666] dark:text-[#B8AF9F] block">Processing Engine</span>
              <span className="font-semibold text-[#202020] dark:text-[#FFFDF7] mt-0.5 block">
                {tool.category === 'image' ? 'Sharp (libvips)' : 'Local Server Worker'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FFFDF7] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20] flex items-center gap-2 text-xs text-[#666666] dark:text-[#B8AF9F]">
          <AlertCircle className="w-4 h-4 text-[#FF7900] shrink-0" />
          <span>Input and output files are staged in temporary local storage with automated deletion.</span>
        </div>
      </div>
    </Modal>
  );
};

export default ToolPreviewModal;
