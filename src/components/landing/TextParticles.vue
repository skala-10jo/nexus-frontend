<template>
  <canvas
    ref="canvasRef"
    class="absolute inset-0 w-full h-full"
  />
</template>

<script setup>
/**
 * TextParticles - 지구본 파티클 시각화 컴포넌트
 *
 * @description 지구본 위 도시 불빛과 다국어 텍스트 파티클을 Canvas에 렌더링
 */
import { ref } from 'vue'
import { defaultTexts } from './data/textParticlesData'
import { useTextParticles } from '@/composables/landing/useTextParticles'

const props = defineProps({
  texts: {
    type: Array,
    default: () => defaultTexts
  },
  particleCount: { type: Number, default: 35 },
  mouseRadius: { type: Number, default: 150 },
  minFontSize: { type: Number, default: 11 },
  maxFontSize: { type: Number, default: 16 }
})

const canvasRef = ref(null)

useTextParticles(canvasRef, props)
</script>
