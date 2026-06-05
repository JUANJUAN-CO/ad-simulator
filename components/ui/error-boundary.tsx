'use client';

import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: string; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
          <div className="text-center max-w-md p-6">
            <div className="text-5xl mb-4">🔧</div>
            <h1 className="text-lg font-bold text-slate-800 mb-2">页面出错了</h1>
            <p className="text-sm text-slate-500 mb-4">
              可能是存档数据问题，建议清除数据重新开始。
            </p>
            <code className="block text-[11px] text-red-500 bg-red-50 p-2 rounded mb-4 text-left break-all">
              {this.state.error}
            </code>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch (_) {}
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
              >
                🗑 清除数据并重新开始
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
              >
                🔄 刷新重试
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
