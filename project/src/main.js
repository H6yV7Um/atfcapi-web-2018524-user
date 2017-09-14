import Vue from "vue/dist/vue.js";
import Router from "vue-router";
// import Vue from "vue";
//一级
import string from "./common/string.vue";
import seach from "./common/seach.vue";
import logn from "./common/logn.vue";
import header from "./common/header.vue";
//二级
import hot from "./common/hot.vue";
import lets from "./common/lets.vue";
import Jb from "./common/Jb.vue";
import Zb from "./common/Zb.vue";
import Gb from "./common/Gb.vue";
//三级
import history from "./common/history.vue";
let router=new Router({
    routes:[
        {
            name:"section",
            path: '/section', 
            component:header,
            children:[
                {
                    path:"/section/hot",
                    component:hot,
                    children:[
                        {
                            path:"/section/hot/history",
                            component:history,
                        }
                    ]
                },
                {
                    path:"/section/lets",
                    component:lets,
                },
                {
                    path:"/section/Jb",
                    component:Jb,
                },
                {
                    path:"/section/Zb",
                    component:Zb,
                },
                {
                    path:"/section/Gb",
                    component:Gb,
                }
                
            ]
        },
        {
            name:"string",
            path: '/string', 
            component:string,
           
        },
        {
            name:"seach",
            path: '/seach', 
            component:seach,
           
        },
        {
            name:"logn",
            path: '/logn', 
            component:logn           
        }
        

      ]
      
})
Vue.use(Router);
new Vue({
    el:"#app",
    data:{
        home:"tab"
    },
    created(){
        console.log(this.$route)
    },
   mounted(){
        this.$router.push("/section/hot")
   },
    router
})
// watch:{
//     '$route'(to,from) {
//     } 
// },   