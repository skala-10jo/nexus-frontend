<template>
    <div class="h-full flex flex-col items-center justify-center p-4 md:p-8">
        <div class="text-center max-w-md">
            <div class="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <ChatBubbleLeftRightIcon class="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
            </div>
            <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">회화 피드백 노트</h2>
            <p class="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">
                시나리오 회화 연습에서 받은 피드백을 모아볼 수 있는 공간입니다.<br>
                아직 준비 중인 기능입니다.
            </p>
            <button disabled class="px-5 md:px-6 py-2.5 md:py-3 bg-gray-100 text-gray-400 rounded-lg md:rounded-xl font-medium cursor-not-allowed text-sm md:text-base">
                기능 준비 중
            </button>
        </div>
    </div>
</template>

<script setup>
import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
</script>
