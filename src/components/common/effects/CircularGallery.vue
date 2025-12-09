<template>
  <div ref="containerRef" class="w-full overflow-hidden cursor-grab active:cursor-grabbing relative touch-none"
       :style="{ height: '100%', minHeight: minContainerHeight + 'px' }"
       @mousedown="onMouseDown" @touchstart="onTouchStart" @wheel="onWheel">
    <div class="w-full h-full relative flex items-center justify-center perspective-container" :style="{ minHeight: minContainerHeight + 'px' }">
      <div v-for="(item, index) in renderedItems" 
           :key="`${item.originalIndex}-${index}`"
           class="absolute left-1/2 top-1/2 will-change-transform"
           :style="item.style">
        <slot :item="item.data" :index="item.originalIndex" :is-active="activeIndex === item.originalIndex"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, shallowRef } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  bend: {
    type: Number,
    default: 6
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  borderRadius: {
    type: Number,
    default: 0.05
  },
  font: {
    type: String,
    default: 'bold 30px Figtree'
  },
  scrollSpeed: {
    type: Number,
    default: 2
  },
  scrollEase: {
    type: Number,
    default: 0.05
  },
  itemWidth: {
    type: Number,
    default: 420
  },
  gap: {
    type: Number,
    default: 40
  }
});

const emit = defineEmits(['select']);

const containerRef = ref(null);
const activeIndex = ref(0);
const renderedItems = shallowRef([]);
let app = null;

// Responsive min-height based on itemWidth (assuming card height is roughly itemWidth * 1.24)
const minContainerHeight = computed(() => {
  // For smaller cards, need less container height
  const estimatedCardHeight = props.itemWidth * 1.24;
  return Math.max(400, estimatedCardHeight + 50); // Add some padding
});

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

class Media {
  constructor({ index, originalIndex, data, width, length, gap = 0 }) {
    this.index = index;
    this.originalIndex = originalIndex;
    this.data = data;
    this.width = width;
    this.length = length;
    this.gap = gap;
    this.extra = 0;
    this.x = 0;
    this.style = {};
    
    // Initial position
    this.widthTotal = (this.width + this.gap) * this.length;
    this.x = (this.width + this.gap) * this.index;
  }

  update(scroll, viewport, bend) {
    // Calculate position relative to scroll
    let currentX = this.x - scroll.current - this.extra;
    
    // Infinite scroll logic
    const totalWidth = this.widthTotal;
    const halfViewport = viewport.width; // Use full width for safety buffer
    
    // If item moved too far left, move it to the right end
    if (currentX < -halfViewport - this.width) {
      this.extra -= totalWidth;
      currentX += totalWidth;
    }
    // If item moved too far right, move it to the left end
    else if (currentX > halfViewport + this.width) {
      this.extra += totalWidth;
      currentX -= totalWidth;
    }

    // Calculate Bend (Arch) Effect
    let y = 0;
    let rotateZ = 0;

    if (bend !== 0) {
      const H = viewport.width / 2;
      const B_abs = Math.abs(bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(currentX), H);

      // Calculate arc height at this X
      const arc = R - Math.sqrt(Math.max(0, R * R - effectiveX * effectiveX));

      if (bend > 0) {
        y = -arc;
        rotateZ = -Math.sign(currentX) * Math.asin(effectiveX / R);
      } else {
        y = arc;
        rotateZ = Math.sign(currentX) * Math.asin(effectiveX / R);
      }
    }

    // Apply styles
    // Center the item: translate(-50%, -50%) is handled by CSS class or here
    // We use translate3d for hardware acceleration
    this.style = {
      transform: `translate3d(${currentX}px, ${y}px, 0) rotateZ(${rotateZ}rad) translate(-50%, -50%)`,
      zIndex: Math.round(1000 - Math.abs(currentX)) // Higher z-index for centered items
    };
  }
}

class App {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.scroll = { ease: config.scrollEase, current: 0, target: 0, last: 0 };
    this.isDown = false;
    this.start = 0;
    this.raf = null;
    this.medias = [];
    
