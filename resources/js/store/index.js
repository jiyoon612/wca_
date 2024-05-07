import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import auth from '../store/auth'
import lang from '../store/lang'
//import lib_storage from '../store/lib_storage' 

const store = createStore({
    plugins:[
        createPersistedState()
    ],
    modules:{
        auth,
        lang,
        //lib_storage, //저장소 라이브러리 명
    }
})

export default store
