import { ref } from 'vue';
import api from '@/services/api';

export function useAttendance() {
    const isCheckedIn = ref(false);
    const loading = ref(false);
    const attendanceCount = ref(0);
    const attendanceDates = ref(new Set()); // 출석한 날짜들 (YYYY-MM-DD 형식)
    const error = ref(null);

    // Check today's attendance status
    const checkTodayStatus = async () => {
        loading.value = true;
        try {
            const response = await api.get('/attendance/today');
            // API returns { success, message, data: { checkedIn: boolean } }
            isCheckedIn.value = response.data.data?.checkedIn || false;
        } catch (err) {
            console.error('Failed to check attendance status:', err);
            isCheckedIn.value = false;
        } finally {
            loading.value = false;
        }
    };

    // Submit check-in
    const submitCheckIn = async () => {
        loading.value = true;
        error.value = null;
        try {
            await api.post('/attendance/check-in');
            isCheckedIn.value = true;
            return true; // Success
        } catch (err) {
            console.error('Failed to check in:', err);
            error.value = '출석 체크에 실패했습니다.';
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Get total attendance count
    const fetchAttendanceCount = async () => {
        try {
            const response = await api.get('/attendance/count');
            attendanceCount.value = response.data.data?.totalCount || 0;
        } catch (err) {
            console.error('Failed to fetch attendance count:', err);
        }
    };

    // Get all attendance records (날짜 목록)
    const fetchAttendanceRecords = async () => {
        try {
            const response = await api.get('/attendance');
            const records = response.data.data || [];
            // Set에 날짜들 저장 (YYYY-MM-DD 형식)
            attendanceDates.value = new Set(
                records.map(r => r.attendanceDate)
            );
        } catch (err) {
            console.error('Failed to fetch attendance records:', err);
        }
    };

    // 특정 날짜에 출석했는지 확인
    const hasAttendance = (date) => {
        // 로컬 타임존 기준으로 YYYY-MM-DD 포맷 (toISOString은 UTC 기준이라 날짜가 밀림)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return attendanceDates.value.has(dateStr);
    };

    return {
        isCheckedIn,
        loading,
        attendanceCount,
        attendanceDates,
        error,
        checkTodayStatus,
        submitCheckIn,
        fetchAttendanceCount,
        fetchAttendanceRecords,
        hasAttendance
    };
}
