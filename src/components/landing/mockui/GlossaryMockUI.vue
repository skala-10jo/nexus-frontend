<template>
  <div ref="containerRef" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Browser Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">문서 · 전문용어 사전</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-4 space-y-4 bg-gray-50/50 min-h-[400px]">
      <!-- Document Upload Section -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
          <DocumentTextIcon class="w-4 h-4 text-blue-500" />
          <h2 class="text-sm font-bold text-gray-900">문서 관리</h2>
          <span class="text-xs text-gray-400">({{ uploadedDocs.length }})</span>
        </div>

        <!-- Dropzone -->
        <div class="p-4">
          <div
            ref="dropzoneRef"
            class="relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300"
            :class="dropzoneClass"
          >
            <!-- Flying File Icon -->
            <div
              ref="flyingFileRef"
              v-show="animationPhase === 'file-flying'"
              class="absolute"
              style="left: 50%; top: -40px; transform: translateX(-50%); opacity: 0;"
            >
              <DocumentIcon class="w-10 h-10 text-blue-500" />
            </div>

            <CloudArrowUpIcon
              class="w-10 h-10 mx-auto mb-2 transition-all duration-300"
              :class="isDragActive ? 'text-blue-500 scale-110' : 'text-gray-400'"
            />
            <p class="text-sm font-medium text-gray-700">
              {{ isDragActive ? '파일을 여기에 놓으세요' : '문서를 드래그하거나 클릭' }}
            </p>
            <span class="text-xs text-gray-400">PDF, DOCX, TXT (최대 50MB)</span>

            <!-- Progress Bar with Glow -->
            <div
              v-if="animationPhase === 'uploading'"
              class="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden"
            >
              <div
                ref="progressBarRef"
                class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full progress-glow"
                style="width: 0%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Document Table (appears after upload) -->
        <div v-if="uploadedDocs.length > 0" class="border-t border-gray-100">
          <table class="w-full text-sm">
            <thead class="bg-gray-50/95">
              <tr class="text-left border-b border-gray-100">
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">파일명</th>
                <th class="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase">크기</th>
                <th class="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase">상태</th>
                <th class="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase">작업</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="doc in uploadedDocs"
                :key="doc.id"
                ref="docRowRef"
                class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                style="opacity: 0; transform: translateX(-20px);"
              >
                <td class="px-4 py-2">
                  <div class="flex items-center gap-2">
                    <span>📄</span>
                    <span class="text-sm font-medium text-gray-900">{{ doc.filename }}</span>
                  </div>
                </td>
                <td class="px-3 py-2 text-sm text-gray-500">{{ doc.size }}</td>
                <td class="px-3 py-2">
                  <span class="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase bg-green-100 text-green-700">
                    처리완료
                  </span>
                </td>
                <td class="px-3 py-2">
                  <button
                    ref="extractBtnRef"
                    v-if="showExtractBtn"
                    class="flex items-center gap-1 px-2 py-1 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded text-[10px] font-bold"
                    style="opacity: 0; transform: scale(0.8);"
                  >
                    <SparklesIcon class="w-3 h-3" />
                    용어 추출
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Terms Section -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div class="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
          <BookOpenIcon class="w-4 h-4 text-blue-500" />
          <h2 class="text-sm font-bold text-gray-900">전문용어 사전</h2>
          <span class="text-xs text-gray-400">({{ visibleTerms.length }})</span>
        </div>

        <!-- Scan Line Overlay -->
        <div
          v-if="animationPhase === 'scanning'"
          class="absolute inset-0 z-20 pointer-events-none overflow-hidden"
        >
          <div ref="scanLineRef" class="scan-line" style="top: 0;"></div>
        </div>

        <!-- Terms Table -->
        <div class="relative">
          <!-- Floating Terms (before settling) -->
          <div
            v-if="animationPhase === 'extracting'"
            class="absolute inset-0 z-10 p-4"
          >
            <div
              v-for="(term, index) in floatingTerms"
              :key="term.id"
              :ref="el => floatingTermRefs[index] = el"
              class="absolute text-sm font-medium text-blue-600"
              :style="getFloatingInitialStyle(index)"
            >
              {{ term.korean }}
            </div>
          </div>

          <table v-if="visibleTerms.length > 0" class="w-full text-sm">
            <thead class="bg-gray-50/95 sticky top-0">
              <tr class="text-left border-b border-gray-100">
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">한국어</th>
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">영어</th>
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">베트남어</th>
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">상태</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="(term, index) in visibleTerms"
                :key="term.id"
                :ref="el => termRowRefs[index] = el"
                class="hover:bg-blue-50/30 transition-colors cursor-pointer"
                :class="{ 'bg-blue-50/50 ring-2 ring-blue-300': selectedTerm?.id === term.id }"
                style="opacity: 0; transform: translateY(-10px);"
                @click="selectTerm(term)"
              >
                <td class="px-4 py-2">
                  <span class="text-sm font-bold text-gray-900 hover:text-blue-600">{{ term.korean }}</span>
                </td>
                <td class="px-4 py-2 text-sm text-gray-600">{{ term.english }}</td>
                <td class="px-4 py-2 text-sm text-gray-600">{{ term.vietnamese }}</td>
                <td class="px-4 py-2">
                  <span
                    class="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase"
                    :class="term.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                  >
                    {{ term.isVerified ? '검증' : 'AI추출' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-else class="py-8 text-center text-gray-400">
            <BookOpenIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">문서에서 용어를 추출하세요</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Glassmorphism Popup -->
    <div
      v-if="showPopup && selectedTerm"
      ref="popupOverlayRef"
      class="absolute inset-0 z-30 flex items-center justify-center p-4"
      style="background: rgba(0,0,0,0); opacity: 0;"
      @click.self="closePopup"
    >
      <div ref="popupRef" class="glassmorphism-popup w-full max-w-sm p-5 rounded-2xl" style="transform: scale(0.9) translateY(20px); opacity: 0;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ selectedTerm.korean }}</h3>
          <button
            @click="closePopup"
            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-16">영어</span>
            <span class="text-sm text-gray-900">{{ selectedTerm.english }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-16">베트남어</span>
            <span class="text-sm text-gray-900">{{ selectedTerm.vietnamese }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-16">정의</span>
            <span class="text-sm text-gray-700">{{ selectedTerm.definition }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-16">상태</span>
            <div class="flex items-center gap-1">
              <CheckCircleIcon v-if="selectedTerm.isVerified" class="w-4 h-4 text-green-500" />
              <span
                class="text-xs font-bold"
                :class="selectedTerm.isVerified ? 'text-green-600' : 'text-yellow-600'"
              >
                {{ selectedTerm.isVerified ? '검증완료' : 'AI 자동추출' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  BookOpenIcon,
  SparklesIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Demo Data
const allTerms = [
  { id: 1, korean: '인공지능', english: 'Artificial Intelligence', vietnamese: 'Trí tuệ nhân tạo', definition: '인간의 학습능력과 추론능력을 컴퓨터로 구현한 기술', isVerified: true },
  { id: 2, korean: '머신러닝', english: 'Machine Learning', vietnamese: 'Học máy', definition: '데이터를 기반으로 패턴을 학습하는 AI의 한 분야', isVerified: false },
  { id: 3, korean: '자연어처리', english: 'NLP', vietnamese: 'Xử lý ngôn ngữ tự nhiên', definition: '컴퓨터가 인간의 언어를 이해하고 처리하는 기술', isVerified: true },
  { id: 4, korean: '딥러닝', english: 'Deep Learning', vietnamese: 'Học sâu', definition: '인공신경망을 기반으로 한 기계학습의 한 분야', isVerified: false }
]

const demoDoc = { id: 1, filename: 'AI_기술문서_v2.pdf', size: '2.4MB' }

// Refs
const containerRef = ref(null)
const dropzoneRef = ref(null)
const flyingFileRef = ref(null)
const progressBarRef = ref(null)
const docRowRef = ref(null)
const extractBtnRef = ref(null)
const scanLineRef = ref(null)
const floatingTermRefs = ref([])
const termRowRefs = ref([])
const popupOverlayRef = ref(null)
const popupRef = ref(null)

// State
const animationPhase = ref('idle')
const uploadedDocs = ref([])
const visibleTerms = ref([])
const floatingTerms = ref([])
const selectedTerm = ref(null)
const showPopup = ref(false)
const showExtractBtn = ref(false)
const isDragActive = ref(false)

let observer = null
let mainTimeline = null

// Computed
const dropzoneClass = computed(() => {
  if (isDragActive.value || animationPhase.value === 'file-flying') {
    return 'border-blue-500 bg-blue-50 scale-[1.02]'
  }
  return 'border-gray-300 bg-white'
})

// Methods
const getFloatingInitialStyle = (index) => {
  const positions = [
    { x: 20, y: 30 },
    { x: 65, y: 45 },
    { x: 25, y: 65 },
    { x: 70, y: 25 }
  ]
  const pos = positions[index % positions.length]
  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    opacity: 0,
    transform: 'scale(0.5)'
  }
}

const selectTerm = (term) => {
  selectedTerm.value = term
  showPopup.value = true

  nextTick(() => {
    if (popupOverlayRef.value && popupRef.value) {
      gsap.to(popupOverlayRef.value, {
        backgroundColor: 'rgba(0,0,0,0.2)',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
      gsap.to(popupRef.value, {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)'
      })
    }
  })
}

const closePopup = () => {
  if (popupOverlayRef.value && popupRef.value) {
    gsap.to(popupRef.value, {
      scale: 0.9,
      y: 20,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in'
    })
    gsap.to(popupOverlayRef.value, {
      backgroundColor: 'rgba(0,0,0,0)',
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        showPopup.value = false
      }
    })
  } else {
    showPopup.value = false
  }
}

const resetAnimation = () => {
  if (mainTimeline) {
    mainTimeline.kill()
    mainTimeline = null
  }

  gsap.killTweensOf([
    flyingFileRef.value,
    progressBarRef.value,
    scanLineRef.value,
    popupOverlayRef.value,
    popupRef.value,
    ...floatingTermRefs.value,
    ...termRowRefs.value
  ])

  animationPhase.value = 'idle'
  uploadedDocs.value = []
  visibleTerms.value = []
  floatingTerms.value = []
  selectedTerm.value = null
  showPopup.value = false
  showExtractBtn.value = false
  isDragActive.value = false
  floatingTermRefs.value = []
  termRowRefs.value = []
}

const startAnimation = () => {
  resetAnimation()

  mainTimeline = gsap.timeline({
    defaults: { ease: 'power2.out' }
  })

  // Phase 1: File flying in
  mainTimeline.add(() => {
    animationPhase.value = 'file-flying'
    isDragActive.value = true
  }, 0.5)

  mainTimeline.add(() => {
    if (flyingFileRef.value) {
      gsap.fromTo(flyingFileRef.value,
        { y: -100, opacity: 0, rotation: -15 },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'back.out(1.2)'
        }
      )
    }
  }, 0.5)

  // Phase 2: Start uploading
  mainTimeline.add(() => {
    animationPhase.value = 'uploading'
    isDragActive.value = false
  }, 1.2)

  mainTimeline.add(() => {
    if (progressBarRef.value) {
      gsap.to(progressBarRef.value, {
        width: '100%',
        duration: 1.5,
        ease: 'power1.inOut'
      })
    }
  }, 1.3)

  // Phase 3: Upload complete, show document
  mainTimeline.add(() => {
    uploadedDocs.value = [demoDoc]
    animationPhase.value = 'ready-to-extract'

    nextTick(() => {
      if (docRowRef.value) {
        const row = Array.isArray(docRowRef.value) ? docRowRef.value[0] : docRowRef.value
        gsap.to(row, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: 'power2.out'
        })
      }
    })
  }, 3)

  // Show extract button with bounce
  mainTimeline.add(() => {
    showExtractBtn.value = true
    nextTick(() => {
      if (extractBtnRef.value) {
        const btn = Array.isArray(extractBtnRef.value) ? extractBtnRef.value[0] : extractBtnRef.value
        gsap.to(btn, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(2)'
        })
      }
    })
  }, 3.5)

  // Phase 4: Start scanning
  mainTimeline.add(() => {
    animationPhase.value = 'scanning'

    nextTick(() => {
      if (scanLineRef.value) {
        gsap.fromTo(scanLineRef.value,
          { top: '0%' },
          {
            top: '100%',
            duration: 1.5,
            ease: 'power1.inOut',
            onComplete: () => {
              animationPhase.value = 'extracting'
              floatingTerms.value = [...allTerms]

              // Animate floating terms
              nextTick(() => {
                floatingTermRefs.value.forEach((el, idx) => {
                  if (el) {
                    gsap.fromTo(el,
                      { opacity: 0, scale: 0.5 },
                      {
                        opacity: 1,
                        scale: 1.2,
                        duration: 0.5,
                        delay: idx * 0.15,
                        ease: 'back.out(1.5)',
                        onComplete: () => {
                          gsap.to(el, {
                            opacity: 0,
                            y: 30,
                            scale: 0.8,
                            duration: 0.4,
                            delay: 0.3,
                            ease: 'power2.in'
                          })
                        }
                      }
                    )
                  }
                })
              })
            }
          }
        )
      }
    })
  }, 4)

  // Phase 5: Terms settle into table
  mainTimeline.add(() => {
    animationPhase.value = 'complete'
    floatingTerms.value = []

    // Add terms with stagger animation
    allTerms.forEach((term, index) => {
      setTimeout(() => {
        visibleTerms.value.push(term)

        nextTick(() => {
          const row = termRowRefs.value[index]
          if (row) {
            gsap.to(row, {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out'
            })
          }
        })
      }, index * 150)
    })
  }, 6.5)

  // Phase 6: Auto-click first term
  mainTimeline.add(() => {
    if (visibleTerms.value.length > 0) {
      // Highlight first row before clicking
      const firstRow = termRowRefs.value[0]
      if (firstRow) {
        gsap.to(firstRow, {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            selectTerm(visibleTerms.value[0])
          }
        })
      } else {
        selectTerm(visibleTerms.value[0])
      }
    }
  }, 8.5)
}

// Watch for visibility
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    startAnimation()
  } else {
    resetAnimation()
  }
})

