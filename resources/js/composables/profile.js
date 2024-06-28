import { ref, inject } from "vue";
import { useRouter } from "vue-router";
import store from "../store";

export default function useProfile() {
    const profile = ref({
        name: "",
        email: "",
    });

    const router = useRouter();
    const validationErrors = ref({});
    const isLoading = ref(false);
    const swal = inject("$swal");

    const getProfile = async () => {
        profile.value = store.getters["auth/user"];
        // axios.get('/api/user')
        //     .then(({data}) => {
        //         profile.value = data.data;
        //     })
    };

    const updateProfile = async (profile) => {
        if (isLoading.value) return;

        isLoading.value = true;
        validationErrors.value = {};

        axios
            .put("/api/users/" + user.id, profile)
            .then(({ data }) => {
                if (data.success) {
                    store.commit("auth/SET_USER", data.data);
                    // router.push({name: 'profile.index'})
                    wica.ntcn(swal).icon('S').title('정상 처리 되었습니다.').fire();
                }
            })
            .catch((error) => {
                if (error.response?.data) {
                    validationErrors.value = error.response.data.errors;
                }
            })
            .finally(() => (isLoading.value = false));
    };

    return {
        profile,
        getProfile,
        updateProfile,
        validationErrors,
        isLoading,
    };
}
