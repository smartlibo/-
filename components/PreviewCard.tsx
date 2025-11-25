import React from 'react';

interface PreviewCardProps {
  imageUrl: string;
  title: string;
  summary: string;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ imageUrl, title, summary }) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gray-50 p-3 border-b text-xs text-gray-500 font-medium uppercase tracking-wider text-center">
        WeChat Preview Simulation
      </div>
      
      {/* List View Large Card Simulation */}
      <div className="p-4">
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-200 group">
            {imageUrl ? (
                <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
            )}
            
            {/* WeChat typically overlays title on the image in the old style, or below it in the new style. 
                Let's simulate the classic "Big Picture" look where title is sometimes overlaid or just the visual impact.
                Currently, WeChat usually puts the title below the 2.35:1 image or overlaid on 1:1. 
                Let's show the standard feed view.
            */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                 <p className="text-white font-medium text-sm line-clamp-2 leading-snug">
                    {title || "文章标题 Article Title"}
                 </p>
            </div>
        </div>
        <div className="mt-3 flex items-start space-x-2">
             <div className="h-4 w-4 rounded-full bg-gray-200 shrink-0"></div>
             <div className="h-3 w-20 bg-gray-100 rounded shrink-0 mt-0.5"></div>
        </div>
      </div>

      {/* Share Card Simulation */}
      <div className="border-t border-gray-100 p-4 bg-gray-50/50">
        <p className="text-[10px] text-gray-400 mb-2 uppercase">Share Card Preview</p>
        <div className="flex bg-white p-2 rounded border border-gray-200 items-center">
            <div className="flex-1 pr-3">
                <h4 className="text-sm text-gray-800 font-medium line-clamp-2">{title || "文章标题"}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{summary || "Wait for generation..."}</p>
            </div>
            <div className="w-12 h-12 bg-gray-200 shrink-0 rounded overflow-hidden">
                {imageUrl && <img src={imageUrl} className="w-full h-full object-cover" alt="thumb" />}
            </div>
        </div>
      </div>
    </div>
  );
};
