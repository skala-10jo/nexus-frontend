<template>
  <component
    :is="as"
    ref="containerRef"
    :class="`inline-block whitespace-pre-wrap tracking-tight ${className}`"
    v-bind="$attrs"
  >
    <span class="inline" :style="{ color: getCurrentTextColor() }">
      {{ displayedText }}
    </span>
    <span
      v-if="showCursor"
      ref="cursorRef"
      :class="`ml-1 inline-block opacity-100 ${
        hideCursorWhileTyping && (currentCharIndex < textArray[currentTextIndex].length || isDeleting) ? 'hidden' : ''
      } ${cursorClassName}`"
    >
      {{ cursorCharacter }}
    </span>
  </component>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  className: {
    type: String,
    default: ''
  },
  showCursor: {
    type: Boolean,
    default: true
  },
  hideCursorWhileTyping: {
    type: Boolean,
    default: false
  },
  cursorCharacter: {
    type: String,
    default: '|'
  },
  cursorBlinkDuration: {
    type: Number,
    default: 0.5
  },
  cursorClassName: {
    type: String,
    default: ''
  },
  text: {
    type: [String, Array],
    required: true
  },
  as: {
    type: String,
    default: 'div'
  },
  typingSpeed: {
    type: Number,
    default: 50
  },
  initialDelay: {
    type: Number,
    default: 0
  },
  pauseDuration: {
    type: Number,
    default: 2000
  },
  deletingSpeed: {
    type: Number,
    default: 30
  },
  loop: {
    type: Boolean,
    default: true
  },
  textColors: {
    type: Array,
    default: () => []
  },
  variableSpeed: {
    type: Object,
    default: null
  },
  onSentenceComplete: {
    type: Function,
    default: null
  },
  startOnVisible: {
    type: Boolean,
    default: false
  },
  reverseMode: {
    type: Boolean,
    default: false
  }
});

const displayedText = ref('');
const currentCharIndex = ref(0);
const isDeleting = ref(false);
const currentTextIndex = ref(0);
const isVisible = ref(!props.startOnVisible);
const cursorRef = ref(null);
const containerRef = ref(null);

const textArray = computed(() => (Array.isArray(props.text) ? props.text : [props.text]));

const getRandomSpeed = () => {
  if (!props.variableSpeed) return props.typingSpeed;
  const { min, max } = props.variableSpeed;
  return Math.random() * (max - min) + min;
};

const getCurrentTextColor = () => {
  if (!props.textColors.length) return 'inherit';
  return props.textColors[currentTextIndex.value % props.textColors.length];
};

let timeout = null;

const clearTimeoutIfNeeded = () => {
  if (timeout) clearTimeout(timeout);
};

const executeTypingAnimation = () => {
  const currentText = textArray.value[currentTextIndex.value];
  const processedText = props.reverseMode ? currentText.split('').reverse().join('') : currentText;

  if (isDeleting.value) {
    if (displayedText.value === '') {
      isDeleting.value = false;
      if (currentTextIndex.value === textArray.value.length - 1 && !props.loop) return;

      props.onSentenceComplete?.(textArray.value[currentTextIndex.value], currentTextIndex.value);

      currentTextIndex.value = (currentTextIndex.value + 1) % textArray.value.length;
      currentCharIndex.value = 0;
      timeout = setTimeout(() => {}, props.pauseDuration);
    } else {
      timeout = setTimeout(() => {
        displayedText.value = displayedText.value.slice(0, -1);
      }, props.deletingSpeed);
    }
  } else {
    if (currentCharIndex.value < processedText.length) {
      timeout = setTimeout(
        () => {
          displayedText.value += processedText[currentCharIndex.value];
          currentCharIndex.value += 1;
        },
        props.variableSpeed ? getRandomSpeed() : props.typingSpeed
      );
    } else if (textArray.value.length > 1) {
      timeout = setTimeout(() => {
        isDeleting.value = true;
      }, props.pauseDuration);
    }
  }
};

watch(
  [displayedText, currentCharIndex, isDeleting, isVisible],
  () => {
    if (!isVisible.value) return;
    clearTimeoutIfNeeded();

    if (currentCharIndex.value === 0 && !isDeleting.value && displayedText.value === '') {
      timeout = setTimeout(() => {
        executeTypingAnimation();
      }, props.initialDelay);
    } else {
      executeTypingAnimation();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.showCursor && cursorRef.value) {
    gsap.set(cursorRef.value, { opacity: 1 });
    gsap.to(cursorRef.value, {
      opacity: 0,
      duration: props.cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });
  }

  if (props.startOnVisible && containerRef.value) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) isVisible.value = true;
        });
      },
      { threshold: 0.1 }
    );
    if (containerRef.value instanceof Element) {
      observer.observe(containerRef.value);
    }
    onBeforeUnmount(() => observer.disconnect());
  }
});

onBeforeUnmount(() => {
  clearTimeoutIfNeeded();
});
</script>
