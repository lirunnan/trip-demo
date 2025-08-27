// hooks/useScript.js
'use client';

import { useEffect, useState } from 'react';

export const useScript = (src) => {
  const [status, setStatus] = useState(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      setStatus('idle');
      return;
    }

    // 检查脚本是否已存在
    let script = document.querySelector(`script[src="${src}"]`);
    if (!script) {
      // 创建脚本标签
      script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => setStatus('ready');
      script.onerror = () => setStatus('error');
    } else {
      // 如果脚本已存在，直接设置为 ready
      setStatus('ready');
    }

    // 清理函数
    return () => {
      if (script) {
        // 但通常不建议移除脚本，因为地图库很大，可能其他地方也会用到
        // document.head.removeChild(script);
      }
    };
  }, [src]);

  return status;
};