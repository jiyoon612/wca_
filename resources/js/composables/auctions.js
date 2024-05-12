import { reactive, ref,inject } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import store from "../store";

export default function useAuctions() {
    const showModal = ref(false);
    const auctionsData = ref([]);
    const auction = ref({});
    const pagination = ref({});
    const router = useRouter();;
    const processing = ref(false);
    const validationErrors = ref({});

    const isLoading = ref(false);
    const swal = inject('$swal');

 const hope_price = ref('');
    const carInfoForm = reactive({
        owner: "",
        no: "",
        forceRefresh: "" 
    });

// 경매 내용 통신 (페이지까지)
const getAuctions = async (page = 1) => {
    try {
        const response = await axios.get(`/api/auctions?page=${page}`);
        auctionsData.value = response.data.data;
        pagination.value = response.data.meta;
        console.log('Pagination:', pagination.value);
        console.log('Auctions:', auctionsData.value);
    } catch (error) {
        console.error('Error fetching auctions:', error);
    }
};


    
// 경매 ID를 이용해 경매 상세 정보를 가져오는 함수
const getAuctionById = async (id) => {
    try {
        // API 경로에서 {auction} 부분을 실제 ID로 치환하여 요청
        const response = await axios.get(`/api/auctions/${id}`);
         auction.value = response.data;
        console.log(response);
        return response.data;
    } catch (error) {
        console.error('Error ID:', error);
        throw error; 
    }
};
// 상태를 
const statusMap = {
    cancel: "취소",
    done: "경매완료",
    chosen: "선택완료",
    wait: "선택대기",
    ing: "경매진행",
    diag: "진단대기",
    ask: "신청완료"
};
const getStatusLabel = (status) => {
    return statusMap[status] || status;
};

// carinfo detail 정보를 가져오고 스토리지 저장 
const submitCarInfo = async () => {
    if (processing.value) return;  // 이미 처리중이면 다시 처리하지 않음
    processing.value = true;
    validationErrors.value = {};

    try {
        const response = await axios.post('/api/auctions/carInfo', carInfoForm);
        localStorage.setItem('carDetails', JSON.stringify(response.data.data));  // 데이터를 로컬 스토리지에 저장
        router.push({ name: 'sell' });  // 저장 후 sell 라우트로 이동
    } catch (error) {
        console.error(error);
        if (error.response?.data) {
            validationErrors.value = error.response.data.errors;  // 서버로부터 받은 에러 메시지 처리
        }
    } finally {
        processing.value = false;
    }
};
 const createAuction = async (auctionData) => {
        if (processing.value) return;
        processing.value = true;
        validationErrors.value = {};

        try {
            const response = await axios.post('/api/auctions', auctionData);
            return response.data; 
        } catch (error) {
            console.error(error);
            if (error.response?.data) {
                validationErrors.value = error.response.data.errors;
            }
            swal({
                icon: 'error',
                title: 'Failed to create auction'
            });
            throw error;
        } finally {
            processing.value = false;
        }
    };
// 상태 업데이트 
const updateAuctionStatus = async (id, status) => {
    if (isLoading.value) return;
    
    isLoading.value = true;
    validationErrors.value = {};

    const data = {
        auction: {
            status: status
        }
    };

    try {
        console.log(`status : ${status} auction id : ${id}`);
        const response = await axios.put(`/api/auctions/${id}`, data);
        console.log('response:', response.data);
        auction.value = response.data;
        swal({
            icon: 'success',
            title: 'Auction status updated successfully'
        });
    } catch (error) {
        if (error.response?.data) {
            validationErrors.value = error.response.data.errors;
        }
        swal({
            icon: 'error',
            title: 'Failed to update auction status'
        });
    } finally {
        isLoading.value = false;
        router.push({ name: 'auctions.index' }); 
    }
};

 const updateAuctionPrice = async (auctionId, amount) => {
    if (isLoading.value) return;

    isLoading.value = true;
    validationErrors.value = {};

    const data = {
        auction: {
            amount: amount
        }
    };

    try {
        console.log(`Updating auction price: ${amount}`);
        const response = await axios.put(`/api/auctions/${auctionId}`, data);
        console.log('response:', response.data);
        swal({
            icon: 'success',
            title: 'Auction price updated successfully'
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) {
            validationErrors.value = error.response.data.errors;
        }
        swal({
            icon: 'error',
            title: 'Failed to update auction price'
        });
        throw error;
    } finally {
        isLoading.value = false;
    }
};

    const deleteAuction = async (id) => {
        try {
          const response = await axios.delete(`/api/auctions/${id}`);
          return response.data;
        } catch (error) {
          console.error('Error deleting auction:', error);
          throw error;
        }
      };

    return {
        hope_price,
        deleteAuction,
        updateAuctionPrice,
        getAuctionById,
        useAuctions,
        getAuctions,
        auctionsData,
        pagination,
        carInfoForm,
        submitCarInfo,
        auction,
        processing,
        validationErrors,
        statusMap,
        getStatusLabel,
        updateAuctionStatus,
        createAuction
    };
    
}
