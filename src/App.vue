<script setup>
import { ref, computed, onMounted } from "vue";
import { SettingOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import dayjs from "dayjs";
import { message } from 'ant-design-vue';

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
  let nowT = useNetworkTime.value
    ? networkTime.value.valueOf()
    : Math.floor(Date.now() / 1000) * 1000

  let begin = format0(dayjs(range.value[0]).valueOf())
  let end = begin + examDuration.value * 60000

  let beginDiff = begin - nowT

  if (beginDiff === 0 && beginAudio.value) {
    audio.play()
  }
  if (beginDiff > 0) {
    let hour = Math.floor(beginDiff / 3600000)
    let minute = Math.floor((beginDiff - hour * 3600000) / 60000)
    let second = Math.floor((beginDiff - hour * 3600000 - minute * 60000) / 1000)
    if (hour > 0) {
      remainTime.value = `距离开考还有：${hour} 小时 ${minute} 分 ${second} 秒`
    } else if (minute > 0) {
      remainTime.value = `距离开考还有：${minute} 分 ${second} 秒`
    } else {
      remainTime.value = `距离开考还有：${second} 秒`
    }
    return
  }

  let diff = end - nowT

  if (diff === 0 && endAudio.value) {
    audio.play()
  }
  
  if (diff <= 0) {
    remainTime.value = '考试结束！'
  } else {
    let hour = Math.floor(diff / 3600000)
    let minute = Math.floor((diff - hour * 3600000) / 60000)
    let second = Math.floor((diff - hour * 3600000 - minute * 60000) / 1000)

    if (remind15.value && diff === 15 * 60000) {
      audio15.play()
    }

    if (hour > 0) {
      remainTime.value = `考试剩余时间：${hour} 小时 ${minute} 分 ${second} 秒`
    } else if (minute > 0) {
      remainTime.value = `考试剩余时间：${minute} 分 ${second} 秒`
    } else {
      remainTime.value = `考试剩余时间：${second} 秒`
    }
  }
}

const now = ref(dayjs())

// 网络校时的状态
const useNetworkTime = ref(false)
const networkTime = ref(null)

// 获取网络时间
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
    // 进入全屏时启动隐藏计时器
    handleUserActivity()
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
    // 退出全屏时清除计时器并显示按钮
    clearTimeout(hideTimeout)
    buttonsVisible.value = true
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

// 添加按钮显示状态控制
const buttonsVisible = ref(true)
let hideTimeout = null

// 处理用户操作，重置隐藏计时器
const handleUserActivity = () => {
  if (!isFullscreen.value) return
  
  buttonsVisible.value = true
  clearTimeout(hideTimeout)
  
  hideTimeout = setTimeout(() => {
    buttonsVisible.value = false
  }, 3000)
}

// 在组件挂载时添加事件监听
onMounted(() => {
  // ... 现有的 onMounted 代码 ...
  
  document.addEventListener('mousemove', handleUserActivity)
  document.addEventListener('click', handleUserActivity)
  document.addEventListener('keydown', handleUserActivity)
  
  // 添加URL参数处理
  const urlParams = new URLSearchParams(window.location.search);
  const encoded = urlParams.get('s');
  if (encoded) {
    decodeSettings(encoded);
  }
})

// 添加字体大小和位置设置
const infoFontSize = ref(45) // 考试信息字体大小
const currentTimeFontSize = ref(70) // 当前时间字体大小
const infoPosition = ref('left') // 考试信息位置
const currentTimePosition = ref('left') // 当前时间位置

// 位置选项
const positionOptions = [
  { value: 'left', label: '居左' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '居右' },
]

// 添加显示控制开关
const showInfo = ref(true) // 控制考试信息显示
const showCurrentTime = ref(true) // 控制当前时间显示

// 添加剩余时间的显示设置
const remainTimeFontSize = ref(90) // 剩余时间字体大小
const remainTimePosition = ref('center') // 剩余时间位置

// 添加剩余时间显示控制
const showRemainTime = ref(true) // 控制剩余时间显示

// 添加自定义科目相关的状态
const customSubjectEnabled = ref(false) // 自定义科目开关
const customSubject = ref('') // 自定义科目输入值

// 计算属性：根据是否启用自定义科目返回最终显示的科目
const displaySubject = computed(() => {
  return customSubjectEnabled.value ? customSubject.value : subject.value
})

