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
const examDuration = ref(0) // 添加考试时长变量
const remainTime = ref('') // 添加回 remainTime 的定义
const format0 = timecho => {
  return timecho = Math.floor(timecho * 0.001) * 1000 //将时间戳的毫秒数变为0
}

const remind15 = ref(false) // 15分钟提醒开关

const audio15 = new Audio('./audio/2.mp3')
audio15.preload = 'auto'
audio15.load()

const getRemainTime = () => {
  let nowT = useNetworkTime.value ? networkTime.value.valueOf()+1000 : Date.now()
  let begin = format0(dayjs(range.value[0]).valueOf())
  let end = begin + examDuration.value * 60000

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
    
    if (remind15.value && minute === 15 && second === 0 && hour === 0) {
      audio15.play()
    }

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

// 添加网络校时的状态
const useNetworkTime = ref(false)
const networkTime = ref(null)

// 修改获取网络时间的函数
const fetchNetworkTime = async () => {
  try {
    const response = await fetch('https://quan.suning.com/getSysTime.do')
    const data = await response.json()
    // 直接创建 dayjs 对象，不要给 networkTime.value 赋值数字
    networkTime.value = dayjs(data.sysTime2)
  } catch (error) {
    console.error('获取网络时间失败:', error)
    networkTime.value = dayjs()
  }
}

// 修改定时器中的时间更新逻辑
onMounted(() => {
  let lastFetchTime = 0
  const timer = setInterval(async () => {
    if (useNetworkTime.value) {
      const currentTime = Date.now()
      if (currentTime - lastFetchTime >= 60000 || !networkTime.value) {
        await fetchNetworkTime()
        lastFetchTime = currentTime
      } else {
        // 使用 add 方法创建新的 dayjs 对象
        networkTime.value = dayjs(networkTime.value).add(1, 'second')
      }
      now.value = networkTime.value.format('YYYY-MM-DD HH:mm:ss')
    } else {
      now.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    
    if (range.value[0] && examDuration.value > 0) {
      getRemainTime()
    } else {
      remainTime.value = '请设置考试时间'
    }
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

// 添加主题色相关的状态
const themeColor = ref('#00a6ff') // 默认蓝色
const presetColors = [
  '#00a6ff', // 蓝色
  '#002E8A', // 深蓝色
  '#292929', // 深灰色
  '#02694F', // 墨绿色
  '#DB8080', // 暗粉色
]

</script>

<template>
  <div class="body" :style="{ backgroundColor: themeColor }">


    <div class="info">
  <span style="margin-right: 30px;">考试科目：{{ subject }} </span> 
  <span v-if="range.length > 0">考试时间：{{
    range[0].format('HH:mm') }} - {{ dayjs(range[0]).add(examDuration, 'minutes').format('HH:mm') }}，共 {{ examDuration }} 分钟</span>
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

      <a-space :size="20">
        <a-space :size="3">
          <span>开始时间：</span>
          <a-date-picker 
            v-model:value="range[0]" 
            :show-time="{ format: 'HH:mm' }"
            placeholder="设置开始时间" 
            format="YYYY-MM-DD HH:mm"
           @change="(time) => range[0] = time.set('second', 0)"
          />
        </a-space>

        <a-space :size="3">
          <span>考试时长：</span>
          <a-input-number v-model:value="examDuration" :min="1" :max="360" placeholder="请输入考试时长" />
          <span>分钟</span>
        </a-space>
      </a-space>

      <a-space :size="10">
        <span>开考铃声：</span>
        <a-switch v-model:checked="beginAudio" />
        <span>结束铃声：</span>
        <a-switch v-model:checked="endAudio" />
      </a-space>

      <a-space :size="10">
        <span>15分钟提醒：</span>
        <a-switch v-model:checked="remind15" />
      </a-space>

      <a-space :size="10">
        <span>使用网络时间（需联网）：</span>
        <a-switch v-model:checked="useNetworkTime" />
      </a-space>

      <a-space direction="vertical" :size="5">
        <span>主题颜色：</span>
        <a-space :size="8">
          <!-- 预设颜色按钮 -->
          <template v-for="color in presetColors" :key="color">
            <div
              class="color-block"
              :style="{ backgroundColor: color }"
              :class="{ active: themeColor === color }"
              @click="themeColor = color"
            ></div>
          </template>
          <!-- 替换为原生颜色选择器 -->
          <div class="color-picker-wrapper">
            <input 
              type="color" 
              v-model="themeColor"
              class="color-picker"
            >
            <div 
              class="color-block"
              :style="{ backgroundColor: themeColor }"
            ></div>
          </div>
        </a-space>
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

/* 添加颜色块的样式 */
.color-block {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  box-sizing: border-box;
}

.color-block:hover {
  transform: scale(1.1);
}

.color-block.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px #1890ff;
}

.color-picker-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}

.color-picker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