    console.log('CircularGallery initialized with items:', config.items.length);
    this.init();
    this.animate();
  }

  init() {
    const { items, gap, itemWidth } = this.config;
    if (!items || items.length === 0) {
      console.warn('CircularGallery: No items provided');
      return;
    }

    // Double the items for infinite scroll illusion
    const galleryItems = items.concat(items);

    this.medias = galleryItems.map((data, index) => {
      return new Media({
        index,
        originalIndex: index % items.length,
        data,
        width: itemWidth,
        length: galleryItems.length,
        gap: gap
      });
    });

    this.handleResize();
  }

  scrollTo(index) {
    if (this.medias.length === 0) return;
    const itemWidth = this.medias[0].width + this.medias[0].gap;

    // Current "virtual" index
    const currentIndex = Math.round(this.scroll.target / itemWidth);

    // We want to go to a targetIndex such that targetIndex % items.length === index
    // And targetIndex is close to currentIndex
    const len = this.config.items.length;
    const diff = (index - (currentIndex % len) + len) % len;
    // Adjust diff to be -len/2 to +len/2 for shortest path
    const shortestDiff = diff > len / 2 ? diff - len : diff;

    this.scroll.target = (currentIndex + shortestDiff) * itemWidth;
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.config.scrollEase);
    
    // Update all media items
    this.medias.forEach(media => {
      media.update(this.scroll, this.viewport, this.config.bend);
    });

    // Sync to Vue state
    renderedItems.value = this.medias.map(m => ({
      originalIndex: m.originalIndex,
      data: m.data,
      style: m.style
    }));

    // Calculate active index
    if (this.medias.length > 0) {
      const itemWidth = this.medias[0].width + this.medias[0].gap;
      const index = Math.round(this.scroll.current / itemWidth);
      const normalizedIndex = Math.abs(index % this.config.items.length);
      if (activeIndex.value !== normalizedIndex) {
        activeIndex.value = normalizedIndex;
        emit('select', normalizedIndex);
      }
    }

    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update.bind(this));
  }

  animate() {
    this.update();
  }

  handleResize() {
    if (!this.container) return;
    this.viewport = { width: this.container.clientWidth, height: this.container.clientHeight };
    console.log('CircularGallery resized:', this.viewport);
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

// Event Handlers
const onMouseDown = (e) => {
  if (!app) return;
  app.isDown = true;
  app.scroll.position = app.scroll.current;
  app.start = e.clientX;
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const onTouchStart = (e) => {
  if (!app) return;
  app.isDown = true;
  app.scroll.position = app.scroll.current;
  app.start = e.touches[0].clientX;
  
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchUp);
};

const onMouseMove = (e) => {
  if (!app || !app.isDown) return;
  const x = e.clientX;
  const distance = (app.start - x) * app.config.scrollSpeed;
  app.scroll.target = (app.scroll.position ?? 0) + distance;
};

const onMouseUp = () => {
  if (!app) return;
  app.isDown = false;
  snap();
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};

const onTouchMove = (e) => {
  if (!app || !app.isDown) return;
  const x = e.touches[0].clientX;
  const distance = (app.start - x) * app.config.scrollSpeed;
  app.scroll.target = (app.scroll.position ?? 0) + distance;
};

const onTouchUp = () => {
  if (!app) return;
  app.isDown = false;
  snap();
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchUp);
};

const onWheel = (e) => {
  if (!app) return;
  const delta = e.deltaY;
  app.scroll.target += delta * 0.5; // Adjust sensitivity
  snapDebounced();
};

const snap = () => {
  if (!app || app.medias.length === 0) return;
  const itemWidth = app.medias[0].width + app.medias[0].gap;
  const index = Math.round(app.scroll.target / itemWidth);
  app.scroll.target = index * itemWidth;
};

const snapDebounced = debounce(snap, 200);

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

let resizeObserver = null;

const scrollTo = (index) => {
  if (app) app.scrollTo(index);
};

defineExpose({
  scrollTo
});

onMounted(() => {
  if (!containerRef.value) return;

  // Initialize App
  app = new App(containerRef.value, {
    items: props.items,
    bend: props.bend,
    scrollSpeed: props.scrollSpeed,
    scrollEase: props.scrollEase,
    itemWidth: props.itemWidth,
    gap: props.gap
  });

  // Resize Observer for robustness
  resizeObserver = new ResizeObserver(() => {
    app?.handleResize();
  });
  resizeObserver.observe(containerRef.value);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  if (app) app.destroy();
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchUp);
});

watch(() => props.items, (newItems) => {
  console.log('CircularGallery items updated:', newItems.length);
  if (app) {
    app.destroy();
    app = new App(containerRef.value, {
      items: newItems,
      bend: props.bend,
      scrollSpeed: props.scrollSpeed,
      scrollEase: props.scrollEase,
      itemWidth: props.itemWidth,
      gap: props.gap
    });
  }
}, { deep: true });

// Watch for itemWidth changes (responsive)
watch(() => props.itemWidth, (newWidth) => {
  console.log('CircularGallery itemWidth updated:', newWidth);
  if (app && containerRef.value) {
    app.destroy();
    app = new App(containerRef.value, {
      items: props.items,
      bend: props.bend,
      scrollSpeed: props.scrollSpeed,
      scrollEase: props.scrollEase,
      itemWidth: newWidth,
      gap: props.gap
    });
  }
});

// Watch for gap changes (responsive)
watch(() => props.gap, (newGap) => {
  if (app && containerRef.value) {
    app.destroy();
    app = new App(containerRef.value, {
      items: props.items,
      bend: props.bend,
      scrollSpeed: props.scrollSpeed,
      scrollEase: props.scrollEase,
      itemWidth: props.itemWidth,
      gap: newGap
    });
  }
});

// Watch for bend changes (responsive)
watch(() => props.bend, (newBend) => {
  if (app) {
    app.config.bend = newBend;
  }
});
</script>

<style scoped>
.perspective-container {
  perspective: 1000px;
}
</style>
