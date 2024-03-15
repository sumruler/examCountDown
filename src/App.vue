<script setup>
import { ref, computed, onMounted } from "vue";
import { SettingOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import dayjs from "dayjs";

dayjs.locale('zh-cn')


const beginAudio = ref(false)//开考铃声开关
const endAudio = ref(false)//结束铃声开关
const audio = new Audio('./audio/1.mp3')
audio.preload = 'auto'
audio.load()

onMounted(() => {
  const audio = new Audio('./audio/1.mp3')
  audio.preload = 'auto'
  audio.load()
})


const subjects = ref([ //科目列表
  {
    value: '物理',
    label: '物理',
  },
  {
    value: '语文',
    label: '语文',
  },
  {
    value: '数学',
    label: '数学',
  },
  {
    value: '英语',
    label: '英语',
  },
  {
    value: '化学',
    label: '化学',
  },
  {
    value: '生物',
    label: '生物',
  },
  {
    value: '历史',
    label: '历史',
  },
  {
    value: '地理',
    label: '地理',
  },
  {
    value: '政治',
    label: '政治',
  },
  {
    value: '物理竞赛初赛',
    label: '物理竞赛初赛',
  },
  {
    value: '物理竞赛复赛',
    label: '物理竞赛复赛',
  },
  {
    value: '物理竞赛决赛',
    label: '物理竞赛决赛',
  },
  {
    value: '物理竞赛',
    label: '物理竞赛',
  },
]);
const subject = ref('物理')
const setting = ref(false);
const range = ref([]) //考试时间范围
const format0 = timecho => {
  return timecho = Math.floor(timecho * 0.001) * 1000 //将时间戳的毫秒数变为0
}

const duration = computed(() => {     //考试时长
  if (range.value.length === 0) { return 0 } else {
    let start = format0(range.value[0].valueOf())
    let end = format0(range.value[1].valueOf())
    return Math.floor((end - start) / 60000)

  }
})

const remainTime = ref('')

const getRemainTime = () => { 

  let nowT = Date.now()
  let begin = format0(dayjs(range.value[0]).valueOf())
  let end = format0(dayjs(range.value[1]).valueOf())

  let beginDiff = begin - nowT + 1000
  if (beginDiff > 0) {
    let hour = Math.floor(beginDiff / 3600000)
    let minute = Math.floor((beginDiff - hour * 3600000) / 60000)
    let second = Math.floor((beginDiff - hour * 3600000 - minute * 60000) / 1000)
    if (hour > 0) {
      remainTime.value = `距离开考还有：${hour} 小时 ${minute} 分 ${second} 秒`
      return
    } else if (minute > 0) {
      remainTime.value = `距离开考还有：${minute} 分 ${second} 秒`
      return
    } else {
      remainTime.value = `距离开考还有：${second} 秒`
      if (second === 0 && beginAudio.value) { audio.play() }
      return
    }
  }

  let diff = end - nowT + 1000
  if (diff <= 0) {
    remainTime.value = '考试结束！'
  } else {
    let hour = Math.floor(diff / 3600000)
    let minute = Math.floor((diff - hour * 3600000) / 60000)
    let second = Math.floor((diff - hour * 3600000 - minute * 60000) / 1000)
    if (hour > 0) {
      remainTime.value = `考试剩余时间：${hour} 小时 ${minute} 分 ${second} 秒`
    } else if (minute > 0) {
      remainTime.value = `考试剩余时间：${minute} 分 ${second} 秒`
    } else {
      remainTime.value = `考试剩余时间：${second} 秒`
      if (second === 0 && endAudio.value) { audio.play() }
    }

  }
}


const now = ref(dayjs())




onMounted(() => {
  const timer = setInterval(() => {

    now.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    if (range.value.length > 0) { getRemainTime() } else { remainTime.value = '请设置考试时间' }

  }, 1000)
})


//全屏和退出全屏按钮

const isFullscreen = ref(false)
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}


</script>

<template>
  <div class="body">


    <div class="info">
      <span style="margin-right: 30px;">考试科目：{{ subject }} </span> <span v-if="range.length > 0">考试时间：{{
        range[0].format('HH:mm') }} - {{ range[1].format('HH:mm')
  }}，共 {{ duration }} 分钟</span>
    </div>
    <div class="currentTime">
      当前时间：{{ now }}

    </div>
    <div class="remainTime">
      {{ remainTime }}
    </div>







    <div class="setting">
      <a-button shape="circle" size="large" @click="setting = true">
        <template #icon>
          <SettingOutlined />
        </template>
      </a-button>
    </div>

    <div class="fullSccreen">
      <a-button shape="circle" size="large" @click="toggleFullscreen">
        <template #icon>

          <FullscreenExitOutlined v-if="isFullscreen" />
          <FullscreenOutlined v-else />
        </template>
      </a-button>
    </div>
  </div>


  <!-- 弹窗 -->
  <a-modal v-model:open="setting" width="600px" title="设置" centered :footer="null">

    <a-space direction="vertical" :size="10">


      <a-space :size="3">

        <span>设置科目：</span>
        <a-select ref="select" v-model:value="subject" style="width: 120px" :options="subjects"
          placeholder="选择科目"></a-select>


      </a-space>
      <a-space :size="3">
        <span>设置结束时间：</span>
        <!-- <a-date-picker v-model:value="deadline" show-time placeholder="设置结束时间" format="YYYY-MM-DD HH:mm" /> -->
        <a-range-picker v-model:value="range" format="YYYY-MM-DD HH:mm:ss" :placeholder="['开始时间', '结束时间']" show-time />

      </a-space>
      <a-space :size="10">

        <span> 开考铃声：</span><a-switch v-model:checked="beginAudio" /><span>结束铃声：</span> <a-switch
          v-model:checked="endAudio" />

      </a-space>


    </a-space>
  </a-modal>
</template>

<style scoped>
.body {
  background-color: #00a6ff;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.setting {
  position: absolute;
  left: 30px;
  bottom: 30px;
}

.fullSccreen {
  position: absolute;
  left: 30px;
  bottom: 80px;
}

.info {
  position: absolute;
  top: 30px;
  left: 30px;
  font-size: 40px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px #b8b8b8;
  -webkit-user-select: none;
  /* Chrome/Safari */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* IE10+ */

}

.currentTime {
  position: absolute;
  top: 80px;
  left: 30px;
  font-size: 70px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px #b8b8b8;
  -webkit-user-select: none;
  /* Chrome/Safari */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* IE10+ */
}

.remainTime {
  font-size: 90px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px #b8b8b8;
  -webkit-user-select: none;
  /* Chrome/Safari */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* IE10+ */
}
</style>