// 修改 encodeSettings 函数
const encodeSettings = () => {
  try {
    // 将设置转换为数组格式，按固定顺序排列
    const settings = [
      customSubjectEnabled.value ? customSubject.value : subject.value, // [0] 科目
      range.value[0] ? range.value[0].format('YYMMDDHHmm') : '', // [1] 开始时间，使用更紧凑的格式
      examDuration.value || 0, // [2] 考试时长
      // 将布尔值打包成一个数字，每个位表示一个开关
      (beginAudio.value ? 1 : 0) |
      (endAudio.value ? 2 : 0) |
      (remind15.value ? 4 : 0) |
      (useNetworkTime.value ? 8 : 0) |
      (customSubjectEnabled.value ? 16 : 0)
    ];
    
    // 过滤掉空值和0值，进一步缩短URL
    const compactSettings = settings.map(v => v || '').join(',');
    return btoa(encodeURIComponent(compactSettings));
  } catch (error) {
    console.error('编码设置失败:', error);
    return '';
  }
};

// 修改 decodeSettings 函数
const decodeSettings = (encoded) => {
  try {
    const decoded = decodeURIComponent(atob(encoded));
    const settings = decoded.split(',');
    
    // 解析科目
    if (settings[0]) {
      // 检查是否是预设科目
      const isPresetSubject = subjects.value.some(s => s.value === settings[0]);
      customSubjectEnabled.value = !isPresetSubject;
      if (isPresetSubject) {
        subject.value = settings[0];
        customSubject.value = '';
      } else {
        customSubject.value = settings[0];
        subject.value = subjects.value[0].value; // 设置默认科目
      }
    }

    // 解析时间
    if (settings[1]) {
      const timeStr = settings[1];
      try {
        const year = '20' + timeStr.slice(0, 2);
        const month = timeStr.slice(2, 4);
        const day = timeStr.slice(4, 6);
        const hour = timeStr.slice(6, 8);
        const minute = timeStr.slice(8, 10);
        range.value = [dayjs(`${year}-${month}-${day} ${hour}:${minute}`)];
      } catch (e) {
        console.error('时间格式解析失败');
      }
    }

    // 解析考试时长
    if (settings[2]) {
      examDuration.value = parseInt(settings[2]) || 0;
    }

    // 解析开关状态
    if (settings[3]) {
      const flags = parseInt(settings[3]);
      beginAudio.value = !!(flags & 1);
      endAudio.value = !!(flags & 2);
      remind15.value = !!(flags & 4);
      useNetworkTime.value = !!(flags & 8);
      customSubjectEnabled.value = !!(flags & 16);
    }
  } catch (error) {
    console.error('解析设置失败:', error);
    // 设置默认值
    subject.value = subjects.value[0].value;
    customSubjectEnabled.value = false;
    customSubject.value = '';
    range.value = [];
    examDuration.value = 0;
    beginAudio.value = false;
    endAudio.value = false;
    remind15.value = false;
    useNetworkTime.value = false;
    message.error('链接格式错误，已重置为默认设置');
  }
};

// 复制当前设置的链接
const copySettingsLink = () => {
  const encoded = encodeSettings();
  // const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
  const url = `https://t.phycat.cn?s=${encoded}`; // 使用物理猫的短网址
  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制到剪贴板');
  }).catch(() => {
    message.error('复制失败，请手动复制');
  });
};
</script>

