<template>
    <div class="h-full flex flex-col items-center justify-center p-8">
        <div class="text-center max-w-md">
            <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChatBubbleLeftRightIcon class="w-10 h-10 text-blue-500" />
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-3">회화 피드백 노트</h2>
            <p class="text-gray-500 mb-8">
                실무 시나리오 회화연습에서 받은 피드백을 모아볼 수 있는 공간입니다.<br>
                아직 준비 중인 기능입니다.
            </p>
            <button disabled class="px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-medium cursor-not-allowed">
                기능 준비 중
            </button>
        </div>
    </div>
</template>

<script setup>
import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
</script>
