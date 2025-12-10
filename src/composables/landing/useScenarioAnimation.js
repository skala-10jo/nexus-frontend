/**
 * 시나리오 생성 애니메이션 로직
 * ScenarioGenerationScene에서 사용
 */
import { ref } from 'vue'
import { gsap } from 'gsap'
import { documentData, extractionKeywords, docPositions, keywordPositions } from '@/components/landing/data/scenarioData'

export function useScenarioAnimation() {
  // Extracting phase state
  const flyingDocuments = ref([])
  const sphereOpacity = ref(0)
  const sphereScale = ref(0.3)
  const docStackOpacity = ref(1)
  const dataParticles = ref([])
  const extractedKeywords = ref([])
  const showDocStack = ref(true)

  // Ripple effects
  const ripples = ref([])

  // Create multiple ripple effects
  const createRipples = (x, y) => {
    ripples.value = []
    const colors = ['rgba(59, 130, 246, 0.6)', 'rgba(99, 102, 241, 0.5)', 'rgba(139, 92, 246, 0.4)', 'rgba(168, 85, 247, 0.3)']

    for (let i = 0; i < 4; i++) {
      const ripple = {
        style: {
          left: `${x}px`,
          top: `${y}px`,
          width: '20px',
          height: '20px',
          border: `3px solid ${colors[i]}`,
          boxShadow: `0 0 20px ${colors[i]}`,
          transform: 'translate(-50%, -50%)',
          opacity: 1
        }
      }
      ripples.value.push(ripple)

      setTimeout(() => {
        gsap.to(ripple.style, {
          width: '300px',
          height: '300px',
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out'
        })
      }, i * 100)
    }
  }

  // Create particles from document
  const createParticlesFromDoc = (docX, docY) => {
    const colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#06b6d4']
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const particle = {
          style: {
            left: `${docX + (Math.random() - 0.5) * 80}px`,
            top: `${docY}px`,
            backgroundColor: colors[i % colors.length],
            boxShadow: `0 0 8px ${colors[i % colors.length]}`,
            opacity: 1
          }
        }
        dataParticles.value.push(particle)
        const pIndex = dataParticles.value.length - 1

        gsap.to(dataParticles.value[pIndex].style, {
          top: `${docY - 50 - Math.random() * 30}px`,
          left: `${docX + (Math.random() - 0.5) * 120}px`,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            dataParticles.value = [...dataParticles.value]
          }
        })
      }, i * 40)
    }
  }

  // Create keyword from document
  const createKeywordFromDoc = (docIndex, x, y) => {
    if (docIndex < extractionKeywords.length) {
      const kw = extractionKeywords[docIndex]
      const keyword = {
        text: kw.text,
        style: {
          left: `${x}px`,
          top: `${y}px`,
          color: kw.color,
          backgroundColor: '#ffffff',
          border: `2px solid ${kw.color}`,
          opacity: 0,
          transform: 'translateY(10px) scale(0.8)'
        }
      }
      extractedKeywords.value.push(keyword)
      const kwIndex = extractedKeywords.value.length - 1

      gsap.to(extractedKeywords.value[kwIndex].style, {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
        duration: 0.3,
        ease: 'back.out(1.5)',
        onUpdate: () => {
          extractedKeywords.value = [...extractedKeywords.value]
        }
      })
    }
  }

  // Absorb all elements to sphere
  const absorbAllToSphere = (centerX, centerY) => {
    flyingDocuments.value.forEach((doc, i) => {
      gsap.to(doc.style, {
        left: `${centerX - 57}px`,
        top: `${centerY - 45}px`,
        opacity: 0,
        transform: 'scale(0.1) rotate(180deg)',
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.in',
        onUpdate: () => {
          flyingDocuments.value = [...flyingDocuments.value]
        }
      })
    })

    extractedKeywords.value.forEach((kw, i) => {
      gsap.to(kw.style, {
        left: `${centerX}px`,
        top: `${centerY}px`,
        opacity: 0,
        transform: 'scale(0.1)',
        duration: 0.7,
        delay: i * 0.08,
        ease: 'power3.in',
        onUpdate: () => {
          extractedKeywords.value = [...extractedKeywords.value]
        }
      })
    })

    // Sphere absorb pulse effect
    gsap.to(sphereScale, {
      value: 1.3,
      duration: 0.4,
      delay: 0.6,
      ease: 'power2.out',
      onUpdate: () => { sphereScale.value = sphereScale.value }
    })
    gsap.to(sphereScale, {
      value: 1,
      duration: 0.3,
      delay: 1.0,
      ease: 'power2.in',
      onUpdate: () => { sphereScale.value = sphereScale.value }
    })
  }

  // Main extraction animation
  const runExtractionAnimation = () => {
    const centerX = 387
    const centerY = 200
    const stackStartX = 387
    const stackStartY = 450

    showDocStack.value = true
    docStackOpacity.value = 1

    // 1. AI sphere appears
    gsap.to(sphereOpacity, {
      value: 1,
      duration: 0.6,
      onUpdate: () => { sphereOpacity.value = sphereOpacity.value }
    })
    gsap.to(sphereScale, {
      value: 1,
      duration: 0.7,
      ease: 'back.out(1.5)',
      onUpdate: () => { sphereScale.value = sphereScale.value }
    })

    // 2. Documents fly up from stack
    documentData.forEach((doc, index) => {
      setTimeout(() => {
        const targetPos = docPositions[index]

        const docObj = {
          ...doc,
          style: {
            left: `${stackStartX - 57}px`,
            top: `${stackStartY}px`,
            opacity: 0,
            transform: 'scale(0.5)'
          }
        }
        flyingDocuments.value.push(docObj)
        const docIndex = flyingDocuments.value.length - 1

        gsap.to(flyingDocuments.value[docIndex].style, {
          left: `${targetPos.x}px`,
          top: `${targetPos.y}px`,
          opacity: 1,
          transform: 'scale(1)',
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            flyingDocuments.value = [...flyingDocuments.value]
          },
          onComplete: () => {
            createParticlesFromDoc(targetPos.x + 57, targetPos.y + 45)
            setTimeout(() => {
              const kwPos = keywordPositions[index]
              createKeywordFromDoc(index, kwPos.x, kwPos.y)
            }, 200)
          }
        })
      }, index * 150)
    })

    // 2.5. Fade out document stack
    setTimeout(() => {
      gsap.to(docStackOpacity, {
        value: 0,
        duration: 0.5,
        onUpdate: () => { docStackOpacity.value = docStackOpacity.value },
        onComplete: () => { showDocStack.value = false }
      })
    }, 1000)

    // 3. Absorb all to sphere
    setTimeout(() => {
      absorbAllToSphere(centerX, centerY)
    }, 2800)
  }

  // Reset extraction state
  const resetExtractionState = () => {
    flyingDocuments.value = []
    sphereOpacity.value = 0
    sphereScale.value = 0.3
    docStackOpacity.value = 1
    dataParticles.value = []
    extractedKeywords.value = []
    showDocStack.value = true
    ripples.value = []
  }

  return {
    // State
    flyingDocuments,
    sphereOpacity,
    sphereScale,
    docStackOpacity,
    dataParticles,
    extractedKeywords,
    showDocStack,
    ripples,
    // Methods
    createRipples,
    runExtractionAnimation,
    resetExtractionState
  }
}