<template>
  <div class="body" 
       :style="{ backgroundColor: themeColor }"
       @mousemove="handleUserActivity"
       @click="handleUserActivity"
       @keydown="handleUserActivity">


    <div class="info" 
         v-show="showInfo"
         :style="{ 
           fontSize: `${infoFontSize}px`,
           left: infoPosition === 'left' ? '30px' : 'auto',
           right: infoPosition === 'right' ? '30px' : 'auto',
           textAlign: infoPosition,
           transform: infoPosition === 'center' ? 'translateX(-50%)' : 'none',
           left: infoPosition === 'center' ? '50%' : (infoPosition === 'left' ? '30px' : 'auto')
         }">
      <span class="info-content">
        <span class="no-wrap">考试科目：{{ displaySubject }}</span>
        <span v-if="range.length > 0" class="no-wrap">考试时间：{{
          range[0].format('HH:mm') }} - {{ dayjs(range[0]).add(examDuration, 'minutes').format('HH:mm') }}，共 {{
            examDuration }} 分钟</span>
      </span>
    </div>
    <div class="currentTime"
         v-show="showCurrentTime"
         :style="{ 
           fontSize: `${currentTimeFontSize}px`,
           left: currentTimePosition === 'left' ? '30px' : 'auto',
           right: currentTimePosition === 'right' ? '30px' : 'auto',
           textAlign: currentTimePosition,
           transform: currentTimePosition === 'center' ? 'translateX(-50%)' : 'none',
           left: currentTimePosition === 'center' ? '50%' : (currentTimePosition === 'left' ? '30px' : 'auto'),
           top: `${showInfo ? (30 + infoFontSize + 10) : 30}px` // 根据 info 是否显示调整位置
         }">
      <span class="no-wrap">当前时间：{{ now }}</span>
    </div>
    <div class="remainTime"
         v-show="showRemainTime"
         :style="{ 
           fontSize: `${remainTimeFontSize}px`,
           textAlign: remainTimePosition,
           left: remainTimePosition === 'left' ? '30px' : 'auto',
           right: remainTimePosition === 'right' ? '30px' : 'auto',
           transform: remainTimePosition === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)',
           left: remainTimePosition === 'center' ? '50%' : (remainTimePosition === 'left' ? '30px' : 'auto')
         }">
      <span class="no-wrap">{{ remainTime }}</span>
    </div>







    <div class="setting" :class="{ 'buttons-hidden': !buttonsVisible }">
      <a-button shape="circle" size="large" @click="setting = true">
        <template #icon>
          <SettingOutlined />
        </template>
      </a-button>
    </div>

    <div class="fullSccreen" :class="{ 'buttons-hidden': !buttonsVisible }">
      <a-button shape="circle" size="large" @click="toggleFullscreen">
        <template #icon>
          <FullscreenExitOutlined v-if="isFullscreen" />
          <FullscreenOutlined v-else />
        </template>
      </a-button>
    </div>
  </div>


  <!-- 弹窗 -->
  <a-modal v-model:open="setting" width="550px" title="设置" centered :footer="null">
    <a-tabs>
      <!-- 常规设置选项卡 -->
      <a-tab-pane key="1" tab="常规设置">
        <a-space direction="vertical" :size="10">
          <a-space :size="3">
            <span>设置科目：</span>
            <a-select 
              ref="select" 
              v-model:value="subject" 
              style="width: 120px" 
              :options="subjects"
              :disabled="customSubjectEnabled"
              placeholder="选择科目"
            ></a-select>
            <a-switch 
              v-model:checked="customSubjectEnabled"
              id="custom-subject-toggle"
              checked-children="自定义"
              un-checked-children="预设"
            />
          </a-space>
          <a-space :size="3" v-if="customSubjectEnabled" style="margin-top: 10px">
            <span>自定义科目：</span>
            <a-input 
              v-model:value="customSubject"
              placeholder="请输入科目名称"
              style="width: 200px"
            />
          </a-space>

          <a-space :size="20">
            <a-space :size="3">
              <span>开始时间：</span>
              <a-date-picker v-model:value="range[0]" :show-time="{ format: 'HH:mm' }" placeholder="设置开始时间"
                format="YYYY-MM-DD HH:mm" @change="(time) => range[0] = time.set('second', 0)" />
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
              <template v-for="color in presetColors" :key="color">
                <div class="color-block" :style="{ backgroundColor: color }" 
                     :class="{ active: themeColor === color }"
                     @click="themeColor = color"></div>
              </template>
              <div class="color-picker-wrapper">
                <input type="color" v-model="themeColor" class="color-picker">
                <div class="color-block" :style="{ backgroundColor: themeColor }"></div>
              </div>
            </a-space>
          </a-space>

          <!-- 添加复制链接按钮 -->
          <a-button type="primary" @click="copySettingsLink">
            复制当前设置链接
          </a-button>
        </a-space>
      </a-tab-pane>

      <!-- 显示设置选项卡 -->
      <a-tab-pane key="2" tab="显示设置">
        <a-space direction="vertical" :size="10">
          <!-- 考试信息设置 -->
          <a-space direction="vertical" :size="5">
            <a-space :size="20">
              <span>考试信息：</span>
              <a-switch v-model:checked="showInfo" />
            </a-space>
            <a-space :size="20" v-show="showInfo">
              <a-space>
                <span>字体大小：</span>
                <a-slider
                  v-model:value="infoFontSize"
                  :min="30"
                  :max="100"
                  style="width: 150px"
                />
                <a-input-number
                  v-model:value="infoFontSize"
                  :min="30"
                  :max="100"
                  style="width: 60px"
                />
              </a-space>
              <a-space>
                <span>位置：</span>
                <a-select
                  v-model:value="infoPosition"
                  style="width: 100px"
                  :options="positionOptions"
                />
              </a-space>
            </a-space>
          </a-space>

          <!-- 当前时间设置 -->
          <a-space direction="vertical" :size="5">
            <a-space :size="20">
              <span>当前时间：</span>
              <a-switch v-model:checked="showCurrentTime" />
            </a-space>
            <a-space :size="20" v-show="showCurrentTime">
              <a-space>
                <span>字体大小：</span>
                <a-slider
                  v-model:value="currentTimeFontSize"
                  :min="30"
                  :max="100"
                  style="width: 150px"
                />
                <a-input-number
                  v-model:value="currentTimeFontSize"
                  :min="30"
                  :max="100"
                  style="width: 60px"
                />
              </a-space>
              <a-space>
                <span>位置：</span>
                <a-select
                  v-model:value="currentTimePosition"
                  style="width: 100px"
                  :options="positionOptions"
                />
              </a-space>
            </a-space>
          </a-space>

          <!-- 剩余时间设置 -->
          <a-space direction="vertical" :size="5">
            <a-space :size="20">
              <span>剩余时间：</span>
              <a-switch v-model:checked="showRemainTime" />
            </a-space>
            <a-space :size="20" v-show="showRemainTime">
              <a-space>
                <span>字体大小：</span>
                <a-slider
                  v-model:value="remainTimeFontSize"
                  :min="60"
                  :max="150"
                  style="width: 150px"
                />
                <a-input-number
                  v-model:value="remainTimeFontSize"
                  :min="60"
                  :max="150"
                  style="width: 60px"
                />
              </a-space>
              <a-space>
                <span>位置：</span>
                <a-select
                  v-model:value="remainTimePosition"
                  style="width: 100px"
                  :options="positionOptions"
                />
              </a-space>
            </a-space>
          </a-space>
        </a-space>
      </a-tab-pane>

      <!-- 添加关于标签页 -->
      <a-tab-pane key="3" tab="关于">
        <a-card :bordered="false" style="background: transparent">
          <template #cover>
            <div style="text-align: center; ">
              <img 
                src="/qrcode.png" 
                alt="微信公众号二维码" 
                style="width: 200px; height: 200px; border-radius: 8px;"
              >
            </div>
          </template>
          <a-card-meta>
            <template #title>
              <div style="text-align: center; font-size: 18px; margin-bottom: 16px;">
                考试倒计时工具
              </div>
            </template>
            <template #description>
              <a-space direction="vertical" style="width: 100%">
                <div style="text-align: center; color: rgba(0, 0, 0, 0.65);">
                  <p style="margin: 8px 0;">工具制作：老龙</p>
                  <p style="margin: 8px 0;">微信公众号：物理猫</p>
                  <a 
                    href="https://github.com/sumruler/examCountDown" 
                    target="_blank"
                    style="color: #1890ff; text-decoration: none;"
                  >
                    项目开源地址：GitHub
                  </a>
                </div>
              </a-space>
            </template>
          </a-card-meta>
        </a-card>
      </a-tab-pane>
    </a-tabs>
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
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px #b8b8b8;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  width: fit-content;
}

.info-content {
  display: flex;
  gap: 30px; /* 替代之前的 margin-right */
}

.currentTime {
  position: absolute;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px #b8b8b8;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  width: fit-content;
}

.remainTime {
  position: absolute;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px #b8b8b8;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  top: 50%; /* 垂直居中 */
  width: fit-content;
  min-width: 100px; /* 添加最小宽度确保文本居中效果 */
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

.setting,
.fullSccreen {
  transition: opacity 0.5s ease;
  opacity: 1;
}

.buttons-hidden {
  opacity: 0;
  pointer-events: none;
}

/* 添加防止换行的样式 */
.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 添加样式以确保UI的整体美观性 */
#custom-subject-toggle {
  margin-left: 10px;
}
input[type="text"] {
  margin-left: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
}
</style>
