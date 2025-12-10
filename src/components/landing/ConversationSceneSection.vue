<template>
  <section ref="sectionRef" class="relative bg-gray-50 pt-30 pb-80">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Main Content: 클로바노트 스타일 -->
      <div class="flex">
        <!-- Left: 스크롤되는 텍스트 영역 -->
        <div class="w-[45%] pr-12">
          <div
            v-for="(scene, index) in scenes"
            :key="index"
            :ref="el => triggerRefs[index] = el"
            :class="[
              'flex items-start pt-20',
              index === scenes.length - 1 ? 'h-[60vh]' : 'h-screen'
            ]"
            :data-scene="index"
          >
            <div
              class="transition-all duration-500"
              :class="currentScene === index
                ? 'opacity-100 translate-y-0'
                : 'opacity-30 translate-y-4'"
            >
              <!-- Subtitle badge (FeatureSection 스타일) -->
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <component :is="scene.icon" class="w-4 h-4" />
                <span>{{ scene.subtitle }}</span>
              </div>

              <!-- Title -->
              <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {{ scene.title }}
              </h3>

              <!-- Description -->
              <p class="text-lg text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                {{ scene.description }}
              </p>

              <!-- CTA Button -->
              <router-link
                :to="scene.route"
                class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 group"
              >
                <span>자세히 보기</span>
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Right: Sticky MockUI 영역 -->
        <div class="w-[55%] relative">
          <div class="sticky top-[20vh] flex justify-center h-fit">
            <!-- Scene Components (stacked, one visible) -->
            <div class="relative">
              <template v-for="(component, index) in sceneComponents" :key="index">
                <div
                  :class="getSceneClass(index)"
                  :style="getSceneStyle(index)"
                >
                  <component
                    :is="component"
                    :ref="el => sceneRefs[index] = el"
                    :is-active="currentScene === index"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, markRaw, nextTick } from 'vue'
import { CalendarDaysIcon, SparklesIcon, UserCircleIcon } from '@heroicons/vue/24/outline'
import ProjectScheduleScene from './scenes/ProjectScheduleScene.vue'
import ScenarioGenerationScene from './scenes/ScenarioGenerationScene.vue'
import AvatarPracticeScene from './scenes/AvatarPracticeScene.vue'

// Scene definitions
const scenes = [
  {
    icon: markRaw(CalendarDaysIcon),
    subtitle: '통합 프로젝트 관리',
    title: '프로젝트 · 일정 관리',
    description: '문서, 프로젝트, 일정을 연동하여 효율적으로 관리하세요.',
    route: '/management/schedule'
  },
  {
    icon: markRaw(SparklesIcon),
    subtitle: 'AI 시나리오 생성',
    title: '실무 기반\n시나리오 자동 생성',
    description: '일정과 프로젝트 정보를 분석하여 실제 업무 상황에 맞는\n비즈니스 영어 회화 시나리오를 자동으로 생성합니다.',
    route: '/conversation/scenario'
  },
  {
    icon: markRaw(UserCircleIcon),
    subtitle: '1:1 AI 회화',
    title: '아바타와 함께하는\n1:1 회화 연습',
    description: '생성된 시나리오를 바탕으로 AI 아바타와 영어 회화를 연습하고, \n실시간 피드백과 평가를 받아보세요.',
    route: '/conversation/practice'
  }
]

// Scene components
const sceneComponents = [
  markRaw(ProjectScheduleScene),
  markRaw(ScenarioGenerationScene),
  markRaw(AvatarPracticeScene)
]

// State
const sectionRef = ref(null)
const currentScene = ref(0)
const triggerRefs = ref([])
const sceneRefs = ref([])
const wasOutOfView = ref(false) // 섹션이 뷰포트 밖에 있었는지 추적
let observer = null
let sectionObserver = null

// Get class for scene transition (no animation)
const getSceneClass = (index) => {
  if (index === currentScene.value) {
    return 'visible z-10'
  } else {
    return 'invisible z-0 pointer-events-none absolute inset-0'
  }
}

// Get style for scene (for stacking)
const getSceneStyle = (index) => {
  if (index !== currentScene.value) {
    return { position: 'absolute', top: '0', left: '0' }
  }
  return {}
}

// Watch scene changes to restart animations
watch(currentScene, (newScene, oldScene) => {
  // 항상 새로운 scene의 애니메이션 재시작
  nextTick(() => {
    const sceneComponent = sceneRefs.value[newScene]
    if (sceneComponent && sceneComponent.restartAnimation) {
      sceneComponent.restartAnimation()
    }
  })
})

onMounted(() => {
  // nextTick to ensure refs are populated
  nextTick(() => {
    // Section Observer: 섹션 전체가 뷰포트를 벗어났다가 다시 들어오면 애니메이션 재시작
    sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // 섹션이 뷰포트를 벗어남
            wasOutOfView.value = true
          } else if (wasOutOfView.value && entry.isIntersecting) {
            // 섹션이 다시 뷰포트에 들어옴 - 현재 scene 애니메이션 재시작
            wasOutOfView.value = false
            const sceneComponent = sceneRefs.value[currentScene.value]
            if (sceneComponent && sceneComponent.restartAnimation) {
              sceneComponent.restartAnimation()
            }
          }
        })
      },
      {
        threshold: 0.1
      }
    )

    if (sectionRef.value) {
      sectionObserver.observe(sectionRef.value)
    }

    // Create Intersection Observer for individual scenes
    observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry
        let mostVisible = null
        let maxRatio = 0

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            mostVisible = entry
          }
        })

        if (mostVisible) {
          const sceneIndex = parseInt(mostVisible.target.dataset.scene)
          if (!isNaN(sceneIndex) && sceneIndex !== currentScene.value) {
            currentScene.value = sceneIndex
          }
        }
      },
      {
        threshold: [0.1, 0.3, 0.5, 0.7],
        rootMargin: '-20% 0px -20% 0px'
      }
    )

    // Observe all trigger elements
    triggerRefs.value.forEach((trigger) => {
      if (trigger) observer.observe(trigger)
    })
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (sectionObserver) {
    sectionObserver.disconnect()
  }
})
</script>

<style scoped>
/* Smooth transitions */
.transition-all {
  will-change: transform, opacity;
}

/* Title whitespace handling for line breaks */
h3 {
  white-space: pre-line;
}
</style>
