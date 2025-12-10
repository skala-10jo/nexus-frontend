/**
 * 일정 관리 애니메이션 로직
 * ProjectScheduleMockUI에서 사용
 */
import { ref, nextTick } from 'vue'
import { gsap } from 'gsap'

export function useScheduleAnimation() {
  // State
  const hoveredEventId = ref(null)
  const draggingEventId = ref(null)
  const movedEventPosition = ref(null)
  const animatedEvents = ref(new Set())

  // Typing animation helper
  const typeText = (targetRef, text, onComplete, scrollTarget = null, speed = 40) => {
    let index = 0
    const interval = setInterval(() => {
      if (index <= text.length) {
        targetRef.value = text.slice(0, index)
        index++

        // 다음 틱에서 스크롤을 맨 아래로 이동 (최신 텍스트가 보이도록)
        nextTick(() => {
          const el = scrollTarget?.value || scrollTarget
          if (el) {
            el.scrollTop = el.scrollHeight
          }
        })
      } else {
        clearInterval(interval)
        if (onComplete) onComplete()
      }
    }, speed)
    return interval
  }

  // Handle event hover
  const handleEventHover = (event, isHovering) => {
    hoveredEventId.value = isHovering ? event.id : null
  }

  // Get event CSS class based on state
  const getEventClass = (event) => {
    const baseClasses = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      orange: 'bg-orange-500 text-white',
      cyan: 'bg-cyan-500 text-white'
    }

    let classes = baseClasses[event.color] || baseClasses.blue

    if (hoveredEventId.value === event.id) {
      classes += ' ring-2 ring-offset-1 ring-white/50 shadow-lg z-10'
    }

    if (draggingEventId.value === event.id) {
      classes += ' shadow-xl z-20'
    }

    return classes
  }

  // Animate event drag
  const animateEventDrag = (eventEl, targetEventId, newStartDate, newEndDate, eventRefs) => {
    if (!eventEl) return

    hoveredEventId.value = targetEventId

    // 1. Hover effect
    gsap.to(eventEl, {
      scale: 1.02,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        // 2. Drag start - lift up
        draggingEventId.value = targetEventId
        gsap.to(eventEl, {
          scale: 1.05,
          y: -3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          duration: 0.15,
          ease: 'power2.out',
          onComplete: () => {
            // 3. Move to new position
            const cellWidth = eventEl.offsetWidth / 2
            gsap.to(eventEl, {
              x: cellWidth * 2,
              duration: 0.6,
              ease: 'power2.inOut',
              onComplete: () => {
                // 4. Drop
                gsap.to(eventEl, {
                  scale: 1,
                  y: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  duration: 0.25,
                  ease: 'power2.out',
                  onComplete: () => {
                    movedEventPosition.value = {
                      id: targetEventId,
                      startDate: newStartDate,
                      endDate: newEndDate
                    }

                    nextTick(() => {
                      const newEventEl = eventRefs.value[targetEventId]
                      if (newEventEl) {
                        gsap.set(newEventEl, { opacity: 1, y: 0, x: 0 })
                      }
                    })

                    draggingEventId.value = null
                    hoveredEventId.value = null
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  // Animate event drop into calendar
  const animateEventDrop = (eventEl, eventId, onComplete) => {
    if (!eventEl) return

    gsap.fromTo(eventEl,
      { opacity: 0, y: -25, scale: 0.5 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'bounce.out',
        onComplete: () => {
          animatedEvents.value.add(eventId)
          if (onComplete) onComplete()
        }
      }
    )
  }

  // Reset state
  const resetAnimationState = () => {
    hoveredEventId.value = null
    draggingEventId.value = null
    movedEventPosition.value = null
    animatedEvents.value = new Set()
  }

  return {
    hoveredEventId,
    draggingEventId,
    movedEventPosition,
    animatedEvents,
    typeText,
    handleEventHover,
    getEventClass,
    animateEventDrag,
    animateEventDrop,
    resetAnimationState
  }
}
