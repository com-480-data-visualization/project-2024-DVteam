
var playerButton = document.getElementById('playerButton');
var playerSelect = document.getElementById('playerSelect');
var playerChoice = document.getElementById('playerChoice');

// 当点击player按钮时，显示下拉列表
playerButton.addEventListener('click', function () {
    playerSelect.style.display = 'block';
});

// 当选择下拉列表的选项时，显示选项并隐藏下拉列表
playerSelect.addEventListener('change', function () {
    playerChoice.textContent = playerSelect.value;
    playerSelect.style.display = 'none';
});

var startButton = document.getElementById("startButton");

startButton.addEventListener("mousedown", function () {
    // 在按钮被按下时改变背景颜色
    startButton.style.background = "linear-gradient(to bottom, #069798, #0ABAB5)";
});

startButton.addEventListener("mouseup", function () {
    // 在按钮被释放时恢复原始背景颜色
    startButton.style.background = "linear-gradient(to bottom, #0ABAB5, #069798)";
});

// 获取时间条和按钮元素
var timeBar = document.getElementById("timeBar");
var startButton = document.getElementById("startButton");

var interval;

// 按钮点击事件监听器
startButton.addEventListener("click", function () {
    // 如果滑块已经在右边，则将其值设置为最小值
    if (parseFloat(timeBar.value) == timeBar.max) {
        timeBar.value = timeBar.min;
    }

    // 清除之前的定时器
    clearInterval(interval);

    // 计算每100毫秒滑块应该增加的值，以确保滑块在10秒内从左边滑到右边
    var increment = 1;

    // 创建一个新的定时器，每100毫秒将滑块的值增加increment
    interval = setInterval(function () {
        if (parseFloat(timeBar.value) < timeBar.max) {
            timeBar.value = parseFloat(timeBar.value) + increment;
        } else {
            // 如果滑块已经到达右边，则清除定时器
            clearInterval(interval);
        }
    }, 100);
});

