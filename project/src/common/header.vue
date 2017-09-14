<template>
<div>
<div class="head">
<ul>
    <router-link :to="{path:'hot'}" tag="li">热门</router-link>
    <router-link :to="{path:'lets'}" tag="li">分类</router-link>
    <router-link :to="{path:'Jb'}" tag="li">精品</router-link>
    <router-link :to="{path:'Zb'}" tag="li">直播</router-link>
    <router-link :to="{path:'Gb'}" tag="li">广播</router-link>
</ul>
</div>
<section>
    <router-view></router-view>
</section>
</div>
</template>
<script>

</script>
<style scoped>
.head{width: 100%;height: .4rem;background: #f3f4f6;}
ul{width: 100%;height: .4rem;display: flex;}
li{flex-grow: 1;text-align: center;line-height: .4rem;height: 100%;}
</style>