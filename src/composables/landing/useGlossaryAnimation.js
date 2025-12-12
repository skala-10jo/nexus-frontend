/**
 * GlossaryMockUI 애니메이션 로직
 *
 * @description 문서 업로드 및 용어 추출 시연 애니메이션 관리
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { glossaryTerms, demoDocument, floatingPositions } from '@/components/landing/data/glossaryData'

export function useGlossaryAnimation(props, refs) {
  // ============================================
  // State
  // ============================================
  const animationPhase = ref('idle')
  const uploadedDocs = ref([])
  const visibleTerms = ref([])
  const floatingTerms = ref([])
  const selectedTerm = ref(null)
  const showPopup = ref(false)
  const showExtractBtn = ref(false)
  const isDragActive = ref(false)
  const floatingTermRefs = ref([])
  const termRowRefs = ref([])

  let observer = null
  let mainTimeline = null

  // ============================================
  // Computed
  // ============================================
  const dropzoneClass = computed(() => {
    if (isDragActive.value || animationPhase.value === 'file-flying') {
      return 'border-blue-500 bg-blue-50 scale-[1.02]'
    }
    return 'border-gray-300 bg-white'
  })

  // ============================================
  // Methods
  // ============================================
  const getFloatingInitialStyle = (index) => {
    const pos = floatingPositions[index % floatingPositions.length]
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
      if (refs.popupOverlayRef.value && refs.popupRef.value) {
        gsap.to(refs.popupOverlayRef.value, {
          backgroundColor: 'rgba(0,0,0,0.2)',
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
        gsap.to(refs.popupRef.value, {
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
    if (refs.popupOverlayRef.value && refs.popupRef.value) {
      gsap.to(refs.popupRef.value, {
        scale: 0.9,
        y: 20,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in'
      })
      gsap.to(refs.popupOverlayRef.value, {
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
      refs.flyingFileRef?.value,
      refs.progressBarRef?.value,
      refs.scanLineRef?.value,
      refs.popupOverlayRef?.value,
      refs.popupRef?.value,
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
      if (refs.flyingFileRef?.value) {
        gsap.fromTo(refs.flyingFileRef.value,
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
      if (refs.progressBarRef?.value) {
        gsap.to(refs.progressBarRef.value, {
          width: '100%',
          duration: 1.5,
          ease: 'power1.inOut'
        })
      }
    }, 1.3)

    // Phase 3: Upload complete, show document
    mainTimeline.add(() => {
      uploadedDocs.value = [demoDocument]
      animationPhase.value = 'ready-to-extract'

      nextTick(() => {
        if (refs.docRowRef?.value) {
          const row = Array.isArray(refs.docRowRef.value) ? refs.docRowRef.value[0] : refs.docRowRef.value
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
        if (refs.extractBtnRef?.value) {
          const btn = Array.isArray(refs.extractBtnRef.value) ? refs.extractBtnRef.value[0] : refs.extractBtnRef.value
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
        if (refs.scanLineRef?.value) {
          gsap.fromTo(refs.scanLineRef.value,
            { top: '0%' },
            {
              top: '100%',
              duration: 1.5,
              ease: 'power1.inOut',
              onComplete: () => {
                animationPhase.value = 'extracting'
                floatingTerms.value = [...glossaryTerms]

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
      glossaryTerms.forEach((term, index) => {
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

  // ============================================
  // Lifecycle
  // ============================================
  watch(() => props.isVisible, (newVal) => {
    if (newVal) {
      startAnimation()
    } else {
      resetAnimation()
    }
  })

  onMounted(() => {
    if (!refs.containerRef?.value) return

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

    observer.observe(refs.containerRef.value)
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

  // ============================================
  // Return
  // ============================================
  return {
    // State
    animationPhase,
    uploadedDocs,
    visibleTerms,
    floatingTerms,
    selectedTerm,
    showPopup,
    showExtractBtn,
    isDragActive,
    floatingTermRefs,
    termRowRefs,

    // Computed
    dropzoneClass,

    // Methods
    getFloatingInitialStyle,
    selectTerm,
    closePopup
  }
}
