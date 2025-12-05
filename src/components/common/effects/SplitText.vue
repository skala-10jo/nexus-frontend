<template>
  <p
    ref="textRef"
    :class="`split-parent overflow-hidden inline-block whitespace-normal ${className}`"
    :style="{
      textAlign,
      wordWrap: 'break-word'
    }"
  >
    {{ text }}
  </p>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  },
  delay: {
    type: Number,
    default: 100
  },
  duration: {
    type: Number,
    default: 0.6
  },
  ease: {
    type: [String, Function],
    default: 'power3.out'
  },
  splitType: {
    type: String,
    default: 'chars'
  },
  from: {
    type: Object,
    default: () => ({ opacity: 0, y: 40 })
  },
  to: {
    type: Object,
    default: () => ({ opacity: 1, y: 0 })
  },
  threshold: {
    type: Number,
    default: 0.1
  },
  rootMargin: {
    type: String,
    default: '-100px'
  },
  textAlign: {
    type: String,
    default: 'center'
  },
  onLetterAnimationComplete: {
    type: Function,
    default: null
  },
  autoPlay: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['animation-complete']);

const textRef = ref(null);
const animationCompletedRef = ref(false);
const scrollTriggerRef = ref(null);
const timelineRef = ref(null);
const splitterRef = ref(null);

const initializeAnimation = async () => {
  if (typeof window === 'undefined' || !textRef.value || !props.text) return;

  await nextTick();

  const el = textRef.value;

  animationCompletedRef.value = false;

  const absoluteLines = props.splitType === 'lines';
  if (absoluteLines) el.style.position = 'relative';

  let splitter;
  try {
    splitter = new GSAPSplitText(el, {
      type: props.splitType,
      absolute: absoluteLines,
      linesClass: 'split-line'
    });
    splitterRef.value = splitter;
  } catch (error) {
    console.error('Failed to create SplitText:', error);
    return;
  }

  let targets;
  switch (props.splitType) {
    case 'lines':
      targets = splitter.lines;
      break;
    case 'words':
      targets = splitter.words;
      break;
    case 'chars':
      targets = splitter.chars;
      break;
    default:
      targets = splitter.chars;
  }

  if (!targets || targets.length === 0) {
    console.warn('No targets found for SplitText animation');
    splitter.revert();
    return;
  }

  targets.forEach(t => {
    t.style.willChange = 'transform, opacity';
  });

  if (props.autoPlay) {
    // Auto play without scroll trigger
    const tl = gsap.timeline({
      smoothChildTiming: true,
      onComplete: () => {
        animationCompletedRef.value = true;
        gsap.set(targets, {
          ...props.to,
          clearProps: 'willChange',
          immediateRender: true
        });
        props.onLetterAnimationComplete?.();
        emit('animation-complete');
      }
    });

    timelineRef.value = tl;

    tl.set(targets, { ...props.from, immediateRender: false, force3D: true });
    tl.to(targets, {
      ...props.to,
      duration: props.duration,
      ease: props.ease,
      stagger: props.delay / 1000,
      force3D: true
    });
  } else {
    // With scroll trigger
    const startPct = (1 - props.threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(props.rootMargin);
    const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign = marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
        once: true,
        onToggle: self => {
          scrollTriggerRef.value = self;
        }
      },
      smoothChildTiming: true,
      onComplete: () => {
        animationCompletedRef.value = true;
        gsap.set(targets, {
          ...props.to,
          clearProps: 'willChange',
          immediateRender: true
        });
        props.onLetterAnimationComplete?.();
        emit('animation-complete');
      }
    });

    timelineRef.value = tl;

    tl.set(targets, { ...props.from, immediateRender: false, force3D: true });
    tl.to(targets, {
      ...props.to,
      duration: props.duration,
      ease: props.ease,
      stagger: props.delay / 1000,
      force3D: true
    });
  }
};

const cleanup = () => {
  if (timelineRef.value) {
    timelineRef.value.kill();
    timelineRef.value = null;
  }
  if (scrollTriggerRef.value) {
    scrollTriggerRef.value.kill();
    scrollTriggerRef.value = null;
  }
  if (splitterRef.value) {
    gsap.killTweensOf(textRef.value);
    splitterRef.value.revert();
    splitterRef.value = null;
  }
};

onMounted(() => {
  initializeAnimation();
});

onUnmounted(() => {
  cleanup();
});

watch(
  [
    () => props.text,
    () => props.delay,
    () => props.duration,
    () => props.ease,
    () => props.splitType,
    () => props.from,
    () => props.to,
    () => props.threshold,
    () => props.rootMargin,
    () => props.onLetterAnimationComplete
  ],
  () => {
    cleanup();
    initializeAnimation();
  }
);
</script>