onMounted(() => {
  if (!containerRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAnimation()
        } else {
          resetAnimation()
        }
      })
    },
    { threshold: 0.3 }
  )

  observer.observe(containerRef.value)
})

onUnmounted(() => {
  if (mainTimeline) {
    mainTimeline.kill()
  }
  gsap.killTweensOf('*')
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
/* Progress bar glow effect */
.progress-glow {
  box-shadow:
    0 0 10px rgba(59, 130, 246, 0.5),
    0 0 20px rgba(59, 130, 246, 0.3),
    0 0 30px rgba(59, 130, 246, 0.2);
  animation: pulse-glow 0.5s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  from {
    box-shadow:
      0 0 10px rgba(59, 130, 246, 0.5),
      0 0 20px rgba(59, 130, 246, 0.3);
  }
  to {
    box-shadow:
      0 0 15px rgba(59, 130, 246, 0.7),
      0 0 30px rgba(59, 130, 246, 0.5),
      0 0 40px rgba(59, 130, 246, 0.3);
  }
}

/* Scan line */
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #3b82f6, transparent);
  box-shadow:
    0 0 10px #3b82f6,
    0 0 20px #3b82f6,
    0 0 30px #06b6d4;
}

/* Glassmorphism popup */
.glassmorphism-popup {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}
</style>
