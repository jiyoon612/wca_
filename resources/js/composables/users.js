import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import { cmmn } from '@/hooks/cmmn';

export default function useUsers() {
    const users = ref([])
    const user = ref({
        name: ''
    })
    const { wica , wicac} = cmmn();
    const router = useRouter()
    const validationErrors = ref({})
    const isLoading = ref(false)
    const swal = inject('$swal')
    const pagination = ref({});
    
    const editForm = reactive({
        name:"",
        status:"",
        role:"",
        company:"",
        company_post:"",
        company_addr1:"",
        company_addr2:"",
        introduce:"",
        receive_post:"",
        receive_addr1:"",
        receive_addr2:"",
        receive_addr2:"",
        file_user_photo:"",
        file_user_photo_name:"",
        file_user_biz:"",
        file_user_sign:"",
        file_user_sign_name:"",
        file_user_cert:"",
        file_user_cert_name:"",
    
    });

    const adminEditForm = reactive({
        name:"",
        phone:"",
        currentPw:"",
        password:"",
        password_confirmation:"",
    });

    const getUsers = async (
        page = 1,
        search_id = '',
        search_title = '',
        search_global = '',
        order_column = 'created_at',
        order_direction = 'desc'
    ) => {
        axios.get('/api/users?page=' + page +
            '&search_id=' + search_id +
            '&search_title=' + search_title +
            '&search_global=' + search_global +
            '&order_column=' + order_column +
            '&order_direction=' + order_direction)
            .then(response => {
                users.value = response.data;
                console.log(users.value);
            })
        
            
    }
    
    const adminGetUsers = async (
        page = 1,
        stat = 'all',
        role = 'all',
        column = '',
        direction = ''
    ) => {
        const apiList = [];
        if(stat != 'all'){
            apiList.push(`users.status:${stat}`)
        } 
        if(role != 'all'){
            apiList.push(`users.roles:${role}`)
        }
        console.log(apiList);

        return wicac.conn()
        .url(`/api/users`)
        .where(apiList)
        .order([
            [`${column}`,`${direction}`]
        ])
        .page(`${page}`)
        .callback(function(result) {
            console.log('wicac.conn callback ' , result);
            users.value = result.data;
            pagination.value = result.rawData.data.meta;
            return result.data;
        })
        .get();

    }

    const getUser = async (id) => {
        try {
            const result = await wicac.conn()
            .url(`/api/users/${id}`)
            .callback(function(result) {
                return result
            })
            .get();

            //const response = await axios.get('/api/users/' + id);
            return result.data;
        } catch (error) {
            throw error;
        }
    }
    

    const storeUser = async (user) => {
        if (isLoading.value) return;

        isLoading.value = true
        validationErrors.value = {}

        let serializedPost = new FormData()
        for (let item in user) {
            if (user.hasOwnProperty(item)) {
                serializedPost.append(item, user[item])
            }
        }
        
        axios.post('/api/users', serializedPost)
            .then(response => {
                router.push({name: 'users.index'})
                wica.ntcn(swal).icon('S').title('정상 처리 되었습니다.').fire();
            })
            .catch(error => {
                if (error.response?.data) {
                    validationErrors.value = error.response.data.errors
                }
            })
            .finally(() => isLoading.value = false)
    }

    const updateUser = async (editForm, id) => {
        console.log(JSON.stringify(editForm));
        if (isLoading.value) return;
        let payload = {
            user: {
                name: editForm.name,
                status: editForm.status,
                role: editForm.role
            },
            dealer: {
                company: editForm.company,
                company_post: editForm.company_post,
                company_addr1: editForm.company_addr1,
                company_addr2: editForm.company_addr2,
                introduce: editForm.introduce,
                receive_post: editForm.receive_post,
                receive_addr1: editForm.receive_addr1,
                receive_addr2: editForm.receive_addr2,
            }
        };

        
    
        console.log(JSON.stringify(payload));
        const formData = new FormData();
        formData.append('user', JSON.stringify(payload.user));
        formData.append('dealer', JSON.stringify(payload.dealer));
        //formData.append('_method', 'PUT');
        
        if (editForm.file_user_photo) {
            formData.append('file_user_photo', editForm.file_user_photo);
        }
        if (editForm.file_user_biz) {
            formData.append('file_user_biz', editForm.file_user_biz);
        }
        if (editForm.file_user_cert) {
            formData.append('file_user_cert', editForm.file_user_cert);
        }
        if (editForm.file_user_sign) {
            formData.append('file_user_sign', editForm.file_user_sign);
        }
        for (const x of formData) {
            console.log(x);
        };

        wica.ntcn(swal)
            .title('수정하시겠습니까?') // 알림 제목
            .icon('Q') //E:error , W:warning , I:info , Q:question
            .callback(async function(result) {
                if (result.isOk) {
                    wicac.conn()
                    .url(`/api/users/${id}`)
                    .param(formData)
                    .multipart()
                    .callback(async function(result) {
                        console.log('wicac.conn callback ' , result);
                        if(result.isError) {
                            validationErrors.value = result.msg;
                        } else {
                            wica.ntcn(swal).icon('S').title('정상 처리 되었습니다.').fire();
                            //console.log(response);
                            await router.push({ name: "users.index" });
                        }
                    })
                    .post();
                }
            }).confirm();
    };

    const updateMyInfo = async(adminEditForm,id) =>{
        validationErrors.value = {};
        if (isLoading.value) return;

        wica.ntcn(swal)
        .title('수정하시겠습니까?') // 알림 제목
        .icon('Q') //E:error , W:warning , I:info , Q:question
        .callback(async function(result) {
            if(result.isOk){
                wicac.conn()
                .url(`/api/users/confirmPassword`)
                .param({
                    'password' : adminEditForm.currentPw
                })
                .callback(function(result) {
                    if(result.isSuccess){
                        //내 정보 변경 진행
                        myInfoModify(adminEditForm,id);
                    }else{
                        wica.ntcn(swal)
                        .title('비밀번호 불일치')
                        .icon('E') //E:error , W:warning , I:info , Q:question
                        .alert('비밀번호가 옳바르지 않습니다.');
                    }
                })
                .post();
            }
        }).confirm();
    };

    const myInfoModify = async(adminEditForm,id) =>{
        let jsonData = {};
        if(adminEditForm.password || adminEditForm.password_confirmation){
            jsonData = {
                user:{
                    name: adminEditForm.name,
                    phone: adminEditForm.phone,
                    password: adminEditForm.password,
                    password_confirmation : adminEditForm.password_confirmation
                }
            }
        }else{
            jsonData = {
                user:{
                    name: adminEditForm.name,
                    phone: adminEditForm.phone
                }
            }
        }

        wicac.conn()
        .url(`/api/users/${id}`)
        .param(jsonData)
        .callback(function(result) {
            if(result.isSuccess){
                //내 정보 변경 진행
                wica.ntcn(swal)
                .icon('I') //E:error , W:warning , I:info , Q:question
                .callback(function(result) {
                    if (result.isOk) {
                        router.push({ name: 'users.index' });
                    }
                })
                .alert('내 정보가 정상적으로 수정되었습니다.');
            }else{
                validationErrors.value = result.msg;
                wica.ntcn(swal)
                .title('변경 실패')
                .icon('E') //E:error , W:warning , I:info , Q:question
                .alert('내 정보 변경에 실패하였습니다.');
            }
        })
        .put();
    }
    
    /**console.log(result);
    await axios.put(`/api/users/${id}`, formData,{
        headers:{ 
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(response => {
        wica.ntcn(swal)
            .icon('I') //E:error , W:warning , I:info , Q:question
            .callback(function(result) {
                if (result.isOk) {
                    router.push({ name: 'users.index' });
                }
            })
            .alert('회원정보가 정상적으로 수정되었습니다.');
    })
    .catch(error => {
        if (error.response?.data) {
            validationErrors.value = error.response.data.errors;
        }
    })
    .finally(() => isLoading.value = false); */

    const deleteUser = async (id) => {
        wica.ntcn(swal)
        .param({ _id : id }) // 리턴값에 전달 할 데이터
        .title('삭제하시겠습니까?') // 알림 제목
        .icon('W') //E:error , W:warning , I:info , Q:question
        .callback(function(result) {
            if(result.isOk){
                console.log(result);
                axios.delete('/api/users/' + id)
                    .then(response => {
                        wica.ntcn(swal)
                        .icon('I') //E:error , W:warning , I:info , Q:question
                        .callback(function(result) {
                            if(result.isOk){                                
                                location.reload();                          
                            }
                        })
                        .alert('이용후기가 정상적으로 삭제되었습니다.');
                    })
                    .catch(error => {
                        wica.ntcn(swal)
                        .title('오류가 발생하였습니다.')
                        .icon('E') //E:error , W:warning , I:info , Q:question
                        .alert('관리자에게 문의해주세요.');
                    })
            }
        })
        .confirm('삭제된 정보는 복구할 수 없습니다.');   
        
    }

    return {
        adminEditForm,
        editForm,
        users,
        user,
        getUsers,
        getUser,
        adminGetUsers,
        storeUser,
        updateMyInfo,
        updateUser,
        deleteUser,
        validationErrors,
        isLoading,
        pagination
    }
}
