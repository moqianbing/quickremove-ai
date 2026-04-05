'use client';

import { useState, useRef, useCallback } from 'react';

type ProcessingState = 'idle' | 'loading' | 'processing' | 'done' | 'error';

export default function Home() {
  const [state, setState] = useState<ProcessingState>('idle');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [freeCredits, setFreeCredits] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('请上传图片文件（JPG、PNG）');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('图片大小不能超过 10MB');
      return;
    }
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setOriginalImage(url);
    setResultImage(null);
    setState('loading');
    setErrorMessage('');
  }, []);

  const processImage = useCallback(async () => {
    if (!originalImage) return;
    if (freeCredits <= 0) {
      setErrorMessage('今日免费次数已用完，请购买积分包');
      return;
    }

    setState('processing');
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(originalImage as File | string, {
        progress: (key: string) => {
          if (key === 'compute:inference') {
            console.log(`🤖 AI 处理中...`);
          }
        },
        output: {
          format: 'image/png',
          quality: 0.9,
        },
      });

      const url = URL.createObjectURL(blob as Blob);
      setResultImage(url);
      setFreeCredits(prev => prev - 1);
      setState('done');
    } catch (err) {
      console.error(err);
      setErrorMessage('处理失败，请重试');
      setState('error');
    }
  }, [originalImage, freeCredits]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const downloadResult = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = fileName.replace(/\.[^.]+$/, '') + '_no_bg.png';
    a.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/25">
              Q
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">QuickRemove</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              今日免费次数：<span className="text-cyan-400 font-semibold">{freeCredits}</span>/3
            </span>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25">
              购买积分
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          AI 智能消除图片背景
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          拖拽图片，3 秒完成 · 100% 自动 · 完全免费
        </p>
      </section>

      {/* Upload Area */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 min-h-80 flex flex-col items-center justify-center gap-4
            ${state === 'idle' || state === 'loading'
              ? 'border-slate-600 hover:border-cyan-500 bg-slate-800/30 hover:bg-slate-800/50'
              : 'border-cyan-500/50 bg-slate-800/40'
            }
          `}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {(state === 'idle') && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-lg">拖拽图片到这里，或点击上传</p>
                <p className="text-slate-500 text-sm mt-1">支持 JPG、PNG，最大 10MB</p>
              </div>
            </>
          )}

          {state === 'loading' && originalImage && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center overflow-hidden">
                <img src={originalImage} alt="预览" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-medium">图片加载完成 ✓</p>
                <p className="text-slate-500 text-sm mt-1">点击&quot;开始处理&quot;按钮消除背景</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); processImage(); }}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30 text-lg"
              >
                开始处理 ✨
              </button>
            </>
          )}

          {state === 'processing' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center overflow-hidden">
                {originalImage && <img src={originalImage} alt="预览" className="w-full h-full object-cover" />}
              </div>
              <div>
                <p className="text-cyan-400 font-medium text-lg animate-pulse">🤖 AI 正在消除背景...</p>
                <p className="text-slate-500 text-sm mt-1">通常需要 5-15 秒，请稍候</p>
              </div>
            </>
          )}

          {state === 'done' && resultImage && (
            <div className="w-full">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-slate-400 text-sm mb-2 font-medium">原始图片</p>
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50 aspect-square flex items-center justify-center">
                    <img src={originalImage!} alt="原始" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
                <div>
                  <p className="text-cyan-400 text-sm mb-2 font-medium">消除背景后 ✓</p>
                  <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-800 to-slate-900 aspect-square flex items-center justify-center">
                    <img src={resultImage} alt="结果" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadResult(); }}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30 text-lg"
                >
                  下载 PNG ↓
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setOriginalImage(null); setResultImage(null); setState('idle'); }}
                  className="px-8 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-all"
                >
                  处理下一张
                </button>
              </div>
            </div>
          )}

          {state === 'error' && (
            <>
              <p className="text-red-400 font-medium">{errorMessage}</p>
              <button
                onClick={(e) => { e.stopPropagation(); setState('idle'); setOriginalImage(null); }}
                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                重试
              </button>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: '极速处理', desc: '5-15秒完成，自动 AI 识别' },
            { icon: '🔒', title: '隐私安全', desc: '图片在浏览器本地处理' },
            { icon: '💎', title: '高清输出', desc: 'PNG 透明背景，无损画质' },
          ].map((f) => (
            <div key={f.title} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-700/40 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">免费使用，每天 3 次</h2>
          <p className="text-slate-400 mb-6">需要更多？积分包低至 $4.99 起</p>
          <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30">
            查看定价方案
          </button>
        </div>
      </section>
    </main>
  );
}
