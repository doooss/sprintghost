import { cn } from '../../lib/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { clsx as cx } from 'clsx';

import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const Z_INDEX = {
  panel: 'z-[200]',
  panel2Plus: 'z-[202]',
  panelPlus: 'z-[205]',
};

type ScrollBarProps = ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> & {
  orientation?: 'horizontal' | 'vertical';
  showTrackBg?: boolean;
  dimSize?: number; // dim 크기 px
  dimPosition?: 'top' | 'bottom' | 'left' | 'right' | 'y' | 'x' | 'auto'; // dim 위치
  gutter?: number;
  thickness?: number;
  trackBgColor?: string; // 스크롤바 배경색
};

export type ScrollAreaProps = ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> & {
  orientation?: 'horizontal' | 'vertical';
  showTrackBg?: boolean;
  trackBgColor?: string; // 스크롤바 배경색
  showDim?: boolean; // dim 존재 여부
  dimPosition?: 'top' | 'bottom' | 'left' | 'right' | 'y' | 'x' | 'auto'; // dim 위치
  dimColor?: 'white' | 'black' | string; //
  gutter?: number;
  dimSize?: number; // dim 크기 px

  thickness?: number;
};

const ScrollArea = forwardRef<
  ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    {
      className,
      children,
      orientation = 'vertical',
      showTrackBg = false,
      trackBgColor = 'white',
      showDim = false,
      dimPosition = 'auto',
      dimColor = 'white',
      gutter,
      dimSize = 24,
      thickness = 4,
      ...props
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [isScrollable, setIsScrollable] = useState(false);

    const [showTopDim, setShowTopDim] = useState(false);
    const [showBottomDim, setShowBottomDim] = useState(true);

    const handleScroll = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      if (orientation === 'vertical') {
        setShowTopDim(viewport.scrollTop > 0);
        setShowBottomDim(
          viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight,
        );
      } else {
        setShowTopDim(viewport.scrollLeft > 0);
        setShowBottomDim(
          viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth,
        );
      }
    }, [orientation]);

    // 스크롤 위치에 따라 dim 표시

    useEffect(() => {
      if (!showDim) return;
      const viewport = viewportRef.current;
      if (!viewport) return;

      // 스크롤이 필요한지 판단
      const checkScrollable = () => {
        if (orientation === 'vertical') {
          setIsScrollable(viewport.scrollHeight > viewport.clientHeight);
        } else {
          setIsScrollable(viewport.scrollWidth > viewport.clientWidth);
        }
      };

      checkScrollable();
      handleScroll();
      viewport.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', checkScrollable);

      // viewport 자체의 크기 변화도 감지 (ResizeObserver)
      const resizeObserver = new window.ResizeObserver(() => {
        checkScrollable();
        handleScroll();
      });
      resizeObserver.observe(viewport);

      return () => {
        viewport.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', checkScrollable);
        resizeObserver.disconnect();
      };
    }, [showDim, orientation, handleScroll]);

    return (
      <ScrollAreaPrimitive.Root
        className={cn('relative overflow-hidden grow', className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          className={cx(
            'h-full w-full rounded-[inherit]',
            orientation === 'vertical' ? 'max-w-full' : 'max-h-full',
          )}
          style={{
            // showTrackBg가 true일 때 thickness에 따라 패딩 추가
            paddingRight:
              showTrackBg && orientation === 'vertical'
                ? `${thickness + 8}px`
                : undefined,
            paddingBottom:
              showTrackBg && orientation === 'horizontal'
                ? `${thickness + 8}px`
                : undefined,
          }}
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            viewportRef.current = node;
          }}
        >
          {/* Dim 표시: orientation에 따라 위치 변경 */}
          {showDim &&
            isScrollable &&
            orientation === 'vertical' &&
            showTopDim &&
            ['top', 'y', 'auto'].includes(dimPosition) && (
              <div
                className={`pointer-events-none absolute left-0 top-0 w-full ${Z_INDEX.panelPlus}`}
                style={{
                  background: `linear-gradient(to bottom, ${dimColor}, transparent)`,
                  height: `${dimSize}px`,
                }}
              />
            )}
          {showDim &&
            isScrollable &&
            orientation === 'vertical' &&
            showBottomDim &&
            ['bottom', 'y', 'auto'].includes(dimPosition) && (
              <div
                className={`pointer-events-none absolute left-0 bottom-0 w-full ${Z_INDEX.panelPlus}`}
                style={{
                  background: `linear-gradient(to top, ${dimColor}, transparent)`,
                  height: `${dimSize}px`,
                }}
              />
            )}
          {showDim &&
            isScrollable &&
            orientation === 'horizontal' &&
            showTopDim &&
            ['left', 'x', 'auto'].includes(dimPosition) && (
              <div
                className={`pointer-events-none absolute left-0 top-0 h-full ${Z_INDEX.panelPlus}`}
                style={{
                  background: `linear-gradient(to right, ${dimColor}, transparent)`,
                  width: `${dimSize}px`,
                }}
              />
            )}
          {showDim &&
            isScrollable &&
            orientation === 'horizontal' &&
            showBottomDim &&
            ['right', 'x', 'auto'].includes(dimPosition) && (
              <div
                className={`pointer-events-none absolute right-0 top-0 h-full ${Z_INDEX.panelPlus}`}
                style={{
                  background: `linear-gradient(to left, ${dimColor}, transparent)`,
                  width: `${dimSize}px`,
                }}
              />
            )}

          {children}
        </ScrollAreaPrimitive.Viewport>

        <ScrollBar
          orientation={orientation}
          showTrackBg={showTrackBg}
          gutter={gutter}
          thickness={thickness}
          trackBgColor={trackBgColor}
        />

        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  },
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = forwardRef<
  ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(
  (
    {
      className,
      orientation = 'vertical',
      showTrackBg = false,
      gutter = 10,
      thickness = 2,
      trackBgColor,
      ...props
    },
    ref,
  ) => {
    const wrapperClass = cx(
      orientation === 'vertical'
        ? `absolute right-0 top-0 bottom-0 w-4 ${Z_INDEX.panel}`
        : `absolute left-0 right-0 bottom-0 h-4 ${Z_INDEX.panel}`,
    );

    return (
      <div
        className={wrapperClass}
        aria-hidden="true"
        style={{
          backgroundColor: showTrackBg ? trackBgColor : 'transparent',
        }}
      >
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          ref={ref}
          orientation={orientation}
          className={cn(
            `flex touch-none select-none transition-colors rounded-full m-3 ${Z_INDEX.panel2Plus}`,
            orientation === 'vertical' && 'w-2',
            orientation === 'horizontal' && 'h-2 flex-col',
            className,
          )}
          style={{
            // For horizontal scrollbar, adjust width based on gutter
            width:
              orientation === 'horizontal'
                ? `calc(100% - ${gutter}px)`
                : `${thickness}px`,
            // For vertical scrollbar, adjust height based on gutter
            height:
              orientation === 'vertical'
                ? `calc(100% - ${gutter}px)`
                : `${thickness}px`,
            margin: `max(0px, ${gutter - 6}px)`, // 수정: 최소값 0, gutter + 6px
          }}
          {...props}
        >
          <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-gray-300" />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
      </div>
    );
  },
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
