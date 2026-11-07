import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#EDE7D9] dark:border-[#2E271E] bg-[#242018] dark:bg-[#100D09] pt-14 pb-12 text-[#EDE7D9] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF7900] via-[#FFBF00] to-[#FFE642] flex items-center justify-center text-[#202020] shadow-warm-sm">
                <Layers className="w-4 h-4 text-[#202020]" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-[#FFFDF7] group-hover:text-[#FFBF00] transition-colors">
                Filoro
              </span>
            </Link>
            <p className="text-xs text-[#EDE7D9]/80 max-w-sm leading-relaxed">
              A streamlined, privacy-first file utilities studio for converting, compressing, and managing your documents and images with zero cloud bloat.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#EDE7D9]/70">
              <ShieldCheck className="w-4 h-4 text-[#FFE642] shrink-0" />
              <span>Temporary local disk processing with automated directory cleanup.</span>
            </div>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F2CF7E] mb-3.5">
              Popular Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/pdf-compressor" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">Compress PDF</Link>
              </li>
              <li>
                <Link to="/pdf-merge" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">Merge PDF</Link>
              </li>
              <li>
                <Link to="/pdf-split" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">Split PDF</Link>
              </li>
              <li>
                <Link to="/image-compressor" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">Image Compressor</Link>
              </li>
              <li>
                <Link to="/word-to-pdf" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">Word to PDF</Link>
              </li>
              <li>
                <Link to="/passport-photo-resizer" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">Passport Photo Resizer</Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Privacy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F2CF7E] mb-3.5">
              Architecture & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#privacy" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">Privacy Principles</a>
              </li>
              <li>
                <a href="/#how-it-works" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">How It Works</a>
              </li>
              <li>
                <Link to="/batch" className="py-0.5 block text-[#EDE7D9]/80 hover:text-[#FFBF00] transition-colors">Batch Processing Studio</Link>
              </li>
              <li>
                <span className="py-0.5 block text-[#EDE7D9]/50">Express + Local Temporary Staging</span>
              </li>
            </ul>
          </div>

          {/* About & Project */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F2CF7E] mb-3.5">
              About
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-[#FFFDF7] font-medium">B.Tech Portfolio Project</span>
              </li>
              <li>
                <span className="text-[#EDE7D9]/80">Designed & Engineered by Sahil</span>
              </li>
              <li>
                <span className="text-[#EDE7D9]/80">Stack: MERN + Vite + TypeScript</span>
              </li>
              <li className="pt-1.5">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FFFDF7] hover:text-[#FFBF00] font-medium transition-colors"
                >
                  <Github className="w-3.5 h-3.5 text-[#EDE7D9]" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-[#EDE7D9]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#EDE7D9]/60">
          <p>© {new Date().getFullYear()} Filoro. Built with precision and care.</p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>Local Node.js Engine Active</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
